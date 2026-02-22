import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// PATCH /api/catalog-requests/[id] - 상태 변경
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const catalogRequest = await prisma.catalogRequest.update({
      where: { id: params.id },
      data: { status: data.status },
    });

    return NextResponse.json(catalogRequest);
  } catch (error) {
    console.error('Catalog Request Update Error:', error);
    return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/catalog-requests/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    await prisma.catalogRequest.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (error) {
    console.error('Catalog Request Delete Error:', error);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  }
}
