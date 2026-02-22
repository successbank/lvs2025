import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/sliders
export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ sliders });
  } catch (error) {
    console.error('Sliders API Error:', error);
    return NextResponse.json({ error: '슬라이더를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// POST /api/sliders — 슬라이더 생성
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const slider = await prisma.slider.create({
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl,
        link: data.link || null,
        isActive: data.isActive !== false,
        order: data.order || 0,
      },
    });

    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Slider Create Error:', error);
    return NextResponse.json({ error: '슬라이더 생성에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/sliders — 두 슬라이더의 순서(order) 교환
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { sliderId1, sliderId2 } = await request.json();
    if (!sliderId1 || !sliderId2) {
      return NextResponse.json({ error: '두 슬라이더 ID가 필요합니다.' }, { status: 400 });
    }

    const [slider1, slider2] = await Promise.all([
      prisma.slider.findUnique({ where: { id: sliderId1 } }),
      prisma.slider.findUnique({ where: { id: sliderId2 } }),
    ]);

    if (!slider1 || !slider2) {
      return NextResponse.json({ error: '슬라이더를 찾을 수 없습니다.' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.slider.update({ where: { id: sliderId1 }, data: { order: slider2.order } }),
      prisma.slider.update({ where: { id: sliderId2 }, data: { order: slider1.order } }),
    ]);

    return NextResponse.json({ message: '순서가 변경되었습니다.' });
  } catch (error) {
    console.error('Slider Order Swap Error:', error);
    return NextResponse.json({ error: '순서 변경에 실패했습니다.' }, { status: 500 });
  }
}
