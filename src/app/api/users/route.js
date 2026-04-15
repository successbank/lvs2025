import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/users — 회원 목록 (관리자 전용)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total, counts] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, status: true,
          phone: true, company: true,
          suspendedAt: true, suspendedReason: true, deletedAt: true,
          signupIp: true, suspicionFlags: true,
          createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const statusCounts = counts.reduce((acc, c) => {
      acc[c.status] = c._count.status;
      return acc;
    }, { ACTIVE: 0, SUSPENDED: 0, DELETED: 0 });

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusCounts,
    });
  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: '회원 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
