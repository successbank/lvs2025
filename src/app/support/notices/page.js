import BoardListPage from '@/components/BoardListPage';

export default function NoticesPage() {
  return <BoardListPage boardSlug="notices" />;
}

export const metadata = {
  title: '공지사항 | LVS',
  description: '엘브이에스의 소식과 공지사항을 확인하세요.',
};
