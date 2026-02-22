import BoardViewPage from '@/components/BoardViewPage';

export default function TechGuideViewPage({ params }) {
  return <BoardViewPage boardSlug="tech-guide" postId={params.postId} />;
}

export async function generateMetadata({ params }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5555'}/api/posts/${params.postId}?incrementView=false`,
      { cache: 'no-store' }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        title: `${data.post.title} | 테크니컬 가이드 | LVS`,
        description: data.post.content.replace(/<[^>]*>/g, '').substring(0, 160),
      };
    }
  } catch (error) {
    console.error('Metadata fetch error:', error);
  }

  return {
    title: '테크니컬 가이드 | LVS',
    description: '제품 사용 가이드 및 기술 자료',
  };
}
