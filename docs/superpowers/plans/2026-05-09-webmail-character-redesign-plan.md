# webmail.lvs.co.kr 캐릭터 재디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mailcow 기본 소 마스코트를 LVS 부엉이 + 한글 회사명으로 교체하고 로그인 페이지를 한글 비즈니스 톤으로 전환한다.

**Architecture:** Mailcow의 빌트인 Customize 패널(로고/CSS/main_name)을 1차 활용하고, 부족한 한국어 번역은 `lang.ko-kr.json`을 확장한 파일을 readonly volume으로 마운트한다. 컨테이너 자체나 Mailcow 코어 템플릿은 수정하지 않으며, 모든 변경은 mailcow 업그레이드에도 안전하게 유지되도록 설계.

**Tech Stack:** Mailcow 1.x (nginx + PHP/twig), Docker Compose, SVG, JSON, CSS. 호스트 위치 `/opt/lvs-mailcow/`. 변경 산출물은 `lvs2025` 저장소의 `webmail-customizations/` 디렉토리에 버전 관리.

**Spec:** `docs/superpowers/specs/2026-05-09-webmail-character-redesign-design.md`

---

## File Structure

산출물은 `lvs2025` 저장소에 다음 구조로 배치한다:

```
webmail-customizations/
├── README.md                          # 운영 가이드 + 롤백 절차
├── assets/
│   ├── lvs-mailcow-logo.svg           # 라이트 모드용 (부엉이+LVS+한글 회사명)
│   └── lvs-mailcow-logo-dark.svg      # 다크 모드용
├── css/
│   └── lvs-overrides.css              # LVS 옐로우 버튼, 레이아웃 미세조정
└── lang/
    └── lang.ko-kr.json                # login.* 키 보강한 한국어 번역
```

배포 시에는 `/opt/lvs-mailcow/lvs-customizations/`로 복사하고, `/opt/lvs-mailcow/docker-compose.override.yml`이 해당 디렉토리에서 readonly 마운트한다.

각 파일의 책임:
- **lvs-mailcow-logo*.svg**: 부엉이 캐릭터 + "LVS" 워드마크 + tagline + "주식회사 엘브이에스 / 이메일 시스템" 모두 포함하는 단일 이미지. Mailcow Customize 패널의 main_logo / main_logo_dark 슬롯에 업로드.
- **lvs-overrides.css**: 로그인 버튼 색상(`#F7C600`), 링크 색상, 메인 로고 max-width 조정. Customize 패널의 Custom CSS 필드에 붙여넣기.
- **lang.ko-kr.json**: Mailcow 기본 한국어 번역 + login 섹션의 누락/오류 키(login_user, email, forgot_password, fido2_webauthn, other_logins) 보강. 기존 파일을 컨테이너 내부에서 덮어쓰는 readonly volume.

---

## Task 1: 사전 점검 및 백업

**Files:**
- 백업 위치: `/home/successbank/backups/mailcow-customize-2026-05-09/`

- [ ] **Step 1: 백업 디렉토리 생성**

```bash
mkdir -p /home/successbank/backups/mailcow-customize-2026-05-09
```

- [ ] **Step 2: 현재 페이지 HTML 스냅샷 (변경 전 비교용)**

```bash
curl -sL https://webmail.lvs.co.kr/ -o /home/successbank/backups/mailcow-customize-2026-05-09/before.html
curl -sL "https://webmail.lvs.co.kr/?lang=ko-kr" -o /home/successbank/backups/mailcow-customize-2026-05-09/before-ko.html
```

Expected: 두 파일 생성, 각 ~25KB 내외.

- [ ] **Step 3: 현재 mailcow.conf 백업**

```bash
sudo cp /opt/lvs-mailcow/mailcow.conf /home/successbank/backups/mailcow-customize-2026-05-09/mailcow.conf.bak
```

- [ ] **Step 4: 현재 docker-compose.override.yml 백업 (있다면)**

```bash
sudo cp /opt/lvs-mailcow/docker-compose.override.yml /home/successbank/backups/mailcow-customize-2026-05-09/docker-compose.override.yml.bak 2>/dev/null && echo "백업됨" || echo "기존 override 없음 — OK"
```

- [ ] **Step 5: 현재 Mailcow 내장 lang.ko-kr.json 백업 (참고용)**

```bash
docker exec lvsmailcow-nginx-mailcow-1 cat /web/lang/lang.ko-kr.json > /home/successbank/backups/mailcow-customize-2026-05-09/lang.ko-kr.original.json
ls -la /home/successbank/backups/mailcow-customize-2026-05-09/lang.ko-kr.original.json
```

Expected: 파일 크기 30KB 이상.

- [ ] **Step 6: 현재 Customize 상태 확인 (현재 등록된 logo/main_name 있는지)**

```bash
docker exec lvsmailcow-redis-mailcow-1 redis-cli GET MAIN_NAME
docker exec lvsmailcow-redis-mailcow-1 redis-cli EXISTS MAIN_LOGO
docker exec lvsmailcow-redis-mailcow-1 redis-cli EXISTS MAIN_LOGO_DARK
```

