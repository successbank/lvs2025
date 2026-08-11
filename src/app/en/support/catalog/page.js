import BoardListPage from '@/components/BoardListPage';

export default function Page() {
  return <BoardListPage boardSlug="catalog" locale="en" />;
}

export const metadata = {
  title: 'Catalog Request | LVS',
  description: 'Request a product catalog.',
};
