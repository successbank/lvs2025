const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 기존 메뉴 항목 삭제
  await prisma.menuItem.deleteMany();
  console.log('기존 메뉴 항목 삭제 완료');

  // 제품 카테고리 메뉴 (단일 링크)
  await prisma.menuItem.create({
    data: { label: '일반조명', url: '/products/general-lighting', type: 'link', order: 0 },
  });
  await prisma.menuItem.create({
    data: { label: '파워서플라이', url: '/products/power-supply', type: 'link', order: 1 },
  });
  await prisma.menuItem.create({
    data: { label: 'LED LIGHTSOURCE', url: '/products/led-lightsource', type: 'link', order: 2 },
  });

  // 회사소개 (드롭다운)
  const about = await prisma.menuItem.create({
    data: { label: '회사소개', url: '/about', type: 'dropdown', order: 3 },
  });
  const aboutChildren = [
    { label: '회사소개', url: '/about/us', order: 0 },
    { label: '개요 및 조직도', url: '/about/organization', order: 1 },
    { label: 'Why LED', url: '/about/why-led', order: 2 },
    { label: '인증현황', url: '/about/certifications', order: 3 },
    { label: '대리점 안내', url: '/about/dealers', order: 4 },
  ];
  for (const child of aboutChildren) {
    await prisma.menuItem.create({
      data: { ...child, type: 'link', parentId: about.id },
    });
  }

  // 고객지원 (드롭다운)
  const support = await prisma.menuItem.create({
    data: { label: '고객지원', url: '/support', type: 'dropdown', order: 4 },
  });
  const supportChildren = [
    { label: '공지사항', url: '/support/notices', order: 0 },
    { label: '기술자료', url: '/support/tech-guide', order: 1 },
    { label: '다운로드', url: '/support/downloads', order: 2 },
    { label: '온라인 상담', url: '/support/consultation', order: 3 },
    { label: '찾아오시는 길', url: '/support/contact', order: 4 },
    { label: '카탈로그 신청', url: '/support/catalog', order: 5 },
  ];
  for (const child of supportChildren) {
    await prisma.menuItem.create({
      data: { ...child, type: 'link', parentId: support.id },
    });
  }

  console.log('메뉴 시드 데이터 삽입 완료');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
