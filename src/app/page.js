import HomePage from '@/components/HomePage';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    const [categories, featuredProducts, notices, companyInfo, sliders, partners] = await Promise.all([
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
            orderBy: { order: 'asc' },
          },
        },
        take: 6,
        orderBy: { order: 'asc' },
      }),
      prisma.notice.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.companyInfo.findFirst(),
      prisma.slider.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.partner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    return {
      categories,
      featuredProducts,
      notices,
      companyInfo,
      sliders,
      partners,
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      categories: [],
      featuredProducts: [],
      notices: [],
      companyInfo: null,
      sliders: [],
      partners: [],
    };
  }
}

export default async function Page() {
  const data = await getData();

  return <HomePage {...data} />;
}
