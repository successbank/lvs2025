import SubcategoryPage from '@/components/SubcategoryPage';

export const metadata = {
  title: '일반조명 - LVS',
  description: '일반조명 제품을 소개합니다.',
};

export default function GeneralLightingSubcategory({ params }) {
  return <SubcategoryPage categorySlug="general-lighting" subcategorySlug={params.subcategory} />;
}
