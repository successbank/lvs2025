import SubcategoryPage from '@/components/SubcategoryPage';

export const metadata = {
  title: '파워서플라이 - LVS',
  description: '파워서플라이 제품을 소개합니다.',
};

export default function PowerSupplySubcategory({ params }) {
  return <SubcategoryPage categorySlug="power-supply" subcategorySlug={params.subcategory} />;
}
