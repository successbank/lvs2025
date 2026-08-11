'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

const STATUS_BADGE = {
  missing: { label: '미번역', bg: '#fee2e2', color: '#b91c1c' },
  auto: { label: '자동번역', bg: '#fef3c7', color: '#92400e' },
  reviewed: { label: '검수완료', bg: '#dcfce7', color: '#166534' },
  stale: { label: '원본 변경됨', bg: '#fde68a', color: '#9a3412' },
};

export default function AdminEnProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // { source, translation, specTranslations, stale }
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/en/translations/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openEditor = async (id) => {
    try {
      const res = await fetch(`/api/admin/en/translations/products/${id}`);
      if (!res.ok) throw new Error('번역 정보를 불러오지 못했습니다.');
      const data = await res.json();
      setEditing(data);
      setForm({
        name: data.translation?.name || data.source.name || '',
        summary: data.translation?.summary ?? '',
        description: data.translation?.description ?? '',
        origin: data.translation?.origin || 'South Korea',
        seriesData: data.translation?.series_data ?? data.source.seriesData,
        productOptions: data.translation?.product_options ?? data.source.productOptions,
        specs: data.specTranslations,
      });
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/en/translations/products/${editing.source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || '저장 실패');
      alert('번역이 저장되었습니다. (검수완료 처리)');
      setEditing(null);
      setForm(null);
      fetchList();
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const badge = (status) => {
    const b = STATUS_BADGE[status] || STATUS_BADGE.missing;
    return (
      <span style={{ background: b.bg, color: b.color, padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600 }}>
        {b.label}
      </span>
    );
  };

  const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' };
  const koBox = { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '0.5rem', fontSize: '0.85rem', color: '#4b5563', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 120, overflow: 'auto' };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>영문 제품 번역 관리</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          영문 사이트(/en)에 노출되는 제품 텍스트를 관리합니다. 원본(한국어) 제품이 수정되면 &quot;원본 변경됨&quot; 배지가 표시됩니다.
        </p>

        {!editing ? (
          loading ? <p>로딩 중...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <thead>
                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>모델명</th>
                  <th style={{ padding: '0.75rem' }}>제품명(KR)</th>
                  <th style={{ padding: '0.75rem' }}>제품명(EN)</th>
                  <th style={{ padding: '0.75rem' }}>번역 상태</th>
                  <th style={{ padding: '0.75rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6', opacity: p.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.modelName}</td>
                    <td style={{ padding: '0.75rem' }}>{p.nameKo}</td>
                    <td style={{ padding: '0.75rem' }}>{p.nameEn || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                    <td style={{ padding: '0.75rem' }}>{badge(p.translationStatus)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button onClick={() => openEditor(p.id)}
                        style={{ padding: '0.35rem 0.9rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                        번역 편집
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {editing.source.modelName} 번역 편집
                {editing.stale && <span style={{ marginLeft: 8 }}>{badge('stale')}</span>}
              </h2>
              <button onClick={() => { setEditing(null); setForm(null); }}
                style={{ padding: '0.35rem 0.9rem', background: '#e5e7eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                ← 목록
              </button>
            </div>

            {/* 제품명 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>제품명 (KR 원문)</label>
                <div style={koBox}>{editing.source.name}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>제품명 (EN)</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>

            {/* 요약 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>요약 (KR 원문)</label>
                <div style={koBox}>{editing.source.summary || '—'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>요약 (EN)</label>
                <input style={inputStyle} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
              </div>
            </div>

            {/* 설명 (HTML) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>제품 설명 HTML (KR 원문)</label>
                <div style={{ ...koBox, maxHeight: 220 }}>{editing.source.description || '—'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>제품 설명 HTML (EN)</label>
                <textarea style={{ ...inputStyle, minHeight: 220, fontFamily: 'monospace', fontSize: '0.8rem' }}
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            {/* 원산지 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>원산지 (KR 원문)</label>
                <div style={koBox}>{editing.source.origin}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>원산지 (EN)</label>
                <input style={inputStyle} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} />
              </div>
            </div>

            {/* 스펙 */}
            {form.specs.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>제품 사양 번역</label>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem' }}>KR 라벨</th>
                      <th style={{ padding: '0.4rem' }}>KR 값</th>
                      <th style={{ padding: '0.4rem' }}>EN 라벨</th>
                      <th style={{ padding: '0.4rem' }}>EN 값</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.specs.map((spec, i) => (
                      <tr key={spec.specId} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.4rem', color: '#6b7280' }}>{spec.labelKo}</td>
                        <td style={{ padding: '0.4rem', color: '#6b7280' }}>{spec.valueKo}</td>
                        <td style={{ padding: '0.4rem' }}>
                          <input style={{ ...inputStyle, padding: '0.3rem' }} value={spec.labelEn}
                            onChange={e => setForm(f => {
                              const specs = [...f.specs];
                              specs[i] = { ...specs[i], labelEn: e.target.value };
                              return { ...f, specs };
                            })} />
                        </td>
                        <td style={{ padding: '0.4rem' }}>
                          <input style={{ ...inputStyle, padding: '0.3rem' }} value={spec.valueEn}
                            onChange={e => setForm(f => {
                              const specs = [...f.specs];
                              specs[i] = { ...specs[i], valueEn: e.target.value };
                              return { ...f, specs };
                            })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 시리즈 JSON */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>시리즈 표 JSON (EN — 고급)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 140, fontFamily: 'monospace', fontSize: '0.75rem' }}
                value={form.seriesData ? JSON.stringify(form.seriesData, null, 1) : ''}
                onChange={e => {
                  const val = e.target.value.trim();
                  try {
                    setForm(f => ({ ...f, seriesData: val ? JSON.parse(val) : null, _seriesErr: false }));
                  } catch {
                    setForm(f => ({ ...f, _seriesErr: true, _seriesRaw: e.target.value }));
                  }
                }}
              />
              {form._seriesErr && <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>JSON 형식 오류 — 저장 시 마지막 유효 값이 사용됩니다.</p>}
            </div>

            <button onClick={handleSave} disabled={saving}
              style={{ padding: '0.6rem 1.6rem', background: '#059669', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              {saving ? '저장 중...' : '번역 저장 (검수완료)'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
