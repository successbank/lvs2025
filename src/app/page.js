import HomePage from '@/components/HomePage';
import prisma from '@/lib/prisma';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

// 홈의 공지사항은 /support/notices(boards.slug='notices', posts 테이블)와 동일 소스.
// 어드민(/admin/notices)에서 등록한 글이 양쪽에 함께 노출된다.
async function getNoticesFromBoard() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(`
      SELECT p.id,
             p.title,
             p.created_at AS "createdAt",
             p.is_notice  AS "isNotice"
      FROM posts p
      JOIN boards b ON b.id = p.board_id
      WHERE b.slug = 'notices' AND b.is_active = true
      ORDER BY p.is_notice DESC, p.created_at DESC
      LIMIT 5
    `);
    return result.rows;
  } catch (error) {
    console.error('home notices fetch error:', error);
    return [];
  } finally {
    await pool.end();
  }
}

async function getData() {
  try {
    const [categories, featuredProducts, notices, companyInfo, sliders, partners] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              products: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                take: 1,
                select: { slug: true },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
        take: 6,
        orderBy: { order: 'asc' },
      }),
      getNoticesFromBoard(),
      prisma.companyInfo.findFirst(),
      prisma.slider.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.partner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    return {
      categories,
      featuredProducts,
      notices,
      companyInfo,
      sliders,
      partners,
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      categories: [],
      featuredProducts: [],
      notices: [],
      companyInfo: null,
      sliders: [],
      partners: [],
    };
  }
}

export default async function Page() {
  const data = await getData();

  return <HomePage {...data} />;
}