Expected: `MAIN_NAME` 비어있거나 기본값. `EXISTS` 모두 `(integer) 0` (현재 커스텀 없음).

이 결과를 백업 디렉토리에 메모로 남긴다:

```bash
cat > /home/successbank/backups/mailcow-customize-2026-05-09/redis-state.txt <<EOF
MAIN_NAME: $(docker exec lvsmailcow-redis-mailcow-1 redis-cli GET MAIN_NAME)
MAIN_LOGO exists: $(docker exec lvsmailcow-redis-mailcow-1 redis-cli EXISTS MAIN_LOGO)
MAIN_LOGO_DARK exists: $(docker exec lvsmailcow-redis-mailcow-1 redis-cli EXISTS MAIN_LOGO_DARK)
captured_at: $(date -Iseconds)
EOF
cat /home/successbank/backups/mailcow-customize-2026-05-09/redis-state.txt
```

- [ ] **Step 7: 양방향 헬스체크 (변경 전 baseline)**

```bash
curl -sI --max-time 10 https://webmail.lvs.co.kr/ | head -5
echo "---"
curl -s --max-time 10 https://webmail.lvs.co.kr/ | grep -E "<title>|cow_mailcow" | head -3
```

Expected: HTTP/2 200, title에 "mail UI", img src에 cow_mailcow.svg.

- [ ] **Step 8: Mailcow 어드민 UI 접근 가능 여부 확인**

`https://webmail.lvs.co.kr/admin` 을 브라우저로 열어 어드민 계정으로 로그인 가능한지 확인한다. 어드민 비밀번호가 없으면 기존 운영 담당자에게 확인 후 진행. **이 plan은 어드민 UI 접근이 가능하다는 전제로 작성되었음.**

---

## Task 2: 산출물 디렉토리 생성

**Files:**
- Create: `webmail-customizations/README.md`
- Create: `webmail-customizations/assets/`
- Create: `webmail-customizations/css/`
- Create: `webmail-customizations/lang/`

- [ ] **Step 1: 디렉토리 생성**

```bash
cd /home/successbank/project_management/lvs2025
mkdir -p webmail-customizations/{assets,css,lang}
ls -la webmail-customizations/
```

Expected: 3개 디렉토리.

- [ ] **Step 2: README skeleton 작성**

`webmail-customizations/README.md`:

````markdown
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
````

```bash
cat webmail-customizations/README.md | head -10
```

Expected: 제목과 표 출력.

- [ ] **Step 3: 커밋**

```bash
cd /home/successbank/project_management/lvs2025
git add webmail-customizations/README.md
git commit -m "[chore] webmail-customizations 디렉토리 + README 스켈레톤 추가"
```

---

## Task 3: LVS 부엉이 로고 SVG 작성 (라이트 + 다크)

**Files:**
- Create: `webmail-customizations/assets/lvs-mailcow-logo.svg`
- Create: `webmail-customizations/assets/lvs-mailcow-logo-dark.svg`

- [ ] **Step 1: 라이트 모드 SVG 작성**

`webmail-customizations/assets/lvs-mailcow-logo.svg`:

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 140" width="380" height="140" role="img" aria-label="주식회사 엘브이에스 이메일 시스템">
  <title>주식회사 엘브이에스 이메일 시스템</title>
  <!-- 부엉이 (좌측, 130x90 영역을 translate(20,25) 위치에) -->
  <g transform="translate(20, 25)">
    <ellipse cx="40" cy="42" rx="34" ry="28" fill="#000000"/>
    <path d="M 12 38 Q 40 20 68 38 L 68 56 Q 40 64 12 56 Z" fill="#F7C600"/>
    <ellipse cx="92" cy="42" rx="34" ry="28" fill="#000000"/>
    <path d="M 64 38 Q 92 20 120 38 L 120 56 Q 92 64 64 56 Z" fill="#F7C600"/>
    <path d="M 64 50 L 70 76 L 76 50 Z" fill="#000000"/>
  </g>
  <!-- 세로 구분선 -->
  <line x1="170" y1="35" x2="170" y2="115" stroke="#e1e4e8" stroke-width="1"/>
  <!-- 우측 텍스트 -->
  <text x="190" y="55" font-family="'Arial Black', 'Helvetica', sans-serif" font-weight="900" font-size="32" letter-spacing="3" fill="#1a1a1a">LVS</text>
  <text x="190" y="73" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#666666" letter-spacing="0.3">Lighting for Vision System</text>
  <text x="190" y="98" font-family="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif" font-weight="700" font-size="13" fill="#1a1a1a">주식회사 엘브이에스</text>
  <text x="190" y="116" font-family="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif" font-weight="700" font-size="13" fill="#1a1a1a">이메일 시스템</text>
