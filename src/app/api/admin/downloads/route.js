import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// GET /api/admin/downloads?search=&searchField=&page=&limit=
// 다운로드 게시판 전용 어드민 목록 (검색 + 페이지 + 첨부 통계 + broken 배지)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const searchField = searchParams.get('searchField') || 'all'; // all|title|content|author
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    const whereParts = ["b.slug = 'downloads'"];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      if (searchField === 'title') {
        whereParts.push(`p.title ILIKE $${idx}`);
      } else if (searchField === 'content') {
        whereParts.push(`p.content ILIKE $${idx}`);
      } else if (searchField === 'author') {
        whereParts.push(`p.author ILIKE $${idx}`);
      } else {
        whereParts.push(`(p.title ILIKE $${idx} OR p.content ILIKE $${idx} OR p.author ILIKE $${idx})`);
      }
    }

    const whereSql = whereParts.join(' AND ');

    const listSql = `
      SELECT p.id, p.title, p.author, p.is_notice, p.view_count, p.created_at,
             COALESCE(att.attachment_count, 0) AS attachment_count,
             COALESCE(att.total_download_count, 0) AS total_download_count
        FROM posts p
        JOIN boards b ON p.board_id = b.id
        LEFT JOIN (
          SELECT post_id,
                 COUNT(*) AS attachment_count,
                 SUM(download_count) AS total_download_count
            FROM post_attachments
           GROUP BY post_id
        ) att ON att.post_id = p.id
       WHERE ${whereSql}
       ORDER BY p.is_notice DESC, p.created_at DESC
       LIMIT ${limit} OFFSET ${offset}
    `;
    const countSql = `
      SELECT COUNT(*) AS n
        FROM posts p
        JOIN boards b ON p.board_id = b.id
       WHERE ${whereSql}
    `;

    const [listRes, countRes] = await Promise.all([
      pool.query(listSql, params),
      pool.query(countSql, params),
    ]);

    // 페이지에 해당하는 게시물의 첨부파일 file_path를 한번에 가져와 broken 집계
    const postIds = listRes.rows.map(r => r.id);
    let brokenSet = new Set();
    if (postIds.length > 0) {
      const attRes = await pool.query(
        'SELECT post_id, file_path FROM post_attachments WHERE post_id = ANY($1)',
        [postIds]
      );
      for (const a of attRes.rows) {
        const exists = a.file_path
          ? fs.existsSync(path.join('/app', a.file_path))
          : false;
        if (!exists) brokenSet.add(a.post_id);
      }
    }

    const items = listRes.rows.map(r => ({
      ...r,
      has_unavailable: brokenSet.has(r.id),
    }));

    const total = parseInt(countRes.rows[0]?.n || '0', 10);
    return NextResponse.json({
      items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error('admin/downloads GET error:', error);
    return NextResponse.json({ error: '목록 조회에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}
