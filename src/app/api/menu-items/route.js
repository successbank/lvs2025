import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/menu-items — 메뉴 목록 조회 (공개)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    const where = includeAll ? { parentId: null } : { isActive: true, parentId: null };
    const childrenWhere = includeAll ? {} : { isActive: true };

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        children: {
          where: childrenWhere,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ menuItems });
  } catch (error) {
    console.error('Menu Items API Error:', error);
    return NextResponse.json(
      { error: '메뉴 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/menu-items — 메뉴 항목 생성 (관리자 전용)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();

    const menuItem = await prisma.menuItem.create({
      data: {
        label: data.label,
        url: data.url,
        type: data.type || 'link',
        parentId: data.parentId || null,
        order: data.order || 0,
      },
      include: { children: true },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Menu Item Create Error:', error);
    return NextResponse.json(
      { error: '메뉴 항목 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/menu-items — 메뉴 순서 일괄 변경 (관리자 전용)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: '올바른 형식이 아닙니다.' }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.menuItem.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ message: '순서가 저장되었습니다.' });
  } catch (error) {
    console.error('Menu Item Order Update Error:', error);
    return NextResponse.json(
      { error: '순서 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
