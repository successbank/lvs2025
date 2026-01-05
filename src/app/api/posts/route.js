import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// GET /api/posts - 게시물 목록 조회
export async function GET(request) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    const boardSlug = searchParams.get('boardSlug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const searchField = searchParams.get('searchField') || 'all'; // all, title, content, author

    // boardSlug로 boardId 조회
    let finalBoardId = boardId;
    if (boardSlug && !boardId) {
      const boardResult = await pool.query(
        'SELECT id FROM boards WHERE slug = $1 AND is_active = true',
        [boardSlug]
      );

      if (boardResult.rows.length === 0) {
        return NextResponse.json(
          { error: '게시판을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      finalBoardId = boardResult.rows[0].id;
    }

    if (!finalBoardId) {
      return NextResponse.json(
        { error: '게시판 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 검색 조건 구성
    let whereConditions = ['board_id = $1'];
    const params = [finalBoardId];
    let paramIndex = 2;

    if (search) {
      const searchConditions = [];
      if (searchField === 'all' || searchField === 'title') {
        searchConditions.push(`title ILIKE $${paramIndex}`);
      }
      if (searchField === 'all' || searchField === 'content') {
        searchConditions.push(`content ILIKE $${paramIndex}`);
      }
      if (searchField === 'all' || searchField === 'author') {
        searchConditions.push(`author ILIKE $${paramIndex}`);
      }

      if (searchConditions.length > 0) {
        whereConditions.push(`(${searchConditions.join(' OR ')})`);
        params.push(`%${search}%`);
        paramIndex++;
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // 전체 게시물 수 조회 (공지사항 제외)
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE ${whereClause} AND is_notice = false`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // 공지사항 조회 (is_notice = true)
    const noticeResult = await pool.query(
      `SELECT
        p.*,
        (SELECT COUNT(*) FROM post_attachments WHERE post_id = p.id) as attachment_count
      FROM posts p
      WHERE ${whereClause} AND is_notice = true
      ORDER BY created_at DESC`,
      params
    );

    // 일반 게시물 조회 (페이지네이션)
    const offset = (page - 1) * limit;
    const postsResult = await pool.query(
      `SELECT
        p.*,
        (SELECT COUNT(*) FROM post_attachments WHERE post_id = p.id) as attachment_count
      FROM posts p
      WHERE ${whereClause} AND is_notice = false
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      notices: noticeResult.rows,
      posts: postsResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Posts API Error:', error);
    return NextResponse.json(
      { error: '게시물 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
