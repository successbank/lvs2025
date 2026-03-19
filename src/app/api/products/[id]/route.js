import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/products/[id] - 제품 상세 조회
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        specs: {
          orderBy: { order: 'asc' },
        },
        files: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product Detail Error:', error);
    return NextResponse.json(
      { error: '제품 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - 제품 수정 (관리자 전용)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        modelName: data.modelName,
        name: data.name,
        slug: data.slug,
        description: data.description,
        summary: data.summary,
        categoryId: data.categoryId,
        manufacturer: data.manufacturer,
        origin: data.origin,
        colorOptions: data.colorOptions,
        voltageOptions: data.voltageOptions,
        isNew: data.isNew,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        order: data.order,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product Update Error:', error);
    return NextResponse.json(
      { error: '제품 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - 제품 삭제 (관리자 전용)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: '제품이 삭제되었습니다.' });
  } catch (error) {
    console.error('Product Delete Error:', error);
    return NextResponse.json(
      { error: '제품 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
