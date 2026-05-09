import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';
import fs from 'fs';
import { unlink, stat } from 'fs/promises';
import path from 'path';

// PATCH /api/admin/attachments/[id]
// file_path 정정 — 디스크 파일이 다른 이름으로 살아 있을 때 DB 경로만 갱신
// body: { file_path: '/uploads/downloads/IFSM.zip' }
//   - 새 file_path가 디스크에 실제로 존재해야만 적용 (검증)
//   - file_size도 자동 동기화 (디스크 stat)
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const { id } = params;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { file_path: newPath } = await request.json();
    if (!newPath || typeof newPath !== 'string' || !newPath.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'file_path는 /uploads/ 로 시작해야 합니다.' },
        { status: 400 }
      );
    }

    // 디스크 파일 존재 + 크기 확인
    const absolute = path.join('/app', newPath);
    if (!fs.existsSync(absolute)) {
      return NextResponse.json(
        { error: `디스크에 파일이 없습니다: ${newPath}` },
        { status: 400 }
      );
    }
    const st = await stat(absolute);

    const sel = await pool.query(
      'SELECT id FROM post_attachments WHERE id = $1',
      [id]
    );
    if (sel.rows.length === 0) {
      return NextResponse.json({ error: '첨부파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    // filename은 file_path의 basename으로 동기화
    const newFilename = path.posix.basename(newPath);
    const result = await pool.query(
      `UPDATE post_attachments
          SET file_path = $1,
              filename = $2,
              file_size = $3
        WHERE id = $4
        RETURNING id, file_path, filename, file_size, original_filename`,
      [newPath, newFilename, st.size, id]
    );

    return NextResponse.json({
      message: '경로가 정정되었습니다.',
      updated: result.rows[0],
    });
  } catch (error) {
    console.error('Attachment PATCH error:', error);
    return NextResponse.json({ error: '경로 정정에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}

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
