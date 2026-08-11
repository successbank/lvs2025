import ProductsMainPage from '@/components/ProductsMainPage';
import prisma from '@/lib/prisma';
import { translateCategories } from '@/lib/en-content';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Products - LVS',
  description: 'Explore the full range of LVS lighting products.',
};

async function getData() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { order: 'asc' },
    });

    return { categories: await translateCategories(categories) };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { categories: [] };
  }
}

export default async function Products() {
  const data = await getData();
  return <ProductsMainPage {...data} locale="en" />;
}
