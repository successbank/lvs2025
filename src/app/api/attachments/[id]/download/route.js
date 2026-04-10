import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// GET /api/attachments/[id]/download - 첨부파일 다운로드
export async function GET(request, { params }) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const { id } = params;

    // 첨부파일 정보 조회
    const result = await pool.query(
      'SELECT * FROM post_attachments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '첨부파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const attachment = result.rows[0];

    // 다운로드 카운트 증가
    await pool.query(
      'UPDATE post_attachments SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );

    // 실제 파일 경로 (Docker 컨테이너 내부 경로)
    const filePath = path.join('/app', attachment.file_path);

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      // 파일이 없는 경우 - 준비 중 메시지 반환
      return NextResponse.json(
        {
          error: '파일 준비 중',
          message: '해당 파일은 현재 준비 중입니다. 곧 다운로드 가능합니다.',
          attachment: {
            id: attachment.id,
            filename: attachment.original_filename,
            size: attachment.file_size,
            mime_type: attachment.mime_type,
          },
        },
        { status: 503 } // Service Unavailable
      );
    }

    // 파일 읽기
    const fileBuffer = fs.readFileSync(filePath);

    // Content-Disposition: RFC 5987 filename*= 문법으로 한글 파일명 복원 지원
    const encodedFilename = encodeURIComponent(attachment.original_filename);

    // 파일 다운로드 응답
    // NOTE: Content-Length는 DB의 file_size가 아닌 실제 버퍼 길이로 계산.
    // DB 값은 마이그레이션 시 하드코딩된 경우가 있어 실제 파일과 불일치 시
    // HTTP/2 스트림이 INTERNAL_ERROR로 끊긴다.
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': attachment.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Attachment Download API Error:', error);
    return NextResponse.json(
      { error: '파일 다운로드에 실패했습니다.', details: error.message },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
