# Changelog

## [1.0.0] - 2024-12-06

### Added
- 초기 릴리스
- `taskmaster-kit init` 명령어
- API 키 자동 탐색 (상위 디렉토리 → 홈 디렉토리)
- .mcp.json, .env, CLAUDE.md, .taskmaster/config.json 자동 생성
- 모델 프리셋 (default, performance, economy)
- 65개 단위 테스트

### Features
- `--force`: 기존 설정 덮어쓰기
- `--models <preset>`: 모델 프리셋 선택
- `--source <path>`: API 키 경로 지정

### Technical
- TypeScript + ESM
- Commander.js CLI
- Jest 테스트 환경
