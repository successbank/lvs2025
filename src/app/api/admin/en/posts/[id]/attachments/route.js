import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';
import {
  validateAttachments,
  checkAttachmentCount,
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
  const pool = new Pool({ connectionString: process.env.DATABASE_URL_EN });
  let cleanupSavedFiles = async () => {};

  try {
    const formData = await request.formData();
    const files = formData.getAll('files').filter(
      (f) => f && typeof f !== 'string' && typeof f.arrayBuffer === 'function'
    );

    if (files.length === 0) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    // 게시물 + 게시판 slug + 기존 첨부 수 확인.
    // 기존 첨부 수는 상한 검사에 필요하다 — 디스크 파일이 누락된 첨부도 DB 레코드가
    // 남아 있는 한 목록에서 한 칸을 차지하므로 그대로 센다.
    const postRes = await pool.query(
      `SELECT p.id, b.slug AS board_slug,
              (SELECT COUNT(*) FROM post_attachments WHERE post_id = p.id)::int AS attachment_count
         FROM posts p JOIN boards b ON p.board_id = b.id
        WHERE p.id = $1`,
      [postId]
    );
    if (postRes.rows.length === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    const boardSlug = postRes.rows[0].board_slug || 'misc';
    const existingCount = postRes.rows[0].attachment_count || 0;

    const validation = validateAttachments(files, { existingCount });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 디스크 저장 (실패 시 cleanup) — EN 게시판 첨부는 en-<slug> 디렉토리
    const { saved, cleanup } = await saveAttachmentsToDisk(files, `en-${boardSlug}`);
    cleanupSavedFiles = cleanup;

    // DB INSERT (트랜잭션)
    const client = await pool.connect();
    const inserted = [];
    try {
      await client.query('BEGIN');
      // 동시 업로드로 상한을 넘기지 않도록 게시물 행을 잠그고 한 번 더 확인한다.
      await client.query('SELECT id FROM posts WHERE id = $1 FOR UPDATE', [postId]);
      const lockedCount = await client.query(
        'SELECT COUNT(*)::int AS count FROM post_attachments WHERE post_id = $1',
        [postId]
      );
      const limitCheck = checkAttachmentCount(saved.length, lockedCount.rows[0].count);
      if (!limitCheck.ok) {
        throw Object.assign(new Error(limitCheck.error), { statusCode: 409 });
      }
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
    if (error.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: '첨부파일 업로드에 실패했습니다.' }, { status: 500 });
  } finally {
    pool.end().catch(() => {});
  }
}
