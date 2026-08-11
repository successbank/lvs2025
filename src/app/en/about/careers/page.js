import BoardListPage from '@/components/BoardListPage';

export default function CareersPage() {
  return <BoardListPage boardSlug="careers" section="about" locale="en" />;
}

export const metadata = {
  title: 'Careers | LVS',
  description: 'Join LVS and grow with us.',
};
