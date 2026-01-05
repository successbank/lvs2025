import BoardViewPage from '@/components/BoardViewPage';

export default function NoticeViewPage({ params }) {
  return <BoardViewPage boardSlug="notices" postId={params.postId} />;
}

export async function generateMetadata({ params }) {
  // 실제 게시물 정보를 가져와서 메타데이터 생성
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5555'}/api/posts/${params.postId}?incrementView=false`,
      { cache: 'no-store' }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        title: `${data.post.title} | 공지사항 | LVS`,
        description: data.post.content.replace(/<[^>]*>/g, '').substring(0, 160),
      };
    }
  } catch (error) {
    console.error('Metadata fetch error:', error);
  }

  return {
    title: '공지사항 | LVS',
    description: '엘브이에스의 소식과 공지사항을 확인하세요.',
  };
}
