import CertificationsPageEn from '@/components/en/CertificationsPageEn';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Certifications - LVS',
  description: 'Certifications that prove the safety and quality of LVS products.',
};

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
  return <CertificationsPageEn {...data} />;
}
