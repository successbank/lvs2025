import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 빈 문자열은 null 로, 그 외에는 형식 검증. 잘못된 형식이면 { error, field } 반환.
function normalizeNotificationEmail(value, field) {
  if (value == null) return { value: null };
  const trimmed = String(value).trim();
  if (trimmed === '') return { value: null };
  if (!EMAIL_RE.test(trimmed)) {
    return { error: { code: 'invalid_email', field } };
  }
  return { value: trimmed };
}

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

    // 알림 이메일 3개 검증 (빈 값 허용, 비어있지 않으면 형식 검증)
    const n1 = normalizeNotificationEmail(data.notificationEmail1, 'notificationEmail1');
    const n2 = normalizeNotificationEmail(data.notificationEmail2, 'notificationEmail2');
    const n3 = normalizeNotificationEmail(data.notificationEmail3, 'notificationEmail3');
    for (const r of [n1, n2, n3]) {
      if (r.error) {
        return NextResponse.json(
          { error: '이메일 형식이 올바르지 않습니다.', field: r.error.field },
          { status: 400 }
        );
      }
    }

    let companyInfo = await prisma.companyInfo.findFirst();

    const updateData = {
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
      notificationEmail1: n1.value,
      notificationEmail2: n2.value,
      notificationEmail3: n3.value,
    };

    if (companyInfo) {
      companyInfo = await prisma.companyInfo.update({
        where: { id: companyInfo.id },
        data: updateData,
      });
    } else {
      companyInfo = await prisma.companyInfo.create({ data: updateData });
    }

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: '설정 저장에 실패했습니다.' }, { status: 500 });
  }
}
