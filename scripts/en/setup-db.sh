#!/bin/bash
# lvs_db_en 생성 + 스키마 + 시드 일괄 적용 (idempotent, 재실행 안전)
# 사용법: bash scripts/en/setup-db.sh [local|prod]
# - local: docker exec lvs_db
# - prod : docker exec database-d9dr3v* (Coolify 운영 DB 컨테이너)
# 주의: 기존 lvs_db에는 절대 접속/변경하지 않는다 (CREATE DATABASE만 postgres 기본 DB에서 실행)
set -euo pipefail

MODE="${1:-local}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="$SCRIPT_DIR/../../database/en"

if [ "$MODE" = "local" ]; then
  DB_CONTAINER="lvs_db"
elif [ "$MODE" = "prod" ]; then
  DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep '^database-d9dr3v' | head -1)
  if [ -z "$DB_CONTAINER" ]; then
    echo "ERROR: 운영 DB 컨테이너(database-d9dr3v*)를 찾을 수 없습니다." >&2
    exit 1
  fi
else
  echo "사용법: $0 [local|prod]" >&2
  exit 1
fi

echo "== 대상 컨테이너: $DB_CONTAINER (mode: $MODE)"

PSQL="docker exec -i $DB_CONTAINER psql -U lvs_user -v ON_ERROR_STOP=1"

# 1. DB 생성 (존재하면 스킵)
echo "== 1/4 lvs_db_en 생성 확인"
echo "SELECT 'CREATE DATABASE lvs_db_en' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lvs_db_en')\\gexec" \
  | $PSQL -d postgres

# 2~4. 스키마 + 시드
echo "== 2/4 스키마 적용 (001-schema.sql)"
$PSQL -d lvs_db_en < "$SQL_DIR/001-schema.sql"

echo "== 3/4 게시판 시드 (002-seed-boards.sql)"
$PSQL -d lvs_db_en < "$SQL_DIR/002-seed-boards.sql"

if [ -f "$SQL_DIR/003-seed-translations.sql" ]; then
  echo "== 4/4 번역 시드 (003-seed-translations.sql)"
  $PSQL -d lvs_db_en < "$SQL_DIR/003-seed-translations.sql"
else
  echo "== 4/4 번역 시드 없음 — 스킵"
fi

# 검증
echo "== 검증"
$PSQL -d lvs_db_en -c "SELECT (SELECT count(*) FROM boards) AS boards,
  (SELECT count(*) FROM product_translations) AS product_tr,
  (SELECT count(*) FROM product_spec_translations) AS spec_tr,
  (SELECT count(*) FROM category_translations) AS category_tr,
  (SELECT count(*) FROM menu_item_translations) AS menu_tr,
  (SELECT count(*) FROM slider_translations) AS slider_tr,
  (SELECT count(*) FROM company_info_translation) AS company_tr;"
echo "== 완료"
