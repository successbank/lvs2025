import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/wishlist — 내 관심제품 목록 (제품 정보 포함)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: session.user.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              modelName: true,
              slug: true,
              summary: true,
              isActive: true,
              category: { select: { id: true, name: true, slug: true } },
              images: {
                where: { isMain: true },
                select: { url: true, alt: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.wishlist.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Wishlist GET Error:', error);
    return NextResponse.json({ error: '조회에 실패했습니다.' }, { status: 500 });
  }
}

// POST /api/wishlist — 관심제품 등록 (idempotent)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'productId가 필요합니다.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: '제품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      create: { userId: session.user.id, productId },
      update: {},
    });

    return NextResponse.json({ message: '관심제품에 추가되었습니다.', wishlist: item });
  } catch (error) {
    console.error('Wishlist POST Error:', error);
    return NextResponse.json({ error: '등록에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/wishlist?productId=xxx — 관심제품 해제 (idempotent)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'productId가 필요합니다.' }, { status: 400 });
    }

    const result = await prisma.wishlist.deleteMany({
      where: { userId: session.user.id, productId },
    });

    return NextResponse.json({ message: '관심제품에서 제거되었습니다.', removed: result.count });
  } catch (error) {
    console.error('Wishlist DELETE Error:', error);
    return NextResponse.json({ error: '해제에 실패했습니다.' }, { status: 500 });
  }
}
