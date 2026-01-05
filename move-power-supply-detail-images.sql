-- Move power supply detail images from product_images to products.description
-- This ensures detail images appear in content area, not thumbnail gallery

-- 1. EN Series (prod-ps-001)
UPDATE products SET description = 'Digital Type 파워서플라이<br/><br/><img src="/images/products/power-supply/en-series-detail.jpg" alt="EN Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-ps-001';
DELETE FROM product_images WHERE id = 'img-en-detail-1';

-- 2. ES Series (prod-ps-002)
UPDATE products SET description = 'Strobe Type 파워서플라이<br/><br/><img src="/images/products/power-supply/es-series-detail.jpg" alt="ES Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-ps-002';
DELETE FROM product_images WHERE id = 'img-es-detail-1';

-- 3. ET Series (prod-ps-003)
UPDATE products SET description = 'SPOT Type 파워서플라이<br/><br/><img src="/images/products/power-supply/et-series-detail.jpg" alt="ET Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-ps-003';
DELETE FROM product_images WHERE id = 'img-et-detail-1';

-- 4. PA Series (prod-ps-004)
UPDATE products SET description = 'Analog Type 파워서플라이<br/><br/><img src="/images/products/power-supply/pa-series-detail.jpg" alt="PA Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-ps-004';
DELETE FROM product_images WHERE id = 'img-pa-detail-1';

-- 5. DN Series (prod-ps-005)
UPDATE products SET description = 'High Speed PWM 파워서플라이<br/><br/><img src="/images/products/power-supply/dn-series-detail.jpg" alt="DN Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-ps-005';
DELETE FROM product_images WHERE id = 'img-dn-detail-1';

-- 6. DS Series (prod-ps-006)
UPDATE products SET description = 'High Speed STROBE 파워서플라이<br/><br/><img src="/images/products/power-supply/ds-series-detail.jpg" alt="DS Series 상세" style="max-width: 100%; height: auto;" />' WHERE id = 'prod-ps-006';
DELETE FROM product_images WHERE id = 'img-ds-detail-1';
