import { Pool } from 'pg';

// 영문 콘텐츠 DB(lvs_db_en) 전용 pg Pool 싱글톤.
// 기존 게시판 API의 요청별 new Pool 패턴과 달리 재사용한다 (EN 신규 코드 한정).
const globalForDbEn = globalThis;

export function isEnDbConfigured() {
  return Boolean(process.env.DATABASE_URL_EN);
}

function getPool() {
  if (!process.env.DATABASE_URL_EN) {
    throw new Error('DATABASE_URL_EN is not configured');
  }
  if (!globalForDbEn.__lvsEnPool) {
    globalForDbEn.__lvsEnPool = new Pool({
      connectionString: process.env.DATABASE_URL_EN,
      max: 5,
    });
  }
  return globalForDbEn.__lvsEnPool;
}

/** 영문 DB 쿼리 헬퍼 */
export function queryEn(text, params) {
  return getPool().query(text, params);
}

/** 영문 DB 미설정/장애 시 null 반환하는 안전 쿼리 (공개 페이지 폴백용) */
export async function safeQueryEn(text, params) {
  if (!isEnDbConfigured()) return null;
  try {
    return await queryEn(text, params);
  } catch (error) {
    console.error('EN DB query error:', error.message);
    return null;
  }
}
