import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'sliders');

// 통이미지 최대 크기
const FULL_IMAGE_MAX_WIDTH = 1920;
const FULL_IMAGE_MAX_HEIGHT = 600;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    const type = formData.get('type') || 'TEXT_IMAGE';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '허용되지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const random = Math.random().toString(36).substring(2, 8);
    const buffer = Buffer.from(await file.arrayBuffer());

    let outputBuffer;
    let filename;

    if (type === 'FULL_IMAGE') {
      // 통이미지: 1920×600 이내로 리사이징 + WebP 변환
      const metadata = await sharp(buffer).metadata();
      const needsResize =
        metadata.width > FULL_IMAGE_MAX_WIDTH ||
        metadata.height > FULL_IMAGE_MAX_HEIGHT;

      let pipeline = sharp(buffer);
      if (needsResize) {
        pipeline = pipeline.resize(FULL_IMAGE_MAX_WIDTH, FULL_IMAGE_MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
      outputBuffer = await pipeline.webp({ quality: 85 }).toBuffer();
      filename = `slider-full-${Date.now()}-${random}.webp`;
    } else {
      // 기존 텍스트+이미지: 원본 그대로 저장
      const ext = file.name.split('.').pop().toLowerCase();
      outputBuffer = buffer;
      filename = `slider-${Date.now()}-${random}.${ext}`;
    }

    await writeFile(path.join(UPLOAD_DIR, filename), outputBuffer);

    return NextResponse.json({ url: `/uploads/sliders/${filename}` });
  } catch (error) {
    console.error('Slider Upload Error:', error);
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
  }
}
