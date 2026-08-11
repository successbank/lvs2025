-- 영문 게시판 시드 — slug는 KR과 동일 유지(코드 재사용), 이름/설명만 영문
INSERT INTO boards (id, name, slug, description, type, allow_comments, allow_attachments, "order")
VALUES
  ('board-notices', 'Notices', 'notices', 'Check the latest news and announcements from LVS.', 'notice', false, true, 1),
  ('board-tech-guide', 'Technical Guides', 'tech-guide', 'Product usage guides and technical resources', 'tech-guide', false, true, 2),
  ('board-downloads', 'Downloads', 'downloads', 'Product catalogs and technical documents', 'download', false, true, 3),
  ('board-consultation', 'Online Inquiry', 'consultation', 'Product inquiries and technical consultation', 'consultation', true, true, 4),
  ('board-careers', 'Careers', 'careers', 'Join LVS and grow with us.', 'notice', false, true, 5),
  ('board-catalog', 'Catalog Request', 'catalog', 'Request a product catalog', 'consultation', true, true, 6)
ON CONFLICT (id) DO NOTHING;
