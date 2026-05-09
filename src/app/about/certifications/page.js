import CertificationsPage from '@/components/CertificationsPage';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    const [companyInfo, categories, certifications] = await Promise.all([
      prisma.companyInfo.findFirst(),
      prisma.certificationCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.certification.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
      }),
    ]);
    return { companyInfo, categories, certifications };
  } catch (error) {
    console.error('Certifications data fetch error:', error);
    return { companyInfo: null, categories: [], certifications: [] };
  }
}

export default async function Page() {
  const data = await getData();
  return <CertificationsPage {...data} />;
}