</svg>
```

- [ ] **Step 2: 다크 모드 SVG 작성**

`webmail-customizations/assets/lvs-mailcow-logo-dark.svg`:

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 140" width="380" height="140" role="img" aria-label="주식회사 엘브이에스 이메일 시스템">
  <title>주식회사 엘브이에스 이메일 시스템</title>
  <g transform="translate(20, 25)">
    <ellipse cx="40" cy="42" rx="34" ry="28" fill="#e6e6e6"/>
    <path d="M 12 38 Q 40 20 68 38 L 68 56 Q 40 64 12 56 Z" fill="#F7C600"/>
    <ellipse cx="92" cy="42" rx="34" ry="28" fill="#e6e6e6"/>
    <path d="M 64 38 Q 92 20 120 38 L 120 56 Q 92 64 64 56 Z" fill="#F7C600"/>
    <path d="M 64 50 L 70 76 L 76 50 Z" fill="#e6e6e6"/>
  </g>
  <line x1="170" y1="35" x2="170" y2="115" stroke="#3a4250" stroke-width="1"/>
  <text x="190" y="55" font-family="'Arial Black', 'Helvetica', sans-serif" font-weight="900" font-size="32" letter-spacing="3" fill="#ffffff">LVS</text>
  <text x="190" y="73" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#a0a8b4" letter-spacing="0.3">Lighting for Vision System</text>
  <text x="190" y="98" font-family="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif" font-weight="700" font-size="13" fill="#ffffff">주식회사 엘브이에스</text>
  <text x="190" y="116" font-family="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', sans-serif" font-weight="700" font-size="13" fill="#ffffff">이메일 시스템</text>
</svg>
```

- [ ] **Step 3: SVG 유효성 검증**

```bash
cd /home/successbank/project_management/lvs2025
xmllint --noout webmail-customizations/assets/lvs-mailcow-logo.svg && echo "light SVG: OK"
xmllint --noout webmail-customizations/assets/lvs-mailcow-logo-dark.svg && echo "dark SVG: OK"
```

Expected: 두 파일 모두 "OK" 출력. xmllint 미설치 시 `apt install -y libxml2-utils`로 설치 후 재실행.

- [ ] **Step 4: SVG 시각 검증 (호스트 브라우저로 직접 열기)**

```bash
ls -la webmail-customizations/assets/
file webmail-customizations/assets/*.svg
```

가능하면 SVG 파일을 브라우저로 열어 부엉이 + 텍스트가 정상 렌더되는지 확인. (예: 로컬 머신으로 scp 후 브라우저로 열기, 또는 `python3 -m http.server 8000 --bind 127.0.0.1 -d webmail-customizations/assets/`로 잠시 서버 띄워 확인)

- [ ] **Step 5: 커밋**

```bash
cd /home/successbank/project_management/lvs2025
git add webmail-customizations/assets/
git commit -m "[feat] webmail 로그인 페이지용 LVS 부엉이 로고 SVG (라이트/다크)"
```

---

## Task 4: Custom CSS 작성

**Files:**
- Create: `webmail-customizations/css/lvs-overrides.css`

- [ ] **Step 1: CSS 작성**

`webmail-customizations/css/lvs-overrides.css`:

```css
/* LVS webmail customizations
 * Applies to webmail.lvs.co.kr login page only.
 * Loaded via Mailcow Customize panel → Custom CSS field.
 */

/* 메인 로고: 와이드 컴포지트 SVG에 맞춰 max-width 확장 */
.mailcow-logo .main-logo,
.mailcow-logo .main-logo-dark {
  max-width: 360px;
  width: 100%;
  height: auto;
}

/* 로그인 버튼: Mailcow 기본 success 녹색 → LVS 브랜드 옐로우 */
.btn.btn-success {
  background-color: #F7C600 !important;
  border-color: #E0B300 !important;
  color: #000000 !important;
  font-weight: 800;
}
.btn.btn-success:hover,
.btn.btn-success:focus,
.btn.btn-success:active {
  background-color: #E0B300 !important;
  border-color: #C99E00 !important;
  color: #000000 !important;
}

/* 안내 문구(예: "비밀번호를 잊으셨나요?") 링크 색상 — LVS 톤 */
.card-body a {
  color: #1565C0;
}
.card-body a:hover {
  color: #0D47A1;
}

/* 다크 모드 보정 */
body.dark .card-body a {
  color: #5BA8E5;
}
body.dark .card-body a:hover {
  color: #82BFEE;
}
body.dark .btn.btn-success {
  box-shadow: 0 0 0 1px rgba(247, 198, 0, 0.2);
}

/* legend 텍스트(임직원 메일 서비스) 강조 */
.card-body legend {
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
  color: #1565C0;
  margin-bottom: 0.5rem;
}
body.dark .card-body legend {
  color: #5BA8E5;
}
```

- [ ] **Step 2: CSS 문법 검증**

복잡한 CSS 린터를 강요하지 않고, 단순 paren/brace 카운트로 기초 검증:

```bash
cd /home/successbank/project_management/lvs2025
python3 -c "
import sys
content = open('webmail-customizations/css/lvs-overrides.css').read()
opens = content.count('{')
closes = content.count('}')
assert opens == closes, f'중괄호 불일치: 열림 {opens} / 닫힘 {closes}'
print(f'CSS 중괄호 OK ({opens} pair)')
print(f'바이트: {len(content)}')
"
```

Expected: "CSS 중괄호 OK" + 바이트 수 출력.

- [ ] **Step 3: 커밋**

