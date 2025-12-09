# @successbank/taskmaster-kit

> 한 명령어로 Claude Code에서 Task Master AI MCP 사용 가능하게 설정

## 사용법

```bash
cd your-project
taskmaster-kit init
```

API 키는 `~/.env`에서 자동으로 찾습니다.

## 프로젝트별 커스터마이징

```bash
# Backend API 프로젝트
taskmaster-kit init -t backend -d "사용자 관리 API"

# Frontend 프로젝트
taskmaster-kit init -t frontend -n "admin-dashboard"

# 기술 스택 지정
taskmaster-kit init -t fullstack --tech "Next.js,TypeScript,PostgreSQL"
```

### 프로젝트 타입

| 타입 | 설명 |
|------|------|
| `backend` | Backend API 서버 |
| `frontend` | Frontend 웹 앱 |
| `fullstack` | Fullstack 앱 (Next.js 등) |
| `api` | REST/GraphQL API |
| `cli` | CLI 도구 |
| `library` | 라이브러리/패키지 |
| `mobile` | 모바일 앱 |
| `devops` | DevOps/인프라 |
| `data` | 데이터 파이프라인 |
| `custom` | 커스텀 |

각 타입별로 기본 기술 스택과 개발 컨벤션이 자동 적용됩니다.

## 옵션

```bash
taskmaster-kit init [options]

Options:
  -f, --force              기존 설정 덮어쓰기
  -n, --name <name>        프로젝트 이름
  -t, --type <type>        프로젝트 타입
  -d, --description <desc> 프로젝트 설명
  --tech <stack>           기술 스택 (쉼표 구분)
  -m, --models <preset>    모델 프리셋 (default/performance/economy)
  --source <path>          API 키 경로
```

## 생성되는 파일

| 파일 | 용도 |
|------|------|
| `.mcp.json` | Claude Code MCP 설정 |
| `.env` | CLI용 API 키 |
| `CLAUDE.md` | 프로젝트 가이드 (타입별 커스텀) |
| `.taskmaster/` | Task Master 설정 |

## API 키 설정

`~/.env` 파일에 저장:
```
ANTHROPIC_API_KEY="sk-ant-..."
PERPLEXITY_API_KEY="pplx-..."
OPENAI_API_KEY="sk-proj-..."
GOOGLE_API_KEY="AIza..."
```

## 라이센스

MIT
