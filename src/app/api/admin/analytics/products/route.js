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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const toDate = to ? new Date(to + 'T23:59:59.999Z') : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 기간 내 제품 조회수 순위
    const productViews = await prisma.$queryRaw`
      SELECT pvl."productId",
             p.name,
             p.slug,
             p."modelName",
             c.name as "categoryName",
             COUNT(*)::int as "viewCount"
      FROM product_view_logs pvl
      JOIN products p ON p.id = pvl."productId"
      JOIN categories c ON c.id = p."categoryId"
      WHERE pvl."createdAt" >= ${fromDate} AND pvl."createdAt" <= ${toDate}
      GROUP BY pvl."productId", p.name, p.slug, p."modelName", c.name
      ORDER BY "viewCount" DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(productViews);
  } catch (error) {
    console.error('Analytics Products Error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
