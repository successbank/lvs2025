import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/wishlist/check?productId=xxx
//   비로그인: { authenticated: false, registered: false }
//   로그인:   { authenticated: true,  registered: boolean }
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'productId가 필요합니다.' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ authenticated: false, registered: false });
    }

    const item = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
      select: { id: true },
    });

    return NextResponse.json({ authenticated: true, registered: !!item });
  } catch (error) {
    console.error('Wishlist check Error:', error);
    return NextResponse.json({ error: '확인에 실패했습니다.' }, { status: 500 });
  }
}
