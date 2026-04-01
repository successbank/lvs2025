import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';

// GET /api/me — 내 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: '조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/me — 내 정보 수정
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;

    // 비밀번호 변경
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: '현재 비밀번호를 입력해주세요.' }, { status: 400 });
      }
      if (data.newPassword.length < 6) {
        return NextResponse.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      const isValid = await compare(data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
      }

      updateData.password = await hash(data.newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '변경할 내용이 없습니다.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ message: '수정되었습니다.', user: updated });
  } catch (error) {
    console.error('Me PUT Error:', error);
    return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/me — 회원 탈퇴
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ message: '탈퇴되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: '탈퇴에 실패했습니다.' }, { status: 500 });
  }
}
