import BoardViewPage from '@/components/BoardViewPage';

export default function ConsultationViewPage({ params }) {
  return <BoardViewPage boardSlug="consultation" postId={params.postId} />;
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
        title: `${data.post.title} | 온라인 상담실 | LVS`,
        description: data.post.content.replace(/<[^>]*>/g, '').substring(0, 160),
      };
    }
  } catch (error) {
    console.error('Metadata fetch error:', error);
  }

  return {
    title: '온라인 상담실 | LVS',
    description: '제품 문의 및 기술 상담',
  };
}
