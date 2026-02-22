import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/settings - 회사 정보 조회
export async function GET() {
  try {
    let companyInfo = await prisma.companyInfo.findFirst();
    if (!companyInfo) {
      companyInfo = await prisma.companyInfo.create({ data: {} });
    }
    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: '설정을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/settings - 회사 정보 수정
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();
    let companyInfo = await prisma.companyInfo.findFirst();

    if (companyInfo) {
      companyInfo = await prisma.companyInfo.update({
        where: { id: companyInfo.id },
        data: {
          name: data.name,
          ceo: data.ceo,
          businessNumber: data.businessNumber,
          phone: data.phone,
          fax: data.fax,
          email: data.email,
          address: data.address,
          workingHours: data.workingHours,
          lunchTime: data.lunchTime,
          closedDays: data.closedDays,
        },
      });
    } else {
      companyInfo = await prisma.companyInfo.create({ data });
    }

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: '설정 저장에 실패했습니다.' }, { status: 500 });
  }
}
