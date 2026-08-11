import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { translateCategories } from '@/lib/en-content';

// GET /api/en/categories — 영문 카테고리 (원본 lvs_db + 번역 머지, 조회 전용)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const parentId = searchParams.get('parentId');
    const includeChildren = searchParams.get('includeChildren') === 'true';

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
        return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
      }

      const [translated] = await translateCategories([{
        ...category,
        parent: category.parent,
      }]);
      // parent도 번역
      if (translated.parent) {
        const [parentTr] = await translateCategories([translated.parent]);
        translated.parent = parentTr;
      }
      return NextResponse.json({ category: translated });
    }

    const where = { isActive: true };
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
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: { _count: { select: { products: true } } },
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

    return NextResponse.json({ categories: await translateCategories(categories) });
  } catch (error) {
    console.error('EN Categories API Error:', error);
    return NextResponse.json({ error: 'Failed to load categories.' }, { status: 500 });
  }
}
