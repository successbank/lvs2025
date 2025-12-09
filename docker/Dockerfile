FROM node:18-alpine AS base

# 개발 단계
FROM base AS dev
WORKDIR /app

# Next.js 텔레메트리 비활성화
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

# 개발에 필요한 시스템 패키지 설치 (Prisma 엔진을 위한 OpenSSL 포함)
RUN apk add --no-cache libc6-compat openssl

# 패키지 파일만 먼저 복사 (캐시 최적화)
COPY src/package*.json ./
RUN npm ci || npm install

# 소스코드는 볼륨 마운트로 처리
EXPOSE 3000

# CMD는 docker-compose.yml에서 정의됨

# 프로덕션 빌드 단계
FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 프로덕션 실행 단계
FROM base AS production
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup -g 1001 nodejs && \
    adduser -S nextjs -u 1001

# 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
