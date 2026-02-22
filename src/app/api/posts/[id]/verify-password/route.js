import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// POST /api/posts/[id]/verify-password - 비밀글 비밀번호 확인
export async function POST(request, { params }) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { id } = params;
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { verified: false, error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT password FROM posts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { verified: false, error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const post = result.rows[0];

    if (post.password === password) {
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json(
      { verified: false, error: '비밀번호가 일치하지 않습니다.' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Verify Password Error:', error);
    return NextResponse.json(
      { verified: false, error: '비밀번호 확인에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