```bash
cd /home/successbank/project_management/lvs2025
git add webmail-customizations/css/lvs-overrides.css
git commit -m "[feat] webmail Custom CSS — LVS 옐로우 버튼 + 링크 색상"
```

---

## Task 5: 한국어 번역 확장 lang.ko-kr.json 작성

**Files:**
- Create: `webmail-customizations/lang/lang.ko-kr.json`

본 파일은 컨테이너 내장 `/web/lang/lang.ko-kr.json`을 readonly로 덮어쓴다. 따라서 **기본 파일의 모든 키를 보존하고 login 섹션만 보강**해야 한다.

- [ ] **Step 1: 기본 파일에서 시작하여 login 섹션 보강**

```bash
cd /home/successbank/project_management/lvs2025
cp /home/successbank/backups/mailcow-customize-2026-05-09/lang.ko-kr.original.json \
   webmail-customizations/lang/lang.ko-kr.json
ls -la webmail-customizations/lang/lang.ko-kr.json
```

Expected: 파일이 30KB 이상.

- [ ] **Step 2: login 섹션 키를 한국어로 교정 + 누락 키 추가**

`webmail-customizations/lang/lang.ko-kr.json`을 편집한다. 파일 안에서 `"login":` 객체를 찾아 다음 내용으로 교체한다 (기존 다른 키들은 그대로 유지):

```json
"login": {
    "delayed": "로그인이 %s 초 동안 지연되었습니다.",
    "login": "로그인",
    "mobileconfig_info": "Apple 연결 프로파일을 다운로드하려면 메일 사용자로 로그인해주세요.",
    "password": "비밀번호",
    "username": "사용자 이름",
    "login_user": "사용자 로그인",
    "email": "이메일 주소",
    "forgot_password": "&gt; 비밀번호를 잊으셨나요?",
    "fido2_webauthn": "FIDO2 / WebAuthn 로그인",
    "other_logins": "또는 다른 방법으로 로그인"
}
```

편집 방법:
1. 에디터로 파일을 연다 (`code webmail-customizations/lang/lang.ko-kr.json` 또는 `vim`).
2. `"login": {` 객체 블록을 찾는다.
3. 그 객체 내부 키-값을 위 내용으로 교체. **JSON 다른 섹션은 절대 건드리지 않는다.**

- [ ] **Step 3: JSON 유효성 검증**

```bash
cd /home/successbank/project_management/lvs2025
python3 -m json.tool webmail-customizations/lang/lang.ko-kr.json > /dev/null && echo "JSON: OK"
python3 -c "
import json
d = json.load(open('webmail-customizations/lang/lang.ko-kr.json'))
required = ['delayed','login','mobileconfig_info','password','username','login_user','email','forgot_password','fido2_webauthn','other_logins']
missing = [k for k in required if k not in d.get('login',{})]
if missing: raise SystemExit(f'login 섹션 누락 키: {missing}')
print('login 키 모두 존재:', list(d['login'].keys()))
print('전체 최상위 키 수:', len(d))
"
```

Expected: "JSON: OK" + login 키 10개 + 전체 최상위 키 수 출력 (40개 이상).

- [ ] **Step 4: 원본과 diff 확인 (login 섹션만 변경되었는지)**

```bash
diff /home/successbank/backups/mailcow-customize-2026-05-09/lang.ko-kr.original.json \
     webmail-customizations/lang/lang.ko-kr.json | head -80
```

Expected: login 섹션 부분만 ±줄로 표시. 다른 섹션 변경이 보이면 실수한 것이므로 Step 1로 돌아가서 다시 시작.

- [ ] **Step 5: 커밋**

```bash
cd /home/successbank/project_management/lvs2025
git add webmail-customizations/lang/lang.ko-kr.json
git commit -m "[feat] 한국어 lang 팩 login 섹션 보강 (login_user/email/forgot_password 등)"
```

---

## Task 6: 산출물을 호스트 배포 위치로 복사

**Files:**
- Create: `/opt/lvs-mailcow/lvs-customizations/` (호스트, mailcow 디렉토리 내부)

- [ ] **Step 1: 배포 디렉토리 생성**

```bash
sudo mkdir -p /opt/lvs-mailcow/lvs-customizations/{assets,css,lang}
sudo chown -R successbank:successbank /opt/lvs-mailcow/lvs-customizations
ls -la /opt/lvs-mailcow/lvs-customizations/
```

Expected: 3개 빈 디렉토리.

- [ ] **Step 2: 산출물 복사**

```bash
cp /home/successbank/project_management/lvs2025/webmail-customizations/assets/*.svg \
   /opt/lvs-mailcow/lvs-customizations/assets/

cp /home/successbank/project_management/lvs2025/webmail-customizations/css/lvs-overrides.css \
   /opt/lvs-mailcow/lvs-customizations/css/

cp /home/successbank/project_management/lvs2025/webmail-customizations/lang/lang.ko-kr.json \
   /opt/lvs-mailcow/lvs-customizations/lang/

find /opt/lvs-mailcow/lvs-customizations -type f
```

Expected: 4개 파일 출력 (logo light.svg, logo dark.svg, lvs-overrides.css, lang.ko-kr.json).

