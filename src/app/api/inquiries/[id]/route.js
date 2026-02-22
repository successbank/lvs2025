import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/inquiries/[id]
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const inquiry = await prisma.inquiry.findUnique({ where: { id: params.id } });
    if (!inquiry) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Inquiry Detail Error:', error);
    return NextResponse.json({ error: '문의를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// PATCH /api/inquiries/[id] - 답변 작성/상태 변경
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};

    if (data.reply !== undefined) updateData.reply = data.reply;
    if (data.status !== undefined) updateData.status = data.status;

    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Inquiry Update Error:', error);
    return NextResponse.json({ error: '문의 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/inquiries/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    await prisma.inquiry.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '문의가 삭제되었습니다.' });
  } catch (error) {
    console.error('Inquiry Delete Error:', error);
    return NextResponse.json({ error: '문의 삭제에 실패했습니다.' }, { status: 500 });
  }
}
