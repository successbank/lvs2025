# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고할 수 있는 가이드를 제공합니다.

## 프로젝트 개요

LVS (Lighting for Vision System)는 조명 시스템 회사의 기업 웹사이트입니다. PostgreSQL과 Redis를 사용하는 Docker 기반 개발 환경에서 실행되는 Next.js 14 애플리케이션입니다.

## 아키텍처

## ai와의 소통언어
- 한국어

**기술 스택:**
- Next.js 14.2.5 with App Router (`src/app/`)
- React 18.3.1
- Node.js 18 (Alpine container)
- PostgreSQL 15 (Alpine)
- Redis 7 (Alpine)
- Tailwind 디자인 활용.

**Docker 서비스:**
애플리케이션은 4개 컨테이너 스택으로 실행됩니다:
- `lvs_app`: Next.js 애플리케이션 (포트 5555)
- `lvs_db`: PostgreSQL 데이터베이스 (포트 5556)
- `lvs_redis`: Redis 캐시 (포트 5557)
- `lvs_adminer`: 데이터베이스 관리 UI (포트 5558)

모든 서비스는 `app-network` 브리지 네트워크를 통해 통신합니다. 데이터는 `postgres_data`와 `redis_data` 볼륨에 영구 저장됩니다.

## 개발 명령어

### 애플리케이션 시작

```bash
# 모든 서비스 시작 (프로젝트 루트에서)
docker-compose up -d

# 애플리케이션 로그 확인
docker-compose logs -f app

# 모든 서비스 중지
docker-compose down

# 코드 변경 후 재시작
docker-compose restart app
```

애플리케이션은 http://localhost:5555 에서 접근할 수 있습니다.

### 컨테이너 접근

```bash
# app 컨테이너에서 명령 실행
docker exec -it lvs_app sh

# PostgreSQL CLI 접근
docker exec -it lvs_db psql -U lvs_user -d lvs_db

# Redis CLI 접근
docker exec -it lvs_redis redis-cli -a VQfag01CFpqJ62IB
```

### 데이터베이스 관리

- Adminer UI: http://localhost:5558
- System: PostgreSQL
- Server: database
- Username: lvs_user
- Password: Yhq7xeDCA5h6v0ApgAVuX4588
- Database: lvs_db

## 프로젝트 구조

```
lvs/
├── src/                    # Next.js 애플리케이션
│   ├── app/               # App Router 페이지 및 레이아웃
│   │   ├── page.js        # 메인 홈페이지 컴포넌트
│   │   ├── layout.js      # 루트 레이아웃
│   │   └── styles/        # 전역 CSS
│   └── package.json       # 의존성 패키지
├── docker/                # 멀티 스테이지 Dockerfile
├── docker-compose.yml     # 서비스 오케스트레이션
├── .env                   # 환경 설정
├── logs/                  # 애플리케이션 로그
├── backups/              # 데이터베이스 백업
└── query/                # SQL 쿼리 스크립트
```

## 애플리케이션 아키텍처

**현재 구현 사항:**
애플리케이션은 단일 페이지 홈페이지(`src/app/page.js`)로 다음 기능을 포함합니다:
- React hooks를 사용한 클라이언트 사이드 컴포넌트 상태 관리
- 햄버거 메뉴가 있는 모바일 반응형 내비게이션
- 3단계 다중 스텝 위저드 제품 찾기 모달
- 5초마다 자동 회전하는 제품 쇼케이스 캐러셀 히어로 섹션
- 회사 전화번호가 있는 연락처 배너
- 표준 조명 제품 그리드
- 공지사항 섹션 및 서비스 빠른 링크
- 회사 정보가 있는 푸터

**주요 UI 컴포넌트:**
- 상단 내비게이션 바와 메인 내비게이션이 있는 헤더
- 슬라이드 인 애니메이션이 있는 모바일 메뉴 오버레이
- 옵션 카드 및 단계 내비게이션이 있는 제품 찾기 모달
- 4개 슬라이드가 있는 히어로 캐러셀
- 12개 조명 제품 카테고리를 표시하는 제품 그리드
- 연락처 배너 및 푸터

**상태 관리:**
모든 상태는 React useState hooks로 로컬 관리됩니다:
- `mobileMenuOpen`: 모바일 메뉴 표시 여부 제어
- `productFinderOpen`: 제품 찾기 모달 제어
- `currentStep`: 제품 찾기 위저드 단계 추적 (1-3)
- `selectedOption`: 각 위저드 단계에서 선택된 옵션 저장
- `currentSlide`: 현재 히어로 캐러셀 슬라이드 추적

## 환경 변수

데이터베이스 연결은 docker-compose.yml에서 자동 구성됩니다:
```
DATABASE_URL=postgresql://lvs_user:Yhq7xeDCA5h6v0ApgAVuX4588@database:5432/lvs_db
REDIS_URL=redis://:VQfag01CFpqJ62IB@redis:6379
```

포트 매핑 (`.env`에 정의):
- WEB_PORT=5555 (Next.js app)
- DB_PORT=5556 (PostgreSQL)
- REDIS_PORT=5557 (Redis)
- ADMINER_PORT=5558 (Adminer)

## 개발 워크플로우

**핫 리로드:**
소스 코드는 자동 핫 리로드를 위해 볼륨 마운트됩니다(`./src:/app:cached`). `WATCHPACK_POLLING=true` 환경 변수가 Docker에서 파일 감시를 활성화합니다.

**Node Modules:**
호스트와 컨테이너 환경 간 충돌을 방지하기 위해 `node_modules`와 `.next`는 익명 볼륨에 보관됩니다.

**컨테이너 시작:**
app 컨테이너는 시작 시 자동으로 `npm install && npm run dev`를 실행합니다.

## 중요 참고사항

1. **호스트에서 직접 `npm run dev` 실행 금지** - 포트 충돌을 방지하기 위해 항상 `docker-compose up` 사용
2. **컨테이너 내부에서 데이터베이스 연결** 시 `localhost:5556`이 아닌 서비스 이름 `database:5432` 사용 필수
3. **컨테이너 내부에서 Redis 연결** 시 `localhost:5557`이 아닌 `redis:6379` 사용 필수
4. **모바일 메뉴 상태**는 메뉴가 열릴 때 스크롤을 방지하기 위해 body overflow를 관리합니다
5. **제품 찾기**는 다음 단계로 진행하기 전에 옵션 선택이 필요한 3단계 위저드입니다
6. **캐러셀 자동 회전**은 useEffect 클린업을 사용하여 5초 간격으로 실행됩니다

## 현재 상태

프로젝트는 정적 콘텐츠가 있는 기본 홈페이지 구현을 가지고 있습니다. 조명 제품 데이터는 컴포넌트에 하드코딩되어 있습니다. 백엔드 API, 데이터베이스 스키마 또는 관리자 패널은 아직 구현되지 않았습니다.
