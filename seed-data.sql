-- Seed Data for LVS Database

-- 1. Insert admin user (password: admin123, hashed with bcrypt)
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'admin@lvs.co.kr',
  '$2a$10$YourHashedPasswordHere123456789012345678901234567890123456',
  '관리자',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert company info
INSERT INTO company_info (id, name, ceo, "businessNumber", phone, fax, email, address, "workingHours", "lunchTime", "closedDays", "updatedAt")
VALUES (
  'company-info-1',
  '(주)엘브이에스',
  '김태화',
  '131-86-14914',
  '032-461-1800',
  '032-461-1001',
  'info@lvs.co.kr',
  '인천광역시 연수구 송도미래로 30 (송도동 214번지) 스마트밸리 B동 801~803호',
  '평일 09:00~18:00',
  '12:00~13:00',
  '일요일, 공휴일',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert main categories
INSERT INTO categories (id, name, slug, description, "order", "isActive", "createdAt", "updatedAt")
VALUES
  ('cat-general', '일반조명', 'general-lighting', '다양한 산업용 LED 조명 솔루션', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-power', '파워서플라이', 'power-supply', 'LED 조명용 전원 공급 장치', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-led', 'LED 라이트소스', 'led-lightsource', '고출력 LED 광원 시스템', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

-- 4. Insert sub-categories for 일반조명
INSERT INTO categories (id, name, slug, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
  ('cat-g-01', '직사광 - 원형조명', 'direct-ring-lighting', 'cat-general', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-02', '직사광 원형 - Low Angle조명', 'direct-ring-low-angle', 'cat-general', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-03', '직사광 바조명', 'direct-bar-lighting', 'cat-general', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-04', '면발광 원형조명', 'diffuse-ring-lighting', 'cat-general', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-05', '면발광 - 원형 사각형 Low Angle 조명', 'diffuse-low-angle', 'cat-general', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-06', '돔형 무영조명', 'dome-shadowless', 'cat-general', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-07', '면발광 - 플랫조명', 'diffuse-flat', 'cat-general', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-08', '돔 형태의 다이렉트 조명', 'dome-direct', 'cat-general', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-09', '면발광 - 동축조명', 'diffuse-coaxial', 'cat-general', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-10', '고휘도 컴팩트 스폿라이트', 'high-intensity-spotlight', 'cat-general', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-11', '독립형 스트로브 조명', 'standalone-strobe', 'cat-general', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-g-12', 'Ultraviolet/Infrared Lights', 'uv-ir-lights', 'cat-general', 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

-- 5. Insert sub-categories for 파워서플라이
INSERT INTO categories (id, name, slug, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
  ('cat-p-01', 'Digital Type', 'power-digital', 'cat-power', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-p-02', 'Strobe Type', 'power-strobe', 'cat-power', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-p-03', 'SPOT Type', 'power-spot', 'cat-power', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-p-04', 'Analog Type', 'power-analog', 'cat-power', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-p-05', 'High Speed PWM', 'power-pwm', 'cat-power', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-p-06', 'High Speed STROBE', 'power-high-strobe', 'cat-power', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

-- 6. Insert sub-categories for LED 라이트소스
INSERT INTO categories (id, name, slug, "parentId", "order", "isActive", "createdAt", "updatedAt")
VALUES
  ('cat-l-01', 'HPLS-LP30', 'hpls-lp30', 'cat-led', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-l-02', 'HPLS-CW50', 'hpls-cw50', 'cat-led', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-l-03', 'HPLS-S/FS50', 'hpls-sfs50', 'cat-led', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-l-04', 'HPLS-CW150', 'hpls-cw150', 'cat-led', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-l-05', 'HPLS-RGB-V4', 'hpls-rgb-v4', 'cat-led', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-l-06', '광화이버', 'optical-fiber', 'cat-led', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

-- 7. Insert sample product (HPLS-CW150-V2)
INSERT INTO products (id, "modelName", name, slug, description, summary, "categoryId", manufacturer, origin, "isNew", "isFeatured", "isActive", "createdAt", "updatedAt")
VALUES (
  'prod-hpls-cw150-v2',
  'HPLS-CW150-V2',
  'HPLS-CW150-V2',
  'hpls-cw150-v2',
  '250W 메탈할라이드 램프를 대체할 수 있는 고출력 LED 조명입니다.',
  'Designed to Replace 250W Metal Halide Light, 4096 Step brightness control',
  'cat-l-04',
  'LVS',
  '대한민국',
  true,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("modelName") DO NOTHING;

-- 8. Insert product specs
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt")
VALUES
  ('spec-001', 'prod-hpls-cw150-v2', '밝기 조절', '4096 단계', 1, CURRENT_TIMESTAMP),
  ('spec-002', 'prod-hpls-cw150-v2', '대체 램프', '250W 메탈할라이드', 2, CURRENT_TIMESTAMP),
  ('spec-003', 'prod-hpls-cw150-v2', '특징', '안정적인 광출력과 긴 수명', 3, CURRENT_TIMESTAMP),
  ('spec-004', 'prod-hpls-cw150-v2', '디자인', '컴팩트한 디자인과 쉬운 설치', 4, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 9. Insert sample notices
INSERT INTO notices (id, title, content, category, "isActive", "isPinned", "createdAt", "updatedAt")
VALUES
  ('notice-001', 'Automation World 2019에 방문해 주셔서 감사합니다', '<p>Automation World 2019 전시회에 방문해 주신 모든 분들께 감사드립니다.</p>', 'NOTICE', true, true, '2019-04-04 00:00:00', CURRENT_TIMESTAMP),
  ('notice-002', '(주)엘브이에스 웹사이트가 리뉴얼하였습니다', '<p>더욱 편리하고 개선된 웹사이트로 여러분을 찾아뵙겠습니다.</p>', 'NOTICE', true, false, '2017-07-31 00:00:00', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
