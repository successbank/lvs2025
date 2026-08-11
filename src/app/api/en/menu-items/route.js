import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { translateMenuItems } from '@/lib/en-content';

// GET /api/en/menu-items — 영문 메뉴 목록 (원본 lvs_db + 번역 머지, 조회 전용)
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ menuItems: await translateMenuItems(menuItems) });
  } catch (error) {
    console.error('EN Menu Items API Error:', error);
    return NextResponse.json({ error: 'Failed to load menu items.' }, { status: 500 });
  }
}
