import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/categories - 카테고리 목록 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const parentId = searchParams.get('parentId');
    const includeChildren = searchParams.get('includeChildren') === 'true';

    // slug로 단일 카테고리 조회
    if (slug) {
      const category = await prisma.category.findFirst({
        where: { slug, isActive: true },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
          parent: true,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: '카테고리를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ category });
    }

    // 카테고리 목록 조회
    const includeAll = searchParams.get('includeAll') === 'true';
    const where = includeAll ? {} : { isActive: true };
    const childrenWhere = includeAll ? {} : { isActive: true };

    if (parentId === 'null' || parentId === '') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const categories = await prisma.category.findMany({
      where,
      include: includeChildren
        ? {
            children: {
              where: childrenWhere,
              orderBy: { order: 'asc' },
              include: {
                _count: { select: { products: true } },
              },
            },
            parent: true,
            _count: { select: { products: true } },
          }
        : {
            parent: true,
            _count: { select: { products: true } },
          },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/categories - 카테고리 순서 일괄 변경 (관리자 전용)
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
        prisma.category.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ message: '순서가 저장되었습니다.' });
  } catch (error) {
    console.error('Category Order Update Error:', error);
    return NextResponse.json(
      { error: '순서 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/categories - 카테고리 생성 (관리자 전용)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId || null,
        order: data.order || 0,
      },
      include: {
        parent: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Category Create Error:', error);
    return NextResponse.json(
      { error: '카테고리 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
