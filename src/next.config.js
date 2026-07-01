/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // nodemailer 는 dynamic require 를 사용하므로 Next.js automatic tracing 으로
  // 자동 포함되지 않음. 외부 패키지로 표시하여 standalone 에서 require 가능하게 한다.
  experimental: {
    serverComponentsExternalPackages: ['nodemailer'],
  },
  // standalone 출력에 nodemailer 전체를 포함 (lvs/lib/mailer.js 가 사용)
  outputFileTracingIncludes: {
    '/api/posts': ['./node_modules/nodemailer/**/*'],
  },
  // 런타임 업로드 파일 서빙: Next.js standalone 은 부팅 시점의 public/ 파일만 정적
  // 서빙하므로 업로드된 파일은 재배포 전까지 404 가 발생한다. `/uploads/*` 요청을
  // 항상 동적 라우트(/api/uploads/*)로 보내 볼륨에서 직접 스트리밍한다.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: '/api/uploads/:path*',
        },
      ],
    };
  },
}

module.exports = nextConfig
