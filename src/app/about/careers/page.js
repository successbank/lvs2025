import BoardListPage from '@/components/BoardListPage';

export default function CareersPage() {
  return <BoardListPage boardSlug="careers" section="about" />;
}

export const metadata = {
  title: '인재채용 | LVS',
  description: 'LVS와 함께 성장할 인재를 찾습니다.',
};
