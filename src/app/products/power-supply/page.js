import CategoryPage from '@/components/CategoryPage';

export const metadata = {
  title: '파워서플라이 - LVS',
  description: '다양한 파워서플라이 제품을 소개합니다.',
};

export default function PowerSupply() {
  return <CategoryPage categorySlug="power-supply" />;
}
