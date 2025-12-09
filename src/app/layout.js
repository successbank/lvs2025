import { Providers } from './providers';

export const metadata = {
  title: 'LVS - Lighting for Vision System',
  description: '엘브이에스는 모든 현장에 감동을 전할 수 있는 빛의 기술을 연구합니다.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
