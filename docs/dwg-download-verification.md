# DWG 자료실 업로드·다운로드 검증 (2026-09-17)

상태: 구현·개발 검증·운영 배포 완료.

- 관리자 자료 등록·수정 파일 선택에 `.dwg` 추가, DWG 지원 안내 표시.
- 공통 첨부 검증에 DWG 확장자와 CAD MIME 변형 허용. KO/EN 등록·첨부 추가에 적용.
- 기존 파일당 10MB, 요청당 최대 10개 제한과 회원 다운로드 정책 유지.
- 공개 다운로드 API는 기존 바이너리 응답을 그대로 사용. 운영 Docker의 `/app/uploads` → `/app/public/uploads` 연결로 저장 파일을 읽음.

검증 결과:

1. `node --test src/tests/uploadAttachments.test.mjs`: Node 20 및 개발 컨테이너 Node 18에서 3개 테스트 통과. DWG 대소문자·한글명·MIME 변형, 기존 제한·PDF/ZIP 허용, 저장 원본 바이트와 정리 검사.
2. 별도 컨테이너에서 `NODE_ENV=production npm run build`: 성공. 첫 시도는 개발 이미지의 NODE_ENV를 상속해 prerender 오류가 발생했으며, 운영 설정을 명시한 재검증은 통과. 기존 Next 설정 경고는 남아 있음.
3. 임시 PostgreSQL과 standalone 앱에서 KO/EN HTTP 통합 검사: 각각 5종 MIME 신규 등록, 기존 게시물에 첨부 추가, 파일 가용성, 회원 다운로드의 파일명·바이트·길이, 비로그인 401 통과.
4. Playwright 실제 화면 검사: 관리자 신규 한글 `.DWG` 등록, 수정에서 `.dwg` 추가 저장, 일반 회원의 `/support/downloads` 목록 → 게시물 모달 → 두 파일 다운로드 성공. 원본 파일명과 바이트 일치, 브라우저 오류 없음.

운영 DB와 업로드 볼륨에는 테스트 자료를 쓰지 않았으며 검증용 컨테이너와 DB는 종료·제거함.

운영 배포 (사용자 재배포 승인 후 실행):

- 원격 `main` 반영 및 배포 커밋: `3f917c1b41ca2a974fa27218c0d6bcc018d62f32`.
- Coolify 앱: `d9dr3vdf9alez7mjz06uroz0`, 배포: `vebpqfczq4cqdjll8bjvoz08`.
- 2026-09-17 01:33:23 UTC 배포 `finished`. 앱·PostgreSQL healthy, Redis running.
- 기존 업로드 볼륨 유지 및 새 커밋 이미지 실행 확인.
- 운영 `/support/downloads`, `/en/support/downloads` HTTP 200. 비로그인 `/admin/downloads`는 관리자 로그인 화면으로 정상 이동.
- 실제 운영에서 제공되는 관리자 JS의 신규/수정 입력 두 곳에 `.dwg` 포함 확인.
- KO/EN 운영 API에서 DWG MIME 3종(일반 바이너리·표준 DWG·CAD 변형)의 검증 통과 확인. 제목·내용을 생략한 요청을 사용하여 필수 항목 오류에서 종료되게 했으며 운영 게시물·파일은 생성하지 않음.
- 실제 파일 업로드·회원 다운로드의 종단 간 검증은 위 격리 환경에서 완료. 운영에는 같은 검증 완료 소스를 배포했으며 운영 테스트 게시물 생성은 하지 않음.
