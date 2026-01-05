-- Insert Power Supply Products
-- Category ID: cat-power (파워서플라이)

-- 1. EN Series (Digital Type)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ps-001',
  'EN Series',
  'EN Series',
  'en-series',
  'Digital Type 파워서플라이',
  'Digital Type',
  'cat-p-01',
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
  'img-en-1',
  'prod-ps-001',
  '/images/products/power-supply/en-series.jpg',
  'EN Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-en-detail-1',
  'prod-ps-001',
  '/images/products/power-supply/en-series-detail.jpg',
  'EN Series 상세',
  false,
  1,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 2. ES Series (Strobe Type)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ps-002',
  'ES Series',
  'ES Series',
  'es-series',
  'Strobe Type 파워서플라이',
  'Strobe Type',
  'cat-p-02',
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
  'img-es-1',
  'prod-ps-002',
  '/images/products/power-supply/es-series.jpg',
  'ES Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-es-detail-1',
  'prod-ps-002',
  '/images/products/power-supply/es-series-detail.jpg',
  'ES Series 상세',
  false,
  1,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 3. ET Series (SPOT Type)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ps-003',
  'ET Series',
  'ET Series',
  'et-series',
  'SPOT Type 파워서플라이',
  'SPOT Type',
  'cat-p-03',
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
  'img-et-1',
  'prod-ps-003',
  '/images/products/power-supply/et-series.jpg',
  'ET Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-et-detail-1',
  'prod-ps-003',
  '/images/products/power-supply/et-series-detail.jpg',
  'ET Series 상세',
  false,
  1,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 4. PA Series (Analog Type)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ps-004',
  'PA Series',
  'PA Series',
  'pa-series',
  'Analog Type 파워서플라이',
  'Analog Type',
  'cat-p-04',
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
  'img-pa-1',
  'prod-ps-004',
  '/images/products/power-supply/pa-series.jpg',
  'PA Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-pa-detail-1',
  'prod-ps-004',
  '/images/products/power-supply/pa-series-detail.jpg',
  'PA Series 상세',
  false,
  1,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 5. DN Series (High Speed PWM)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ps-005',
  'DN Series',
  'DN Series',
  'dn-series',
  'High Speed PWM 파워서플라이',
  'High Speed PWM',
  'cat-p-05',
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
  'img-dn-1',
  'prod-ps-005',
  '/images/products/power-supply/dn-series.jpg',
  'DN Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-dn-detail-1',
  'prod-ps-005',
  '/images/products/power-supply/dn-series-detail.jpg',
  'DN Series 상세',
  false,
  1,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

-- 6. DS Series (High Speed STROBE)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isActive", "order", "createdAt", "updatedAt")
VALUES (
  'prod-ps-006',
  'DS Series',
  'DS Series',
  'ds-series',
  'High Speed STROBE 파워서플라이',
  'High Speed STROBE',
  'cat-p-06',
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
  'img-ds-1',
  'prod-ps-006',
  '/images/products/power-supply/ds-series.jpg',
  'DS Series',
  true,
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-ds-detail-1',
  'prod-ps-006',
  '/images/products/power-supply/ds-series-detail.jpg',
  'DS Series 상세',
  false,
  1,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  alt = EXCLUDED.alt;
