import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // 기본 기간: 최근 30일
    const toDate = to ? new Date(to + 'T23:59:59.999Z') : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    let truncFn;
    switch (period) {
      case 'weekly':
        truncFn = 'week';
        break;
      case 'monthly':
        truncFn = 'month';
        break;
      default:
        truncFn = 'day';
    }

    const truncSql = Prisma.raw(`'${truncFn}'`);
    const data = await prisma.$queryRaw`
      SELECT DATE_TRUNC(${truncSql}, "createdAt") as date,
             COUNT(*)::int as views,
             COUNT(DISTINCT "sessionId")::int as "uniqueVisitors"
      FROM page_views
      WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
      GROUP BY DATE_TRUNC(${truncSql}, "createdAt")
      ORDER BY date ASC
    `;

    return NextResponse.json(
      data.map(d => ({
        date: d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date,
        views: d.views,
        uniqueVisitors: d.uniqueVisitors,
      }))
    );
  } catch (error) {
    console.error('Analytics Visitors Error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
