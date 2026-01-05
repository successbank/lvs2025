-- Insert General Lighting Products
-- Category ID: cat-general

-- 1. DB,DB2,DBS Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-db-series',
  'DB,DB2,DBS Series',
  'DB,DB2,DBS Series',
  'db-db2-dbs-series',
  '고밀도이면서 콤팩트한 조명입니다.',
  '고밀도이면서 콤팩트한 조명',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  1,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-db-series-1',
  'prod-db-series',
  '/images/products/general-lighting/db-db2-dbs-series.jpg',
  'DB,DB2,DBS Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 2. DRT/DRF Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-drt-drf-series',
  'DRT/DRF Series',
  'DRT/DRF Series',
  'drt-drf-series',
  '고밀도의 광량으로 확실한 검사 기능을 제공합니다.',
  '고밀도의 광량으로 확실한 검사 기능',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  2,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-drt-drf-1',
  'prod-drt-drf-series',
  '/images/products/general-lighting/drt-drf-series.jpg',
  'DRT/DRF Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 3. DLA2/DL Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-dla2-dl-series',
  'DLA2/DL Series',
  'DLA2/DL Series',
  'dla2-dl-series',
  '물체의 엣지추출, 광택물체 크랙검사에 최적화된 조명입니다.',
  '물체의 엣지추출, 광택물체 크랙검사',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  3,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-dla2-dl-1',
  'prod-dla2-dl-series',
  '/images/products/general-lighting/dla2-dl-series.jpg',
  'DLA2/DL Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 4. IFRK Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ifrk-series',
  'IFRK Series',
  'IFRK Series',
  'ifrk-series',
  '상부로부터 확산 광을 균일하게 조사하는 조명입니다.',
  '상부로부터 확산 광을 균일하게 조사',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  4,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-ifrk-1',
  'prod-ifrk-series',
  '/images/products/general-lighting/ifrk-series.jpg',
  'IFRK Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 5. ILA Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ila-series',
  'ILA Series',
  'ILA Series',
  'ila-series',
  '측면으로부터 확산광을 균일하게 조사하는 조명입니다.',
  '측면으로부터 확산광을 균일하게 조사',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  5,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-ila-1',
  'prod-ila-series',
  '/images/products/general-lighting/ila-series.jpg',
  'ILA Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 6. IDM Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-idm-series',
  'IDM Series',
  'IDM Series',
  'idm-series',
  '곡면상태의 광택 물체 검사에 적합한 조명입니다.',
  '곡면상태의 광택 물체 검사',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-idm-1',
  'prod-idm-series',
  '/images/products/general-lighting/idm-series.jpg',
  'IDM Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 7. IFS,IFS2 Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ifs-ifs2-series',
  'IFS,IFS2 Series',
  'IFS,IFS2 Series',
  'ifs-ifs2-series',
  '물체를 실루엣으로 검사할 수 있는 조명입니다.',
  '물체를 실루엣으로 검사',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  7,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-ifs-ifs2-1',
  'prod-ifs-ifs2-series',
  '/images/products/general-lighting/ifs-ifs2-series.jpg',
  'IFS,IFS2 Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 8. DDM Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ddm-series',
  'DDM Series',
  'DDM Series',
  'ddm-series',
  '돔형태의 라인스캔 조명입니다.',
  '돔형태의 라인스캔 조명',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  8,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-ddm-1',
  'prod-ddm-series',
  '/images/products/general-lighting/ddm-series.jpg',
  'DDM Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 9. ICFV Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-icfv-series',
  'ICFV Series',
  'ICFV Series',
  'icfv-series',
  '경면 물체를 고르고 균일하게 조사하는 조명입니다.',
  '경면 물체를 고르고 균일하게 조사',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  9,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-icfv-1',
  'prod-icfv-series',
  '/images/products/general-lighting/icfv-series.jpg',
  'ICFV Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 10. SVL Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-svl-series',
  'SVL Series',
  'SVL Series',
  'svl-series',
  '스트로브 컨드롤러 보드가 내장된 LED 조명입니다.',
  '스트로브 컨드롤러 보드가 내장된 LED 조명',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  10,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-svl-1',
  'prod-svl-series',
  '/images/products/general-lighting/svl-series.jpg',
  'SVL Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 11. UV,IR Series
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-uv-ir-series',
  'UV,IR Series',
  'UV,IR Series',
  'uv-ir-series',
  '자외선 및 적외선 특수 조명입니다.',
  '자외선 및 적외선 특수 조명',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  11,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-uv-ir-1',
  'prod-uv-ir-series',
  '/images/products/general-lighting/uv-ir-series.jpg',
  'UV,IR Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 12. LV-4RBOX-R0.3 (This product doesn't have description on source site)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-lv-4rbox-r03',
  'LV-4RBOX-R0.3',
  'LV-4RBOX-R0.3',
  'lv-4rbox-r03',
  'LV-4RBOX-R0.3',
  'LV-4RBOX-R0.3',
  'cat-general',
  'LVS',
  '대한민국',
  true,
  12,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  "modelName" = EXCLUDED."modelName",
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  "updatedAt" = NOW();

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-lv-4rbox-1',
  'prod-lv-4rbox-r03',
  '/images/products/general-lighting/lv-4rbox-r03.jpg',
  'LV-4RBOX-R0.3',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;
