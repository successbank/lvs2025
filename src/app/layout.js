import prisma from '@/lib/prisma';
import { Providers } from './providers';
import PublicLayout from '@/components/PublicLayout';

async function getCompanyInfo() {
  try {
    return await prisma.companyInfo.findFirst();
  } catch {
    return null;
  }
}

export const metadata = {
  title: 'LVS - Lighting for Vision System',
  description: '엘브이에스는 모든 현장에 감동을 전할 수 있는 빛의 기술을 연구합니다.',
}

export default async function RootLayout({ children }) {
  const companyInfo = await getCompanyInfo();

  return (
    <html lang="ko">
      <body>
        <Providers>
          <PublicLayout companyInfo={companyInfo}>
            {children}
          </PublicLayout>
        </Providers>
      </body>
    </html>
  )
}
