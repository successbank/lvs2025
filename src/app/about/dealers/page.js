import DealersPage from '@/components/DealersPage';
import prisma from '@/lib/prisma';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

async function getCompanyInfo() {
  // company_info는 Prisma 모델 외부에서 관리되어 pg Pool 직접 쿼리 유지
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query('SELECT * FROM company_info LIMIT 1');
    return result.rows[0] || null;
  } catch (error) {
    console.error('companyInfo fetch error:', error);
    return null;
  } finally {
    await pool.end();
  }
}

async function getDealers() {
  try {
    return await prisma.dealer.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    });
  } catch (error) {
    console.error('dealers fetch error:', error);
    return [];
  }
}

export default async function Page() {
  const [companyInfo, dealers] = await Promise.all([
    getCompanyInfo(),
    getDealers(),
  ]);

  return <DealersPage companyInfo={companyInfo} dealers={dealers} />;
}
