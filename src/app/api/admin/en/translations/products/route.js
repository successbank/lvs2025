import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { safeQueryEn } from '@/lib/db-en';
import crypto from 'crypto';

const md5 = (s) => crypto.createHash('md5').update(s || '', 'utf8').digest('hex');

function computeSourceHash(p) {
  return md5([p.name, p.summary, p.description, p.origin, JSON.stringify(p.seriesData), JSON.stringify(p.productOptions)].join('|'));
}

// GET /api/admin/en/translations/products — 제품 번역 상태 목록
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      select: {
        id: true, modelName: true, name: true, summary: true, description: true,
        origin: true, seriesData: true, productOptions: true, isActive: true, order: true,
      },
      orderBy: { order: 'asc' },
    });

    const res = await safeQueryEn('SELECT product_id, name, status, source_hash, updated_at FROM product_translations');
    const trMap = new Map((res?.rows || []).map(r => [r.product_id, r]));

    const rows = products.map(p => {
      const tr = trMap.get(p.id);
      const currentHash = computeSourceHash(p);
      let trStatus = 'missing'; // 미번역
      if (tr) {
        trStatus = tr.source_hash && tr.source_hash !== currentHash ? 'stale' : tr.status; // stale=원본 변경됨
      }
      return {
        id: p.id,
        modelName: p.modelName,
        nameKo: p.name,
        nameEn: tr?.name || null,
        isActive: p.isActive,
        translationStatus: trStatus,
        updatedAt: tr?.updated_at || null,
      };
    });

    return NextResponse.json({ products: rows });
  } catch (error) {
    console.error('EN product translations list error:', error);
    return NextResponse.json({ error: '목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
