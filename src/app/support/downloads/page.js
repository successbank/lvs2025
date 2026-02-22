import BoardListPage from '@/components/BoardListPage';

export default function DownloadsPage() {
  return <BoardListPage boardSlug="downloads" />;
}

export const metadata = {
  title: '자료 다운로드 | LVS',
  description: '제품 카탈로그 및 기술 자료 다운로드',
};
