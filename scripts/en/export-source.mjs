// 번역 원본 데이터 추출 (읽기 전용) — lvs_app 컨테이너 /app 안에서 실행
// 사용법: docker exec lvs_app node scripts-en-export.mjs > source.json
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const md5 = (s) => crypto.createHash('md5').update(s || '', 'utf8').digest('hex');

const [products, categories, menuItems, sliders, companyInfo] = await Promise.all([
  prisma.product.findMany({
    select: {
      id: true, modelName: true, name: true, summary: true, description: true,
      origin: true, seriesData: true, productOptions: true,
      specs: { select: { id: true, label: true, value: true }, orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  }),
  prisma.category.findMany({
    select: { id: true, name: true, slug: true, description: true, parentId: true },
    orderBy: { order: 'asc' },
  }),
  prisma.menuItem.findMany({
    select: { id: true, label: true, url: true, parentId: true },
    orderBy: { order: 'asc' },
  }),
  prisma.slider.findMany({
    select: { id: true, type: true, title: true, description: true },
    orderBy: { order: 'asc' },
  }),
  prisma.companyInfo.findFirst(),
]);

// source_hash: 원본 변경 감지용
const productsWithHash = products.map(p => ({
  ...p,
  sourceHash: md5([p.name, p.summary, p.description, p.origin, JSON.stringify(p.seriesData), JSON.stringify(p.productOptions)].join('|')),
}));

console.log(JSON.stringify({ products: productsWithHash, categories, menuItems, sliders, companyInfo }, null, 1));
await prisma.$disconnect();
