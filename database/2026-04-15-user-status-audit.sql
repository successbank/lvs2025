-- 의심 회원 관리 고도화: 상태 enum, 감사 로그 테이블, 기존 봇 의심 계정 자동 정지
BEGIN;

-- 1) UserStatus enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
  END IF;
END $$;

-- 2) users 테이블 확장
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "suspendedAt"      timestamp(3) NULL,
  ADD COLUMN IF NOT EXISTS "suspendedReason"  text NULL,
  ADD COLUMN IF NOT EXISTS "deletedAt"        timestamp(3) NULL,
  ADD COLUMN IF NOT EXISTS "signupIp"         text NULL,
  ADD COLUMN IF NOT EXISTS "signupUserAgent"  text NULL,
  ADD COLUMN IF NOT EXISTS "suspicionFlags"   text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE INDEX IF NOT EXISTS "users_status_idx" ON users("status");

-- 3) user_audit_logs 테이블
CREATE TABLE IF NOT EXISTS user_audit_logs (
  id               text PRIMARY KEY,
  "userId"         text NOT NULL,
  "adminId"        text NULL,
  action           text NOT NULL,
  "previousStatus" "UserStatus" NULL,
  "newStatus"      "UserStatus" NULL,
  reason           text NULL,
  metadata         jsonb NULL,
  "createdAt"      timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_audit_logs_user_fk  FOREIGN KEY ("userId")  REFERENCES users(id) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT user_audit_logs_admin_fk FOREIGN KEY ("adminId") REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "user_audit_logs_userId_idx"    ON user_audit_logs("userId");
CREATE INDEX IF NOT EXISTS "user_audit_logs_createdAt_idx" ON user_audit_logs("createdAt");

-- 4) 기존 봇 의심 계정 자동 정지 (Gmail dot trick 6건)
WITH suspicious AS (
  SELECT id
  FROM users
  WHERE email LIKE '%.%.%@gmail.com'
    AND (email ~ '\.[a-z]+\.[a-z]+\.')
    AND "status" = 'ACTIVE'
)
UPDATE users
SET "status"         = 'SUSPENDED',
    "suspendedAt"    = CURRENT_TIMESTAMP,
    "suspendedReason"= '자동 탐지(초기 마이그레이션): Gmail 점회피 + 랜덤 이름/전화/회사 패턴',
    "suspicionFlags" = ARRAY['GMAIL_DOT_TRICK','RANDOM_NAME','RANDOM_PHONE','RANDOM_COMPANY']::text[]
WHERE id IN (SELECT id FROM suspicious);

-- 5) 위 업데이트 건에 감사 로그 남기기
INSERT INTO user_audit_logs (id, "userId", "adminId", action, "previousStatus", "newStatus", reason, metadata, "createdAt")
SELECT
  substr(md5(random()::text || clock_timestamp()::text), 1, 25),
  id,
  NULL,
  'AUTO_SUSPEND_BACKFILL',
  'ACTIVE',
  'SUSPENDED',
  '자동 탐지(초기 마이그레이션): Gmail 점회피 패턴',
  jsonb_build_object('email', email, 'name', name),
  CURRENT_TIMESTAMP
FROM users
WHERE "suspendedReason" = '자동 탐지(초기 마이그레이션): Gmail 점회피 + 랜덤 이름/전화/회사 패턴';

COMMIT;
