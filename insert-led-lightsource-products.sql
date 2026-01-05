-- LED LIGHTSOURCE 제품 데이터 추가

-- 1. HPLS-LP30
INSERT INTO products (id, name, "modelName", slug, "categoryId", description, summary, manufacturer, origin, "isActive", "viewCount", "createdAt", "updatedAt")
VALUES (
  'prod-ls-001',
  'HPLS-LP30',
  'HPLS-LP30',
  'hpls-lp30',
  'cat-l-01',
  'LED 라이트 소스',
  'LED 라이트 소스',
  'LVS',
  '대한민국',
  true,
  0,
  NOW(),
  NOW()
);

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt") VALUES
('img-hpls-lp30-1', 'prod-ls-001', '/images/products/led-lightsource/hpls-lp30.jpg', 'HPLS-LP30', true, 0, NOW()),
('img-hpls-lp30-detail-1', 'prod-ls-001', '/images/products/led-lightsource/hpls-lp30-detail.jpg', 'HPLS-LP30 상세', false, 1, NOW());

-- 2. HPLS-CW50
INSERT INTO products (id, name, "modelName", slug, "categoryId", description, summary, manufacturer, origin, "isActive", "viewCount", "createdAt", "updatedAt")
VALUES (
  'prod-ls-002',
  'HPLS-CW50',
  'HPLS-CW50',
  'hpls-cw50',
  'cat-l-02',
  'LED 라이트 소스',
  'LED 라이트 소스',
  'LVS',
  '대한민국',
  true,
  0,
  NOW(),
  NOW()
);

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt") VALUES
('img-hpls-cw50-1', 'prod-ls-002', '/images/products/led-lightsource/hpls-cw50.jpg', 'HPLS-CW50', true, 0, NOW()),
('img-hpls-cw50-detail-1', 'prod-ls-002', '/images/products/led-lightsource/hpls-cw50-detail.jpg', 'HPLS-CW50 상세', false, 1, NOW());

-- 3. HPLS-S/FS50
INSERT INTO products (id, name, "modelName", slug, "categoryId", description, summary, manufacturer, origin, "isActive", "viewCount", "createdAt", "updatedAt")
VALUES (
  'prod-ls-003',
  'HPLS-S/FS50',
  'HPLS-S/FS50',
  'hpls-s-fs50',
  'cat-l-03',
  'LED 라이트 소스',
  'LED 라이트 소스',
  'LVS',
  '대한민국',
  true,
  0,
  NOW(),
  NOW()
);

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt") VALUES
('img-hpls-sfs50-1', 'prod-ls-003', '/images/products/led-lightsource/hpls-s-fs50.jpg', 'HPLS-S/FS50', true, 0, NOW()),
('img-hpls-sfs50-detail-1', 'prod-ls-003', '/images/products/led-lightsource/hpls-s-fs50-detail.jpg', 'HPLS-S/FS50 상세', false, 1, NOW());

-- 4. HPLS-CW150-V2
INSERT INTO products (id, name, "modelName", slug, "categoryId", description, summary, manufacturer, origin, "isActive", "viewCount", "createdAt", "updatedAt")
VALUES (
  'prod-ls-004',
  'HPLS-CW150-V2',
  'HPLS-CW150-V2',
  'hpls-cw150-v2',
  'cat-l-04',
  'LED 라이트 소스',
  'LED 라이트 소스',
  'LVS',
  '대한민국',
  true,
  0,
  NOW(),
  NOW()
);

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt") VALUES
('img-hpls-cw150-1', 'prod-ls-004', '/images/products/led-lightsource/hpls-cw150-v2.jpg', 'HPLS-CW150-V2', true, 0, NOW()),
('img-hpls-cw150-detail-1', 'prod-ls-004', '/images/products/led-lightsource/hpls-cw150-v2-detail.jpg', 'HPLS-CW150-V2 상세', false, 1, NOW());

-- 5. HPLS-RGB-V4
INSERT INTO products (id, name, "modelName", slug, "categoryId", description, summary, manufacturer, origin, "isActive", "viewCount", "createdAt", "updatedAt")
VALUES (
  'prod-ls-005',
  'HPLS-RGB-V4',
  'HPLS-RGB-V4',
  'hpls-rgb-v4',
  'cat-l-05',
  'LED 라이트 소스',
  'LED 라이트 소스',
  'LVS',
  '대한민국',
  true,
  0,
  NOW(),
  NOW()
);

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt") VALUES
('img-hpls-rgb-1', 'prod-ls-005', '/images/products/led-lightsource/hpls-rgb-v4.jpg', 'HPLS-RGB-V4', true, 0, NOW()),
('img-hpls-rgb-detail-1', 'prod-ls-005', '/images/products/led-lightsource/hpls-rgb-v4-detail.jpg', 'HPLS-RGB-V4 상세', false, 1, NOW());

-- 6. 광화이바 (Optical Fiber)
INSERT INTO products (id, name, "modelName", slug, "categoryId", description, summary, manufacturer, origin, "isActive", "viewCount", "createdAt", "updatedAt")
VALUES (
  'prod-ls-006',
  '광화이바',
  '광화이바',
  'optical-fiber',
  'cat-l-06',
  'LED 라이트 소스',
  'LED 라이트 소스',
  'LVS',
  '대한민국',
  true,
  0,
  NOW(),
  NOW()
);

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt") VALUES
('img-optical-fiber-1', 'prod-ls-006', '/images/products/led-lightsource/optical-fiber.jpg', '광화이바', true, 0, NOW()),
('img-optical-fiber-detail-1', 'prod-ls-006', '/images/products/led-lightsource/optical-fiber-detail.jpg', '광화이바 상세', false, 1, NOW());

-- 7. HPLS-LSC-320 (메인 LED LIGHTSOURCE 카테고리)
INSERT INTO products (id, name, "modelName", slug, "categoryId", description, summary, manufacturer, origin, "isActive", "viewCount", "createdAt", "updatedAt")
VALUES (
  'prod-ls-007',
  'HPLS-LSC-320',
  'HPLS-LSC-320',
  'hpls-lsc-320',
  (SELECT id FROM categories WHERE slug = 'led-lightsource'),
  'LED 라이트 소스',
  'LED 라이트 소스',
  'LVS',
  '대한민국',
  true,
  0,
  NOW(),
  NOW()
);

INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt") VALUES
('img-hpls-lsc-1', 'prod-ls-007', '/images/products/led-lightsource/hpls-lsc-320.jpg', 'HPLS-LSC-320', true, 0, NOW()),
('img-hpls-lsc-detail-1', 'prod-ls-007', '/images/products/led-lightsource/hpls-lsc-320-detail.jpg', 'HPLS-LSC-320 상세', false, 1, NOW());
