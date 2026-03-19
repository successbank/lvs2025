import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    // 전일 기준 집계
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // 전일 PageView 데이터 집계
    const [totalViews, uniqueVisitors, deviceCounts, topPages, topReferrers] = await Promise.all([
      prisma.pageView.count({
        where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
      }),
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
      }),
      prisma.pageView.groupBy({
        by: ['deviceType'],
        where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
        _count: { deviceType: true },
      }),
      prisma.pageView.groupBy({
        by: ['path'],
        where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 20,
      }),
      prisma.pageView.groupBy({
        by: ['referrer'],
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
          referrer: { not: null },
        },
        _count: { referrer: true },
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
      }),
    ]);

    const deviceMap = {};
    deviceCounts.forEach(d => { deviceMap[d.deviceType] = d._count.deviceType; });

    await prisma.dailyStat.upsert({
      where: { date: yesterdayStart },
      update: {
        totalViews,
        uniqueVisitors: uniqueVisitors.length,
        desktopViews: deviceMap.desktop || 0,
        mobileViews: deviceMap.mobile || 0,
        tabletViews: deviceMap.tablet || 0,
        topPages: topPages.map(p => ({ path: p.path, count: p._count.path })),
        topReferrers: topReferrers.map(r => ({ referrer: r.referrer, count: r._count.referrer })),
      },
      create: {
        date: yesterdayStart,
        totalViews,
        uniqueVisitors: uniqueVisitors.length,
        desktopViews: deviceMap.desktop || 0,
        mobileViews: deviceMap.mobile || 0,
        tabletViews: deviceMap.tablet || 0,
        topPages: topPages.map(p => ({ path: p.path, count: p._count.path })),
        topReferrers: topReferrers.map(r => ({ referrer: r.referrer, count: r._count.referrer })),
      },
    });

    return NextResponse.json({
      message: '집계가 완료되었습니다.',
      date: yesterdayStart.toISOString().split('T')[0],
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
    });
  } catch (error) {
    console.error('Analytics Aggregate Error:', error);
    return NextResponse.json(
      { error: '집계에 실패했습니다.' },
      { status: 500 }
    );
  }
}
