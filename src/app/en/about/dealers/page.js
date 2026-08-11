import DealersPageEn from '@/components/en/DealersPageEn';
import prisma from '@/lib/prisma';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Distributors - LVS',
  description: 'The LVS global distributor network.',
};

async function getCompanyInfo() {
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
  const [companyInfo, dealers] = await Promise.all([getCompanyInfo(), getDealers()]);
  return <DealersPageEn companyInfo={companyInfo} dealers={dealers} />;
}
