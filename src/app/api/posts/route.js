import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';
import prisma from '@/lib/prisma';
import { sendInquiryNotification } from '@/lib/mailer';
import {
  ATTACHMENT_LIMITS,
  validateAttachments,
  saveAttachmentsToDisk,
  generateAttachmentId,
} from '@/lib/uploadAttachments';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

function readPostFields(source, isFormData) {
  const get = (key) => {
    if (!isFormData) return source[key];
    const v = source.get(key);
    return v == null ? undefined : v;
  };
  const getBool = (key) => {
    const raw = get(key);
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'string') return raw === 'true' || raw === '1' || raw === 'on';
    return false;
  };
  return {
    boardId: get('boardId'),
    title: get('title'),
    content: get('content'),
    author: get('author'),
    authorEmail: get('authorEmail'),
    isNotice: getBool('isNotice'),
    isSecret: getBool('isSecret'),
    password: get('password'),
    company: get('company'),
    contactName: get('contactName'),
    contactPosition: get('contactPosition'),
    contactEmail: get('contactEmail'),
    contactPhone: get('contactPhone'),
  };
}

// POST /api/posts - 게시물 등록 (JSON 또는 multipart/form-data)
export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';
  const isMultipart = contentType.includes('multipart/form-data');

  let data;
  let files = [];
  let boardSlug = null;

  try {
    if (isMultipart) {
      const formData = await request.formData();
      data = readPostFields(formData, true);
      boardSlug = formData.get('boardSlug') || null;
      files = formData.getAll('files').filter(
        (f) => f && typeof f !== 'string' && typeof f.arrayBuffer === 'function'
      );
    } else {
      data = readPostFields(await request.json(), false);
    }
  } catch (err) {
    console.error('Post POST parse error:', err);
    return NextResponse.json(
      { error: '요청 형식이 올바르지 않습니다.' },
      { status: 400 }
    );
  }

  const validation = validateAttachments(files);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (!data.title || !data.content) {
    return NextResponse.json(
      { error: '제목, 내용은 필수 항목입니다.' },
      { status: 400 }
    );
  }

  if (data.password && !/^\d{4}$/.test(data.password)) {
    return NextResponse.json(
      { error: '비밀번호는 4자리 숫자여야 합니다.' },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const isAdmin = session && session.user.role === 'ADMIN';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  let boardId = data.boardId;
  let boardSlugForUpload = null;
  let cleanupSavedFiles = async () => {};

  try {
    if (!boardId && boardSlug) {
      const boardResult = await client.query(
        'SELECT id, slug FROM boards WHERE slug = $1 AND is_active = true',
        [boardSlug]
      );
      if (boardResult.rows.length === 0) {
        return NextResponse.json(
          { error: '게시판을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      boardId = boardResult.rows[0].id;
      boardSlugForUpload = boardResult.rows[0].slug;
    } else if (boardId && files.length > 0) {
      const boardResult = await client.query(
        'SELECT slug FROM boards WHERE id = $1',
        [boardId]
      );
      boardSlugForUpload = boardResult.rows[0]?.slug || 'misc';
    }

    if (!boardId) {
      return NextResponse.json(
        { error: '게시판 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 상담 게시판은 비즈니스 식별 필드를 모두 강제 (다른 게시판 영향 없음)
    if (boardSlugForUpload === 'consultation') {
      if (!data.company || !data.contactName || !data.contactPosition || !data.contactEmail || !data.contactPhone) {
        return NextResponse.json(
          { error: '업체명, 담당자, 직함, 이메일, 연락처는 필수 항목입니다.' },
          { status: 400 }
        );
      }
    }

    await client.query('BEGIN');

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const postResult = await client.query(
      `INSERT INTO posts (id, board_id, title, content, author, author_email, is_notice, is_secret, password, company, contact_name, contact_position, contact_email, contact_phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        postId,
        boardId,
        data.title,
        data.content,
        data.author || (isAdmin ? '관리자' : '익명'),
        data.authorEmail || (session?.user?.email || null),
        data.isNotice || false,
        data.isSecret || false,
        data.password || null,
        data.company || null,
        data.contactName || null,
        data.contactPosition || null,
        data.contactEmail || null,
        data.contactPhone || null,
      ]
    );

    let attachmentRows = [];
    if (files.length > 0) {
      const subDir = boardSlugForUpload || 'misc';
      const { saved, cleanup } = await saveAttachmentsToDisk(files, subDir);
      cleanupSavedFiles = cleanup;

      const insertValues = [];
      const insertParams = [];
      let paramIdx = 1;
      for (const f of saved) {
        const attId = generateAttachmentId();
        insertValues.push(
          `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
        );
        insertParams.push(
          attId,
          postId,
          f.filename,
          f.original_filename,
          f.file_path,
          f.file_size,
          f.mime_type
        );
      }

      const attResult = await client.query(
        `INSERT INTO post_attachments (id, post_id, filename, original_filename, file_path, file_size, mime_type)
         VALUES ${insertValues.join(', ')}
         RETURNING *`,
        insertParams
      );
      attachmentRows = attResult.rows;
    }

    await client.query('COMMIT');

    // 알림 이메일 발송 (consultation/catalog 만, fire-and-forget)
    if (boardSlugForUpload === 'consultation' || boardSlugForUpload === 'catalog') {
      try {
        const ci = await prisma.companyInfo.findFirst().catch(() => null);
        const recipients = [
          ci?.notificationEmail1,
          ci?.notificationEmail2,
          ci?.notificationEmail3,
        ].filter(Boolean);
        if (recipients.length > 0) {
          // 비동기 호출 — 응답 지연 방지 (await 안 함)
          sendInquiryNotification({
            post: postResult.rows[0],
            boardSlug: boardSlugForUpload,
            recipients,
            attachmentCount: attachmentRows.length,
            baseUrl: process.env.NEXTAUTH_URL,
          }).catch((err) => console.error('[mailer] dispatch failed', err));
        }
      } catch (mailErr) {
        // 메일 디스패치 자체가 실패해도 사용자 응답엔 영향 없음
        console.error('[mailer] dispatch error', mailErr);
      }
    }

    return NextResponse.json(
      {
        post: postResult.rows[0],
        attachments: attachmentRows,
      },
      { status: 201 }
    );
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('ROLLBACK failed:', rollbackErr);
    }
    await cleanupSavedFiles();
    console.error('Post Create Error:', error);
    return NextResponse.json(
      { error: '게시물 등록에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    client.release();
    await pool.end();
  }
}
