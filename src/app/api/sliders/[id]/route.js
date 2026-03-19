import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// PUT /api/sliders/[id] — 전체 업데이트
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const slider = await prisma.slider.update({
      where: { id: params.id },
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl,
        link: data.link,
        isActive: data.isActive,
        order: data.order,
      },
    });

    return NextResponse.json(slider);
  } catch (error) {
    console.error('Slider Update Error:', error);
    return NextResponse.json({ error: '슬라이더 수정에 실패했습니다.' }, { status: 500 });
  }
}

// PATCH /api/sliders/[id] — 부분 업데이트 (isActive 토글 등)
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

    const slider = await prisma.slider.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(slider);
  } catch (error) {
    console.error('Slider Patch Error:', error);
    return NextResponse.json({ error: '슬라이더 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/sliders/[id] — 삭제 + 업로드 이미지 파일 정리
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const slider = await prisma.slider.findUnique({ where: { id: params.id } });
    if (!slider) {
      return NextResponse.json({ error: '슬라이더를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 업로드된 이미지 파일 삭제 (외부 URL은 건너뜀)
    const filesToDelete = [slider.imageUrl, slider.mobileImageUrl].filter(
      url => url && url.startsWith('/uploads/sliders/')
    );
    for (const url of filesToDelete) {
      try {
        await unlink(path.join(process.cwd(), 'public', url));
      } catch (fileError) {
        console.warn('이미지 파일 삭제 실패 (무시):', fileError.message);
      }
    }

    await prisma.slider.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '슬라이더가 삭제되었습니다.' });
  } catch (error) {
    console.error('Slider Delete Error:', error);
    return NextResponse.json({ error: '슬라이더 삭제에 실패했습니다.' }, { status: 500 });
  }
}
