import CategoryPage from '@/components/CategoryPage';

export const metadata = {
  title: '일반조명 - LVS',
  description: '다양한 일반조명 제품을 소개합니다.',
};

export default function GeneralLighting() {
  return <CategoryPage categorySlug="general-lighting" />;
}
