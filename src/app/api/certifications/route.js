import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/certifications — 인증서 목록 (공개)
// 필터: ?categoryKey=&categoryId=&isActive=&includeAll=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryKey = searchParams.get('categoryKey');
    const categoryId = searchParams.get('categoryId');
    const includeAll = searchParams.get('includeAll') === 'true';

    const where = includeAll ? {} : { isActive: true };
    if (categoryKey) where.category = { key: categoryKey };
    if (categoryId) where.categoryId = categoryId;

    const certifications = await prisma.certification.findMany({
      where,
      include: { category: true },
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
    });

    return NextResponse.json({ certifications });
  } catch (error) {
    console.error('Certifications GET Error:', error);
    return NextResponse.json(
      { error: '인증서 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/certifications — 생성 (admin)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.title || !data.image || !data.categoryId) {
      return NextResponse.json(
        { error: 'title, image, categoryId는 필수입니다.' },
        { status: 400 }
      );
    }

    const created = await prisma.certification.create({
      data: {
        title: data.title,
        image: data.image,
        categoryId: data.categoryId,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: { category: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Certification Create Error:', error);
    return NextResponse.json(
      { error: '인증서 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/certifications — 순서 일괄 변경 (admin)
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
        prisma.certification.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ message: '순서가 저장되었습니다.' });
  } catch (error) {
    console.error('Certification Order Update Error:', error);
    return NextResponse.json(
      { error: '순서 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
