import BoardListPage from '@/components/BoardListPage';

export default function Page() {
  return <BoardListPage boardSlug="tech-guide" locale="en" />;
}

export const metadata = {
  title: 'Technical Guides | LVS',
  description: 'Product usage guides and technical resources.',
};