- [ ] **Step 3: 권한 점검**

```bash
ls -la /opt/lvs-mailcow/lvs-customizations/lang/lang.ko-kr.json
```

Expected: read 권한이 있어야 함 (`-rw-r--r--` 등). 컨테이너에서 읽을 수 있어야 한다.

(이 task에는 git 커밋이 없다. 호스트 배포만 수행.)

---

## Task 7: docker-compose.override.yml로 lang 파일 마운트

**Files:**
- Create or Modify: `/opt/lvs-mailcow/docker-compose.override.yml`

- [ ] **Step 1: 기존 override 파일 존재 여부 확인**

```bash
ls -la /opt/lvs-mailcow/docker-compose.override.yml 2>/dev/null
```

기존 파일이 **있다면** Step 2A, **없다면** Step 2B를 수행한다.

- [ ] **Step 2A: 기존 override 파일이 있는 경우 (services.nginx-mailcow에 volume 추가)**

기존 파일을 읽고 `services.nginx-mailcow.volumes` 항목에 새 line을 추가한다. 다른 서비스/속성은 절대 수정하지 않는다. 추가할 한 줄:

```yaml
      - ./lvs-customizations/lang/lang.ko-kr.json:/web/lang/lang.ko-kr.json:ro
```

전체 결과 예시 (services.nginx-mailcow 섹션):

```yaml
services:
  nginx-mailcow:
    volumes:
      # ... (기존 항목)
      - ./lvs-customizations/lang/lang.ko-kr.json:/web/lang/lang.ko-kr.json:ro
```

- [ ] **Step 2B: 기존 override 파일이 없는 경우 (신규 작성)**

`/opt/lvs-mailcow/docker-compose.override.yml`:

```yaml
services:
  nginx-mailcow:
    volumes:
      - ./lvs-customizations/lang/lang.ko-kr.json:/web/lang/lang.ko-kr.json:ro
```

- [ ] **Step 3: YAML 유효성 검증**

```bash
cd /opt/lvs-mailcow
python3 -c "
import yaml
d = yaml.safe_load(open('docker-compose.override.yml'))
print('Top keys:', list(d.keys()))
nginx = d['services']['nginx-mailcow']
print('nginx-mailcow volumes:')
for v in nginx.get('volumes', []):
    print('  -', v)
assert any('lang.ko-kr.json' in str(v) for v in nginx.get('volumes', [])), '한국어 lang 마운트 누락'
print('OK')
"
```

Expected: "OK" 끝, volume 목록에 lang.ko-kr.json 포함.

- [ ] **Step 4: docker compose config 검증 (병합 결과 확인)**

```bash
cd /opt/lvs-mailcow
sudo docker compose config 2>&1 | grep -A 2 "lang.ko-kr.json"
```

Expected: 우리가 추가한 마운트 line이 출력됨. 에러가 나오면 YAML 문법 오류.

(이 task에는 git 커밋이 없다. mailcow 인프라 파일이라 lvs2025 저장소가 아님.)

---

## Task 8: nginx-mailcow 컨테이너만 재생성하여 마운트 적용

**Files:** (변경 없음, 컨테이너 재생성)

- [ ] **Step 1: 변경 전 응답 헤더 캡처 (다운타임 측정용)**

```bash
date && curl -sI --max-time 10 https://webmail.lvs.co.kr/ | head -3
```

- [ ] **Step 2: nginx-mailcow만 재생성**

```bash
cd /opt/lvs-mailcow
sudo docker compose up -d nginx-mailcow
```

Expected: "Container ... Recreate" 또는 "Started". 다른 컨테이너는 영향받지 않아야 한다.

- [ ] **Step 3: 컨테이너 정상 동작 확인 (10초 대기 후)**

```bash
sleep 10
docker ps --filter "name=lvsmailcow-nginx-mailcow" --format "table {{.Names}}\t{{.Status}}"
```

Expected: `Up X seconds (healthy)` 또는 `Up X seconds`.

- [ ] **Step 4: 마운트 적용 확인 (컨테이너 안에서 우리 lang 파일이 보이는지)**

```bash
docker exec lvsmailcow-nginx-mailcow-1 sh -c '
  python3 -c "import json; d = json.load(open(\"/web/lang/lang.ko-kr.json\")); print(\"login_user:\", d[\"login\"].get(\"login_user\")); print(\"email:\", d[\"login\"].get(\"email\"))"
'
```

Expected:
```
login_user: 사용자 로그인
email: 이메일 주소
```

(만약 위 두 값이 안 나오거나 KeyError가 나면, 마운트가 제대로 안 됐거나 우리 JSON에 키가 없는 것.)

- [ ] **Step 5: HTTP 응답 정상 확인**

```bash
curl -sI --max-time 10 https://webmail.lvs.co.kr/ | head -3
```

Expected: `HTTP/2 200`.

만약 5xx이거나 응답 없음:
- `docker logs lvsmailcow-nginx-mailcow-1 --tail 50` 으로 원인 확인.
- 즉시 롤백: `sudo mv /opt/lvs-mailcow/docker-compose.override.yml{,.broken}` 후 재시도.

