# webmail.lvs.co.kr 로그인 페이지 캐릭터 재디자인

**작성일**: 2026-05-09
**대상 시스템**: webmail.lvs.co.kr (Mailcow 1.x 기반 메일 서버)
**관련 인프라**: lvsmailcow-* 컨테이너 그룹 (Coolify 비관리)
**배경**: 로그인 페이지의 mailcow 기본 마스코트(`cow_mailcow.svg`)를 LVS 회사 정체성으로 교체하고, 페이지 전반을 한글 비즈니스 톤으로 재작업.

---

## 1. 목표 (Goal)

webmail.lvs.co.kr 로그인 페이지를 LVS 임직원 메일 서비스에 어울리는 외형으로 전환한다. 구체적으로:

1. **캐릭터 교체**: mailcow 기본 소 마스코트를 LVS 부엉이 로고 기반 SVG 캐릭터로 교체.
2. **회사 정체성 명시**: "주식회사 엘브이에스 이메일 시스템"이라는 한글 회사명을 로그인 카드에 표기.
3. **한글 비즈니스 톤**: 영문 라벨/버튼/안내 문구를 한글로 일괄 변경.
4. **다크모드 호환**: Mailcow의 기존 라이트/다크 토글이 캐릭터·텍스트에서도 자연스럽게 동작.

비목표:
- Mailcow 자체 아키텍처 변경 (코드 리팩터링, 인증 로직 변경 등) 없음.
- 어드민 패널(`/admin`), 도메인 관리자 패널(`/domainadmin`), SOGo UI 변경은 범위 외. 본 작업은 메인 사용자 로그인 페이지(`/`)만 다룬다.
- 다국어 추가/번역 작업 없음. 한국어 단일 진입을 가정한다.

---

## 2. 현재 상태 (Current State)

### 2.1 인프라

