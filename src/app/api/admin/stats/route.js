import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { Pool } from 'pg';

// GET /api/admin/stats - 관리자 대시보드 통계
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
      const [
        productCount,
        categoryCount,
        pendingInquiries,
        catalogRequests,
        postsResult,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.inquiry.count({ where: { status: 'PENDING' } }),
        prisma.catalogRequest.count({ where: { status: 'PENDING' } }),
        pool.query('SELECT COUNT(*) FROM posts'),
      ]);

      const totalPosts = parseInt(postsResult.rows[0].count);

      return NextResponse.json({
        products: productCount,
        categories: categoryCount,
        pendingInquiries,
        pendingCatalogRequests: catalogRequests,
        totalPosts,
      });
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
