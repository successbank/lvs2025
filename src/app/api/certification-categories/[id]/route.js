import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/certification-categories/[id]
export async function GET(request, { params }) {
  try {
    const category = await prisma.certificationCategory.findUnique({
      where: { id: params.id },
      include: { _count: { select: { certifications: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('CertificationCategory GET Error:', error);
    return NextResponse.json({ error: '카테고리 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/certification-categories/[id] (admin)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};
    if (data.key !== undefined) updateData.key = data.key;
    if (data.label !== undefined) updateData.label = data.label;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (updateData.key) {
      const dup = await prisma.certificationCategory.findFirst({
        where: { key: updateData.key, NOT: { id: params.id } },
      });
      if (dup) {
        return NextResponse.json({ error: '이미 존재하는 key입니다.' }, { status: 400 });
      }
    }

    const updated = await prisma.certificationCategory.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('CertificationCategory PUT Error:', error);
    return NextResponse.json({ error: '카테고리 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/certification-categories/[id] (admin)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const category = await prisma.certificationCategory.findUnique({
      where: { id: params.id },
      include: { _count: { select: { certifications: true } } },
    });
    if (!category) {
      return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (category._count.certifications > 0) {
      return NextResponse.json(
        { error: `이 카테고리에 인증서 ${category._count.certifications}건이 있어 삭제할 수 없습니다.` },
        { status: 400 }
      );
    }

    await prisma.certificationCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '카테고리가 삭제되었습니다.' });
  } catch (error) {
    console.error('CertificationCategory DELETE Error:', error);
    return NextResponse.json({ error: '카테고리 삭제에 실패했습니다.' }, { status: 500 });
  }
}
