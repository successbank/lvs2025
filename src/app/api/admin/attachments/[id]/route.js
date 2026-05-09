import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE /api/admin/attachments/[id]
// 첨부파일 단건 삭제: DB row + 디스크 파일 정리
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const { id } = params;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const sel = await pool.query(
      'SELECT id, file_path, original_filename FROM post_attachments WHERE id = $1',
      [id]
    );
    if (sel.rows.length === 0) {
      return NextResponse.json({ error: '첨부파일을 찾을 수 없습니다.' }, { status: 404 });
    }
    const att = sel.rows[0];

    // 디스크 파일 삭제 (이미 사라진 경우 무시)
    if (att.file_path) {
      try {
        const absolutePath = path.join('/app', att.file_path);
        await unlink(absolutePath);
      } catch (err) {
        console.warn('attachment file unlink failed (ignored):', err.message);
      }
    }

    // DB 삭제
    await pool.query('DELETE FROM post_attachments WHERE id = $1', [id]);

    return NextResponse.json({
      message: '첨부파일이 삭제되었습니다.',
      deleted: { id: att.id, original_filename: att.original_filename },
    });
  } catch (error) {
    console.error('Attachment DELETE error:', error);
    return NextResponse.json({ error: '첨부파일 삭제에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}
