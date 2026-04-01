import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/menu-items/[id] — 단일 메뉴 항목 조회
export async function GET(request, { params }) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        children: { orderBy: { order: 'asc' } },
        parent: true,
      },
    });

    if (!menuItem) {
      return NextResponse.json({ error: '메뉴 항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Menu Item GET Error:', error);
    return NextResponse.json({ error: '메뉴 항목 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/menu-items/[id] — 메뉴 항목 수정
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};

    if (data.label !== undefined) updateData.label = data.label;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.parentId !== undefined) updateData.parentId = data.parentId || null;

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: updateData,
      include: {
        children: { orderBy: { order: 'asc' } },
        parent: true,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Menu Item PUT Error:', error);
    return NextResponse.json({ error: '메뉴 항목 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/menu-items/[id] — 메뉴 항목 삭제
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const menuItem = await prisma.menuItem.findUnique({ where: { id: params.id } });
    if (!menuItem) {
      return NextResponse.json({ error: '메뉴 항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.menuItem.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '메뉴 항목이 삭제되었습니다.' });
  } catch (error) {
    console.error('Menu Item DELETE Error:', error);
    return NextResponse.json({ error: '메뉴 항목 삭제에 실패했습니다.' }, { status: 500 });
  }
}
