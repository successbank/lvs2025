-- dealers 시드 — DealersPage.js 하드코딩 12건 그대로 이전
-- id는 cuid로 신규 생성 (CUID 형식 유지). order는 노출 순서 1부터.
-- 적용 전 wishlists 같은 의도하지 않은 데이터 보호 위해 ON CONFLICT 사용

INSERT INTO dealers (id, type, name, address, tel, fax, email, website, country, flag, image, "order") VALUES
  -- 국내 7건
  ('seed_dealer_dom_01', 'DOMESTIC', '(주) 화인스텍',     '서울시 서초구 양재동 321-2 대덕빌딩 3층',                              '02-579-1274',     '02-579-1275',   'fainstec@fainstec.com',     'www.fainstec.com',          NULL, NULL, 'branch1.jpg', 1),
  ('seed_dealer_dom_02', 'DOMESTIC', '(주) 비저너스',     '서울 서초구 논현로 87 삼호물산빌딩 B동 1509호(양재동)',                  '02-589-1818~19',  '02-589-1820',   'vision@visionus.co.kr',     'www.visionus.co.kr',        NULL, NULL, 'branch2.jpg', 2),
  ('seed_dealer_dom_03', 'DOMESTIC', '이미징웍스(주)',     '경기도 수원시 영통구 법조로25, SK ViewLake 에이동 2109호',               '070-7604-4096',   '031-624-3078',  'sales@imagingworks.co.kr',  'http://imagingworks.co.kr', NULL, NULL, 'branch3.jpg', 3),
  ('seed_dealer_dom_04', 'DOMESTIC', '이엑스테크놀러지 (주)', '경기도 안양시 동안구 관양동 1422-9 부흥빌딩 304호',                      '02-401-2040',     '02-401-2057',   'sales@extechnology.co.kr',  'www.extechnology.co.kr',    NULL, NULL, 'branch4.jpg', 4),
  ('seed_dealer_dom_05', 'DOMESTIC', '(주) 싸이로드',     '서울시 강남구 대치동 968-5 일동빌딩 9층',                                '070-7018-0720',   '070-7016-0720', 'info@cylod.com',            'www.cylod.com',             NULL, NULL, 'branch5.jpg', 5),
  ('seed_dealer_dom_06', 'DOMESTIC', 'Sun HighTech',      '경기도 안양시 동안구 관양동 954-6 성지스타위드 1211호',                    '031-345-6390~2',  '031-345-6393',  'sales@sunhightech.co.kr',   'www.sunhightech.co.kr',     NULL, NULL, 'branch6.jpg', 6),
  ('seed_dealer_dom_07', 'DOMESTIC', '(주) 바이렉스',     '경기도 안양시 동안구 흥안대로 427번길38, 1214호 (관양동, 인덕원성지스타위드)', '070-5055-3330',   '070-8233-5445', 'sales@virex.co.kr',         'www.virex.co.kr',           NULL, NULL, 'branch9.jpg', 7),
  -- 국제 5건
  ('seed_dealer_int_01', 'INTERNATIONAL', 'Laser Vision System Pte., Ltd.', NULL, '65-6841-2311 | 65-9023-3211', '65-6841-2355',     'sales@laservision.com.sg', 'www.laservision.com.sg', 'Singapore', E'\U0001F1F8\U0001F1EC', 'branch10.gif', 1),
  ('seed_dealer_int_02', 'INTERNATIONAL', 'Alternative Vision Corporation',  NULL, '+1-520-615-4073',             NULL,               'sales@alt-vision.com',     'www.alt-vision.com',     'USA',       E'\U0001F1FA\U0001F1F8', 'branch11.jpg', 2),
  ('seed_dealer_int_03', 'INTERNATIONAL', 'ColS s.r.o.',                     NULL, '+421-948-231-361',            NULL,               'pcopjan@cois.sk',          'www.cois.sk',            'Slovakia',  E'\U0001F1F8\U0001F1F0', 'branch12.jpg', 3),
  ('seed_dealer_int_04', 'INTERNATIONAL', 'Nevis Co., Ltd.',                 NULL, '+886-2-2226-9796',            '+886-2-2226-6586', 'support@nevis.com.tw',     'www.nevis.com.tw',       'Taiwan',    E'\U0001F1F9\U0001F1FC', 'branch13.jpg', 4),
  ('seed_dealer_int_05', 'INTERNATIONAL', 'imRN Asia Co., Ltd.',             NULL, '087-803-1661',                '02-889-1198',      'sale@imRNasia.com',        'www.imrnasia.com',       'Thailand',  E'\U0001F1F9\U0001F1ED', 'branch14.jpg', 5),
  ('seed_dealer_int_06', 'INTERNATIONAL', 'Abiz Technology Co., Ltd.',       NULL, '+66 (0) 2-275-5475',          '+66 (0) 2-275-5875','info@abizsensor.com',     NULL,                     'Thailand',  E'\U0001F1F9\U0001F1ED', 'branch19.png', 6)
ON CONFLICT (id) DO NOTHING;
