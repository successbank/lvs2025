import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// GET /api/boards - 게시판 목록 조회
export async function GET(request) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const type = searchParams.get('type');

    // slug로 단일 게시판 조회
    if (slug) {
      const result = await pool.query(
        'SELECT * FROM boards WHERE slug = $1 AND is_active = true',
        [slug]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: '게시판을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ board: result.rows[0] });
    }

    // 게시판 목록 조회
    let query = 'SELECT * FROM boards WHERE is_active = true';
    const params = [];

    if (type) {
      query += ' AND type = $1';
      params.push(type);
    }

    query += ' ORDER BY "order" ASC';

    const result = await pool.query(query, params);

    return NextResponse.json({ boards: result.rows });
  } catch (error) {
    console.error('Boards API Error:', error);
    return NextResponse.json(
      { error: '게시판 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
