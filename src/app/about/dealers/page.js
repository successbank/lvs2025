import DealersPage from '@/components/DealersPage';
import { Pool } from 'pg';

async function getData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const [companyInfoResult, dealersResult] = await Promise.all([
      pool.query('SELECT * FROM company_info LIMIT 1'),
      pool.query('SELECT * FROM dealers WHERE is_active = true ORDER BY "order" ASC'),
    ]);

    return {
      companyInfo: companyInfoResult.rows[0] || null,
      dealers: dealersResult.rows || [],
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      companyInfo: null,
      dealers: [],
    };
  } finally {
    await pool.end();
  }
}

export default async function Page() {
  const data = await getData();

  return <DealersPage {...data} />;
}
