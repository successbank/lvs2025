import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/certification-categories — 카테고리 목록 (공개)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';
    const where = includeAll ? {} : { isActive: true };

    const categories = await prisma.certificationCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            certifications: includeAll ? true : { where: { isActive: true } },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('CertificationCategories GET Error:', error);
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/certification-categories — 생성 (admin)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.key || !data.label) {
      return NextResponse.json({ error: 'key, label은 필수입니다.' }, { status: 400 });
    }

    const exists = await prisma.certificationCategory.findUnique({ where: { key: data.key } });
    if (exists) {
      return NextResponse.json({ error: '이미 존재하는 key입니다.' }, { status: 400 });
    }

    const created = await prisma.certificationCategory.create({
      data: {
        key: data.key,
        label: data.label,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('CertificationCategory Create Error:', error);
    return NextResponse.json(
      { error: '카테고리 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/certification-categories — 순서 일괄 변경 (admin)
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
        prisma.certificationCategory.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ message: '순서가 저장되었습니다.' });
  } catch (error) {
    console.error('CertificationCategory Order Update Error:', error);
    return NextResponse.json(
      { error: '순서 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
