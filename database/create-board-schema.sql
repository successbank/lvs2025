-- 게시판 시스템 데이터베이스 스키마
-- Phase 1: 공지사항 게시판

-- 게시판 테이블 (여러 게시판 관리)
CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'notice',  -- notice, download, consultation, tech-guide
  is_active BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT false,
  allow_attachments BOOLEAN DEFAULT false,
  posts_per_page INTEGER DEFAULT 10,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게시물 테이블
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT '관리자',
  author_email TEXT,
  password TEXT,  -- 비밀번호 (비회원 게시물용)
  is_notice BOOLEAN DEFAULT false,  -- 공지사항 상단 고정
  is_secret BOOLEAN DEFAULT false,  -- 비밀글
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 첨부파일 테이블
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

-- 댓글 테이블 (추후 확장용)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_notice ON posts(is_notice);
CREATE INDEX IF NOT EXISTS idx_post_attachments_post_id ON post_attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- 기본 게시판 데이터 삽입
INSERT INTO boards (id, name, slug, description, type, allow_comments, allow_attachments, "order")
VALUES
  ('board-notices', '공지사항', 'notices', '엘브이에스의 소식과 공지사항을 확인하세요.', 'notice', false, true, 1),
  ('board-tech-guide', '테크니컬 가이드', 'tech-guide', '제품 사용 가이드 및 기술 자료', 'tech-guide', false, true, 2),
  ('board-downloads', '자료 다운로드', 'downloads', '제품 카탈로그 및 기술 자료 다운로드', 'download', false, true, 3),
  ('board-consultation', '온라인 상담실', 'consultation', '제품 문의 및 기술 상담', 'consultation', true, true, 4)
ON CONFLICT (id) DO NOTHING;
