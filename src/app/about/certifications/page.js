import CertificationsPage from '@/components/CertificationsPage';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

async function getData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const [companyInfoResult, certificationsResult] = await Promise.all([
      pool.query('SELECT * FROM company_info LIMIT 1'),
      pool.query('SELECT * FROM certifications WHERE is_active = true ORDER BY "order" ASC'),
    ]);

    return {
      companyInfo: companyInfoResult.rows[0] || null,
      certifications: certificationsResult.rows || [],
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      companyInfo: null,
      certifications: [],
    };
  } finally {
    await pool.end();
  }
}

export default async function Page() {
  const data = await getData();

  return <CertificationsPage {...data} />;
}
