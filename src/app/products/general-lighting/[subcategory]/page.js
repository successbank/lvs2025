import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SubcategoryPage from '@/components/SubcategoryPage';

export const metadata = {
  title: '일반조명 - LVS',
  description: '일반조명 제품을 소개합니다.',
};

export default async function GeneralLightingSubcategory({ params }) {
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

  return <SubcategoryPage categorySlug="general-lighting" subcategorySlug={params.subcategory} />;
}
