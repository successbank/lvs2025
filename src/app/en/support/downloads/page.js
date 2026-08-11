import BoardListPage from '@/components/BoardListPage';

export default function Page() {
  return <BoardListPage boardSlug="downloads" locale="en" />;
}

export const metadata = {
  title: 'Downloads | LVS',
  description: 'Product catalogs and technical documents.',
};
