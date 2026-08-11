import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { queryEn } from '@/lib/db-en';
import crypto from 'crypto';

const md5 = (s) => crypto.createHash('md5').update(s || '', 'utf8').digest('hex');
const computeSourceHash = (p) =>
  md5([p.name, p.summary, p.description, p.origin, JSON.stringify(p.seriesData), JSON.stringify(p.productOptions)].join('|'));

// GET — KR 원문 + EN 번역 함께 반환 (좌우 편집 폼용)
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { specs: { orderBy: { order: 'asc' } } },
    });
    if (!product) {
      return NextResponse.json({ error: '제품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const [trRes, specTrRes] = await Promise.all([
      queryEn('SELECT * FROM product_translations WHERE product_id = $1', [params.id]),
      queryEn('SELECT * FROM product_spec_translations WHERE product_id = $1', [params.id]),
    ]);
    const tr = trRes.rows[0] || null;
    const specTrMap = new Map(specTrRes.rows.map(r => [r.spec_id, r]));

    return NextResponse.json({
      source: product,
      translation: tr,
      specTranslations: product.specs.map(spec => ({
        specId: spec.id,
        labelKo: spec.label,
        valueKo: spec.value,
        labelEn: specTrMap.get(spec.id)?.label || '',
        valueEn: specTrMap.get(spec.id)?.value || '',
      })),
      sourceHash: computeSourceHash(product),
      stale: Boolean(tr?.source_hash && tr.source_hash !== computeSourceHash(product)),
    });
  } catch (error) {
    console.error('EN product translation get error:', error);
    return NextResponse.json({ error: '번역을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// PUT — 번역 저장 (본문 + 스펙 일괄, status='reviewed')
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: '제품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const data = await request.json();
    const sourceHash = computeSourceHash(product);

    await queryEn(
      `INSERT INTO product_translations (product_id, name, summary, description, origin, series_data, product_options, status, source_hash, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'reviewed', $8, CURRENT_TIMESTAMP)
       ON CONFLICT (product_id) DO UPDATE SET
         name = EXCLUDED.name, summary = EXCLUDED.summary, description = EXCLUDED.description,
         origin = EXCLUDED.origin, series_data = EXCLUDED.series_data, product_options = EXCLUDED.product_options,
         status = 'reviewed', source_hash = EXCLUDED.source_hash, updated_at = CURRENT_TIMESTAMP`,
      [
        params.id,
        data.name ?? null,
        data.summary ?? null,
        data.description ?? null,
        data.origin ?? null,
        data.seriesData ? JSON.stringify(data.seriesData) : null,
        data.productOptions ? JSON.stringify(data.productOptions) : null,
        sourceHash,
      ]
    );

    if (Array.isArray(data.specs)) {
      for (const spec of data.specs) {
        if (!spec.specId) continue;
        await queryEn(
          `INSERT INTO product_spec_translations (spec_id, product_id, label, value)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (spec_id) DO UPDATE SET label = EXCLUDED.label, value = EXCLUDED.value`,
          [spec.specId, params.id, spec.labelEn ?? null, spec.valueEn ?? null]
        );
      }
    }

    return NextResponse.json({ message: '번역이 저장되었습니다.' });
  } catch (error) {
    console.error('EN product translation save error:', error);
    return NextResponse.json({ error: '번역 저장에 실패했습니다.' }, { status: 500 });
  }
}