(이 task에는 git 커밋이 없다.)

---

## Task 9: Mailcow에 DEFAULT_LANG=ko-kr 설정

**Files:**
- Modify: `/opt/lvs-mailcow/mailcow.conf`

- [ ] **Step 1: 현재 mailcow.conf에 DEFAULT_LANG 라인이 있는지 확인**

```bash
grep -n "^DEFAULT_LANG\|^#DEFAULT_LANG" /opt/lvs-mailcow/mailcow.conf
```

Expected: 결과 없음 (변수 미설정 — 이전 정찰 결과와 일치) 또는 주석 처리된 라인.

- [ ] **Step 2: mailcow.conf 끝에 DEFAULT_LANG 추가**

```bash
echo '' | sudo tee -a /opt/lvs-mailcow/mailcow.conf
echo '# LVS customization: 기본 UI 언어 한국어' | sudo tee -a /opt/lvs-mailcow/mailcow.conf
echo 'DEFAULT_LANG=ko-kr' | sudo tee -a /opt/lvs-mailcow/mailcow.conf
tail -5 /opt/lvs-mailcow/mailcow.conf
```

Expected: 마지막 3줄이 위 내용으로 출력.

- [ ] **Step 3: DEFAULT_LANG이 컨테이너 환경변수로 전달되는지 확인**

Mailcow의 docker-compose.yml은 mailcow.conf 변수를 nginx 컨테이너에 환경으로 주입한다. 재생성:

```bash
cd /opt/lvs-mailcow
sudo docker compose up -d nginx-mailcow php-fpm-mailcow
sleep 10
docker exec lvsmailcow-nginx-mailcow-1 sh -c 'echo "DEFAULT_LANG=$DEFAULT_LANG"'
docker exec lvsmailcow-php-fpm-mailcow-1 sh -c 'echo "DEFAULT_LANG=$DEFAULT_LANG"' 2>/dev/null || echo "(php-fpm 환경변수는 PHP 측에서 확인 필요)"
```

Expected: `DEFAULT_LANG=ko-kr`.

만약 빈 값이라면, mailcow의 docker-compose.yml에 `DEFAULT_LANG: ${DEFAULT_LANG:-en-gb}` 같은 라인이 nginx-mailcow.environment 에 정의되어 있는지 확인 후 필요 시 그 부분에 변수를 추가하거나, 다음 Task에서 어드민 패널 default lang 설정으로 대체한다.

- [ ] **Step 4: HTTP 응답에서 lang attribute 확인**

```bash
curl -s --max-time 10 https://webmail.lvs.co.kr/ | grep -E "<html lang=" | head -1
```

Expected: `<html lang="ko-kr">` 또는 `<html lang="ko-KR">`. 만약 `en-gb`로 그대로면 환경변수 적용이 안 된 것.

(이 task에는 git 커밋 없음.)

---

## Task 10: Mailcow 어드민 UI에서 logo + main_name + Custom CSS 적용

이 task는 **사용자가 브라우저에서 수동 수행**한다. 자동화 가능한 API가 있긴 하나 prod 시스템에서는 UI 경로가 안전하다.

- [ ] **Step 1: 어드민 UI 접속**

브라우저에서 `https://webmail.lvs.co.kr/admin` 접속 → 어드민 계정으로 로그인.

- [ ] **Step 2: Customize 탭으로 이동**

상단 메뉴 → **Configuration** → **Customize** 탭. (또는 URL 직접: `https://webmail.lvs.co.kr/admin/customize`)

- [ ] **Step 3: Main logo 업로드 (라이트 모드)**

- "Main logo" 영역의 파일 선택 버튼 클릭.
- `/opt/lvs-mailcow/lvs-customizations/assets/lvs-mailcow-logo.svg` 업로드.
  (개인 머신에서 작업 중이면 해당 경로 파일을 미리 다운로드 후 업로드.)
- "Save" 또는 "Apply" 버튼 클릭.

Expected: 미리보기 영역에 부엉이 + LVS + 한글 회사명이 표시됨.

- [ ] **Step 4: Main logo (dark) 업로드**

- "Main logo (dark)" 영역에 `lvs-mailcow-logo-dark.svg` 업로드 → Save.

- [ ] **Step 5: Main name 설정 (legend 텍스트)**

- "Main name" 또는 "App name" 필드에 다음 입력:
  ```
  📧 임직원 메일 서비스
  ```
- Save.

- [ ] **Step 6: Custom CSS 붙여넣기**

- "Custom CSS" 또는 "Additional CSS" 텍스트 영역에 `/opt/lvs-mailcow/lvs-customizations/css/lvs-overrides.css` 내용 전체를 붙여넣기.
- Save.

- [ ] **Step 7: Redis에 저장됐는지 확인 (CLI 검증)**

```bash
docker exec lvsmailcow-redis-mailcow-1 redis-cli GET MAIN_NAME
docker exec lvsmailcow-redis-mailcow-1 redis-cli EXISTS MAIN_LOGO
docker exec lvsmailcow-redis-mailcow-1 redis-cli EXISTS MAIN_LOGO_DARK
```

