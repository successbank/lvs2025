-- 기존 대리점 데이터 삭제
TRUNCATE TABLE dealers RESTART IDENTITY CASCADE;

-- 국내 대리점 데이터 입력
INSERT INTO dealers (id, name, region, address, phone, fax, email, contact_person, type, "order", is_active)
VALUES
  ('dealer-domestic-01', '(주) 화인스텍', '서울/경기', '서울시 서초구 양재동 321-2 대덕빌딩 3층', '02-579-1274', '02-579-1275', 'fainstec@fainstec.com', NULL, 'domestic', 1, true),
  ('dealer-domestic-02', '(주) 비저너스', '서울/경기', '서울 서초구 논현로 87 삼호물산빌딩 B동 1509호(양재동)', '02-589-1818~19', '02-589-1820', 'vision@visionus.co.kr', NULL, 'domestic', 2, true),
  ('dealer-domestic-03', '이미징웍스㈜', '서울/경기', '경기도 수원시 영통구 법조로25, SK ViewLake 에이동 2109호', '070-7604-4096', '031-624-3078', 'sales@imagingworks.co.kr', NULL, 'domestic', 3, true),
  ('dealer-domestic-04', '이엑스테크놀러지 (주)', '서울/경기', '경기도 안양시 동안구 관양동 1422-9 부흥빌딩 304호', '02-401-2040', '02-401-2057', 'sales@extechnology.co.kr', NULL, 'domestic', 4, true),
  ('dealer-domestic-05', '(주) 싸이로드', '서울/경기', '서울시 강남구 대치동 968-5 일동빌딩 9층', '070-7018-0720', '070-7016-0720', 'info@cylod.com', NULL, 'domestic', 5, true),
  ('dealer-domestic-06', 'Sun HighTech', '경기', '경기도 안양시 동안구 관양동 954-6 성지스타위드 1211호', '031-345-6390~2', '031-345-6393', 'sales@sunhightech.co.kr', NULL, 'domestic', 6, true),
  ('dealer-domestic-07', '(주) 바이렉스', '경기', '경기도 안양시 동안구 흥안대로 427번길38, 1214호 (관양동, 인덕원성지스타위드)', '070-5055-3330', '070-8233-5445', 'sales@virex.co.kr', NULL, 'domestic', 7, true),
  ('dealer-domestic-08', '주식회사 프리비전', '서울', '서울특별시 송파구 법원로 128, C동 1731호 (문정역 SK V1)', '02-527-8830', '050-4199-9496', 'ceo@pre-vision.co.kr', NULL, 'domestic', 8, true);

-- 해외 대리점 데이터 입력
INSERT INTO dealers (id, name, region, address, phone, fax, email, contact_person, type, "order", is_active)
VALUES
  ('dealer-international-01', 'Laser Vision System Pte., Ltd.', 'Singapore', 'Singapore', '65-6841-2311 | 65-9023-3211', '65-6841-2355', 'sales@laservision.com.sg', NULL, 'international', 1, true),
  ('dealer-international-02', 'Alternative Vision Corporation', 'USA', 'USA', '+1-520-615-4073', NULL, 'sales@alt-vision.com', NULL, 'international', 2, true),
  ('dealer-international-03', 'ColS s.r.o.', 'Slovakia', 'Slovakia', '+421-948-231-361', NULL, 'pcopjan@cois.sk', NULL, 'international', 3, true),
  ('dealer-international-04', 'Nevis Co., Ltd', 'Taiwan', 'Taiwan', '+886-2-2226-9796', '+886-2-2226-6586', 'support@nevis.com.tw', NULL, 'international', 4, true),
  ('dealer-international-05', 'imRN Asia Co.,Ltd.', 'Thailand', 'Thailand', '087-803-1661', '02-889-1198', 'sale@imRNasia.com', NULL, 'international', 5, true),
  ('dealer-international-06', 'VIETNAM SEBONG VINA', 'Vietnam', 'Vietnam', '84.4.3226.2970', '84.4.3226.2971', 'dhshin@osebong.com', NULL, 'international', 6, true),
  ('dealer-international-07', 'Thailand Abiz Technology Co., Ltd.', 'Thailand', 'Thailand', '+66 (0) 2-275-5475', '+66 (0) 2-275-5875', 'info@abizsensor.com', NULL, 'international', 7, true);
