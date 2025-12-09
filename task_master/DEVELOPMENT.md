# @successbank/taskmaster-kit 개발 히스토리

## 프로젝트 개요

**목적**: 새 프로젝트에서 한 명령어로 Claude Code MCP(Task Master AI) 환경을 설정

**핵심 가치**:
- `~/.env`에 API 키를 한 번만 설정하면 모든 프로젝트에서 자동 적용
- `taskmaster-kit init` 한 명령어로 MCP 설정 완료

---

## 개발 히스토리

### 2024-12-06: v1.0.0 초기 개발

#### Phase 1: 초기 구현
- Commander.js 기반 CLI 구조 설계
- 대화형 프롬프트 (Inquirer.js) 구현
- 템플릿 생성기 구현 (.mcp.json, .env, CLAUDE.md, config.json)
- AES-256 암호화 전역 자격증명 저장소 구현
- Jest 테스트 환경 구축 (65개 테스트)

#### Phase 2: 간소화 리팩토링
**문제점 발견**:
- `--skip-prompts --source /path` 매번 입력 불편
- 전역 암호화 저장소 불필요 (나만 사용)
- config 명령어 과잉 기능

**개선 내용**:
1. API 키 자동 탐색 기능 추가
   - 상위 디렉토리 → 홈 디렉토리 순차 탐색
   - `~/.env` 또는 `~/.taskmaster/.env` 자동 발견
2. 대화형 프롬프트 제거 → 기본 비대화형
3. config 명령어 제거
4. CLI 옵션 간소화 (`-f`, `-m`, `--source`만 유지)
5. README 118줄 → 66줄로 간소화

#### Phase 3: 배포 설정
- 로컬 전용 사용 결정 (npm 퍼블리시 안함)
- `npm link`로 전역 명령어 등록
- 리눅스 배포용 tar.gz 2종 생성

---

## 프로젝트 구조

```
task_master/
├── bin/
│   └── cli.js              # 실행 진입점
├── src/
│   ├── index.ts            # CLI 정의 (Commander.js)
│   ├── commands/
│   │   ├── init.ts         # init 명령어 (핵심)
│   │   └── config.ts       # config 명령어 (미사용)
│   ├── templates/
│   │   ├── index.ts        # 템플릿 내보내기
│   │   ├── mcp-json.ts     # .mcp.json 생성
│   │   ├── env.ts          # .env 생성
│   │   ├── claude-md.ts    # CLAUDE.md 생성
│   │   └── taskmaster-config.ts  # config.json 생성
│   ├── utils/
│   │   ├── env-loader.ts   # .env 파일 탐색/파싱 (핵심)
│   │   ├── credentials.ts  # 암호화 저장소 (미사용)
│   │   ├── validators.ts   # API 키 검증
│   │   └── prompts.ts      # 대화형 프롬프트 (미사용)
│   └── types/
│       └── index.ts        # 타입 정의, 모델 프리셋
├── tests/
│   ├── utils/
│   │   ├── env-loader.test.ts
│   │   ├── credentials.test.ts
│   │   └── validators.test.ts
│   ├── templates/
│   │   └── templates.test.ts
│   └── types/
│       └── types.test.ts
├── dist/                   # 빌드 출력
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 핵심 파일 설명

### src/utils/env-loader.ts
API 키 자동 탐색의 핵심 로직

```typescript
// 탐색 우선순위
1. --source 옵션으로 지정된 경로
2. 현재 디렉토리 → 상위 디렉토리 순차 탐색
3. ~/.env (홈 디렉토리)
4. ~/.taskmaster/.env
```

### src/commands/init.ts
메인 명령어. API 키 탐색 → 파일 생성

### src/types/index.ts
모델 프리셋 정의:
- `default`: Gemini 3 Pro, Perplexity Sonar Pro, GPT-4o
- `performance`: Claude Opus 4.5, Perplexity Deep Research, Gemini 3 Pro
- `economy`: Gemini 2.0 Flash, Perplexity Sonar, GPT-4o Mini

---

## 개발 명령어

```bash
# 개발
npm run build          # TypeScript 빌드
npm test               # 테스트 실행 (65개)
npm run dev            # 개발 모드 실행

# 배포
npm link               # 전역 명령어 등록
npm unlink             # 전역 명령어 제거
npm pack               # .tgz 패키지 생성
```

---

## 리눅스 배포

### 배포 파일 위치
```
/Users/successbank/local/task_master/
├── taskmaster-kit-package.tar.gz      # 패키지만
└── taskmaster-kit-with-keys.tar.gz    # API 키 포함
```

### 리눅스 설치 명령어
```bash
tar -xzvf taskmaster-kit-with-keys.tar.gz
mv .env ~/.env
cd task_master && npm install && npm run build && npm link
```

---

## 향후 개선 아이디어

### 단기
- [ ] 설치 스크립트 자동화 (install.sh)
- [ ] API 키 유효성 실시간 검증

### 중기
- [ ] 여러 프로필 지원 (work, personal 등)
- [ ] MCP 서버 상태 확인 명령어

### 장기
- [ ] 다른 MCP 서버 템플릿 추가 지원
- [ ] 프로젝트별 모델 설정 오버라이드

---

## 의존성

### 런타임
- `commander`: CLI 프레임워크
- `chalk`: 터미널 색상
- `fs-extra`: 파일 시스템 유틸리티
- `inquirer`: 대화형 프롬프트 (현재 미사용)

### 개발
- `typescript`: 타입스크립트
- `jest`, `ts-jest`: 테스트
- `@types/*`: 타입 정의

---

## API 키 위치

현재 Mac에서 사용 중인 API 키:
```
/Users/successbank/.env
```

지원 프로바이더:
- ANTHROPIC_API_KEY (Claude)
- OPENAI_API_KEY (GPT)
- GOOGLE_API_KEY (Gemini)
- PERPLEXITY_API_KEY (Research)
- MISTRAL_API_KEY
- XAI_API_KEY (Grok)
- OPENROUTER_API_KEY

---

## 문제 해결 기록

### .env 파싱 오류 (2024-12-06)
**문제**: 따옴표 + 인라인 주석 형식 파싱 실패
```
ANTHROPIC_API_KEY="sk-ant-..."       # comment
```

**해결**: `env-loader.ts`에서 따옴표 내부만 값으로 인식하도록 수정

### ESM 모듈 Jest 오류 (2024-12-06)
**문제**: `Cannot use import statement outside a module`

**해결**: `NODE_OPTIONS='--experimental-vm-modules'` 추가

---

## 연락처

개발자: successbank
라이센스: MIT
