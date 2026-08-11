import { safeQueryEn } from './db-en';

// 영문 번역 머지 헬퍼 — lvs_db_en의 번역 테이블을 원본(lvs_db) 레코드에 덮어쓴다.
// EN DB 미설정/미번역 항목은 KR 원본 그대로 반환 (폴백).

/** 카테고리 배열(children 포함 트리 허용)에 name/description 번역 적용 */
export async function translateCategories(categories) {
  if (!categories?.length) return categories;
  const res = await safeQueryEn('SELECT category_id, name, description FROM category_translations');
  if (!res?.rows?.length) return categories;
  const map = new Map(res.rows.map(r => [r.category_id, r]));
  const apply = (cat) => {
    const tr = map.get(cat.id);
    return {
      ...cat,
      name: tr?.name || cat.name,
      description: tr?.description ?? cat.description,
      children: cat.children ? cat.children.map(apply) : cat.children,
    };
  };
  return categories.map(apply);
}

/** 슬라이더 배열에 title/description 번역 적용 */
export async function translateSliders(sliders) {
  if (!sliders?.length) return sliders;
  const res = await safeQueryEn('SELECT slider_id, title, description FROM slider_translations');
  if (!res?.rows?.length) return sliders;
  const map = new Map(res.rows.map(r => [r.slider_id, r]));
  return sliders.map(s => {
    const tr = map.get(s.id);
    return { ...s, title: tr?.title || s.title, description: tr?.description ?? s.description };
  });
}

/** 메뉴 트리에 label 번역 적용 */
export async function translateMenuItems(menuItems) {
  if (!menuItems?.length) return menuItems;
  const res = await safeQueryEn('SELECT menu_item_id, label FROM menu_item_translations');
  if (!res?.rows?.length) return menuItems;
  const map = new Map(res.rows.map(r => [r.menu_item_id, r.label]));
  const apply = (item) => ({
    ...item,
    label: map.get(item.id) || item.label,
    children: item.children ? item.children.map(apply) : item.children,
  });
  return menuItems.map(apply);
}

/** 제품 배열에 name/summary/description/origin (+스펙) 번역 적용 */
export async function translateProducts(products, { includeSpecs = false } = {}) {
  if (!products?.length) return products;
  const ids = products.map(p => p.id);
  const res = await safeQueryEn(
    'SELECT product_id, name, summary, description, origin, series_data, product_options FROM product_translations WHERE product_id = ANY($1)',
    [ids]
  );
  const trMap = new Map((res?.rows || []).map(r => [r.product_id, r]));

  let specMap = new Map();
  if (includeSpecs) {
    const specRes = await safeQueryEn(
      'SELECT spec_id, label, value FROM product_spec_translations WHERE product_id = ANY($1)',
      [ids]
    );
    specMap = new Map((specRes?.rows || []).map(r => [r.spec_id, r]));
  }

  return products.map(p => {
    const tr = trMap.get(p.id);
    return {
      ...p,
      name: tr?.name || p.name,
      summary: tr?.summary ?? p.summary,
      description: tr?.description ?? p.description,
      origin: tr?.origin || p.origin,
      seriesData: tr?.series_data ?? p.seriesData,
      productOptions: tr?.product_options ?? p.productOptions,
      translated: Boolean(tr),
      specs: p.specs
        ? p.specs.map(spec => {
            const st = specMap.get(spec.id);
            return st ? { ...spec, label: st.label || spec.label, value: st.value || spec.value } : spec;
          })
        : p.specs,
    };
  });
}

/** 회사정보 번역 적용 (workingHoursEn 등 EN 전용 파생 필드 포함) */
export async function translateCompanyInfo(companyInfo) {
  if (!companyInfo) return companyInfo;
  const res = await safeQueryEn('SELECT * FROM company_info_translation WHERE id = 1');
  const tr = res?.rows?.[0];
  if (!tr) return companyInfo;
  return {
    ...companyInfo,
    name: tr.name || companyInfo.name,
    ceo: tr.ceo || companyInfo.ceo,
    address: tr.address || companyInfo.address,
    workingHours: tr.working_hours || companyInfo.workingHours,
    workingHoursEn: tr.working_hours || null,
    lunchTime: tr.lunch_time || companyInfo.lunchTime,
    closedDays: tr.closed_days || companyInfo.closedDays,
  };
}
