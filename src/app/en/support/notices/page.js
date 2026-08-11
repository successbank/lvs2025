import BoardListPage from '@/components/BoardListPage';

export default function Page() {
  return <BoardListPage boardSlug="notices" locale="en" />;
}

export const metadata = {
  title: 'Notices | LVS',
  description: 'Check the latest news and announcements from LVS.',
};
