import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// GET /api/categories/[id] — 단일 카테고리 조회
export async function GET(request, { params }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        children: { orderBy: { order: 'asc' } },
        parent: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Category GET Error:', error);
    return NextResponse.json({ error: '카테고리 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/categories/[id] — 카테고리 수정
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.iconUrl !== undefined) updateData.iconUrl = data.iconUrl;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.parentId !== undefined) updateData.parentId = data.parentId || null;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
      include: {
        children: { orderBy: { order: 'asc' } },
        parent: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Category PUT Error:', error);
    return NextResponse.json({ error: '카테고리 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/categories/[id] — 카테고리 삭제 + 아이콘 파일 정리
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) {
      return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 아이콘 파일 삭제
    if (category.iconUrl && category.iconUrl.startsWith('/uploads/categories/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', category.iconUrl);
        await unlink(filePath);
      } catch (fileError) {
        console.warn('아이콘 파일 삭제 실패 (무시):', fileError.message);
      }
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '카테고리가 삭제되었습니다.' });
  } catch (error) {
    console.error('Category DELETE Error:', error);
    return NextResponse.json({ error: '카테고리 삭제에 실패했습니다.' }, { status: 500 });
  }
}
