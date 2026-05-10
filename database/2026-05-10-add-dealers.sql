-- 대리점(Dealer) 테이블 + DealerType enum 추가
-- 작성: 2026-05-10 / 담당: 개발1팀 BE + 윤성호(DB PM)
-- 목적: /about/dealers 페이지의 12건 하드코딩 데이터를 어드민에서 관리 가능하게 DB로 이전
-- 컬럼명: LVS 표준 camelCase (lvs_external_sql_camelcase.md)
-- ⚠️ 적용 전 pg_dump 백업 필수 (lvs_db_loss_incident_20260509.md)

-- DealerType enum (UserRole, UserStatus 등 다른 모델과 일관)
DO $$ BEGIN
  CREATE TYPE "DealerType" AS ENUM ('DOMESTIC', 'INTERNATIONAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS dealers (
  id          TEXT PRIMARY KEY,
  type        "DealerType" NOT NULL,
  name        TEXT NOT NULL,
  address     TEXT,
  tel         TEXT,
  fax         TEXT,
  email       TEXT,
  website     TEXT,
  country     TEXT,
  flag        TEXT,
  image       TEXT,
  "isActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS dealers_type_order_idx ON dealers(type, "order");
CREATE INDEX IF NOT EXISTS "dealers_isActive_idx" ON dealers("isActive");
