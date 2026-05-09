# webmail.lvs.co.kr 커스터마이징 산출물

LVS 메일 시스템(Mailcow 기반) 로그인 페이지의 캐릭터/로고/한글화를 위한 자산입니다.

## 구성 파일

| 파일 | 용도 | 적용 방식 |
|------|------|----------|
| `assets/lvs-mailcow-logo.svg` | 라이트 모드 메인 로고 (부엉이 + LVS + 한글 회사명) | Redis `MAIN_LOGO` 키에 base64 data URL로 저장 |
| `assets/lvs-mailcow-logo-dark.svg` | 다크 모드 메인 로고 | Redis `MAIN_LOGO_DARK` 키에 저장 |
| `css/lvs-overrides.css` | 옐로우 버튼 + 링크 색상 + 다크 보정 | `0081-custom-mailcow.css`로 readonly 볼륨 마운트 |
| `lang/lang.ko-kr.json` | 한글 번역 보강 (login 섹션) | `/web/lang/lang.ko-kr.json`으로 readonly 볼륨 마운트 |

## 배포 위치

호스트: `/opt/lvs-mailcow/lvs-customizations/`

## 적용 메커니즘

각 산출물은 다음 경로로 컨테이너에 노출되며, `nginx-mailcow`와 `php-fpm-mailcow` 두 컨테이너 모두에 마운트되어야 한다 (PHP 렌더링과 정적 자산 서빙이 분리된 구조).

`/opt/lvs-mailcow/docker-compose.override.yml`:

```yaml
services:
  nginx-mailcow:
    volumes:
      - ./lvs-customizations/lang/lang.ko-kr.json:/web/lang/lang.ko-kr.json:ro
      - ./lvs-customizations/css/lvs-overrides.css:/web/css/build/0081-custom-mailcow.css:ro
  php-fpm-mailcow:
    volumes:
      - ./lvs-customizations/lang/lang.ko-kr.json:/web/lang/lang.ko-kr.json:ro
      - ./lvs-customizations/css/lvs-overrides.css:/web/css/build/0081-custom-mailcow.css:ro
```

로고와 main_name은 Mailcow 어드민 패널 `Configuration → Customize` 에 GUI 필드가 있으나, 폼이 여러 form 단위로 분리되어 있어 사용자가 각 form의 Save 버튼을 모두 눌러야 한다. **운영상 더 안정적인 방법은 Redis 직접 쓰기**이며, 본 프로젝트는 후자를 채택했다.

## 한국어 기본 언어 설정

`/opt/lvs-mailcow/data/web/inc/vars.inc.php`:

```php
$DETECT_LANGUAGE = false;   // 브라우저 Accept-Language 무시
$DEFAULT_LANG = 'ko-kr';    // 기본 언어 한국어 고정
```

⚠️ Mailcow는 `mailcow.conf`의 `DEFAULT_LANG`을 환경변수로 사용하지 않는다. 직접 `vars.inc.php`를 수정해야 한다. 이 파일은 mailcow의 코어 코드이므로 mailcow 업그레이드 시 점검 필요.

## 배포 이력

- **2026-05-09**: 초기 배포. mailcow 기본 cow 마스코트 → LVS 부엉이 + 한글 회사명. DEFAULT_LANG=ko-kr 적용. 로고/CSS는 Redis 직접 쓰기 + 볼륨 마운트 조합으로 적용.

## 적용된 Redis 키

```bash
REDISPASS=$(sudo grep "^REDISPASS=" /opt/lvs-mailcow/mailcow.conf | cut -d= -f2)
docker exec lvsmailcow-redis-mailcow-1 redis-cli -a "$REDISPASS" GET MAIN_NAME
docker exec lvsmailcow-redis-mailcow-1 redis-cli -a "$REDISPASS" STRLEN MAIN_LOGO
docker exec lvsmailcow-redis-mailcow-1 redis-cli -a "$REDISPASS" STRLEN MAIN_LOGO_DARK
```

| 키 | 값 |
|------|-----|
| `MAIN_NAME` | `📧 임직원 메일 서비스` |
| `MAIN_LOGO` | `data:image/svg+xml;base64,{base64 of light SVG}` |
| `MAIN_LOGO_DARK` | `data:image/svg+xml;base64,{base64 of dark SVG}` |

## 변경 이력 / Plan과의 차이점

원래 plan(`docs/superpowers/plans/2026-05-09-webmail-character-redesign-plan.md`)에는 다음과 같은 가정이 있었으나 실제 구현 중 수정되었다:

