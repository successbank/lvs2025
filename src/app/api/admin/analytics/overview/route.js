import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [
      todayViews,
      yesterdayViews,
      todayUnique,
      weekViews,
      monthViews,
      topPages,
      last7Days,
    ] = await Promise.all([
      // 오늘 조회수
      prisma.pageView.count({
        where: { createdAt: { gte: todayStart } },
      }),
      // 어제 조회수
      prisma.pageView.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),
      // 오늘 고유 방문자
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: todayStart } },
      }),
      // 이번 주 조회수
      prisma.pageView.count({
        where: { createdAt: { gte: weekStart } },
      }),
      // 이번 달 조회수
      prisma.pageView.count({
        where: { createdAt: { gte: monthStart } },
      }),
      // 오늘 최다 조회 페이지 (상위 5)
      prisma.pageView.groupBy({
        by: ['path'],
        where: { createdAt: { gte: todayStart } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 5,
      }),
      // 최근 7일 일별 조회수
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date,
               COUNT(*)::int as views,
               COUNT(DISTINCT "sessionId")::int as "uniqueVisitors"
        FROM page_views
        WHERE "createdAt" >= ${weekStart}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    const changeRate = yesterdayViews > 0
      ? Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100)
      : todayViews > 0 ? 100 : 0;

    return NextResponse.json({
      todayViews,
      yesterdayViews,
      changeRate,
      todayUniqueVisitors: todayUnique.length,
      weekViews,
      monthViews,
      topPages: topPages.map(p => ({ path: p.path, count: p._count.path })),
      last7Days: last7Days.map(d => ({
        date: d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date,
        views: d.views,
        uniqueVisitors: d.uniqueVisitors,
      })),
    });
  } catch (error) {
    console.error('Analytics Overview Error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
