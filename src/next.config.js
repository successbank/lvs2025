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
}

module.exports = nextConfig
