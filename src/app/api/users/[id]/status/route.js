import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// POST /api/users/[id]/status — 사용자 상태 변경 (관리자 전용)
// body: { action: 'SUSPEND' | 'ACTIVATE' | 'RESTORE', reason?: string }
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json({ error: '자기 자신의 상태는 변경할 수 없습니다.' }, { status: 400 });
    }

    const { action, reason } = await request.json();
    if (!['SUSPEND', 'ACTIVATE', 'RESTORE'].includes(action)) {
      return NextResponse.json({ error: '허용되지 않은 action입니다.' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });
    if (!target) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    let updateData = {};
    let newStatus;

    if (action === 'SUSPEND') {
      newStatus = 'SUSPENDED';
      updateData = {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspendedReason: reason || null,
        deletedAt: null,
      };
    } else if (action === 'ACTIVATE' || action === 'RESTORE') {
      newStatus = 'ACTIVE';
      updateData = {
        status: 'ACTIVE',
        suspendedAt: null,
        suspendedReason: null,
        deletedAt: null,
      };
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, status: true, suspendedAt: true, suspendedReason: true, deletedAt: true },
    });

    await prisma.userAuditLog.create({
      data: {
        userId: params.id,
        adminId: session.user.id,
        action: action === 'SUSPEND' ? 'SUSPEND' : (action === 'RESTORE' ? 'RESTORE' : 'ACTIVATE'),
        previousStatus: target.status,
        newStatus,
        reason: reason || null,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User Status Error:', error);
    return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
  }
}
