-- 상담/카탈로그 게시물에 관리자 메타데이터 추가
-- admin_status: NEW(신규), IN_PROGRESS(처리중), DONE(완료)
-- admin_reply : 답변 내용
-- admin_reply_at / admin_reply_by : 답변 시각/관리자 id
-- admin_note  : 내부 메모
-- admin_read_at : 관리자 최초 열람 시각(선택)
BEGIN;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS admin_status   text NOT NULL DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS admin_reply    text NULL,
  ADD COLUMN IF NOT EXISTS admin_reply_at timestamp NULL,
  ADD COLUMN IF NOT EXISTS admin_reply_by text NULL,
  ADD COLUMN IF NOT EXISTS admin_note     text NULL,
  ADD COLUMN IF NOT EXISTS admin_read_at  timestamp NULL;

CREATE INDEX IF NOT EXISTS idx_posts_admin_status ON posts(admin_status);

COMMIT;
