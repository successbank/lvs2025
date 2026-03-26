import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SubcategoryPage from '@/components/SubcategoryPage';

export const metadata = {
  title: '파워서플라이 - LVS',
  description: '파워서플라이 제품을 소개합니다.',
};

export default async function PowerSupplySubcategory({ params }) {
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

  return <SubcategoryPage categorySlug="power-supply" subcategorySlug={params.subcategory} />;
}
