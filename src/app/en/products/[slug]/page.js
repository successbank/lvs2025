import ProductDetailPage from '@/components/ProductDetailPage';
import prisma from '@/lib/prisma';
import { translateProducts, translateCategories } from '@/lib/en-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, isActive: true },
    select: { id: true, name: true, summary: true, description: true },
  });
  if (!product) return { title: 'Product - LVS' };

  const [translated] = await translateProducts([product]);
  return {
    title: `${translated.name} - LVS`,
    description: translated.summary || 'Explore LVS industrial LED lighting products.',
  };
}

async function getProduct(slug) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: {
          include: {
            parent: {
              include: {
                children: {
                  where: { isActive: true },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
        images: { orderBy: { order: 'asc' } },
        specs: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) return null;

    // 조회수 증가 (KR과 동일 카운터 공유)
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    let relatedProducts = [];
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      relatedProducts = await prisma.product.findMany({
        where: { id: { in: product.relatedProducts }, isActive: true },
        include: {
          category: true,
          images: { where: { isMain: true }, take: 1 },
        },
        take: 4,
      });
    } else {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        include: {
          category: true,
          images: { where: { isMain: true }, take: 1 },
        },
        take: 4,
        orderBy: { viewCount: 'desc' },
      });
    }

    // ── 영문 번역 머지 ──
    const [translated] = await translateProducts([product], { includeSpecs: true });
    const relatedTranslated = await translateProducts(relatedProducts);

    // 카테고리(부모/형제 포함) 번역
    let categoryEn = product.category;
    if (categoryEn) {
      const [catTr] = await translateCategories([categoryEn]);
      categoryEn = catTr;
      if (categoryEn.parent) {
        const [parentTr] = await translateCategories([categoryEn.parent]);
        categoryEn = { ...categoryEn, parent: parentTr };
      }
    }

    return {
      ...translated,
      category: categoryEn,
      relatedProducts: relatedTranslated,
    };
  } catch (error) {
    console.error('Failed to fetch EN product:', error);
    return null;
  }
}

export default async function ProductDetail({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="error-page">
        <h1>Product not found.</h1>
        <a href="/en/products">Back to Products</a>
      </div>
    );
  }

  return <ProductDetailPage product={product} locale="en" />;
}
