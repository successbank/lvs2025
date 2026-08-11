import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { compressToTarget, HIGH_QUALITY_STEPS, TARGET_BYTES } from '@/lib/imageResize';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB (업로드 후 자동 최적화)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'certifications');
const MAX_DIMENSION = 1200;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '허용되지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '파일 크기는 15MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const random = Math.random().toString(36).substring(2, 8);
    const buffer = Buffer.from(await file.arrayBuffer());

    // 최대 1200px 비율 유지 + WebP 변환 (인증서 가독성 위해 q90부터 시작)
    const optimized = await compressToTarget(buffer, {
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
      qualitySteps: HIGH_QUALITY_STEPS,
    });

    const filename = `cert-${Date.now()}-${random}.webp`;
    await writeFile(path.join(UPLOAD_DIR, filename), optimized.buffer);

    return NextResponse.json({
      filename,
      url: `/images/certifications/${filename}`,
      originalBytes: buffer.length,
      bytes: optimized.bytes,
      width: optimized.width,
      height: optimized.height,
      optimized: true,
      targetBytes: TARGET_BYTES,
    });
  } catch (error) {
    console.error('Certification Upload Error:', error);
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
  }
}
