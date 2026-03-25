import BoardViewPage from '@/components/BoardViewPage';

export default function CareerViewPage({ params }) {
  return <BoardViewPage boardSlug="careers" postId={params.postId} section="about" />;
}

export const metadata = {
  title: '인재채용 | LVS',
  description: 'LVS와 함께 성장할 인재를 찾습니다.',
};
