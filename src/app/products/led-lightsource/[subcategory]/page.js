import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import LedSubcategoryPage from '@/components/LedSubcategoryPage';

export const metadata = {
  title: 'LED LIGHTSOURCE - LVS',
  description: 'LED 라이트소스 제품을 소개합니다.',
};

export default async function LedSubcategory({ params }) {
  const subcategory = await prisma.category.findFirst({
    where: { slug: params.subcategory, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        select: { slug: true },
      },
    },
  });

  if (subcategory?.products?.length === 1) {
    redirect(`/products/${subcategory.products[0].slug}`);
  }

  return <LedSubcategoryPage subcategorySlug={params.subcategory} />;
}
