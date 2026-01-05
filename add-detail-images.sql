-- Add detail images for general lighting products

-- DB,DB2,DBS Series - add detail image
INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-db-detail-1',
  'prod-gl-001',
  '/images/products/general-lighting/db-detail.jpg',
  'DB,DB2,DBS Series 상세',
  false,
  1,
  NOW()
);

-- DRT/DRF Series - add detail image
INSERT INTO product_images (id, "productId", url, alt, "isMain", "order", "createdAt")
VALUES (
  'img-drt-drf-detail-1',
  'prod-gl-002',
  '/images/products/general-lighting/drt-drf-detail.jpg',
  'DRT/DRF Series 상세',
  false,
  1,
  NOW()
);
