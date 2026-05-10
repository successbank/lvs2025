import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/dealers — 대리점 목록 (공개)
// 필터: ?type=DOMESTIC|INTERNATIONAL&isActive=&includeAll=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeAll = searchParams.get('includeAll') === 'true';

    const where = includeAll ? {} : { isActive: true };
    if (type === 'DOMESTIC' || type === 'INTERNATIONAL') {
      where.type = type;
    }

    const dealers = await prisma.dealer.findMany({
      where,
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json({ dealers });
  } catch (error) {
    console.error('Dealers GET Error:', error);
    return NextResponse.json(
      { error: '대리점 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/dealers — 생성 (admin)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.type || !data.name) {
      return NextResponse.json(
        { error: 'type, name은 필수입니다.' },
        { status: 400 }
      );
    }
    if (data.type !== 'DOMESTIC' && data.type !== 'INTERNATIONAL') {
      return NextResponse.json({ error: 'type은 DOMESTIC 또는 INTERNATIONAL.' }, { status: 400 });
    }

    // order 자동: 같은 type 내 max + 1
    let nextOrder = data.order;
    if (nextOrder === undefined || nextOrder === null) {
      const max = await prisma.dealer.aggregate({
        where: { type: data.type },
        _max: { order: true },
      });
      nextOrder = (max._max.order ?? 0) + 1;
    }

    const created = await prisma.dealer.create({
      data: {
        type: data.type,
        name: data.name,
        address: data.address || null,
        tel: data.tel || null,
        fax: data.fax || null,
        email: data.email || null,
        website: data.website || null,
        country: data.country || null,
        flag: data.flag || null,
        image: data.image || null,
        order: nextOrder,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Dealer Create Error:', error);
    return NextResponse.json({ error: '대리점 생성에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/dealers — 같은 type 내 순서 일괄 변경 (admin)
// body: { type: 'DOMESTIC'|'INTERNATIONAL', orderedIds: string[] }
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { type, orderedIds } = await request.json();

    if (type !== 'DOMESTIC' && type !== 'INTERNATIONAL') {
      return NextResponse.json({ error: 'type은 DOMESTIC 또는 INTERNATIONAL.' }, { status: 400 });
    }
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: '올바른 형식이 아닙니다.' }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.dealer.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ message: '순서가 저장되었습니다.' });
  } catch (error) {
    console.error('Dealer Order Update Error:', error);
    return NextResponse.json({ error: '순서 저장에 실패했습니다.' }, { status: 500 });
  }
}
