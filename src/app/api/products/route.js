import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - 제품 목록 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const category = searchParams.get('category');
    const isNew = searchParams.get('isNew');
    const isFeatured = searchParams.get('isFeatured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where = { isActive: true };
    let parentCategory = null;
    let subcategories = [];

    // 카테고리 slug로 조회하는 경우
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
        // 부모 카테고리와 모든 자식 카테고리의 제품 포함
        const categoryIds = [parentCategory.id, ...subcategories.map(c => c.id)];
        where.categoryId = { in: categoryIds };
      }
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isNew === 'true') {
      where.isNew = true;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Add mainImage field to each product
    const productsWithMainImage = products.map(product => ({
      ...product,
      mainImage: product.images && product.images.length > 0 ? product.images[0].url : null
    }));

    // 서브카테고리 정보도 함께 반환
    return NextResponse.json({
      products: productsWithMainImage,
      subcategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: '제품 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/products - 제품 생성 (관리자 전용)
export async function POST(request) {
  try {
    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        modelName: data.modelName,
        name: data.name,
        slug: data.slug,
        description: data.description,
        summary: data.summary,
        categoryId: data.categoryId,
        manufacturer: data.manufacturer || 'LVS',
        origin: data.origin || '대한민국',
        colorOptions: data.colorOptions || [],
        voltageOptions: data.voltageOptions || [],
        isNew: data.isNew || false,
        isFeatured: data.isFeatured || false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product Create Error:', error);
    return NextResponse.json(
      { error: '제품 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