- 도메인: `webmail.lvs.co.kr` (HTTPS, Let's Encrypt)
- 컨테이너: `lvsmailcow-nginx-mailcow-1` (Mailcow nginx, image `ghcr.io/mailcow/nginx:1.06`)
- 동거 컨테이너: `lvsmailcow-{sogo,dovecot,postfix,php-fpm,mysql,redis,acme,...}-mailcow-1`
- 정적 자산 위치(컨테이너 내부): `/web/img/cow_mailcow.svg`, `/web/img/cow_lock.svg`, `/web/css/build/0081-custom-mailcow.css`
- Mailcow 빌트인 커스터마이즈 기능: `/web/templates/admin/tab-config-customize.twig` + `/web/inc/functions.customize.inc.php`
- Mailcow 설치 디렉토리(호스트): 추후 `docker inspect`로 확인 (mailcow.conf 위치)

### 2.2 현재 로그인 페이지 구조 (HTML 발췌)

`https://webmail.lvs.co.kr/`의 핵심 영역:

```html
<title>webmail.lvs.co.kr - mail UI</title>
...
<div class="card-header">
  <i class="bi bi-person-fill me-2"></i> User Login
  ...
</div>
<div class="card-body">
  <div class="text-center mailcow-logo mb-4">
    <img class="main-logo" src="/img/cow_mailcow.svg" alt="mailcow">
    <img class="main-logo-dark" src="/img/cow_mailcow.svg" alt="mailcow-logo-dark">
  </div>
  <legend>webmail.lvs.co.kr - mail UI</legend><hr />
  <form method="post">
    <input name="login_user" placeholder="Email address" ...>
    <input name="pass_user" placeholder="Password" ...>
    <button>Login</button>
    ...
  </form>
  <a class="btn btn-secondary" id="fido2-login">FIDO2/WebAuthn Login</a>
  ...
</div>
```

### 2.3 LVS 브랜드 자산

- 회사 로고: `/home/successbank/project_management/lvs2025/src/public/images/logo.png` (1800×536, RGBA, 47KB)
- 구성 요소: 부엉이 일러스트(검정 + 노랑 #F7C600 눈) + "LVS" 워드마크(Arial Black 계열) + tagline "Lighting for Vision System"

---

## 3. 디자인 결정 (Approved Decisions)

### 3.1 캐릭터 방향성 — **B안: 회사 로고 중심**

신규 마스코트 디자인 대신 기존 LVS 브랜드 자산(부엉이 + 워드마크)을 그대로 활용한다. 부엉이 자체가 "Lighting for Vision System"과 의미적으로 호응하고, 별도의 마스코트 디자인 작업 없이 회사 정체성을 즉시 드러낼 수 있다.

### 3.2 레이아웃 — **C안: 좌우 분할 (명함 스타일)**

```
┌─────────────────────────────────────┐
│  [부엉이 SVG]  │  LVS                │
│   (84px)       │  Lighting for      │
│                │  Vision System     │
│                │                    │
│                │  주식회사 엘브이에스 │
│                │  이메일 시스템       │
└─────────────────────────────────────┘
```

- 좌측: 부엉이 SVG (84px 폭). 두 개의 검정 타원 + 노랑 반달 + 검정 부리. LVS 로고에서 부엉이 부분만 추출하여 SVG로 재구성.
- 중앙: 1px 세로 구분선 (라이트=`#e1e4e8`, 다크=`#3a4250`).
- 우측: "LVS" 워드마크(Arial Black 26px, letter-spacing 3px) + tagline(9px) + 한글 회사명(12px bold, 2줄).

### 3.3 작업 범위 — **옵션 2: 한글 비즈니스 톤 (종합)**

| 영역 | 변경 전 | 변경 후 |
|------|---------|---------|
| 브라우저 탭 타이틀 | webmail.lvs.co.kr - mail UI | 주식회사 엘브이에스 이메일 시스템 |
| 카드 헤더 | User Login | 사용자 로그인 |
| legend | webmail.lvs.co.kr - mail UI | 📧 임직원 메일 서비스 |
| 이메일 placeholder | Email address | 이메일 주소 |
| 비밀번호 placeholder | Password | 비밀번호 |
| 로그인 버튼 텍스트 | Login | 로그인 |
| 비밀번호 찾기 링크 | > Forgot Password? | > 비밀번호를 잊으셨나요? |
| FIDO2 버튼 | FIDO2/WebAuthn Login | 🛡️ FIDO2 / WebAuthn 로그인 |
| FIDO2 구분선 | or login with | 또는 다른 방법으로 로그인 |
| 푸터(잘못된 로그인) | Not the correct login? / Log in as admin / Log in as domain admin | 다른 계정으로 로그인 / 관리자 / 도메인 관리자 |

유지하는 영역:
- 다크모드 토글, 언어 선택 드롭다운, FIDO2 동작 로직, 비밀번호 재설정 페이지, CSRF 처리 등 Mailcow 기본 기능 일체.

### 3.4 색상 사양

| 용도 | 라이트 모드 | 다크 모드 |
|------|------------|-----------|
| 페이지 배경 | `#f4f6f8` | `#14181d` |
| 카드 배경 | `#ffffff` | `#1f242b` |
| 카드 외곽선 | `#e1e4e8` | `#2c333c` |
| 본문 텍스트 | `#1a1a1a` | `#ffffff` |
| 보조 텍스트 | `#666666` | `#a0a8b4` |
| 부엉이 외곽 (검정 영역) | `#000000` | `#e6e6e6` |
| 부엉이 눈 (노랑 영역) | `#F7C600` | `#F7C600` (동일 유지) |
| 로그인 버튼 배경 | `#F7C600` | `#F7C600` |
| 로그인 버튼 글자 | `#000000` | `#000000` |
| 안내 문구 강조 | `#1565C0` | `#5BA8E5` |

브랜드 옐로우 `#F7C600`은 라이트/다크 양쪽에서 동일하게 사용해 LVS 정체성 일관성 확보. 기존 mailcow theme-color `#F5D76E`(meta tag)와도 색계열이 호환된다.

### 3.5 캐릭터 SVG 사양

라이트 모드용 (`lvs-owl-light.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 90" width="130" height="90">
  <ellipse cx="40" cy="42" rx="34" ry="28" fill="#000"/>
  <path d="M 12 38 Q 40 20 68 38 L 68 56 Q 40 64 12 56 Z" fill="#F7C600"/>
  <ellipse cx="92" cy="42" rx="34" ry="28" fill="#000"/>
  <path d="M 64 38 Q 92 20 120 38 L 120 56 Q 92 64 64 56 Z" fill="#F7C600"/>
  <path d="M 64 50 L 70 76 L 76 50 Z" fill="#000"/>
</svg>
```

다크 모드용 (`lvs-owl-dark.svg`): 위 SVG에서 `fill="#000"`을 `fill="#e6e6e6"`로 모두 치환.

뷰박스 130×90, 화면 표시 폭 84px(고정). 본 도형은 LVS 로고 부엉이 부분의 단순화 버전이며, 정확한 곡선은 구현 시 logo.png 트레이싱으로 보강한다.

---

## 4. 적용 방식 (Implementation Approach)

상세 단계별 구현은 별도의 implementation plan에서 다룬다. 본 디자인 문서에서는 **방식의 윤곽**만 합의한다.

### 4.1 후보 방식

**방식 A — Mailcow 빌트인 Customization 활용 (권장)**

Mailcow 어드민 패널 → Configuration → Customize 메뉴에서:
- "Custom main logo" 영역에 LVS 부엉이 + 텍스트가 합성된 단일 SVG/PNG 업로드 → `cow_mailcow.svg`를 자동 대체.
- "Custom CSS" 필드에 LVS 옐로우 버튼/한글 폰트/스페이싱 오버라이드 추가 → `0081-custom-mailcow.css`로 저장.
- 한글 라벨 일부는 Mailcow 다국어 시스템(`?lang=ko-kr`) 기본 한국어 번역으로 흡수하고, 부족한 부분만 custom HTML/CSS로 처리.

장점: 컨테이너 파일 직접 수정 없음. Mailcow 업그레이드에도 안전.
한계: 템플릿 자체(legend, button text 등 영문 하드코딩 부분)는 빌트인으로 못 바꾸는 영역이 있을 수 있다. 검증 필요.

**방식 B — 호스트 볼륨 마운트 오버라이드**

`docker-compose.override.yml`에 nginx-mailcow 서비스에 대한 readonly 볼륨 추가:

```yaml
services:
  nginx-mailcow:
    volumes:
      - ./lvs-customizations/img/cow_mailcow.svg:/web/img/cow_mailcow.svg:ro
      - ./lvs-customizations/templates/index.twig:/web/templates/index.twig:ro
      - ./lvs-customizations/css/lvs-overrides.css:/web/css/build/9999-lvs-overrides.css:ro
```

장점: 모든 텍스트/구조까지 자유 변경.
한계: Mailcow가 템플릿 구조를 변경하면 호환성 깨질 수 있음. 업그레이드 시 점검 필요.

**방식 C — 두 방식의 하이브리드 (실제 채택 후보)**

- 캐릭터/로고 → 방식 A (어드민 패널 업로드)
- CSS 스타일 → 방식 A (Custom CSS 필드)
- 템플릿이 강제 영문 하드코딩하는 영역에 한해 → 방식 B (해당 .twig 파일만 마운트)

implementation plan 단계에서 Mailcow 빌트인이 어디까지 커버하는지 검증 후 최종 결정한다.

### 4.2 검증 체크리스트

배포 후 다음을 확인:

- [ ] `https://webmail.lvs.co.kr/` 정상 200 응답
- [ ] 라이트 모드: 부엉이 검정/노랑, 카드 백그라운드 흰색, 버튼 노랑+검정 글자
- [ ] 다크 모드(브라우저 prefers-color-scheme: dark 또는 토글): 부엉이 흰/노랑, 카드 백그라운드 진회색, 버튼은 노랑 유지
- [ ] 한글 라벨 모두 정상 표시 (탭 타이틀, 헤더, placeholder, 버튼)
- [ ] 로그인 폼 동작 (실제 메일 계정으로 로그인 성공)
- [ ] FIDO2 로그인 버튼 클릭 시 기존 동작 유지
- [ ] 비밀번호 재설정 링크 동작 유지
- [ ] 다른 mailcow 화면(/admin, /domainadmin, SOGo)은 영향 없음
- [ ] Mailcow 컨테이너 메모리 사용량 변화 없음

### 4.3 롤백 전략

- 방식 A 사용분: 어드민 패널 → Customize → "Reset to default logo" / Custom CSS 비우기.
- 방식 B 사용분: `docker-compose.override.yml`에서 해당 볼륨 라인 제거 후 `docker compose up -d nginx-mailcow`.
- 변경 전 어드민 패널 customize 상태와 호스트 파일을 백업해둔다.

---

## 5. 영향 분석 (Impact)

| 영역 | 영향 |
|------|------|
| 메일 송수신 | 영향 없음 (UI 레이어만 변경) |
| 사용자 인증 / 세션 | 영향 없음 |
| Mailcow 어드민 패널 | 영향 없음 (메인 로그인만 변경) |
| SOGo 웹메일 UI | 영향 없음 (별도 컨테이너, 별도 UI) |
| 다른 lvsmailcow-* 컨테이너 | 영향 없음 |
| Mailcow 업그레이드 | 빌트인 customize는 안전, 볼륨 마운트는 템플릿 구조 변경 시 점검 필요 |

다운타임 추정: nginx-mailcow 컨테이너 재시작 시 약 5-10초 (HTML 페이지만 영향, 메일 프로토콜 IMAP/SMTP/POP3는 별도 컨테이너).

---

## 6. 열린 질문 (Open Questions)

implementation plan 단계에서 결정해야 할 항목:

1. Mailcow 어드민 패널 Customize 페이지가 실제로 어디까지 커버하는가? (legend 텍스트, 버튼 텍스트, placeholder까지 변경 가능한지 직접 확인 필요)
2. 부엉이 SVG를 정확히 logo.png 트레이싱 결과로 만들지, 아니면 본 문서의 단순화 버전을 그대로 쓸지.
3. 한글 라벨을 어드민 Customize의 "UI texts" 기능으로 처리할 수 있는지, 아니면 템플릿 직접 수정이 필요한지.
4. 변경된 페이지 스크린샷을 어디에 보관할지 (회사 레코드용).

---

## 7. 참고 자료

- 현재 페이지 HTML 캡처: `/tmp/webmail_login.html` (이미 분석 완료)
- LVS 로고: `/home/successbank/project_management/lvs2025/src/public/images/logo.png`
- Mailcow customize 문서(공식): https://docs.mailcow.email/manual-guides/Mailcow-UI/u_e-mailcow_ui-customize/
- 비주얼 시안 보존: `/home/successbank/project_management/lvs2025/.superpowers/brainstorm/3006496-1778317109/content/`
