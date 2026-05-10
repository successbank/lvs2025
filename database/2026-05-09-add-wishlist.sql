-- 관심제품(Wishlist) 테이블 추가
-- 작성: 2026-05-09 / 담당: 개발1팀 BE + 윤성호(DB PM)
-- Prisma 모델과 동기 — id는 cuid 문자열, FK 모두 CASCADE
-- 운영 DB 적용 전 반드시 pg_dump 백업 (메모리: 2026-05-09 prisma db push 데이터 유실 사고)
--
-- ⚠️ 컬럼명 LVS 표준은 camelCase ("userId", "productId", "createdAt").
--    snake_case로 만들면 prisma client가 컬럼을 못 찾아 500 에러.

CREATE TABLE IF NOT EXISTS wishlists (
  id          TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT wishlists_user_product_unique UNIQUE ("userId", "productId")
);

CREATE INDEX IF NOT EXISTS wishlists_user_id_idx    ON wishlists("userId");
CREATE INDEX IF NOT EXISTS wishlists_product_id_idx ON wishlists("productId");
