import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// POST /api/catalog-requests - 카탈로그 신청
export async function POST(request) {
  try {
    const data = await request.json();

    // 필수 필드 검증
    if (!data.name || !data.phone || !data.address) {
      return NextResponse.json(
        { error: '이름, 연락처, 주소는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const catalogRequest = await prisma.catalogRequest.create({
      data: {
        name: data.name,
        email: data.email || '',
        phone: data.phone,
        company: data.company || null,
        address: data.address,
        message: data.message || null,
      },
    });

    return NextResponse.json(
      { message: '카탈로그 신청이 완료되었습니다.', id: catalogRequest.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Catalog Request Error:', error);
    return NextResponse.json(
      { error: '카탈로그 신청에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

// GET /api/catalog-requests - 카탈로그 신청 목록 (관리자 전용)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.catalogRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.catalogRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Catalog Request List Error:', error);
    return NextResponse.json(
      { error: '카탈로그 신청 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
