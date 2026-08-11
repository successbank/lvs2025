import HomePageEn from '@/components/en/HomePageEn';
import prisma from '@/lib/prisma';
import { safeQueryEn } from '@/lib/db-en';
import { translateCategories, translateSliders, translateCompanyInfo } from '@/lib/en-content';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'LVS - Lighting for Vision System',
  description: 'LVS is an industrial LED lighting specialist delivering lighting technology that inspires every workplace.',
};

// 영문 홈 공지: lvs_db_en의 notices 게시판
async function getEnNotices() {
  const res = await safeQueryEn(`
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
  return res?.rows || [];
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
          images: { orderBy: { order: 'asc' } },
        },
        take: 6,
        orderBy: { order: 'asc' },
      }),
      getEnNotices(),
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

    // 영문 번역 머지 (미번역 시 KR 폴백)
    const [categoriesEn, slidersEn, companyInfoEn] = await Promise.all([
      translateCategories(categories),
      translateSliders(sliders),
      translateCompanyInfo(companyInfo),
    ]);

    return {
      categories: categoriesEn,
      featuredProducts,
      notices,
      companyInfo: companyInfoEn,
      sliders: slidersEn,
      partners,
    };
  } catch (error) {
    console.error('EN home data fetch error:', error);
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

export default async function EnHomePage() {
  const data = await getData();

  return <HomePageEn {...data} />;
}
