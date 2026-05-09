-- 인증현황 / 인증관리 테이블 추가 + 시드 32건
-- 실행: docker exec -i <db_container> psql -U lvs_user -d lvs_db < database/2026-05-09-add-certifications.sql
-- 안전: 트랜잭션 + IF NOT EXISTS + ON CONFLICT, 재실행 안전

BEGIN;

-- 1. 카테고리 테이블
CREATE TABLE IF NOT EXISTS certification_categories (
  id          TEXT PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "isActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS certification_categories_order_idx ON certification_categories ("order");

-- 2. 인증서 테이블
CREATE TABLE IF NOT EXISTS certifications (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  image        TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "order"      INTEGER NOT NULL DEFAULT 0,
  "isActive"   BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT certifications_categoryId_fkey
    FOREIGN KEY ("categoryId") REFERENCES certification_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS certifications_categoryId_idx ON certifications ("categoryId");
CREATE INDEX IF NOT EXISTS certifications_order_idx ON certifications ("order");

-- 3. 카테고리 시드 2건
INSERT INTO certification_categories (id, key, label, "order") VALUES
  ('cert_cat_system',  'system',  '시스템 인증', 0),
  ('cert_cat_product', 'product', '제품 인증',   1)
ON CONFLICT (id) DO NOTHING;

-- 4. 인증서 32건 시드 (CertificationsPage.js CERT_DATA 라인 6-39 1:1 매핑, 표시 순서대로 order 부여)
INSERT INTO certifications (id, title, image, "categoryId", "order") VALUES
  ('cert_001', 'DB,DBS 인증서',          'ce-db-dbs.jpg',              'cert_cat_system',  0),
  ('cert_002', 'EN-04xx CE 인증서',      '5b0f53694aa8b.jpg',          'cert_cat_system',  1),
  ('cert_003', 'EN-02xx CE 인증서',      '5b0f4f02269de.jpg',          'cert_cat_system',  2),
  ('cert_004', 'EN-08xx CE 인증서',      'thumb_5afbd2637efed.jpg',    'cert_cat_system',  3),
  ('cert_005', 'LVS-ES-0224 LVD DoC',    'ce-lvs-es-0224.jpg',         'cert_cat_product', 4),
  ('cert_006', 'LVS-ES-0424 LVD DoC',    'ce-lvs-es-0424.jpg',         'cert_cat_product', 5),
  ('cert_007', 'LVS-ES-0824 LVD DoC',    'ce-lvs-es-0824.jpg',         'cert_cat_product', 6),
  ('cert_008', 'LVS-ET-0205 LVD DoC',    'ce-lvs-et-0205.jpg',         'cert_cat_product', 7),
  ('cert_009', 'LVS-ET-0405 LVD DoC',    'ce-lvs-et-0405.jpg',         'cert_cat_product', 8),
  ('cert_010', 'LVS-ET-0424 LVD DoC',    'ce-lvs-et-0424.jpg',         'cert_cat_product', 9),
  ('cert_011', 'SHL 인증서',             'ce-shl.jpg',                  'cert_cat_system',  10),
  ('cert_012', 'PT08-N04_LVD 인증서',    'ce-pt.jpg',                   'cert_cat_product', 11),
  ('cert_013', 'PT08-N04 인증서',        'ce-pt.jpg',                   'cert_cat_product', 12),
  ('cert_014', 'PT 인증서',              'ce-pt.jpg',                   'cert_cat_product', 13),
  ('cert_015', 'PS-21 인증서',           'ce-ps21.jpg',                 'cert_cat_product', 14),
  ('cert_016', 'PS 인증서',              'ce-ps.jpg',                   'cert_cat_product', 15),
  ('cert_017', 'PN 인증서',              'ce-pn.jpg',                   'cert_cat_product', 16),
  ('cert_018', 'PN-abxx-yy 인증서',      'ce-pn-abxx-yy.jpg',           'cert_cat_product', 17),
  ('cert_019', 'PA10 인증서',            'thumb_5a66c81f54b11.JPG',    'cert_cat_product', 18),
  ('cert_020', 'PA 인증서',              'thumb_5a66c808dd7c6.JPG',    'cert_cat_product', 19),
  ('cert_021', 'ILA-R, ILA-S 인증서',    'ce-ila-r-ila-s.jpg',         'cert_cat_product', 20),
  ('cert_022', 'IFS, IFSM 인증서',       'ce-ifs-ifsm.jpg',            'cert_cat_product', 21),
  ('cert_023', 'IFRK 인증서',            'ce-ifrk.jpg',                 'cert_cat_product', 22),
  ('cert_024', 'IFD 인증서',             'ce-ifd.jpg',                  'cert_cat_product', 23),
  ('cert_025', 'IDM 인증서',             'ce-idm.jpg',                  'cert_cat_product', 24),
  ('cert_026', 'ICFV 인증서',            'ce-icfv.jpg',                 'cert_cat_product', 25),
  ('cert_027', 'HLS 인증서',             'ce-hls.jpg',                  'cert_cat_product', 26),
  ('cert_028', 'DS 인증서',              'ce-ds.jpg',                   'cert_cat_product', 27),
  ('cert_029', 'DRT, DRF 인증서',        'ce-drt-drf.jpg',              'cert_cat_product', 28),
  ('cert_030', 'DR4 인증서',             'ce-dr4.jpg',                  'cert_cat_product', 29),
  ('cert_031', 'DN 인증서',              'ce-dn.jpg',                   'cert_cat_product', 30),
  ('cert_032', 'DL, DLA2 인증서',        'ce-dl-dla2.jpg',              'cert_cat_product', 31)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- 검증 쿼리 (참고용)
-- SELECT (SELECT COUNT(*) FROM certification_categories) AS cats, (SELECT COUNT(*) FROM certifications) AS certs;
-- SELECT category, COUNT(*) FROM (SELECT cc.label AS category FROM certifications c JOIN certification_categories cc ON c."categoryId"=cc.id) t GROUP BY category;
