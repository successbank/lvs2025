# CLAUDE.md

# 개발팀 페르소나
- .claude/CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

LVS (Lighting for Vision System) — 산업용 LED 조명 전문 기업의 공식 웹사이트. Next.js 14 App Router 기반, Docker 4-컨테이너 스택으로 운영.

## ai와의 소통언어
- 한국어

## 개발팀 페르소나
- ./persona.md

## 개발 명령어

```bash
# 서비스 시작/중지
docker-compose up -d
docker-compose down
docker-compose restart app
docker-compose logs -f app

# 컨테이너 내부 접근
docker exec -it lvs_app sh
docker exec -it lvs_db psql -U lvs_user -d lvs_db

# Prisma (컨테이너 내부에서 실행)
docker exec lvs_app npx prisma generate
docker exec lvs_app npx prisma migrate dev
docker exec lvs_app npx prisma studio
docker exec lvs_app node prisma/seed.js

# 패키지 설치 (컨테이너 내부에서 실행)
docker exec lvs_app npm install <패키지명>
```

접속: http://localhost:5555 | Adminer: http://localhost:5558

## 아키텍처

### 기술 스택
- Next.js 14.2.5 (App Router), React 18.3.1, Node.js 18
- PostgreSQL 15, Redis 7 (캐시 — 현재 미활용)
- Next-Auth (JWT, CredentialsProvider)
- Prisma ORM + pg Pool (하이브리드)
- 순수 CSS (`globals.css` 3,500줄+ — Tailwind 미사용)
- Path alias: `@/*` → `./*` (jsconfig.json)

### 하이브리드 데이터 레이어 (핵심 패턴)

프로젝트는 두 가지 DB 접근 방식을 혼용한다:

| 영역 | 접근 방식 | 사용처 |
|------|-----------|--------|
| 제품/카테고리/사용자 | **Prisma ORM** | `src/lib/prisma.js` 싱글톤 |
| 게시판/게시물/첨부파일 | **pg Pool 직접 쿼리** | `src/app/api/boards/`, `posts/`, `attachments/` |

- Prisma 스키마: `src/prisma/schema.prisma` — Product, Category, User, Slider, Inquiry 등
- 게시판 스키마: `database/create-board-schema.sql` — boards, posts, post_attachments 테이블 (Prisma 외부)

새 기능 추가 시 어느 레이어를 사용할지 기존 패턴을 따를 것.

### 렌더링 패턴

**Server Component → Client Component 분리**:
- 페이지 파일(`page.js`)은 Server Component로 Prisma 데이터를 직접 조회
- `src/components/`의 컴포넌트는 `'use client'`로 인터랙티브 UI 처리
- 데이터 흐름: `page.js (SSR fetch)` → props → `Component.js (CSR)`

게시판 계열은 예외적으로 Client Component에서 `/api/` 엔드포인트를 fetch.

### 라우트 구조

```
/                              홈페이지 (SSR)
/products                      제품 메인
/products/general-lighting      일반조명 (12개 서브카테고리)
/products/power-supply          파워서플라이 (6개 시리즈)
/products/led-lightsource       LED 광원 (7개 제품군)
/products/[slug]                제품 상세
/about/us|organization|why-led|certifications|dealers
/support                        고객지원 메인
/support/notices|tech-guide|downloads|consultation  게시판 목록
/support/notices/[postId]       게시판 상세 (각 게시판 동일 패턴)
/support/contact|catalog        연락처, 카탈로그 신청
/admin/login                    관리자 로그인
/admin/dashboard                관리자 대시보드
```

### API 엔드포인트

```
/api/auth/[...nextauth]         Next-Auth 인증
/api/products                   GET (필터: categoryId, slug, isNew, isFeatured, page, limit) / POST
/api/products/[id]              GET / PUT / DELETE
/api/categories                 GET (?parentId, ?includeChildren) / POST
/api/boards                     GET (?slug, ?type)
/api/posts                      GET (?boardSlug, ?page, ?search, ?searchField)
/api/posts/[id]                 GET / PUT / DELETE
/api/attachments/[id]/download  파일 다운로드 (스트리밍)
```

### 게시판 시스템

4개 게시판 slug: `notices`, `tech-guide`, `downloads`, `consultation`
- 공통 컴포넌트: `BoardListPage.js` (목록), `BoardViewPage.js` (상세)
- 첨부파일 업로드 경로: `src/uploads/downloads/`, `src/uploads/notices/`
- 게시물 검색: 제목/내용/작성자 필드별 ILIKE 검색

### 파일 구조 (주요 경로)

```
src/app/page.js              홈페이지 (SSR → HomePage 컴포넌트)
src/app/layout.js            루트 레이아웃
src/app/providers.js         SessionProvider 래퍼
src/app/styles/globals.css   전체 스타일 (순수 CSS)
src/components/              16개 클라이언트 컴포넌트
src/lib/prisma.js            Prisma 클라이언트 싱글톤
src/lib/auth.js              인증 헬퍼
src/prisma/schema.prisma     DB 스키마 (276줄)
src/prisma/seed.js           시드 데이터
src/uploads/                 사용자 업로드 파일
database/                    게시판 SQL 스크립트 (Prisma 외부)
```

## Docker 환경

| 컨테이너 | 호스트 포트 | 내부 포트 |
|-----------|-------------|-----------|
| lvs_app | 5555 | 3000 |
| lvs_db | 5556 | 5432 |
| lvs_redis | 5557 | 6379 |
| lvs_adminer | 5558 | 8080 |

- 소스 볼륨 마운트: `./src:/app:cached` (핫 리로드)
- `node_modules`와 `.next`는 익명 볼륨 (호스트/컨테이너 충돌 방지)
- 컨테이너 내부 DB 연결: `database:5432` (localhost 아닌 서비스명 사용)

## 중요 제약사항

1. **호스트에서 `npm run dev` 직접 실행 금지** — 반드시 Docker Compose 사용
2. **스타일링은 순수 CSS** — `globals.css`에 모든 스타일 정의, Tailwind 클래스 사용하지 않음
3. **게시판 관련 DB 작업은 pg Pool** — Prisma 모델에 게시판 테이블이 없음
4. **제품 관련 DB 작업은 Prisma** — 쿼리 빌더 일관성 유지
5. **인증 보호가 클라이언트 사이드 전용** — 서버 미들웨어 없음, 관리 API 호출 시 세션 직접 확인 필요
