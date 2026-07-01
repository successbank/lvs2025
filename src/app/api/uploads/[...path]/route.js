import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/uploads/[...path]
// next.config.js 의 beforeFiles rewrite 를 통해 `/uploads/*` 요청을 이 핸들러가 처리한다.
//
// 배경: Next.js standalone 은 서버 부팅 시점의 public/ 파일 목록만 정적 서빙하므로,
// 런타임에 업로드된 파일(sliders/popups/categories/certifications 등)은 재배포 전까지
// 404 가 발생한다. 이 라우트는 업로드 볼륨(/app/public/uploads)에서 직접 스트리밍하여
// 재배포 없이 즉시 서빙되도록 한다.

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');

const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const segments = params.path || [];

    // 경로 조립 후 정규화하여 uploads 루트 밖으로 벗어나는지 검증 (path traversal 방지)
    const filePath = path.normalize(path.join(UPLOADS_ROOT, ...segments));
    if (filePath !== UPLOADS_ROOT && !filePath.startsWith(UPLOADS_ROOT + path.sep)) {
      return NextResponse.json({ error: '잘못된 경로입니다.' }, { status: 400 });
    }

    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (!stat.isFile()) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        // 업로드 파일명은 timestamp+random 으로 유일하므로 장기 캐시 안전
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Uploads serve error:', error);
    return NextResponse.json({ error: '파일 서빙에 실패했습니다.' }, { status: 500 });
  }
}
