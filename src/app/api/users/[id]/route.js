import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET /api/users/[id]
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, role: true, status: true,
        phone: true, company: true,
        suspendedAt: true, suspendedReason: true, deletedAt: true,
        signupIp: true, suspicionFlags: true,
        createdAt: true, updatedAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: '조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/users/[id] — 사용자 수정 (관리자 전용)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.company !== undefined) updateData.company = data.company || null;
    if (data.password && data.password.length >= 6) {
      updateData.password = await hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true, phone: true, company: true, createdAt: true, updatedAt: true },
    });

    await prisma.userAuditLog.create({
      data: {
        userId: params.id,
        adminId: session.user.id,
        action: 'UPDATE',
        reason: null,
        metadata: { fields: Object.keys(updateData) },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User PUT Error:', error);
    return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/users/[id]
// 기본: 소프트 삭제 (status=DELETED, deletedAt=now)
// ?hard=true: 영구 삭제(+감사 로그는 user cascade로 사라지므로 pre-log)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json({ error: '자기 자신은 삭제할 수 없습니다.' }, { status: 400 });
    }

    const url = new URL(request.url);
    const hardDelete = url.searchParams.get('hard') === 'true';
    const reason = url.searchParams.get('reason') || null;

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, status: true },
    });
    if (!target) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (hardDelete) {
      // 감사 로그는 user cascade로 지워지므로 별도 로그 전용 행을 관리자 본인 ID로 남긴다.
      await prisma.userAuditLog.create({
        data: {
          userId: session.user.id,
          adminId: session.user.id,
          action: 'HARD_DELETE',
          previousStatus: target.status,
          newStatus: null,
          reason,
          metadata: { targetId: target.id, targetEmail: target.email, targetName: target.name },
        },
      });
      await prisma.user.delete({ where: { id: params.id } });
      return NextResponse.json({ message: '영구 삭제되었습니다.' });
    }

    // 소프트 삭제
    await prisma.user.update({
      where: { id: params.id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });
    await prisma.userAuditLog.create({
      data: {
        userId: params.id,
        adminId: session.user.id,
        action: 'SOFT_DELETE',
        previousStatus: target.status,
        newStatus: 'DELETED',
        reason,
      },
    });

    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (error) {
    console.error('User DELETE Error:', error);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }
}
