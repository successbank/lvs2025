import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { parseUserAgent, isBot, anonymizeIp } from '@/lib/deviceDetect';

function generateSessionId() {
  return crypto.randomUUID();
}

export async function POST(request) {
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';

    if (isBot(userAgent)) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await request.json();
    const { path, referrer, productSlug } = body;

    if (!path || path.startsWith('/admin')) {
      return new NextResponse(null, { status: 204 });
    }

    // 세션 ID 관리 (쿠키 기반)
    const cookieStore = cookies();
    let sessionId = cookieStore.get('lvs_sid')?.value;
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // UA 파싱
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // IP 익명화
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const rawIp = forwarded?.split(',')[0]?.trim() || realIp || '';
    const ip = anonymizeIp(rawIp);

    // PageView 기록
    await prisma.pageView.create({
      data: {
        path,
        sessionId,
        userAgent: userAgent.substring(0, 500),
        deviceType,
        browser,
        os,
        referrer: referrer?.substring(0, 500) || null,
        ip,
      },
    });

    // 제품 상세 페이지인 경우 ProductViewLog 기록
    if (productSlug) {
      const product = await prisma.product.findUnique({
        where: { slug: productSlug },
        select: { id: true },
      });

      if (product) {
        await prisma.productViewLog.create({
          data: {
            productId: product.id,
            sessionId,
            deviceType,
          },
        });
      }
    }

    // 세션 쿠키 설정 (30분 롤링)
    const response = new NextResponse(null, { status: 204 });
    response.cookies.set('lvs_sid', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30분
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Tracking error:', error);
    return new NextResponse(null, { status: 204 });
  }
}