Expected:
```
"📧 임직원 메일 서비스"
(integer) 1
(integer) 1
```

(이 task에는 git 커밋 없음.)

---

## Task 11: 결과 검증 (라이트 / 다크 / 한글 / 로그인 흐름)

**Files:** (검증 전용)

- [ ] **Step 1: HTTP 200 응답 + 한글 키 텍스트 포함 확인**

```bash
curl -s --max-time 10 https://webmail.lvs.co.kr/ > /tmp/after.html
echo "응답 크기: $(wc -c < /tmp/after.html)"
echo "---예상 한글 텍스트---"
for kw in "사용자 로그인" "이메일 주소" "비밀번호" "로그인" "비밀번호를 잊으셨나요" "임직원 메일 서비스" "FIDO2"; do
  count=$(grep -c "$kw" /tmp/after.html)
  echo "  '$kw': $count 회"
done
echo "---로고 src 확인---"
grep -E "main-logo" /tmp/after.html | head -2
```

Expected:
- 응답 크기 정상 (기존과 비슷)
- 모든 한글 키워드가 1회 이상 등장 ("사용자 로그인", "이메일 주소", "비밀번호", "로그인", "비밀번호를 잊으셨나요", "임직원 메일 서비스", "FIDO2")
- main-logo의 src가 base64 data URL이거나 cow_mailcow.svg가 아닌 다른 경로

- [ ] **Step 2: HTML lang 속성 확인**

```bash
grep -E "<html lang=" /tmp/after.html | head -1
```

Expected: `lang="ko-kr"` 또는 `lang="ko"` 가 보여야 한국어가 기본 적용됨.

만약 `en-gb` 그대로라면 Task 9 Step 3-4를 다시 점검하거나, 어드민 UI에서 Default language 설정 옵션이 있는지 확인.

- [ ] **Step 3: 다른 사이트에 영향 없는지 헬스체크 (mailcow 외 사이트)**

```bash
bash /home/successbank/scripts/healthcheck-all-sites.sh 2>&1 | tail -30
```

Expected: 모든 사이트 정상 (RISK 0).

- [ ] **Step 4: 라이트 모드 시각 검증 (수동)**

브라우저에서 `https://webmail.lvs.co.kr/` 접속:
- 부엉이 + LVS 워드마크 + "주식회사 엘브이에스 / 이메일 시스템" 표시 ✓
- 카드 헤더: "사용자 로그인" ✓
- legend: "📧 임직원 메일 서비스" ✓
- placeholder: "이메일 주소", "비밀번호" ✓
- 로그인 버튼: 노란색 + "로그인" 텍스트 ✓
- "비밀번호를 잊으셨나요?" 링크 ✓
- "또는 다른 방법으로 로그인" 구분선 ✓
- "FIDO2 / WebAuthn 로그인" 버튼 ✓

- [ ] **Step 5: 다크 모드 시각 검증 (수동)**

상단 우측 다크모드 토글(🌙 아이콘) 클릭 또는 OS 다크모드 활성화 후 페이지 새로고침:
- 부엉이 외곽이 흰색으로 바뀌고 눈은 노랑 유지 ✓
- 카드 배경 진회색 ✓
- 텍스트 흰색 ✓
- 로그인 버튼 노란색 그대로 ✓

- [ ] **Step 6: 실제 로그인 동작 확인**

기존 메일 계정으로 로그인 → 정상 로그인되어 SOGo 또는 사용자 대시보드로 이동하는지 확인. (이 step은 실제 메일 계정이 필요하므로 운영 담당자와 함께 수행)

만약 로그인 실패가 평소와 다르게 발생하면:
- `docker logs lvsmailcow-nginx-mailcow-1 --tail 50` 확인
- 즉시 롤백 (Task 13 참조)

- [ ] **Step 7: 어드민 패널은 영향 없는지 확인**

`https://webmail.lvs.co.kr/admin` 으로 어드민 로그인 → 정상 동작 확인. 어드민 페이지의 로고도 우리 SVG로 바뀌어 있을 수 있는데 (mailcow customize는 어드민도 영향), 그 자체는 의도된 동작.

(이 task에는 git 커밋 없음.)

---

## Task 12: 변경 전/후 스냅샷 보존 + README 업데이트

**Files:**
- Modify: `webmail-customizations/README.md`
- Create: `webmail-customizations/screenshots/` (선택사항)

- [ ] **Step 1: 변경 후 HTML 스냅샷 저장**

```bash
cp /tmp/after.html /home/successbank/backups/mailcow-customize-2026-05-09/after.html
ls -la /home/successbank/backups/mailcow-customize-2026-05-09/
```

Expected: before.html, before-ko.html, after.html, mailcow.conf.bak, redis-state.txt 모두 존재.

- [ ] **Step 2: README에 배포 결과 + 롤백 절차 추가**

`webmail-customizations/README.md` 끝에 다음 섹션을 추가한다 (기존 내용은 유지):

````markdown

## 배포 이력

- **2026-05-09**: 초기 배포. mailcow 기본 cow 마스코트 → LVS 부엉이 + 한글 회사명. DEFAULT_LANG=ko-kr 적용.

## 롤백 절차

