-- lvs_db_en 스키마 (영문 사이트 전용 DB)
-- 게시판: 기존 lvs_db와 동일 구조 클론 (create-board-schema + add-consultation-fields + posts-admin-meta 통합)
-- 번역: 원본(lvs_db) id 참조 테이블. 전부 idempotent.

-- ─── 게시판 (기존 구조 클론) ───────────────────────────────

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'notice',
  is_active BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT false,
  allow_attachments BOOLEAN DEFAULT false,
  posts_per_page INTEGER DEFAULT 10,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Admin',
  author_email TEXT,
  password TEXT,
  is_notice BOOLEAN DEFAULT false,
  is_secret BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- 상담 필드
  company TEXT,
  contact_name TEXT,
  contact_position TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  -- 관리자 메타
  admin_status   TEXT NOT NULL DEFAULT 'NEW',
  admin_reply    TEXT NULL,
  admin_reply_at TIMESTAMP NULL,
  admin_reply_by TEXT NULL,
  admin_note     TEXT NULL,
  admin_read_at  TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS post_attachments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES post_comments(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_notice ON posts(is_notice);
CREATE INDEX IF NOT EXISTS idx_posts_admin_status ON posts(admin_status);
CREATE INDEX IF NOT EXISTS idx_post_attachments_post_id ON post_attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- ─── 번역 테이블 (원본 lvs_db id 참조 — 크로스 DB라 FK 없음) ───

CREATE TABLE IF NOT EXISTS product_translations (
  product_id TEXT PRIMARY KEY,
  name TEXT,
  summary TEXT,
  description TEXT,
  origin TEXT,
  series_data JSONB,
  product_options JSONB,
  status TEXT NOT NULL DEFAULT 'auto',   -- auto(자동번역) | reviewed(관리자 교정 완료)
  source_hash TEXT,                       -- 원본 KR 텍스트 md5 (원본 변경 감지)
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_spec_translations (
  spec_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  label TEXT,
  value TEXT
);
CREATE INDEX IF NOT EXISTS idx_spec_tr_product ON product_spec_translations(product_id);

CREATE TABLE IF NOT EXISTS category_translations (
  category_id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS menu_item_translations (
  menu_item_id TEXT PRIMARY KEY,
  label TEXT
);

CREATE TABLE IF NOT EXISTS slider_translations (
  slider_id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS company_info_translation (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT,
  ceo TEXT,
  address TEXT,
  working_hours TEXT,
  lunch_time TEXT,
  closed_days TEXT
);
