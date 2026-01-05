-- IFS,IFS2 Series 제품 스펙 추가
-- 원본: http://lvs.co.kr/ko/sub01/view.php?id=18&ca_id=1070

-- 1. 제품 설명 업데이트
UPDATE products SET
  description = '고휘도 LED를 사용한 고밀도 플랫조명으로 물체를 실루엣으로 검사할 수 있는 조명입니다.',
  summary = '고휘도 LED를 사용한 고밀도 플랫조명'
WHERE id = 'prod-gl-007';

-- 2. IFS Series 스펙 추가

-- IFS Series 헤더
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt")
VALUES ('spec-ifs-header', 'prod-gl-007', '※ IFS Series List', '', 1, NOW());

-- LV-IFS-27X27-FL
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs-1-model', 'prod-gl-007', 'Model Name', 'LV-IFS-27X27-FL', 2, NOW()),
('spec-ifs-1-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 3, NOW()),
('spec-ifs-1-power', 'prod-gl-007', 'Power Consumption', '1 / 0.8 / 1 / 1 W', 4, NOW()),
('spec-ifs-1-dim', 'prod-gl-007', 'Dimensions', 'W 37mm x D 37mm x H 17mm', 5, NOW()),
('spec-ifs-1-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 6, NOW()),
('spec-ifs-1-led', 'prod-gl-007', 'Number of LEDs', '16EA', 7, NOW()),
('spec-ifs-1-remark', 'prod-gl-007', 'REMARKS', '기존제품', 8, NOW());

-- LV-IFS-45X45-FL
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs-2-model', 'prod-gl-007', 'Model Name', 'LV-IFS-45X45-FL', 9, NOW()),
('spec-ifs-2-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 10, NOW()),
('spec-ifs-2-power', 'prod-gl-007', 'Power Consumption', '2.2 / 1.1 / 2.2 / 2.2 W', 11, NOW()),
('spec-ifs-2-dim', 'prod-gl-007', 'Dimensions', 'W 53.5mm x D 55mm x H 24mm', 12, NOW()),
('spec-ifs-2-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 13, NOW()),
('spec-ifs-2-led', 'prod-gl-007', 'Number of LEDs', '36EA', 14, NOW()),
('spec-ifs-2-remark', 'prod-gl-007', 'REMARKS', '기존제품', 15, NOW());

-- LV-IFS-64X64
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs-3-model', 'prod-gl-007', 'Model Name', 'LV-IFS-64X64', 16, NOW()),
('spec-ifs-3-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 17, NOW()),
('spec-ifs-3-power', 'prod-gl-007', 'Power Consumption', '4.9 / 2.5 / 4.9 / 4.9 W', 18, NOW()),
('spec-ifs-3-dim', 'prod-gl-007', 'Dimensions', 'W 73mm x D 66mm x H 24mm', 19, NOW()),
('spec-ifs-3-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 20, NOW()),
('spec-ifs-3-led', 'prod-gl-007', 'Number of LEDs', '81EA', 21, NOW()),
('spec-ifs-3-remark', 'prod-gl-007', 'REMARKS', '기존제품', 22, NOW());

-- LV-IFS-80X80-V4
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs-4-model', 'prod-gl-007', 'Model Name', 'LV-IFS-80X80-V4', 23, NOW()),
('spec-ifs-4-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 24, NOW()),
('spec-ifs-4-power', 'prod-gl-007', 'Power Consumption', '8.7 / 4.4 / 8.7 / 8.7 W', 25, NOW()),
('spec-ifs-4-dim', 'prod-gl-007', 'Dimensions', 'W 92.5mm x D 85.5mm x H 24mm', 26, NOW()),
('spec-ifs-4-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 27, NOW()),
('spec-ifs-4-led', 'prod-gl-007', 'Number of LEDs', '144EA', 28, NOW()),
('spec-ifs-4-remark', 'prod-gl-007', 'REMARKS', '기존제품', 29, NOW());

-- 3. IFS2 Series 스펙 추가

-- IFS2 Series 헤더
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt")
VALUES ('spec-ifs2-header', 'prod-gl-007', '※ IFS2 Series List', '', 30, NOW());

-- LV-IFS2-60X50
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-1-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-60X50', 31, NOW()),
('spec-ifs2-1-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 32, NOW()),
('spec-ifs2-1-power', 'prod-gl-007', 'Power Consumption', '3.6 / 2.2 / 3.6 / 3.6 W', 33, NOW()),
('spec-ifs2-1-dim', 'prod-gl-007', 'Dimensions', 'W 112mm x D 105mm x H 25mm', 34, NOW()),
('spec-ifs2-1-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 35, NOW()),
('spec-ifs2-1-led', 'prod-gl-007', 'Number of LEDs', '90EA', 36, NOW()),
('spec-ifs2-1-remark', 'prod-gl-007', 'REMARKS', 'L2835', 37, NOW());

-- LV-IFS2-100X60
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-2-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-100X60', 38, NOW()),
('spec-ifs2-2-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 39, NOW()),
('spec-ifs2-2-power', 'prod-gl-007', 'Power Consumption', '10.8 / 6.5 / 10.8 / 10.8 W', 40, NOW()),
('spec-ifs2-2-dim', 'prod-gl-007', 'Dimensions', 'W 100mm x D 70mm x H 33mm', 41, NOW()),
('spec-ifs2-2-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 42, NOW()),
('spec-ifs2-2-led', 'prod-gl-007', 'Number of LEDs', '180EA', 43, NOW()),
('spec-ifs2-2-remark', 'prod-gl-007', 'REMARKS', 'L2835', 44, NOW());

-- LV-IFS2-100X90
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-3-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-100X90', 45, NOW()),
('spec-ifs2-3-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 46, NOW()),
('spec-ifs2-3-power', 'prod-gl-007', 'Power Consumption', '16.2 / 9.7 / 16.2 / 16.2 W', 47, NOW()),
('spec-ifs2-3-dim', 'prod-gl-007', 'Dimensions', 'W 110mm x D 100mm x H 33mm', 48, NOW()),
('spec-ifs2-3-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 49, NOW()),
('spec-ifs2-3-led', 'prod-gl-007', 'Number of LEDs', '270EA', 50, NOW()),
('spec-ifs2-3-remark', 'prod-gl-007', 'REMARKS', 'L2835', 51, NOW());

-- LV-IFS2-120X100-V2
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-4-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-120X100-V2', 52, NOW()),
('spec-ifs2-4-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 53, NOW()),
('spec-ifs2-4-power', 'prod-gl-007', 'Power Consumption', '21.6 / 13 / 21.6 / 21.6 W', 54, NOW()),
('spec-ifs2-4-dim', 'prod-gl-007', 'Dimensions', 'W 130mm x D 110mm x H 33mm', 55, NOW()),
('spec-ifs2-4-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 56, NOW()),
('spec-ifs2-4-led', 'prod-gl-007', 'Number of LEDs', '360EA', 57, NOW()),
('spec-ifs2-4-remark', 'prod-gl-007', 'REMARKS', 'L2835', 58, NOW());

-- LV-IFS2-150X100-V2
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-5-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-150X100-V2', 59, NOW()),
('spec-ifs2-5-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 60, NOW()),
('spec-ifs2-5-power', 'prod-gl-007', 'Power Consumption', '27 / 16.2 / 27 / 27 W', 61, NOW()),
('spec-ifs2-5-dim', 'prod-gl-007', 'Dimensions', 'W 160mm x D 110mm x H 33mm', 62, NOW()),
('spec-ifs2-5-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 63, NOW()),
('spec-ifs2-5-led', 'prod-gl-007', 'Number of LEDs', '450EA', 64, NOW()),
('spec-ifs2-5-remark', 'prod-gl-007', 'REMARKS', 'L2835', 65, NOW());

-- LV-IFS2-150X120
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-6-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-150X120', 66, NOW()),
('spec-ifs2-6-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 67, NOW()),
('spec-ifs2-6-power', 'prod-gl-007', 'Power Consumption', '36 / 21.6 / 36 / 36 W', 68, NOW()),
('spec-ifs2-6-dim', 'prod-gl-007', 'Dimensions', 'W 160mm x D 130mm x H 33mm', 69, NOW()),
('spec-ifs2-6-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 70, NOW()),
('spec-ifs2-6-led', 'prod-gl-007', 'Number of LEDs', '600EA', 71, NOW()),
('spec-ifs2-6-remark', 'prod-gl-007', 'REMARKS', 'L2835', 72, NOW());

-- LV-IFS2-210X200
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-7-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-210X200', 73, NOW()),
('spec-ifs2-7-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 74, NOW()),
('spec-ifs2-7-power', 'prod-gl-007', 'Power Consumption', '75.6 / 45.4 / 75.6 / 75.6 W', 75, NOW()),
('spec-ifs2-7-dim', 'prod-gl-007', 'Dimensions', 'W 220mm x D 210mm x H 33mm', 76, NOW()),
('spec-ifs2-7-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 77, NOW()),
('spec-ifs2-7-led', 'prod-gl-007', 'Number of LEDs', '1260EA', 78, NOW()),
('spec-ifs2-7-remark', 'prod-gl-007', 'REMARKS', 'L2835', 79, NOW());

-- LV-IFS2-240X200
INSERT INTO product_specs (id, "productId", label, value, "order", "createdAt") VALUES
('spec-ifs2-8-model', 'prod-gl-007', 'Model Name', 'LV-IFS2-240X200', 80, NOW()),
('spec-ifs2-8-color', 'prod-gl-007', 'Color Option', 'SW / RD / GR / BL', 81, NOW()),
('spec-ifs2-8-power', 'prod-gl-007', 'Power Consumption', '75.6 / 45.4 / 75.6 / 75.6 W', 82, NOW()),
('spec-ifs2-8-dim', 'prod-gl-007', 'Dimensions', 'W 250mm x D 210mm x H 33mm', 83, NOW()),
('spec-ifs2-8-volt', 'prod-gl-007', 'Voltage Option', '12V / 24V', 84, NOW()),
('spec-ifs2-8-led', 'prod-gl-007', 'Number of LEDs', '1260EA', 85, NOW()),
('spec-ifs2-8-remark', 'prod-gl-007', 'REMARKS', 'L2835', 86, NOW());