### 1. logo / main_name / Custom CSS 롤백 (Mailcow Admin UI)

`https://webmail.lvs.co.kr/admin/customize` 접속:
- "Reset to default logo" 버튼 클릭 (logo + dark 모두)
- "Main name" 필드 비우기 → Save
- "Custom CSS" 필드 비우기 → Save

또는 redis 직접 삭제:

```bash
docker exec lvsmailcow-redis-mailcow-1 redis-cli DEL MAIN_NAME MAIN_LOGO MAIN_LOGO_DARK CUSTOM_CSS
```

### 2. 한국어 lang 마운트 롤백

```bash
sudo cp /opt/lvs-mailcow/docker-compose.override.yml \
        /opt/lvs-mailcow/docker-compose.override.yml.lvs-backup
# override 파일에서 lang.ko-kr.json 마운트 라인 한 줄만 제거
sudo vi /opt/lvs-mailcow/docker-compose.override.yml
cd /opt/lvs-mailcow
sudo docker compose up -d nginx-mailcow
```

### 3. DEFAULT_LANG 롤백

```bash
sudo sed -i '/^DEFAULT_LANG=ko-kr$/d; /^# LVS customization/d' /opt/lvs-mailcow/mailcow.conf
cd /opt/lvs-mailcow
sudo docker compose up -d nginx-mailcow php-fpm-mailcow
```

### 4. 검증

```bash
curl -s https://webmail.lvs.co.kr/ | grep -E "<title>|main-logo" | head -3
```

Expected: title이 "webmail.lvs.co.kr - mail UI"로 돌아오고 main-logo src가 cow_mailcow.svg.

## 백업 위치

원본 상태: `/home/successbank/backups/mailcow-customize-2026-05-09/`
````

- [ ] **Step 3: README 커밋**

```bash
cd /home/successbank/project_management/lvs2025
git add webmail-customizations/README.md
git commit -m "[docs] webmail-customizations README — 배포 이력 + 롤백 절차"
```

---

## Task 13: 산출물 푸시 및 마무리

**Files:** (커밋만)

- [ ] **Step 1: 전체 커밋 로그 확인**

```bash
cd /home/successbank/project_management/lvs2025
git log --oneline -10
```

Expected: 최근 5-6개 커밋이 webmail-customizations 관련. 디자인 스펙 커밋(`1c1c04c`)도 보임.

- [ ] **Step 2: 푸시 (운영 담당자 컨펌 후)**

푸시 전 사용자 확인:

```
git status
git push origin main
```

(자동 진행 금지 — 사용자 명시 승인이 있을 때만 push)

- [ ] **Step 3: 최종 헬스체크**

```bash
echo "=== webmail.lvs.co.kr ==="
curl -sI --max-time 10 https://webmail.lvs.co.kr/ | head -3
echo "=== 모든 사이트 ==="
bash /home/successbank/scripts/healthcheck-all-sites.sh 2>&1 | tail -20
```

Expected: webmail 200, 모든 사이트 정상.

---

## 부록 A: Mailcow 업그레이드 후 점검 체크리스트

Mailcow 버전 업그레이드 시 다음을 확인한다 (스펙 Section 4.1 참조):

1. `user_index.twig` 구조 변화 여부 — `{{ logo|default(...) }}`, `{{ ui_texts.main_name|raw }}`, `{{ lang.login.* }}` 변수가 그대로 사용되는지 확인.
2. `lang.ko-kr.json` 스키마 변화 여부 — Mailcow 측 신규 키가 추가되었다면 우리 파일에도 반영.
3. Redis 키 이름 변화 — `MAIN_NAME`, `MAIN_LOGO`, `MAIN_LOGO_DARK` 가 그대로 사용되는지.
4. 업그레이드 후 webmail.lvs.co.kr 접속하여 라이트/다크 + 한글 텍스트 정상 여부 확인.

## 부록 B: 알려진 한계

- **SVG 한글 폰트**: 클라이언트 시스템에 한글 폰트가 없으면 텍스트가 다른 폰트로 폴백된다. 서버에 폰트를 임베드하지 않는 이유는 SVG 파일 크기 증가 + 라이선스 이슈. 회사 임직원 환경(Windows/macOS)에는 기본 한글 폰트가 있어 문제 없음.
- **legend가 SVG 안의 한글 회사명과 중복으로 보일 가능성**: SVG에 이미 회사명이 있고 그 아래 legend "📧 임직원 메일 서비스"가 표시된다. 의도된 디자인(SVG=정체성 / legend=서비스 안내)이지만 좁은 화면에서는 답답해 보일 수 있다. 운영 담당자가 어색해 하면 Customize 패널에서 main_name을 비워 legend를 숨길 수 있다.
- **다른 mailcow 화면도 로고가 바뀜**: `/admin`, `/domainadmin`, password reset 페이지 등 main_logo를 사용하는 모든 곳이 함께 LVS 로고로 바뀐다. 본 plan의 의도 외 영역이지만 일반적으로 환영할 만한 변화. 만약 어드민 UI에서는 mailcow 기본 로고를 유지하고 싶다면 별도 plan이 필요하다.

