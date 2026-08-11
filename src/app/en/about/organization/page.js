import OrganizationPageEn from '@/components/en/OrganizationPageEn';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Overview & Organization - LVS',
  description: 'Company overview and organization structure of LVS Co., Ltd.',
};

async function getData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const companyInfoResult = await pool.query('SELECT * FROM company_info LIMIT 1');
    return { companyInfo: companyInfoResult.rows[0] || null };
  } catch (error) {
    console.error('Data fetch error:', error);
    return { companyInfo: null };
  } finally {
    await pool.end();
  }
}

export default async function Page() {
  const data = await getData();
  return <OrganizationPageEn {...data} />;
}
