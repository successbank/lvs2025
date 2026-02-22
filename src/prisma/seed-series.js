/**
 * seriesData 시딩 스크립트
 * series-data.json → DB Product.seriesData 업데이트
 *
 * 사용법: docker exec lvs_app node prisma/seed-series.js
 */

const { PrismaClient } = require('@prisma/client');
const seriesData = require('./series-data.json');

const prisma = new PrismaClient();

async function main() {
  let updated = 0;
  let notFound = 0;

  for (const item of seriesData) {
    try {
      const product = await prisma.product.findUnique({
        where: { slug: item.slug },
        select: { id: true, name: true },
      });

      if (!product) {
        console.log(`⚠️  ${item.slug}: DB에 제품 없음`);
        notFound++;
        continue;
      }

      await prisma.product.update({
        where: { slug: item.slug },
        data: { seriesData: item.data },
      });

      const seriesCount = item.data.series.length;
      const rowCount = item.data.series.reduce((sum, s) => sum + s.rows.length, 0);
      console.log(`✅ ${item.slug} (${product.name}): ${seriesCount}개 시리즈, ${rowCount}개 행`);
      updated++;
    } catch (err) {
      console.error(`❌ ${item.slug}: ${err.message}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`완료: ${updated}개 업데이트, ${notFound}개 미발견`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
