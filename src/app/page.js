import HomePage from '@/components/HomePage';
import prisma from '@/lib/prisma';

async function getData() {
  try {
    const [categories, featuredProducts, notices, companyInfo] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: {
          category: true,
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
        take: 4,
        orderBy: { order: 'asc' },
      }),
      prisma.notice.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.companyInfo.findFirst(),
    ]);

    return {
      categories,
      featuredProducts,
      notices,
      companyInfo,
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      categories: [],
      featuredProducts: [],
      notices: [],
      companyInfo: null,
    };
  }
}

export default async function Page() {
  const data = await getData();

  return <HomePage {...data} />;
}

