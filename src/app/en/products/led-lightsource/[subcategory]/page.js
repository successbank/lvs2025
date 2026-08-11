import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import LedSubcategoryPage from '@/components/LedSubcategoryPage';

export const metadata = {
  title: 'LED LIGHTSOURCE - LVS',
  description: 'Explore the LVS LED light source lineup.',
};

export default async function LedLightsourceSubcategory({ params }) {
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

  return <LedSubcategoryPage subcategorySlug={params.subcategory} locale="en" />;
}
