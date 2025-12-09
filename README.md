# LVS (Lighting for Vision System) - 웹사이트 리뉴얼

산업용 LED 조명 전문 기업 (주)엘브이에스의 공식 웹사이트

## 🚀 프로젝트 개요

- **목적**: lvs.co.kr 한글 버전 콘텐츠를 현대적인 Next.js 14 디자인으로 재구축
- **기술 스택**: Next.js 14, React 18, Prisma, PostgreSQL, Redis, Docker
- **주요 기능**: 제품 관리, 카테고리 관리, 공지사항, 문의 관리, 관리자 페이지

## 📋 시스템 구성

### Frontend
- **Next.js 14.2.5** - App Router 사용
- **React 18.3.1** - Server Component & Client Component 혼용
- **Tailwind CSS** - 스타일링
- **Next-Auth 4.24** - 인증 시스템
- **Embla Carousel** - 이미지 슬라이더

### Backend
- **Prisma ORM 5.22** - 데이터베이스 ORM
- **Next.js API Routes** - RESTful API
- **bcryptjs** - 비밀번호 암호화
- **Formidable** - 파일 업로드

### Database
- **PostgreSQL 15** - 메인 데이터베이스
- **Redis 7** - 세션 및 캐싱

### Infrastructure
- **Docker Compose** - 4개 컨테이너 오케스트레이션
  - app: Next.js 애플리케이션
  - database: PostgreSQL
  - redis: Redis 캐시
  - adminer: DB 관리 도구

## 🔧 개발 환경 설정

### 1. 환경변수 설정

`.env` 파일이 이미 구성되어 있습니다:

```env
# Docker Configuration
PROJECT_NAME=lvs
WEB_PORT=5555
DB_PORT=5556
REDIS_PORT=5557
ADMINER_PORT=5558

# Database
DB_NAME=lvs_db
DB_USER=lvs_user
DB_PASSWORD=Yhq7xeDCA5h6v0ApgAVuX4588

# Application
NEXT_PUBLIC_API_URL=http://211.248.112.67:5555
NEXTAUTH_URL=http://211.248.112.67:5555
NEXTAUTH_SECRET=lvs-nextauth-secret-2025-change-in-production
```

### 2. Docker 컨테이너 시작

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 서비스 중지
docker-compose down
```

### 3. 접속 정보

- **사용자 웹사이트**: http://211.248.112.67:5555
- **관리자 페이지**: http://211.248.112.67:5555/admin/login
- **Adminer (DB 관리)**: http://211.248.112.67:5558

### 4. 관리자 계정

```
이메일: admin@lvs.co.kr
비밀번호: admin123
```

## 📁 프로젝트 구조

```
lvs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js            # 홈페이지 (서버 컴포넌트)
│   │   ├── layout.js          # 루트 레이아웃
│   │   ├── providers.js       # Next-Auth Provider
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Next-Auth API
│   │   │   ├── products/      # 제품 API
│   │   │   └── categories/    # 카테고리 API
│   │   └── admin/             # 관리자 페이지
│   │       ├── login/         # 로그인
│   │       └── dashboard/     # 대시보드
│   ├── components/            # React 컴포넌트
│   │   └── HomePage.js        # 홈페이지 클라이언트 컴포넌트
│   ├── lib/                   # 유틸리티
│   │   ├── prisma.js          # Prisma Client
│   │   └── auth.js            # 인증 헬퍼
│   ├── prisma/                # Prisma 설정
│   │   ├── schema.prisma      # DB 스키마
│   │   └── seed.js            # 시드 데이터
│   ├── public/                # 정적 파일
│   │   └── uploads/           # 업로드 파일
│   └── package.json
├── docker/                    # Dockerfile
├── docker-compose.yml         # Docker 설정
├── .env                       # 환경변수
├── init-db.sql               # DB 초기 스키마
└── seed-data.sql             # 시드 데이터 SQL
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블

1. **users** - 사용자 및 관리자
2. **categories** - 제품 카테고리 (계층 구조)
3. **products** - 제품 정보
4. **product_images** - 제품 이미지
5. **product_specs** - 제품 스펙
6. **product_files** - PDF/DWG 파일
7. **sliders** - 홈페이지 슬라이더
8. **notices** - 공지사항
9. **inquiries** - 온라인 문의
10. **catalog_requests** - 카탈로그 신청
11. **partners** - 파트너사 로고
12. **company_info** - 회사 정보

### 카테고리 구조

**대분류 (3개)**:
- 일반조명 (12개 하위 카테고리)
- 파워서플라이 (6개 하위 카테고리)
- LED 라이트소스 (6개 하위 카테고리)

**총 27개 카테고리**

## 🔌 API 엔드포인트

### 제품 API

