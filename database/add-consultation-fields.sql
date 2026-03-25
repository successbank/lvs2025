-- 온라인 상담실 추가 필드 (업체명, 담당자, 이메일, 연락처)
-- 실행: docker exec <db_container> psql -U lvs_user -d lvs_db -f /path/to/add-consultation-fields.sql

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;
