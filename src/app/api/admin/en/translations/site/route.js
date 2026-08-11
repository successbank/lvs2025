import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { queryEn } from '@/lib/db-en';

// GET /api/admin/en/translations/site — 카테고리/메뉴/슬라이더/회사정보 KR원문+EN번역
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const [categories, menuItems, sliders, companyInfo] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true, slug: true, description: true, parentId: true }, orderBy: [{ parentId: 'asc' }, { order: 'asc' }] }),
      prisma.menuItem.findMany({ select: { id: true, label: true, url: true, parentId: true }, orderBy: [{ parentId: 'asc' }, { order: 'asc' }] }),
      prisma.slider.findMany({ select: { id: true, type: true, title: true, description: true }, orderBy: { order: 'asc' } }),
      prisma.companyInfo.findFirst(),
    ]);

    const [catTr, menuTr, sliderTr, companyTr] = await Promise.all([
      queryEn('SELECT * FROM category_translations'),
      queryEn('SELECT * FROM menu_item_translations'),
      queryEn('SELECT * FROM slider_translations'),
      queryEn('SELECT * FROM company_info_translation WHERE id = 1'),
    ]);

    const catMap = new Map(catTr.rows.map(r => [r.category_id, r]));
    const menuMap = new Map(menuTr.rows.map(r => [r.menu_item_id, r]));
    const sliderMap = new Map(sliderTr.rows.map(r => [r.slider_id, r]));

    return NextResponse.json({
      categories: categories.map(c => ({
        id: c.id, slug: c.slug, parentId: c.parentId,
        nameKo: c.name, descriptionKo: c.description,
        nameEn: catMap.get(c.id)?.name || '', descriptionEn: catMap.get(c.id)?.description || '',
      })),
      menuItems: menuItems.map(m => ({
        id: m.id, url: m.url, parentId: m.parentId,
        labelKo: m.label, labelEn: menuMap.get(m.id)?.label || '',
      })),
      sliders: sliders.map(s => ({
        id: s.id, type: s.type,
        titleKo: s.title, descriptionKo: s.description,
        titleEn: sliderMap.get(s.id)?.title || '', descriptionEn: sliderMap.get(s.id)?.description || '',
      })),
      companyInfo: {
        ko: companyInfo,
        en: companyTr.rows[0] || null,
      },
    });
  } catch (error) {
    console.error('EN site translations get error:', error);
    return NextResponse.json({ error: '번역을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// PUT — 섹션별 일괄 저장 { categories?, menuItems?, sliders?, companyInfo? }
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const data = await request.json();

    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        await queryEn(
          `INSERT INTO category_translations (category_id, name, description) VALUES ($1, $2, $3)
           ON CONFLICT (category_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
          [c.id, c.nameEn ?? null, c.descriptionEn ?? null]
        );
      }
    }

    if (Array.isArray(data.menuItems)) {
      for (const m of data.menuItems) {
        await queryEn(
          `INSERT INTO menu_item_translations (menu_item_id, label) VALUES ($1, $2)
           ON CONFLICT (menu_item_id) DO UPDATE SET label = EXCLUDED.label`,
          [m.id, m.labelEn ?? null]
        );
      }
    }

    if (Array.isArray(data.sliders)) {
      for (const s of data.sliders) {
        await queryEn(
          `INSERT INTO slider_translations (slider_id, title, description) VALUES ($1, $2, $3)
           ON CONFLICT (slider_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description`,
          [s.id, s.titleEn ?? null, s.descriptionEn ?? null]
        );
      }
    }

    if (data.companyInfo) {
      const ci = data.companyInfo;
      await queryEn(
        `INSERT INTO company_info_translation (id, name, ceo, address, working_hours, lunch_time, closed_days)
         VALUES (1, $1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, ceo = EXCLUDED.ceo, address = EXCLUDED.address,
           working_hours = EXCLUDED.working_hours, lunch_time = EXCLUDED.lunch_time, closed_days = EXCLUDED.closed_days`,
        [ci.name ?? null, ci.ceo ?? null, ci.address ?? null, ci.workingHours ?? null, ci.lunchTime ?? null, ci.closedDays ?? null]
      );
    }

    return NextResponse.json({ message: '번역이 저장되었습니다.' });
  } catch (error) {
    console.error('EN site translations save error:', error);
    return NextResponse.json({ error: '번역 저장에 실패했습니다.' }, { status: 500 });
  }
}