```
GET    /api/products              # 제품 목록 조회
POST   /api/products              # 제품 생성 (관리자)
GET    /api/products/[id]         # 제품 상세 조회
PUT    /api/products/[id]         # 제품 수정 (관리자)
DELETE /api/products/[id]         # 제품 삭제 (관리자)
```

**쿼리 파라미터**:
- `categoryId`: 카테고리 필터
- `isNew`: 신제품만 조회
- `isFeatured`: 추천 제품만 조회
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

### 카테고리 API

```
GET    /api/categories            # 카테고리 목록 조회
POST   /api/categories            # 카테고리 생성 (관리자)
```

**쿼리 파라미터**:
- `parentId`: 부모 카테고리 ID
- `includeChildren`: 하위 카테고리 포함 여부

### 인증 API

```
POST   /api/auth/signin           # 로그인
POST   /api/auth/signout          # 로그아웃
GET    /api/auth/session          # 세션 조회
```

## 🎨 주요 기능

### 사용자 웹사이트

✅ **홈페이지**
- 히어로 슬라이더 (자동 재생, 4개 슬라이드)
- 추천 제품 표시
- 카테고리별 제품 그리드
- 공지사항
- 서비스 바로가기
- 회사 정보 푸터

✅ **반응형 디자인**
- 모바일 햄버거 메뉴
- 태블릿/데스크톱 최적화

✅ **데이터베이스 연동**
- Server Component로 SSR 구현
- Prisma로 DB 쿼리
- 실시간 데이터 표시

### 관리자 페이지

✅ **인증 시스템**
- Next-Auth 기반 로그인
- JWT 세션 관리
- Role-based 접근 제어

✅ **대시보드**
- 통계 카드
- 빠른 메뉴 링크
- 최근 활동 요약

## 🚧 개발 중인 기능

다음 기능들은 기본 구조만 완성되어 있으며, 세부 구현이 필요합니다:

### 관리자 페이지
- [ ] 제품 CRUD 전체 구현
- [ ] 카테고리 관리 UI
- [ ] 이미지 업로드 기능
- [ ] 문의 관리 시스템
- [ ] 공지사항 에디터 (WYSIWYG)
- [ ] 슬라이더 관리
- [ ] 파일 관리 라이브러리

### 사용자 페이지
- [ ] 제품 상세 페이지
- [ ] 제품 목록 페이지 (필터링, 검색)
- [ ] 회사소개 페이지
- [ ] 고객센터 페이지
- [ ] 온라인 상담실
- [ ] 카탈로그 신청 폼
- [ ] 찾아오시는 길 (Kakao Map)

### 고급 기능
- [ ] 전역 검색 기능
- [ ] SEO 최적화
- [ ] 이미지 최적화
- [ ] 성능 개선
- [ ] 다국어 지원 (영어)

## 📝 개발 가이드

### 새 API 추가

```javascript
// src/app/api/example/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const data = await prisma.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

### 새 페이지 추가

```javascript
// Server Component (default)
import prisma from '@/lib/prisma';

export default async function Page() {
  const data = await prisma.model.findMany();
  return <div>{/* UI */}</div>;
}

// Client Component
'use client';
import { useState } from 'react';

export default function Page() {
  const [state, setState] = useState(null);
  return <div>{/* Interactive UI */}</div>;
}
```

### Prisma 스키마 변경

```bash
# 1. schema.prisma 수정

# 2. 마이그레이션 생성 (개발 중일 때는 SQL로 직접 수정)
docker exec -i lvs_db psql -U lvs_user -d lvs_db < your-changes.sql

# 3. Prisma Client 재생성
docker exec lvs_app npx prisma generate
```

## 🐛 문제 해결

### Prisma 연결 오류

```bash
# OpenSSL 라이브러리 설치
docker exec lvs_app apk add --no-cache openssl-dev

# Prisma Client 재생성
docker exec lvs_app npx prisma generate
```

### 컨테이너 재시작

```bash
# 전체 재시작
docker-compose restart

# 특정 컨테이너만
docker-compose restart app
```

### 로그 확인

```bash
# 앱 로그
docker-compose logs -f app

# DB 로그
docker-compose logs -f database

# 전체 로그
docker-compose logs -f
```

## 📚 참고 자료

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next-Auth Documentation](https://next-auth.js.org)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 📄 라이선스

Copyright (C) (주)엘브이에스. All Rights Reserved.

## 👨‍💻 개발 정보

**개발 날짜**: 2025-12-09
**개발 환경**: Docker + Next.js 14 + PostgreSQL 15
**접속 주소**: http://211.248.112.67:5555

---

**Note**: 이 프로젝트는 기본 구조와 핵심 기능이 완성된 상태입니다. 추가 기능 개발 및 콘텐츠 입력이 필요합니다.
