-- Move detail images from product_images to products.description
-- This ensures detail images appear in content area, not thumbnail gallery

-- 1. DB,DB2,DBS Series (prod-gl-001)
UPDATE products SET description = '머신비젼 검사를 위한 조명.<br/><br/><img src="/images/products/general-lighting/db-detail.jpg" alt="DB,DB2,DBS Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-001';
DELETE FROM product_images WHERE id = 'img-db-detail-1';

-- 2. DRT/DRF Series (prod-gl-002)
UPDATE products SET description = '머신비젼 검사를 위한 COAXIAL 조명.<br/><br/><img src="/images/products/general-lighting/drt-drf-detail.jpg" alt="DRT/DRF Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-002';
DELETE FROM product_images WHERE id = 'img-drt-drf-detail-1';

-- 3. DLA2/DL Series (prod-gl-003)
UPDATE products SET description = '일정한 각도로 저면 검사가 가능한 조명.<br/><br/><img src="/images/products/general-lighting/dla2-dl-detail.jpg" alt="DLA2/DL Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-003';
DELETE FROM product_images WHERE id = 'img-dla2-dl-detail-1';

-- 4. IFRK Series (prod-gl-004)
UPDATE products SET description = '플랫조명을 위한 링형 제품.<br/><br/><img src="/images/products/general-lighting/ifrk-detail.jpg" alt="IFRK Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-004';
DELETE FROM product_images WHERE id = 'img-ifrk-detail-1';

-- 5. ILA Series (prod-gl-005)
UPDATE products SET description = '넓은 면적을 조명하기 위한 제품.<br/><br/><img src="/images/products/general-lighting/ila-detail.jpg" alt="ILA Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-005';
DELETE FROM product_images WHERE id = 'img-ila-detail-1';

-- 6. IDM Series (prod-gl-006)
UPDATE products SET description = '머신비젼 검사를 위한 DOME 조명.<br/><br/><img src="/images/products/general-lighting/idm-detail.jpg" alt="IDM Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-006';
DELETE FROM product_images WHERE id = 'img-idm-detail-1';

-- 7. DDM Series (prod-gl-008)
UPDATE products SET description = 'DOME 검사 조명.<br/><br/><img src="/images/products/general-lighting/ddm-detail.jpg" alt="DDM Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-008';
DELETE FROM product_images WHERE id = 'img-ddm-detail-1';

-- 8. ICFV Series (prod-gl-009)
UPDATE products SET description = '머신비젼 검사를 위한 COAXIAL 조명.<br/><br/><img src="/images/products/general-lighting/icfv-detail.jpg" alt="ICFV Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-009';
DELETE FROM product_images WHERE id = 'img-icfv-detail-1';

-- 9. SVL Series (prod-gl-011)
UPDATE products SET description = '머신비젼 검사를 위한 BAR 조명.<br/><br/><img src="/images/products/general-lighting/svl-detail.jpg" alt="SVL Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-011';
DELETE FROM product_images WHERE id = 'img-svl-detail-1';

-- 10. UV,IR Series (prod-gl-012)
UPDATE products SET description = 'UV, IR 검사용 조명.<br/><br/><img src="/images/products/general-lighting/uv-ir-detail.jpg" alt="UV,IR Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-gl-012';
DELETE FROM product_images WHERE id = 'img-uv-ir-detail-1';
