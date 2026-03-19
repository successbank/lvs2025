'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PRESET_RANGES = [
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
];

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

export default function PageRankTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(30);

  const today = new Date();
  const [fromDate, setFromDate] = useState(formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(formatDate(today));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/pages?from=${fromDate}&to=${toDate}&limit=20`)
      .then(res => res.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setData([]); setLoading(false); });
  }, [fromDate, toDate]);

  const handlePreset = (days) => {
    setActivePreset(days);
    const now = new Date();
    setToDate(formatDate(now));
    setFromDate(formatDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000)));
  };

  const chartData = data.slice(0, 10).map(d => ({
    name: d.path.length > 25 ? '...' + d.path.slice(-22) : d.path,
    조회수: d.views,
    방문자: d.uniqueVisitors,
  }));

  return (
    <div>
      {/* 필터 */}
      <div style={{
        background: 'white', padding: '1rem 1.5rem', borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
        display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {PRESET_RANGES.map(preset => (
            <button key={preset.days} onClick={() => handlePreset(preset.days)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: '500',
                background: activePreset === preset.days ? '#3b82f6' : '#f3f4f6',
                color: activePreset === preset.days ? 'white' : '#374151',
              }}
            >{preset.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="date" value={fromDate}
            onChange={e => { setFromDate(e.target.value); setActivePreset(null); }}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
          />
          <span style={{ color: '#6b7280' }}>~</span>
          <input type="date" value={toDate}
            onChange={e => { setToDate(e.target.value); setActivePreset(null); }}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
      ) : data.length > 0 ? (
        <>
          {/* 바차트 */}
          <div style={{
            background: 'white', padding: '1.5rem', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>페이지별 조회수 Top 10</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" fontSize={12} tick={{ fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={160} fontSize={11} tick={{ fill: '#374151' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="조회수" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 테이블 */}
          <div style={{
            background: 'white', padding: '1.5rem', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>페이지별 조회 상세</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>순위</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>페이지 경로</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>조회수</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>방문자</th>
                </tr>
              </thead>
              <tbody>
                {data.map((page, i) => (
                  <tr key={page.path} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: i < 3 ? '#6366f1' : '#374151' }}>{i + 1}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>{page.path}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{page.views.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#6b7280' }}>{page.uniqueVisitors.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{
          background: 'white', padding: '3rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', color: '#9ca3af',
        }}>
          선택한 기간에 페이지 조회 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}
