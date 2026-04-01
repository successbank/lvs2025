import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/popups — ?active=true 시 소비자용 필터, 없으면 전체(관리자용)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let where = {};
    if (active === 'true') {
      const now = new Date();
      where = {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      };
    }

    const popups = await prisma.layerPopup.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ popups });
  } catch (error) {
    console.error('Popups API Error:', error);
    return NextResponse.json({ error: '팝업을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// POST /api/popups — 팝업 생성
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const popup = await prisma.layerPopup.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl || null,
        mobileImageUrl: data.mobileImageUrl || null,
        link: data.link || null,
        linkTarget: data.linkTarget || '_self',
        position: data.position || 'CENTER',
        width: parseInt(data.width) || 500,
        height: parseInt(data.height) || 500,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== false,
        order: data.order || 0,
        templateId: data.templateId || null,
        templateData: data.templateData || null,
      },
    });

    return NextResponse.json(popup, { status: 201 });
  } catch (error) {
    console.error('Popup Create Error:', error);
    return NextResponse.json({ error: '팝업 생성에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/popups — 두 팝업의 순서(order) 교환
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { popupId1, popupId2 } = await request.json();
    if (!popupId1 || !popupId2) {
      return NextResponse.json({ error: '두 팝업 ID가 필요합니다.' }, { status: 400 });
    }

    const [popup1, popup2] = await Promise.all([
      prisma.layerPopup.findUnique({ where: { id: popupId1 } }),
      prisma.layerPopup.findUnique({ where: { id: popupId2 } }),
    ]);

    if (!popup1 || !popup2) {
      return NextResponse.json({ error: '팝업을 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.layerPopup.update({ where: { id: popupId1 }, data: { order: popup2.order } }),
      prisma.layerPopup.update({ where: { id: popupId2 }, data: { order: popup1.order } }),
    ]);

    return NextResponse.json({ message: '순서가 변경되었습니다.' });
  } catch (error) {
    console.error('Popup Order Swap Error:', error);
    return NextResponse.json({ error: '순서 변경에 실패했습니다.' }, { status: 500 });
  }
}
