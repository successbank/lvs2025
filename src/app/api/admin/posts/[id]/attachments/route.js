import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';
import {
  validateAttachments,
  saveAttachmentsToDisk,
  generateAttachmentId,
} from '@/lib/uploadAttachments';

// POST /api/admin/posts/[id]/attachments
// 기존 게시물에 첨부파일 추가 (multipart/form-data, 'files' 필드)
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const { id: postId } = params;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let cleanupSavedFiles = async () => {};

  try {
    const formData = await request.formData();
    const files = formData.getAll('files').filter(
      (f) => f && typeof f !== 'string' && typeof f.arrayBuffer === 'function'
    );

    if (files.length === 0) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    const validation = validateAttachments(files);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 게시물 + 게시판 slug 확인
    const postRes = await pool.query(
      `SELECT p.id, b.slug AS board_slug
         FROM posts p JOIN boards b ON p.board_id = b.id
        WHERE p.id = $1`,
      [postId]
    );
    if (postRes.rows.length === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    const boardSlug = postRes.rows[0].board_slug || 'misc';

    // 디스크 저장 (실패 시 cleanup)
    const { saved, cleanup } = await saveAttachmentsToDisk(files, boardSlug);
    cleanupSavedFiles = cleanup;

    // DB INSERT (트랜잭션)
    const client = await pool.connect();
    const inserted = [];
    try {
      await client.query('BEGIN');
      for (const att of saved) {
        const attId = generateAttachmentId();
        const result = await client.query(
          `INSERT INTO post_attachments
             (id, post_id, filename, original_filename, file_path, file_size, mime_type, download_count, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0, CURRENT_TIMESTAMP)
           RETURNING *`,
          [
            attId,
            postId,
            att.filename,
            att.original_filename,
            att.file_path,
            att.file_size,
            att.mime_type,
          ]
        );
        inserted.push(result.rows[0]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      await cleanupSavedFiles();
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ attachments: inserted }, { status: 201 });
  } catch (error) {
    console.error('Attachment add error:', error);
    await cleanupSavedFiles();
    return NextResponse.json({ error: '첨부파일 업로드에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}
