import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SubcategoryPage from '@/components/SubcategoryPage';

export const metadata = {
  title: 'General Lighting - LVS',
  description: 'Explore LVS general lighting products for machine vision.',
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
    redirect(`/en/products/${subcategory.products[0].slug}`);
  }

  return <SubcategoryPage categorySlug="general-lighting" subcategorySlug={params.subcategory} locale="en" />;
}
