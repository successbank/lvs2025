-- 자료 다운로드 게시물 데이터 입력
-- 원본: http://lvs.co.kr/ko/sub06/02.php

-- 다운로드 게시물 1
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-001',
  'board-downloads',
  'LVS Catalog 2019 국문. Ver 4.0',
  '<p>LVS 제품 종합 카탈로그 2019년판 (국문)</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 2
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-002',
  'board-downloads',
  'EX SERIES TEST PROGRAM',
  '<p>EX 시리즈 테스트 프로그램</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 3
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-003',
  'board-downloads',
  'LVS Catalog 2021 영문 Ver 5.0',
  '<p>LVS 제품 종합 카탈로그 2021년판 (영문)</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 4
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-004',
  'board-downloads',
  'LV-DRT-A 시리즈 PDF, DWG 취부도',
  '<p>LV-DRT-70A, LV-DRT-97A, LV-DRT-119A, LV-DRT-A 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 5
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-005',
  'board-downloads',
  '(주)엘브이에스 카탈로그',
  '<p>LVS 카탈로그 2016 Ver 3.1 (국문)</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 6
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-006',
  'board-downloads',
  'LV-DBS 시리즈 PDF, DWG 취부도',
  '<p>LV-DBS-120A, LV-DBS-136A, LV-DBS-147A, LV-DBS-157A, LV-DBS-162A, LV-DBS-162x136, LV-DBS-250A, LV-DBS-360A 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 7
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-007',
  'board-downloads',
  'LV-DRT-B 시리즈 PDF, DWG 취부도',
  '<p>LV-DRT-61B, LV-DRT-81B, LV-DRT-101B, LV-DRT-122B, LV-DRT-150B, LV-DRT-176B, LV-DRT-B 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 8
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-008',
  'board-downloads',
  'LV-IFRK 시리즈 PDF, DWG 취부도',
  '<p>LV-IFRK-75RF1, LV-IFRK-75RF2, LV-IFRK-75RT1, LV-IFRK-75RT2, LV-IFRK-100RF3, LV-IFRK-100RT3, LV-IFRK-130RF3, LV-IFRK-130RF4, LV-IFRK-130RT3, LV-IFRK-130RT4, LV-IFRK-160RF3, LV-IFRK-160RT3, LV-IFRK-233RF3 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 9
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-009',
  'board-downloads',
  'LV-DRT-C 시리즈 PDF, DWG 취부도',
  '<p>LV-DRT-79C, LV-DRT-99C, LV-DRT-118C, LV-DRT-146C, LV-DRT-172C, LV-DRT-C 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 10
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-010',
  'board-downloads',
  'LV-ILA-R 시리즈 PDF, DWG 취부도',
  '<p>LV-ILA-45R, LV-ILA-50R, LV-ILA-75R, LV-ILA-100R, LV-ILA-136R, LV-ILA-180R 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 11
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-011',
  'board-downloads',
  'LV-DBR 시리즈 PDF, DWG 취부도',
  '<p>LV-DBR-45B, LV-DBR-55B, LV-DBR-70B, LV-DBR-100B, LV-DBR-125B, LV-DBR-150B 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 12
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-012',
  'board-downloads',
  'LV-DBRS 시리즈 PDF, DWG 취부도',
  '<p>LV-DBRS-75B, LV-DBRS-100B, LV-DBRS-125B, LV-DBRS-150B 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 13
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-013',
  'board-downloads',
  'LV-IFS 시리즈 PDF, DWG 취부도',
  '<p>LV-IFS-62x42, LV-IFS-72x52, LV-IFS-72x72, LV-IFS-85x55, LV-IFS-102x62, LV-IFS-102x102, LV-IFS-122x82, LV-IFS-152x102, LV-IFS-202x142, LV-IFS-252x172, LV-IFS-302x202 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 14
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-014',
  'board-downloads',
  'LV-ILA-S 시리즈 PDF, DWG 취부도',
  '<p>LV-ILA-75x75S, LV-ILA-100x100S, LV-ILA-150x150S 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 15
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-015',
  'board-downloads',
  'LV-DLA 시리즈 PDF, DWG 취부도',
  '<p>LV-DLA2-DL-50, LV-DLA2-DL-70, LV-DLA2-DL-94, LV-DLA2-DL-113, LV-DLA2-DL-130, LV-DLA2-DL-170 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 16
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-016',
  'board-downloads',
  'LV-DCL 시리즈 PDF, DWG 취부도',
  '<p>LV-DCL2-70C, LV-DCL2-94C, LV-DCL2-113C, LV-DCL2-130C, LV-DCL2-170C 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 17
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-017',
  'board-downloads',
  'LV-HCS 시리즈 PDF, DWG 취부도',
  '<p>LV-HCS-W/R/IR-40x40-A 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 18
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-018',
  'board-downloads',
  'LV-ISL 시리즈 PDF, DWG 취부도',
  '<p>LV-ISL-W/R/IR-S 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 19
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-019',
  'board-downloads',
  'LV-UVIL 시리즈 PDF, DWG 취부도',
  '<p>LV-UVIL-S 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 다운로드 게시물 20
INSERT INTO posts (id, board_id, title, content, author, is_notice, view_count, created_at, updated_at, published_at)
VALUES (
  'post-download-020',
  'board-downloads',
  'LV-LLB 시리즈 PDF, DWG 취부도',
  '<p>LV-LLB 시리즈 취부도</p>',
  '관리자',
  false,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
