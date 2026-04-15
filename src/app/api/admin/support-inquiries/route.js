import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';

// GET /api/admin/support-inquiries?type=all|consultation|catalog&status=NEW|IN_PROGRESS|DONE&search=&page=&limit=
// 상담/카탈로그 문의 통합 목록 (관리자 전용)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || '';
    const search = (searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    const whereParts = ["b.slug IN ('consultation','catalog')"];
    const params = [];

    if (type === 'consultation') {
      whereParts.push("b.slug = 'consultation'");
    } else if (type === 'catalog') {
      whereParts.push("b.slug = 'catalog'");
    }

    if (status && ['NEW', 'IN_PROGRESS', 'DONE'].includes(status)) {
      params.push(status);
      whereParts.push(`p.admin_status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      whereParts.push(`(p.title ILIKE $${idx} OR p.content ILIKE $${idx} OR p.author ILIKE $${idx} OR p.company ILIKE $${idx} OR p.contact_phone ILIKE $${idx})`);
    }

    const whereSql = whereParts.join(' AND ');

    const listSql = `
      SELECT p.id, p.title, p.content, p.author, p.author_email, p.company,
             p.contact_name, p.contact_email, p.contact_phone,
             p.is_secret, p.view_count, p.created_at,
             p.admin_status, p.admin_reply, p.admin_reply_at, p.admin_reply_by,
             p.admin_note, p.admin_read_at,
             b.slug AS board_slug, b.name AS board_name
        FROM posts p
        JOIN boards b ON p.board_id = b.id
       WHERE ${whereSql}
       ORDER BY p.created_at DESC
       LIMIT ${limit} OFFSET ${offset}
    `;
    const countSql = `
      SELECT COUNT(*) AS n
        FROM posts p
        JOIN boards b ON p.board_id = b.id
       WHERE ${whereSql}
    `;
    const statusCountsSql = `
      SELECT p.admin_status AS status, COUNT(*) AS n
        FROM posts p
        JOIN boards b ON p.board_id = b.id
       WHERE b.slug IN ('consultation','catalog')
       GROUP BY p.admin_status
    `;
    const typeCountsSql = `
      SELECT b.slug AS slug, COUNT(*) AS n
        FROM posts p
        JOIN boards b ON p.board_id = b.id
       WHERE b.slug IN ('consultation','catalog')
       GROUP BY b.slug
    `;

    const [listRes, countRes, sCountsRes, tCountsRes] = await Promise.all([
      pool.query(listSql, params),
      pool.query(countSql, params),
      pool.query(statusCountsSql),
      pool.query(typeCountsSql),
    ]);

    const total = parseInt(countRes.rows[0]?.n || '0', 10);
    const statusCounts = { NEW: 0, IN_PROGRESS: 0, DONE: 0 };
    sCountsRes.rows.forEach(r => { statusCounts[r.status] = parseInt(r.n, 10); });
    const typeCounts = { consultation: 0, catalog: 0 };
    tCountsRes.rows.forEach(r => { typeCounts[r.slug] = parseInt(r.n, 10); });

    return NextResponse.json({
      items: listRes.rows,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      statusCounts,
      typeCounts,
    });
  } catch (error) {
    console.error('support-inquiries GET error:', error);
    return NextResponse.json({ error: '목록 조회에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}
