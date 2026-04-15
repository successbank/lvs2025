import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { detectSuspicion } from '@/lib/suspicious';

export async function POST(request) {
  try {
    const { name, email, password, phone, company } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 });
    }

    const flags = detectSuspicion({ name, email, phone, company });
    const isSuspicious = flags.length > 0;

    const hashedPassword = await hash(password, 12);

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;
    const userAgent = request.headers.get('user-agent') || null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        status: isSuspicious ? 'SUSPENDED' : 'ACTIVE',
        phone: phone || null,
        company: company || null,
        signupIp: ip,
        signupUserAgent: userAgent,
        suspicionFlags: flags,
        suspendedAt: isSuspicious ? new Date() : null,
        suspendedReason: isSuspicious ? `자동 탐지: ${flags.join(', ')}` : null,
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    if (isSuspicious) {
      await prisma.userAuditLog.create({
        data: {
          userId: user.id,
          adminId: null,
          action: 'AUTO_SUSPEND_ON_SIGNUP',
          previousStatus: null,
          newStatus: 'SUSPENDED',
          reason: `자동 탐지: ${flags.join(', ')}`,
          metadata: { flags, ip, userAgent },
        },
      });

      return NextResponse.json(
        { error: '가입이 보류되었습니다. 관리자 확인 후 이용이 가능합니다.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: '회원가입이 완료되었습니다.', user }, { status: 201 });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ error: '회원가입에 실패했습니다.' }, { status: 500 });
  }
}
