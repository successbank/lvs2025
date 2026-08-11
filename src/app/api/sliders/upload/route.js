import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { compressToTarget, needsOptimization, TARGET_BYTES } from '@/lib/imageResize';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB (업로드 후 자동 최적화)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'sliders');

// 통이미지 크기 — PC/모바일
const FULL_IMAGE_PC_WIDTH = 1920;
const FULL_IMAGE_PC_HEIGHT = 306;
const FULL_IMAGE_MOBILE_WIDTH = 768;
const FULL_IMAGE_MOBILE_HEIGHT = 306;

// 텍스트+이미지 배너의 가로폭 상한 (비율 유지, 확대 없음)
const TEXT_IMAGE_MAX_WIDTH = 1920;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    const type = formData.get('type') || 'TEXT_IMAGE';
    const device = formData.get('device') || 'pc'; // 'pc' | 'mobile'

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '허용되지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '파일 크기는 15MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const random = Math.random().toString(36).substring(2, 8);
    const buffer = Buffer.from(await file.arrayBuffer());

    let outputBuffer;
    let filename;
    let optimized = null;

    if (type === 'FULL_IMAGE') {
      const w = device === 'mobile' ? FULL_IMAGE_MOBILE_WIDTH : FULL_IMAGE_PC_WIDTH;
      const h = device === 'mobile' ? FULL_IMAGE_MOBILE_HEIGHT : FULL_IMAGE_PC_HEIGHT;
      const prefix = device === 'mobile' ? 'slider-mobile' : 'slider-full';

      optimized = await compressToTarget(buffer, {
        width: w,
        height: h,
        fit: 'cover',
        position: 'center',
      });
      outputBuffer = optimized.buffer;
      filename = `${prefix}-${Date.now()}-${random}.webp`;
    } else {
      // 텍스트+이미지: 목표 용량/가로폭을 넘을 때만 WebP로 재인코딩
      const shouldOptimize = await needsOptimization(buffer, { maxWidth: TEXT_IMAGE_MAX_WIDTH });

      if (shouldOptimize) {
        optimized = await compressToTarget(buffer, { maxWidth: TEXT_IMAGE_MAX_WIDTH });
        outputBuffer = optimized.buffer;
        filename = `slider-${Date.now()}-${random}.webp`;
      } else {
        // 이미 충분히 작으면 원본 그대로 저장 (로고/도형 이미지의 재인코딩 손실 방지)
        const ext = file.name.split('.').pop().toLowerCase();
        outputBuffer = buffer;
        filename = `slider-${Date.now()}-${random}.${ext}`;
      }
    }

    await writeFile(path.join(UPLOAD_DIR, filename), outputBuffer);

    return NextResponse.json({
      url: `/uploads/sliders/${filename}`,
      originalBytes: buffer.length,
      bytes: outputBuffer.length,
      width: optimized?.width ?? null,
      height: optimized?.height ?? null,
      optimized: Boolean(optimized),
      targetBytes: TARGET_BYTES,
    });
  } catch (error) {
    console.error('Slider Upload Error:', error);
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
  }
}
