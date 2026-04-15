import ProductDetailPage from '@/components/ProductDetailPage';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, isActive: true },
    include: { category: true },
  });

  return {
    title: product ? `${product.name} - LVS` : 'Product - LVS',
    description: product?.summary || product?.description || 'LVS 제품을 소개합니다.',
  };
}

async function getProduct(slug) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        specs: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      return null;
    }

    // 조회수 증가
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // 관련 제품 가져오기
    let relatedProducts = [];
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      relatedProducts = await prisma.product.findMany({
        where: {
          id: { in: product.relatedProducts },
          isActive: true,
        },
        include: {
          category: true,
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
        take: 4,
      });
    } else {
      // 같은 카테고리의 다른 제품들
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        include: {
          category: true,
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
        take: 4,
        orderBy: { viewCount: 'desc' },
      });
    }

    return {
      ...product,
      relatedProducts,
    };
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export default async function ProductDetail({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="error-page">
        <h1>제품을 찾을 수 없습니다.</h1>
        <a href="/products">제품 목록으로 돌아가기</a>
      </div>
    );
  }

  return <ProductDetailPage product={product} />;
}
