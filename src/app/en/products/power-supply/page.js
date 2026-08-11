import CategoryPage from '@/components/CategoryPage';

export const metadata = {
  title: 'Power Supply - LVS',
  description: 'Explore LVS power supplies for LED lighting.',
};

export default function PowerSupply() {
  return <CategoryPage categorySlug="power-supply" locale="en" />;
}
