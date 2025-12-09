const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. 관리자 계정 생성
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lvs.co.kr' },
    update: {},
    create: {
      email: 'admin@lvs.co.kr',
      password: hashedPassword,
      name: '관리자',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. 회사 정보 생성
  const companyInfo = await prisma.companyInfo.upsert({
    where: { id: 'company-info-1' },
    update: {},
    create: {
      id: 'company-info-1',
      name: '(주)엘브이에스',
      ceo: '김태화',
      businessNumber: '131-86-14914',
      phone: '032-461-1800',
      fax: '032-461-1001',
      email: 'info@lvs.co.kr',
      address: '인천광역시 연수구 송도미래로 30 (송도동 214번지) 스마트밸리 B동 801~803호',
      workingHours: '평일 09:00~18:00',
      lunchTime: '12:00~13:00',
      closedDays: '일요일, 공휴일',
    },
  });
  console.log('✅ Company info created');

  // 3. 대분류 카테고리 생성
  const categoryGeneral = await prisma.category.upsert({
    where: { slug: 'general-lighting' },
    update: {},
    create: {
      name: '일반조명',
      slug: 'general-lighting',
      description: '다양한 산업용 LED 조명 솔루션',
      order: 1,
    },
  });

  const categoryPower = await prisma.category.upsert({
    where: { slug: 'power-supply' },
    update: {},
    create: {
      name: '파워서플라이',
      slug: 'power-supply',
      description: 'LED 조명용 전원 공급 장치',
      order: 2,
    },
  });

  const categoryLED = await prisma.category.upsert({
    where: { slug: 'led-lightsource' },
    update: {},
    create: {
      name: 'LED 라이트소스',
      slug: 'led-lightsource',
      description: '고출력 LED 광원 시스템',
      order: 3,
    },
  });
  console.log('✅ Main categories created');

  // 4. 일반조명 서브카테고리 생성
  const subCategories = [
    { name: '직사광 - 원형조명', slug: 'direct-ring-lighting', parent: categoryGeneral.id, order: 1 },
    { name: '직사광 원형 - Low Angle조명', slug: 'direct-ring-low-angle', parent: categoryGeneral.id, order: 2 },
    { name: '직사광 바조명', slug: 'direct-bar-lighting', parent: categoryGeneral.id, order: 3 },
    { name: '면발광 원형조명', slug: 'diffuse-ring-lighting', parent: categoryGeneral.id, order: 4 },
    { name: '면발광 - 원형 사각형 Low Angle 조명', slug: 'diffuse-low-angle', parent: categoryGeneral.id, order: 5 },
    { name: '돔형 무영조명', slug: 'dome-shadowless', parent: categoryGeneral.id, order: 6 },
    { name: '면발광 - 플랫조명', slug: 'diffuse-flat', parent: categoryGeneral.id, order: 7 },
    { name: '돔 형태의 다이렉트 조명', slug: 'dome-direct', parent: categoryGeneral.id, order: 8 },
    { name: '면발광 - 동축조명', slug: 'diffuse-coaxial', parent: categoryGeneral.id, order: 9 },
    { name: '고휘도 컴팩트 스폿라이트', slug: 'high-intensity-spotlight', parent: categoryGeneral.id, order: 10 },
    { name: '독립형 스트로브 조명', slug: 'standalone-strobe', parent: categoryGeneral.id, order: 11 },
    { name: 'Ultraviolet/Infrared Lights', slug: 'uv-ir-lights', parent: categoryGeneral.id, order: 12 },
  ];

  for (const cat of subCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parent,
        order: cat.order,
      },
    });
  }
  console.log('✅ Sub-categories created');

  // 5. 파워서플라이 서브카테고리
  const powerSubCategories = [
    { name: 'Digital Type', slug: 'power-digital', parent: categoryPower.id, order: 1 },
    { name: 'Strobe Type', slug: 'power-strobe', parent: categoryPower.id, order: 2 },
    { name: 'SPOT Type', slug: 'power-spot', parent: categoryPower.id, order: 3 },
    { name: 'Analog Type', slug: 'power-analog', parent: categoryPower.id, order: 4 },
    { name: 'High Speed PWM', slug: 'power-pwm', parent: categoryPower.id, order: 5 },
    { name: 'High Speed STROBE', slug: 'power-high-strobe', parent: categoryPower.id, order: 6 },
  ];

  for (const cat of powerSubCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parent,
        order: cat.order,
      },
    });
  }
  console.log('✅ Power supply sub-categories created');

  // 6. LED 라이트소스 서브카테고리
  const ledSubCategories = [
    { name: 'HPLS-LP30', slug: 'hpls-lp30', parent: categoryLED.id, order: 1 },
    { name: 'HPLS-CW50', slug: 'hpls-cw50', parent: categoryLED.id, order: 2 },
    { name: 'HPLS-S/FS50', slug: 'hpls-sfs50', parent: categoryLED.id, order: 3 },
    { name: 'HPLS-CW150', slug: 'hpls-cw150', parent: categoryLED.id, order: 4 },
    { name: 'HPLS-RGB-V4', slug: 'hpls-rgb-v4', parent: categoryLED.id, order: 5 },
    { name: '광화이버', slug: 'optical-fiber', parent: categoryLED.id, order: 6 },
  ];

  for (const cat of ledSubCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parent,
        order: cat.order,
      },
    });
  }
  console.log('✅ LED lightsource sub-categories created');

  // 7. 샘플 제품 생성 (HPLS-CW150-V2)
  const hplsCategory = await prisma.category.findUnique({
    where: { slug: 'hpls-cw150' },
  });

  if (hplsCategory) {
    const product = await prisma.product.upsert({
      where: { slug: 'hpls-cw150-v2' },
      update: {},
      create: {
        modelName: 'HPLS-CW150-V2',
        name: 'HPLS-CW150-V2',
        slug: 'hpls-cw150-v2',
        description: '250W 메탈할라이드 램프를 대체할 수 있는 고출력 LED 조명입니다.',
        summary: 'Designed to Replace 250W Metal Halide Light, 4096 Step brightness control',
        categoryId: hplsCategory.id,
        isNew: true,
        isFeatured: true,
      },
    });

    // 제품 스펙 추가
    await prisma.productSpec.createMany({
      data: [
        { productId: product.id, label: '밝기 조절', value: '4096 단계', order: 1 },
        { productId: product.id, label: '대체 램프', value: '250W 메탈할라이드', order: 2 },
        { productId: product.id, label: '특징', value: '안정적인 광출력과 긴 수명', order: 3 },
        { productId: product.id, label: '디자인', value: '컴팩트한 디자인과 쉬운 설치', order: 4 },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Sample product created: HPLS-CW150-V2');
  }

  // 8. 샘플 공지사항 생성
  await prisma.notice.createMany({
    data: [
      {
        title: 'Automation World 2019에 방문해 주셔서 감사합니다',
        content: '<p>Automation World 2019 전시회에 방문해 주신 모든 분들께 감사드립니다.</p>',
        category: 'NOTICE',
        isPinned: true,
      },
      {
        title: '(주)엘브이에스 웹사이트가 리뉴얼하였습니다',
        content: '<p>더욱 편리하고 개선된 웹사이트로 여러분을 찾아뵙겠습니다.</p>',
        category: 'NOTICE',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Sample notices created');

  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📧 Admin Login:');
  console.log('   Email: admin@lvs.co.kr');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
