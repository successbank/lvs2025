import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/inquiries - 문의 목록 (관리자 전용)
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
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Inquiries API Error:', error);
    return NextResponse.json({ error: '문의 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// POST /api/inquiries - 문의 등록 (공개)
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.title || !data.content) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        title: data.title,
        content: data.content,
      },
    });

    return NextResponse.json({ message: '문의가 등록되었습니다.', id: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error('Inquiry Create Error:', error);
    return NextResponse.json({ error: '문의 등록에 실패했습니다.' }, { status: 500 });
  }
}
