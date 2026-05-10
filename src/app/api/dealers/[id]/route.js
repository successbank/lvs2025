import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// GET /api/dealers/[id]
export async function GET(request, { params }) {
  try {
    const dealer = await prisma.dealer.findUnique({ where: { id: params.id } });
    if (!dealer) {
      return NextResponse.json({ error: '대리점을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(dealer);
  } catch (error) {
    console.error('Dealer GET Error:', error);
    return NextResponse.json({ error: '대리점 조회에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/dealers/[id] (admin)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    const updateData = {};
    if (data.type !== undefined) {
      if (data.type !== 'DOMESTIC' && data.type !== 'INTERNATIONAL') {
        return NextResponse.json({ error: 'type은 DOMESTIC 또는 INTERNATIONAL.' }, { status: 400 });
      }
      updateData.type = data.type;
    }
    if (data.name !== undefined)     updateData.name = data.name;
    if (data.address !== undefined)  updateData.address = data.address || null;
    if (data.tel !== undefined)      updateData.tel = data.tel || null;
    if (data.fax !== undefined)      updateData.fax = data.fax || null;
    if (data.email !== undefined)    updateData.email = data.email || null;
    if (data.website !== undefined)  updateData.website = data.website || null;
    if (data.country !== undefined)  updateData.country = data.country || null;
    if (data.flag !== undefined)     updateData.flag = data.flag || null;
    if (data.image !== undefined)    updateData.image = data.image || null;
    if (data.order !== undefined)    updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.dealer.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Dealer PUT Error:', error);
    return NextResponse.json({ error: '대리점 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/dealers/[id] (admin)
// 신규 업로드 이미지(`dealer-...webp`)만 정리. 기존 시드 이미지(`branchN.jpg` 등)는 보존.
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const dealer = await prisma.dealer.findUnique({ where: { id: params.id } });
    if (!dealer) {
      return NextResponse.json({ error: '대리점을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (dealer.image && dealer.image.startsWith('dealer-')) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'images', 'dealers', dealer.image);
        await unlink(filePath);
      } catch (fileError) {
        console.warn('대리점 이미지 파일 삭제 실패 (무시):', fileError.message);
      }
    }

    await prisma.dealer.delete({ where: { id: params.id } });
    return NextResponse.json({ message: '대리점이 삭제되었습니다.' });
  } catch (error) {
    console.error('Dealer DELETE Error:', error);
    return NextResponse.json({ error: '대리점 삭제에 실패했습니다.' }, { status: 500 });
  }
}
