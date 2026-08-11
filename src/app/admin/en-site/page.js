'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

// 영문 사이트 텍스트 관리 — 메뉴 라벨 / 카테고리 / 슬라이더 / 회사정보
export default function AdminEnSite() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('menu');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/en/translations/site');
      const d = await res.json();
      setData({
        ...d,
        companyEn: {
          name: d.companyInfo.en?.name || '',
          ceo: d.companyInfo.en?.ceo || '',
          address: d.companyInfo.en?.address || '',
          workingHours: d.companyInfo.en?.working_hours || '',
          lunchTime: d.companyInfo.en?.lunch_time || '',
          closedDays: d.companyInfo.en?.closed_days || '',
        },
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/en/translations/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: data.categories,
          menuItems: data.menuItems,
          sliders: data.sliders,
          companyInfo: data.companyEn,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || '저장 실패');
      alert('영문 사이트 텍스트가 저장되었습니다.');
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const inputStyle = { width: '100%', padding: '0.45rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.88rem' };
  const tabStyle = (active) => ({
    padding: '0.5rem 1.2rem', border: '1px solid #d1d5db', background: active ? '#2563eb' : 'white',
    color: active ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.9rem',
  });

  const updateRow = (listKey, idx, field, value) => {
    setData(d => {
      const list = [...d[listKey]];
      list[idx] = { ...list[idx], [field]: value };
      return { ...d, [listKey]: list };
    });
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>영문 사이트 텍스트 관리</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          영문 사이트(/en)의 메뉴·카테고리·슬라이더·회사정보 텍스트를 관리합니다.
        </p>

        {loading || !data ? <p>로딩 중...</p> : (
          <>
            <div style={{ display: 'flex', marginBottom: '1rem' }}>
              <button style={{ ...tabStyle(tab === 'menu'), borderRadius: '6px 0 0 6px' }} onClick={() => setTab('menu')}>메뉴 ({data.menuItems.length})</button>
              <button style={tabStyle(tab === 'categories')} onClick={() => setTab('categories')}>카테고리 ({data.categories.length})</button>
              <button style={tabStyle(tab === 'sliders')} onClick={() => setTab('sliders')}>슬라이더 ({data.sliders.length})</button>
              <button style={{ ...tabStyle(tab === 'company'), borderRadius: '0 6px 6px 0' }} onClick={() => setTab('company')}>회사정보</button>
            </div>

            <div style={{ background: 'white', borderRadius: 8, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
              {tab === 'menu' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead><tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>URL</th><th style={{ padding: '0.5rem' }}>KR 라벨</th><th style={{ padding: '0.5rem', width: '40%' }}>EN 라벨</th>
                  </tr></thead>
                  <tbody>
                    {data.menuItems.map((m, i) => (
                      <tr key={m.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.5rem', color: '#9ca3af', fontSize: '0.8rem' }}>{m.parentId ? '└ ' : ''}{m.url}</td>
                        <td style={{ padding: '0.5rem' }}>{m.labelKo}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <input style={inputStyle} value={m.labelEn} onChange={e => updateRow('menuItems', i, 'labelEn', e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'categories' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead><tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>slug</th><th style={{ padding: '0.5rem' }}>KR 이름</th>
                    <th style={{ padding: '0.5rem', width: '28%' }}>EN 이름</th><th style={{ padding: '0.5rem', width: '30%' }}>EN 설명</th>
                  </tr></thead>
                  <tbody>
                    {data.categories.map((c, i) => (
                      <tr key={c.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.5rem', color: '#9ca3af', fontSize: '0.8rem' }}>{c.parentId ? '└ ' : ''}{c.slug}</td>
                        <td style={{ padding: '0.5rem' }}>{c.nameKo}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <input style={inputStyle} value={c.nameEn} onChange={e => updateRow('categories', i, 'nameEn', e.target.value)} />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <input style={inputStyle} value={c.descriptionEn} onChange={e => updateRow('categories', i, 'descriptionEn', e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'sliders' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead><tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>유형</th><th style={{ padding: '0.5rem' }}>KR 제목</th>
                    <th style={{ padding: '0.5rem', width: '25%' }}>EN 제목</th><th style={{ padding: '0.5rem', width: '35%' }}>EN 설명</th>
                  </tr></thead>
                  <tbody>
                    {data.sliders.map((s, i) => (
                      <tr key={s.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.5rem', color: '#9ca3af', fontSize: '0.8rem' }}>{s.type}</td>
                        <td style={{ padding: '0.5rem' }}>{s.titleKo || '—'}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <input style={inputStyle} value={s.titleEn} onChange={e => updateRow('sliders', i, 'titleEn', e.target.value)} />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <input style={inputStyle} value={s.descriptionEn} onChange={e => updateRow('sliders', i, 'descriptionEn', e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'company' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: 800 }}>
                  {[
                    ['name', '회사명', data.companyInfo.ko?.name],
                    ['ceo', '대표이사', data.companyInfo.ko?.ceo],
                    ['address', '주소', data.companyInfo.ko?.address],
                    ['workingHours', '영업시간', data.companyInfo.ko?.workingHours],
                    ['lunchTime', '점심시간', data.companyInfo.ko?.lunchTime],
                    ['closedDays', '휴무일', data.companyInfo.ko?.closedDays],
                  ].map(([key, label, koVal]) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>{label} <span style={{ color: '#9ca3af' }}>(KR: {koVal || '—'})</span></label>
                      <input style={inputStyle} value={data.companyEn[key]}
                        onChange={e => setData(d => ({ ...d, companyEn: { ...d.companyEn, [key]: e.target.value } }))} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSave} disabled={saving}
              style={{ padding: '0.6rem 1.6rem', background: '#059669', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              {saving ? '저장 중...' : '전체 저장'}
            </button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
