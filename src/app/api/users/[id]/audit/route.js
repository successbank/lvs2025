import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/users/[id]/audit — 해당 사용자의 감사 로그
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const logs = await prisma.userAuditLog.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Audit fetch error:', error);
    return NextResponse.json({ error: '감사 로그 조회에 실패했습니다.' }, { status: 500 });
  }
}
