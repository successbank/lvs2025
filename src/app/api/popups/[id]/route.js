import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// PUT /api/popups/[id] — 전체 업데이트
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const popup = await prisma.layerPopup.update({
      where: { id: params.id },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl,
        link: data.link,
        linkTarget: data.linkTarget,
        position: data.position,
        width: parseInt(data.width) || 500,
        height: parseInt(data.height) || 500,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        order: data.order,
        templateId: data.templateId || null,
        templateData: data.templateData || null,
      },
    });

    return NextResponse.json(popup);
  } catch (error) {
    console.error('Popup Update Error:', error);
    return NextResponse.json({ error: '팝업 수정에 실패했습니다.' }, { status: 500 });
  }
}

// PATCH /api/popups/[id] — isActive 토글
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.order !== undefined) updateData.order = data.order;

    const popup = await prisma.layerPopup.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(popup);
  } catch (error) {
    console.error('Popup Patch Error:', error);
    return NextResponse.json({ error: '팝업 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/popups/[id] — 삭제 + 업로드 이미지 파일 정리
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const popup = await prisma.layerPopup.findUnique({ where: { id: params.id } });
    if (!popup) {
      return NextResponse.json({ error: '팝업을 찾을 수 없습니다.' }, { status: 404 });
    }

    const filesToDelete = [popup.imageUrl, popup.mobileImageUrl].filter(
      url => url && url.startsWith('/uploads/popups/')
    );
    for (const url of filesToDelete) {
      try {
        await unlink(path.join(process.cwd(), 'public', url));
      } catch (fileError) {
        console.warn('이미지 파일 삭제 실패 (무시):', fileError.message);
      }
    }

    await prisma.layerPopup.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '팝업이 삭제되었습니다.' });
  } catch (error) {
    console.error('Popup Delete Error:', error);
    return NextResponse.json({ error: '팝업 삭제에 실패했습니다.' }, { status: 500 });
  }
}
