import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';

// GET /api/posts/[id] - 게시물 상세 조회 및 조회수 증가
export async function GET(request, { params }) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get('incrementView') !== 'false';

    // 게시물 조회
    const postResult = await pool.query(
      `SELECT p.*, b.name as board_name, b.slug as board_slug
       FROM posts p
       LEFT JOIN boards b ON p.board_id = b.id
       WHERE p.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const post = postResult.rows[0];

    // 비밀글 접근 제어
    if (post.is_secret && post.board_slug === 'consultation') {
      const session = await getServerSession(authOptions);
      const isAdmin = session && session.user.role === 'ADMIN';
      const password = searchParams.get('password');
      const passwordMatch = password && post.password === password;

      if (!isAdmin && !passwordMatch) {
        // 비밀번호 필드 제거 후 content 차단
        const { password: _, ...safePost } = post;
        return NextResponse.json({
          post: { ...safePost, content: null, requiresPassword: true },
          attachments: [],
          prevPost: null,
          nextPost: null,
        });
      }
    }

    // 첨부파일 조회
    const attachmentsResult = await pool.query(
      'SELECT * FROM post_attachments WHERE post_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // 조회수 증가
    if (incrementView) {
      await pool.query(
        'UPDATE posts SET view_count = view_count + 1 WHERE id = $1',
        [id]
      );
      post.view_count = parseInt(post.view_count) + 1;
    }

    // 이전글/다음글 조회
    const prevResult = await pool.query(
      `SELECT id, title
       FROM posts
       WHERE board_id = $1 AND created_at < $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [post.board_id, post.created_at]
    );

    const nextResult = await pool.query(
      `SELECT id, title
       FROM posts
       WHERE board_id = $1 AND created_at > $2
       ORDER BY created_at ASC
       LIMIT 1`,
      [post.board_id, post.created_at]
    );

    // 응답에서 password 필드 제거
    const { password: _, ...safePost } = post;

    return NextResponse.json({
      post: safePost,
      attachments: attachmentsResult.rows,
      prevPost: prevResult.rows[0] || null,
      nextPost: nextResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Post Detail API Error:', error);
    return NextResponse.json(
      { error: '게시물을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// PATCH /api/posts/[id] - 게시물 수정 (관리자 전용)
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { id } = params;
    const data = await request.json();

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(data.title);
      paramIndex++;
    }

    if (data.content !== undefined) {
      updateFields.push(`content = $${paramIndex}`);
      values.push(data.content);
      paramIndex++;
    }

    if (data.isNotice !== undefined) {
      updateFields.push(`is_notice = $${paramIndex}`);
      values.push(data.isNotice);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '수정할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE posts
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Post Update API Error:', error);
    return NextResponse.json(
      { error: '게시물 수정에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// DELETE /api/posts/[id] - 게시물 삭제 (관리자 전용)
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { id } = params;

    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post Delete API Error:', error);
    return NextResponse.json(
      { error: '게시물 삭제에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
