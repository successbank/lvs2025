-- 다운로드 게시물 첨부파일 데이터 입력
-- 원본: http://lvs.co.kr/ko/sub06/02.php

-- 첨부파일 1: LVS Catalog 2019 국문
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-001',
  'post-download-001',
  'LVS_국문_2019.pdf',
  'LVS_국문 2019.pdf',
  '/uploads/downloads/LVS_국문_2019.pdf',
  15728640,  -- 약 15MB
  'application/pdf',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 2: EX SERIES TEST PROGRAM
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-002',
  'post-download-002',
  'LVS_UDP_TEST_PR_v1_3.zip',
  'LVS_UDP_TEST_PR_v1_3.zip',
  '/uploads/downloads/LVS_UDP_TEST_PR_v1_3.zip',
  2097152,  -- 약 2MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 3: LVS Catalog 2021 영문
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-003',
  'post-download-003',
  'LVS_영문-최종-20220512.pdf',
  'LVS_영문-최종-20220512.pdf',
  '/uploads/downloads/LVS_영문-최종-20220512.pdf',
  18874368,  -- 약 18MB
  'application/pdf',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 4: LV-DRT-A 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-004',
  'post-download-004',
  'LV-DRT-A 취부도.zip',
  'LV-DRT-A_취부도.zip',
  '/uploads/downloads/LV-DRT-A_취부도.zip',
  5242880,  -- 약 5MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 5: (주)엘브이에스 카탈로그
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-005',
  'post-download-005',
  'LVS 카달로그 2016 Kor. Ver 3.1.pdf',
  'LVS_카달로그_2016_Kor_Ver_3.1.pdf',
  '/uploads/downloads/LVS_카달로그_2016_Kor_Ver_3.1.pdf',
  12582912,  -- 약 12MB
  'application/pdf',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 6: LV-DBS 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-006',
  'post-download-006',
  'DBS.zip',
  'LV-DBS_취부도.zip',
  '/uploads/downloads/LV-DBS_취부도.zip',
  8388608,  -- 약 8MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 7: LV-DRT-B 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-007',
  'post-download-007',
  'LV-DRT-B 취부도.zip',
  'LV-DRT-B_취부도.zip',
  '/uploads/downloads/LV-DRT-B_취부도.zip',
  6291456,  -- 약 6MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 8: LV-IFRK 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-008',
  'post-download-008',
  'LV-IFRK 취부도.zip',
  'LV-IFRK_취부도.zip',
  '/uploads/downloads/LV-IFRK_취부도.zip',
  10485760,  -- 약 10MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 9: LV-DRT-C 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-009',
  'post-download-009',
  'LV-DRT-C 취부도.zip',
  'LV-DRT-C_취부도.zip',
  '/uploads/downloads/LV-DRT-C_취부도.zip',
  5767168,  -- 약 5.5MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 10: LV-ILA-R 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-010',
  'post-download-010',
  'LV-ILA-R 취부도.zip',
  'LV-ILA-R_취부도.zip',
  '/uploads/downloads/LV-ILA-R_취부도.zip',
  7340032,  -- 약 7MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 11: LV-DBR 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-011',
  'post-download-011',
  'LV-DBR 취부도.zip',
  'LV-DBR_취부도.zip',
  '/uploads/downloads/LV-DBR_취부도.zip',
  4194304,  -- 약 4MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 12: LV-DBRS 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-012',
  'post-download-012',
  'LV-DBRS 취부도.zip',
  'LV-DBRS_취부도.zip',
  '/uploads/downloads/LV-DBRS_취부도.zip',
  3670016,  -- 약 3.5MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 13: LV-IFS 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-013',
  'post-download-013',
  'LV-IFS 취부도.zip',
  'LV-IFS_취부도.zip',
  '/uploads/downloads/LV-IFS_취부도.zip',
  9437184,  -- 약 9MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 14: LV-ILA-S 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-014',
  'post-download-014',
  'LV-ILA-S 취부도.zip',
  'LV-ILA-S_취부도.zip',
  '/uploads/downloads/LV-ILA-S_취부도.zip',
  2621440,  -- 약 2.5MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 15: LV-DLA 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-015',
  'post-download-015',
  'LV-DLA 취부도.zip',
  'LV-DLA_취부도.zip',
  '/uploads/downloads/LV-DLA_취부도.zip',
  5505024,  -- 약 5.25MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 16: LV-DCL 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-016',
  'post-download-016',
  'LV-DCL 취부도.zip',
  'LV-DCL_취부도.zip',
  '/uploads/downloads/LV-DCL_취부도.zip',
  4718592,  -- 약 4.5MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 17: LV-HCS 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-017',
  'post-download-017',
  'LV-HCS 취부도.zip',
  'LV-HCS_취부도.zip',
  '/uploads/downloads/LV-HCS_취부도.zip',
  1048576,  -- 약 1MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 18: LV-ISL 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-018',
  'post-download-018',
  'LV-ISL 취부도.zip',
  'LV-ISL_취부도.zip',
  '/uploads/downloads/LV-ISL_취부도.zip',
  1572864,  -- 약 1.5MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 19: LV-UVIL 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-019',
  'post-download-019',
  'LV-UVIL 취부도.zip',
  'LV-UVIL_취부도.zip',
  '/uploads/downloads/LV-UVIL_취부도.zip',
  786432,  -- 약 768KB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 첨부파일 20: LV-LLB 시리즈
INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
VALUES (
  'attachment-download-020',
  'post-download-020',
  'LV-LLB 취부도.zip',
  'LV-LLB_취부도.zip',
  '/uploads/downloads/LV-LLB_취부도.zip',
  1310720,  -- 약 1.25MB
  'application/zip',
  0,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
