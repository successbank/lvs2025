-- 게시물 수동 정렬 순서 컬럼 (자료실 드래그앤드롭 순서 지정용)
-- 추가 전용(additive) 변경 — 기존 데이터/정렬에 영향 없음.
--   * NULL = 순서 미지정 → 기존과 동일하게 created_at DESC 로 정렬(NULLS FIRST)
--   * 값이 있으면 오름차순(0이 최상단)으로 고정 노출
-- 적용 대상: lvs_db, lvs_db_en 양쪽
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sort_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_posts_board_sort_order
  ON posts(board_id, sort_order);
