import ProductsMainPage from '@/components/ProductsMainPage';
import prisma from '@/lib/prisma';

export const metadata = {
  title: '제품소개 - LVS',
  description: 'LVS의 다양한 조명 제품을 만나보세요.',
};

async function getData() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' },
    });

    return { categories };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { categories: [] };
  }
}

export default async function Products() {
  const data = await getData();
  return <ProductsMainPage {...data} />;
}
