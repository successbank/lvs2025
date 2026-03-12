import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'categories');

// POST /api/categories/[id]/generate-icon — 첫 번째 제품 썸네일에서 아이콘 자동 생성
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { children: true },
    });

    if (!category) {
      return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 해당 카테고리 + 하위 카테고리의 제품 중 메인 이미지가 있는 첫 번째 제품 조회
    const categoryIds = [category.id, ...category.children.map(c => c.id)];

    const product = await prisma.product.findFirst({
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
        images: { some: { isMain: true } },
      },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
      orderBy: { order: 'asc' },
    });

    if (!product || product.images.length === 0) {
      return NextResponse.json(
        { error: '해당 카테고리에 이미지가 있는 제품이 없습니다.' },
        { status: 404 }
      );
    }

    const imageUrl = product.images[0].url;

    // 이미지 파일 읽기 (public/ 디렉토리 기준)
    const imagePath = path.join(process.cwd(), 'public', imageUrl);
    let imageBuffer;
    try {
      imageBuffer = await readFile(imagePath);
    } catch {
      return NextResponse.json(
        { error: `제품 이미지 파일을 찾을 수 없습니다: ${imageUrl}` },
        { status: 404 }
      );
    }

    // sharp로 200x200 WebP 리사이징
    await mkdir(UPLOAD_DIR, { recursive: true });

    const random = Math.random().toString(36).substring(2, 8);
    const filename = `cat-${Date.now()}-${random}.webp`;

    const resized = await sharp(imageBuffer)
      .resize(200, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toBuffer();

    await writeFile(path.join(UPLOAD_DIR, filename), resized);

    // DB 업데이트
    const iconUrl = `/uploads/categories/${filename}`;
    const updated = await prisma.category.update({
      where: { id: params.id },
      data: { iconUrl },
      include: {
        children: { orderBy: { order: 'asc' } },
        parent: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Generate Icon Error:', error);
    return NextResponse.json({ error: '아이콘 자동 생성에 실패했습니다.' }, { status: 500 });
  }
}
