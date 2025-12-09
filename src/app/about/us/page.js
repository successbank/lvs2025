import AboutUsPage from '@/components/AboutUsPage';
import { Pool } from 'pg';

async function getData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const [companyInfoResult, historyResult] = await Promise.all([
      pool.query('SELECT * FROM company_info LIMIT 1'),
      pool.query('SELECT * FROM company_history ORDER BY year DESC, month DESC'),
    ]);

    return {
      companyInfo: companyInfoResult.rows[0] || null,
      history: historyResult.rows || [],
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      companyInfo: null,
      history: [],
    };
  } finally {
    await pool.end();
  }
}

export default async function Page() {
  const data = await getData();

  return <AboutUsPage {...data} />;
}
