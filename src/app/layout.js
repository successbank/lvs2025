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

async function getNavigationData() {
  try {
    return await prisma.menuItem.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'LVS - Lighting for Vision System',
  description: '엘브이에스는 모든 현장에 감동을 전할 수 있는 빛의 기술을 연구합니다.',
}

export default async function RootLayout({ children }) {
  const companyInfo = await getCompanyInfo();
  const navigationData = await getNavigationData();
  // /en 하위는 en/layout.js의 HtmlLangEn이 클라이언트에서 lang="en"으로 전환한다.
  // (루트에서 headers()를 읽으면 404/500 등 정적 페이지 프리렌더가 깨져 빌드 실패)

  return (
    <html lang="ko">
      <body>
        <Providers>
          <PublicLayout companyInfo={companyInfo} navigationData={navigationData}>
            {children}
          </PublicLayout>
        </Providers>
      </body>
    </html>
  )
}