1. **Mailcow Customize 패널에 "Custom CSS" 필드 존재** → ❌ 없음. 대신 `0081-custom-mailcow.css` 파일을 볼륨 마운트로 교체.
2. **DEFAULT_LANG을 mailcow.conf로 설정 가능** → ❌ 환경변수로 전달되지 않음. `data/web/inc/vars.inc.php` 직접 수정.
3. **lang/CSS 마운트는 nginx-mailcow에만 추가** → ❌ `php-fpm-mailcow`에도 동일한 마운트가 필요. PHP가 렌더링하므로 PHP 측에서 파일을 읽음.
4. **`forgot_password` 값에 `&gt;`(HTML entity) 사용** → ❌ Twig가 자동 escape하여 `&amp;gt;`로 이중 인코딩. 평문 `>` 사용.

## 롤백 절차

### 1. Redis 키 삭제

```bash
REDISPASS=$(sudo grep "^REDISPASS=" /opt/lvs-mailcow/mailcow.conf | cut -d= -f2)
docker exec lvsmailcow-redis-mailcow-1 redis-cli -a "$REDISPASS" DEL MAIN_NAME MAIN_LOGO MAIN_LOGO_DARK
```

또는 어드민 UI: `https://webmail.lvs.co.kr/admin/customize` → "Reset to default logo" 버튼 + Main name 비우기.

### 2. 볼륨 마운트 제거 (CSS + 한국어 lang)

```bash
sudo cp /opt/lvs-mailcow/docker-compose.override.yml \
        /opt/lvs-mailcow/docker-compose.override.yml.lvs-backup
sudo vi /opt/lvs-mailcow/docker-compose.override.yml
# nginx-mailcow와 php-fpm-mailcow 의 volumes 항목에서
# lang.ko-kr.json 라인과 lvs-overrides.css 라인을 삭제
cd /opt/lvs-mailcow
sudo docker compose up -d nginx-mailcow php-fpm-mailcow
```

### 3. DEFAULT_LANG 롤백

```bash
sudo vi /opt/lvs-mailcow/data/web/inc/vars.inc.php
# $DETECT_LANGUAGE = false; 와 $DEFAULT_LANG = 'ko-kr'; 를 원래 값으로 되돌리기
# (백업 참조: /home/successbank/backups/mailcow-customize-2026-05-09/)

sudo sed -i '/^DEFAULT_LANG=ko-kr$/d; /^# LVS customization/d' /opt/lvs-mailcow/mailcow.conf
cd /opt/lvs-mailcow
sudo docker compose up -d nginx-mailcow php-fpm-mailcow
```

### 4. 캐시 무효화

```bash
docker exec lvsmailcow-php-fpm-mailcow-1 sh -c 'rm -f /tmp/*.css'
```

### 5. 검증

```bash
curl -s https://webmail.lvs.co.kr/ | grep -E "<title>|main-logo|<html lang=" | head -5
```

원래 상태로 돌아오면: title이 "webmail.lvs.co.kr - mail UI", main-logo src가 `/img/cow_mailcow.svg`, html lang이 "en-gb".

## 백업 위치

원본 상태(2026-05-09 시점): `/home/successbank/backups/mailcow-customize-2026-05-09/`

| 파일 | 내용 |
|------|------|
| `before.html` / `before-ko.html` | 변경 전 페이지 HTML |
| `after.html` | 변경 후 페이지 HTML |
| `mailcow.conf.bak` | 원본 mailcow.conf |
| `docker-compose.override.yml.bak` | 원본 docker-compose.override.yml |
| `lang.ko-kr.original.json` | 원본 한국어 lang 팩 |
| `redis-state.txt` | 원본 Redis Customize 상태 (모두 비어있음) |

## Mailcow 업그레이드 시 점검 체크리스트

1. `data/web/inc/vars.inc.php`의 `$DEFAULT_LANG`/`$DETECT_LANGUAGE` 값이 mailcow 업데이트로 덮어씌워지지 않았는지 확인.
2. `data/web/templates/user_index.twig` 구조 변경 여부 — `{{ logo|default(...) }}`, `{{ ui_texts.main_name|raw }}`, `{{ lang.login.* }}` 변수가 그대로 사용되는지.
3. `data/web/lang/lang.ko-kr.json`의 신규 키가 추가되었다면 우리 파일에도 반영.
4. Redis 키 이름 변화 (`MAIN_NAME`, `MAIN_LOGO`, `MAIN_LOGO_DARK`) — 변경되었다면 README 업데이트.
5. 업그레이드 후 webmail.lvs.co.kr 접속하여 라이트/다크 + 한글 텍스트 정상 여부 확인.

## 관련 문서

- 디자인 스펙: `docs/superpowers/specs/2026-05-09-webmail-character-redesign-design.md`
- 실행 계획: `docs/superpowers/plans/2026-05-09-webmail-character-redesign-plan.md`
