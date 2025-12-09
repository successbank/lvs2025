import LedSubcategoryPage from '@/components/LedSubcategoryPage';

export const metadata = {
  title: 'LED LIGHTSOURCE - LVS',
  description: 'LED 라이트소스 제품을 소개합니다.',
};

export default function LedSubcategory({ params }) {
  return <LedSubcategoryPage subcategorySlug={params.subcategory} />;
}
