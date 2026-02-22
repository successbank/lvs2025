import BoardListPage from '@/components/BoardListPage';

export default function CatalogListPage() {
  return <BoardListPage boardSlug="catalog" />;
}

export const metadata = {
  title: '카탈로그 신청 | LVS',
  description: '제품 카탈로그 신청 목록',
};
