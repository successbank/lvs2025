import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SubcategoryPage from '@/components/SubcategoryPage';

export const metadata = {
  title: 'Power Supply - LVS',
  description: 'Explore LVS power supplies for LED lighting.',
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
    redirect(`/en/products/${subcategory.products[0].slug}`);
  }

  return <SubcategoryPage categorySlug="power-supply" subcategorySlug={params.subcategory} locale="en" />;
}
