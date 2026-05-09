# webmail.lvs.co.kr 커스터마이징 산출물

LVS 메일 시스템(Mailcow 기반) 로그인 페이지의 캐릭터/로고/한글화를 위한 자산입니다.

## 구성 파일

| 파일 | 용도 | 적용 방식 |
|------|------|----------|
| `assets/lvs-mailcow-logo.svg` | 라이트 모드 메인 로고 | Mailcow 어드민 → Configuration → Customize → Main logo |
| `assets/lvs-mailcow-logo-dark.svg` | 다크 모드 메인 로고 | Mailcow 어드민 → Customize → Main logo (dark) |
| `css/lvs-overrides.css` | 버튼 색상/링크 색상 | Mailcow 어드민 → Customize → Custom CSS |
| `lang/lang.ko-kr.json` | 한글 번역 보강 | `docker-compose.override.yml`로 readonly 마운트 |

## 배포 위치

호스트: `/opt/lvs-mailcow/lvs-customizations/`

## 관련 문서

- 디자인 스펙: `docs/superpowers/specs/2026-05-09-webmail-character-redesign-design.md`
- 실행 계획: `docs/superpowers/plans/2026-05-09-webmail-character-redesign-plan.md`

## 롤백

Task 13 참조.
