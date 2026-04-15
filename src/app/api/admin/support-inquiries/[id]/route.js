import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';

// GET /api/admin/support-inquiries/[id]
// 상세 조회 (최초 열람 시 admin_read_at 갱신)
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(
      `SELECT p.*, b.slug AS board_slug, b.name AS board_name
         FROM posts p
         JOIN boards b ON p.board_id = b.id
        WHERE p.id = $1 AND b.slug IN ('consultation','catalog')
        LIMIT 1`,
      [params.id]
    );
    if (res.rows.length === 0) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }
    // 최초 열람 기록
    if (!res.rows[0].admin_read_at) {
      await pool.query('UPDATE posts SET admin_read_at = NOW() WHERE id = $1', [params.id]);
      res.rows[0].admin_read_at = new Date();
    }
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('support-inquiries detail error:', error);
    return NextResponse.json({ error: '조회에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}

// PATCH /api/admin/support-inquiries/[id]
// body: { status?, reply?, note? }
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const body = await request.json();
    const sets = [];
    const values = [];

    if (body.status && ['NEW', 'IN_PROGRESS', 'DONE'].includes(body.status)) {
      values.push(body.status);
      sets.push(`admin_status = $${values.length}`);
    }
    if (typeof body.reply === 'string') {
      values.push(body.reply);
      sets.push(`admin_reply = $${values.length}`);
      sets.push(`admin_reply_at = NOW()`);
      values.push(session.user.id);
      sets.push(`admin_reply_by = $${values.length}`);
      // 답변이 있으면 자동으로 DONE으로 승격(명시 status가 없을 때만)
      if (!body.status) {
        values.push('DONE');
        sets.push(`admin_status = $${values.length}`);
      }
    }
    if (typeof body.note === 'string') {
      values.push(body.note);
      sets.push(`admin_note = $${values.length}`);
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: '변경할 필드가 없습니다.' }, { status: 400 });
    }

    values.push(params.id);
    const sql = `
      UPDATE posts
         SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, admin_status, admin_reply, admin_reply_at, admin_reply_by, admin_note
    `;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('support-inquiries PATCH error:', error);
    return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}

// DELETE /api/admin/support-inquiries/[id]
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(
      `DELETE FROM posts
         WHERE id = $1
           AND board_id IN (SELECT id FROM boards WHERE slug IN ('consultation','catalog'))
         RETURNING id`,
      [params.id]
    );
    if (res.rows.length === 0) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (error) {
    console.error('support-inquiries DELETE error:', error);
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}
