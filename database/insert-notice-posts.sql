-- 공지사항 게시물 데이터 입력
-- 원본: http://lvs.co.kr/ko/sub06/04.php

-- 공지사항 게시물 1 (최신)
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-notice-001',
  'board-notices',
  'Automation World 2019에 방문해 주셔서 감사합니다.',
  '<p><img src="http://lvs.co.kr/ksboard/upload/board/0d33629dfe1f00b7a97f665d0e8cf602_1554357605_0042.jpg" alt="Automation World 2019" style="max-width: 100%; height: auto;" /></p>',
  '관리자',
  true,
  6222,
  '2019-04-04 14:55:00',
  '2019-04-04 14:55:00',
  '2019-04-04 14:55:00'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  view_count = EXCLUDED.view_count,
  updated_at = CURRENT_TIMESTAMP;

-- 공지사항 게시물 1 첨부파일
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attach-notice-001',
  'post-notice-001',
  '19-01-25-lvs-automation-world.jpg',
  '19-01-25-(주)엘브이에스-전시부스-제안서-(오토메이션-월드).jpg',
  '/uploads/attachments/19-01-25-lvs-automation-world.jpg',
  1363148,  -- 1.3MB in bytes
  'image/jpeg',
  0,
  '2019-04-04 14:55:00'
) ON CONFLICT (id) DO UPDATE SET
  filename = EXCLUDED.filename,
  original_filename = EXCLUDED.original_filename;

-- 공지사항 게시물 2
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-notice-002',
  'board-notices',
  '(주)엘브이에스 웹사이트가 리뉴얼하였습니다.',
  '<p>(주)엘브이에스 웹사이트가 리뉴얼하였습니다.</p><p><br></p><p>많은 관심 부탁드립니다.</p>',
  '관리자',
  true,
  5135,
  '2017-07-31 15:49:00',
  '2017-07-31 15:49:00',
  '2017-07-31 15:49:00'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  view_count = EXCLUDED.view_count,
  updated_at = CURRENT_TIMESTAMP;
