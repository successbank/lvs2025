import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const toDate = to ? new Date(to + 'T23:59:59.999Z') : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [deviceBreakdown, dailyByDevice] = await Promise.all([
      // 기기별 비율 (파이차트용)
      prisma.pageView.groupBy({
        by: ['deviceType'],
        where: { createdAt: { gte: fromDate, lte: toDate } },
        _count: { deviceType: true },
      }),
      // 기기별 일별 추이 (StackedBar용)
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date,
               "deviceType",
               COUNT(*)::int as count
        FROM page_views
        WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
        GROUP BY DATE("createdAt"), "deviceType"
        ORDER BY date ASC
      `,
    ]);

    // 파이차트 데이터 변환
    const pieData = deviceBreakdown.map(d => ({
      name: d.deviceType,
      value: d._count.deviceType,
    }));

    // 일별 데이터를 StackedBar 형태로 변환
    const dailyMap = {};
    dailyByDevice.forEach(row => {
      const dateKey = row.date.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, desktop: 0, mobile: 0, tablet: 0 };
      }
      dailyMap[dateKey][row.deviceType] = row.count;
    });

    return NextResponse.json({
      pieData,
      dailyData: Object.values(dailyMap),
    });
  } catch (error) {
    console.error('Analytics Devices Error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
