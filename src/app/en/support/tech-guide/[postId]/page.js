import BoardViewPage from '@/components/BoardViewPage';

export default function Page({ params }) {
  return <BoardViewPage boardSlug="tech-guide" postId={params.postId} locale="en" />;
}

export async function generateMetadata({ params }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5555'}/api/en/posts/${params.postId}?incrementView=false`,
      { cache: 'no-store' }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        title: `${data.post.title} | Technical Guides | LVS`,
        description: data.post.content.replace(/<[^>]*>/g, '').substring(0, 160),
      };
    }
  } catch (error) {
    console.error('Metadata fetch error:', error);
  }

  return {
    title: 'Technical Guides | LVS',
    description: 'Product usage guides and technical resources.',
  };
}
