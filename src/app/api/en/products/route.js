import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { translateProducts, translateCategories } from '@/lib/en-content';

// GET /api/en/products — 영문 제품 목록 (원본 lvs_db + 번역 머지, 조회 전용)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const category = searchParams.get('category');
    const isNew = searchParams.get('isNew');
    const isFeatured = searchParams.get('isFeatured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where = { isActive: true };

    if (search && search.trim()) {
      where.OR = [
        { modelName: { contains: search.trim(), mode: 'insensitive' } },
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    let parentCategory = null;
    let subcategories = [];

    if (category) {
      parentCategory = await prisma.category.findFirst({
        where: { slug: category, isActive: true },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (parentCategory) {
        subcategories = parentCategory.children || [];
        const categoryIds = [parentCategory.id, ...subcategories.map(c => c.id)];
        where.categoryId = { in: categoryIds };
      }
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isNew === 'true') where.isNew = true;
    if (isFeatured === 'true') where.isFeatured = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { where: { isMain: true }, take: 1 },
        },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const translated = await translateProducts(products);
    const productsWithMainImage = translated.map(product => ({
      ...product,
      mainImage: product.images && product.images.length > 0 ? product.images[0].url : null,
    }));

    return NextResponse.json({
      products: productsWithMainImage,
      subcategories: await translateCategories(subcategories),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('EN Products API Error:', error);
    return NextResponse.json({ error: 'Failed to load products.' }, { status: 500 });
  }
}
