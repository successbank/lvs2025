import BoardListPage from '@/components/BoardListPage';

export default function Page() {
  return <BoardListPage boardSlug="consultation" locale="en" />;
}

export const metadata = {
  title: 'Online Inquiry | LVS',
  description: 'Product inquiries and technical consultation.',
};
