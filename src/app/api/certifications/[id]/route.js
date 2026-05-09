import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// GET /api/certifications/[id]
export async function GET(request, { params }) {
  try {
    const cert = await prisma.certification.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!cert) {
      return NextResponse.json({ error: '인증서를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(cert);
  } catch (error) {
    console.error('Certification GET Error:', error);
    return NextResponse.json({ error: '인증서 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/certifications/[id] (admin)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.certification.update({
      where: { id: params.id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Certification PUT Error:', error);
    return NextResponse.json({ error: '인증서 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/certifications/[id] (admin)
// 신규 업로드 이미지(/uploads/certifications/...)만 정리 — 기존 32개 원본 보존
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const cert = await prisma.certification.findUnique({ where: { id: params.id } });
    if (!cert) {
      return NextResponse.json({ error: '인증서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 신규 업로드 파일만 삭제 (image가 'cert-' prefix이고 .webp 등 신규 패턴인 경우)
    if (cert.image && cert.image.startsWith('cert-')) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'images', 'certifications', cert.image);
        await unlink(filePath);
      } catch (fileError) {
        console.warn('인증서 이미지 파일 삭제 실패 (무시):', fileError.message);
      }
    }

    await prisma.certification.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '인증서가 삭제되었습니다.' });
  } catch (error) {
    console.error('Certification DELETE Error:', error);
    return NextResponse.json({ error: '인증서 삭제에 실패했습니다.' }, { status: 500 });
  }
}
