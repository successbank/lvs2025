'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OverviewTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics/overview')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>;
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>데이터를 불러올 수 없습니다.</div>;

  const statCards = [
    { label: '오늘 조회수', value: data.todayViews, change: data.changeRate, color: '#3b82f6' },
    { label: '오늘 방문자', value: data.todayUniqueVisitors, color: '#10b981' },
    { label: '이번 주 조회수', value: data.weekViews, color: '#8b5cf6' },
    { label: '이번 달 조회수', value: data.monthViews, color: '#f59e0b' },
  ];

  const chartData = (data.last7Days || []).map(d => {
    const dateStr = typeof d.date === 'string' ? d.date : (d.date instanceof Date ? d.date.toISOString().split('T')[0] : String(d.date));
    const [, m, day] = dateStr.split('-');
    return {
      date: `${parseInt(m)}월 ${parseInt(day)}일`,
      조회수: d.views,
      방문자: d.uniqueVisitors,
    };
  });

  return (
    <div>
      {/* 요약 카드 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: 'white', padding: '1.5rem', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${card.color}`,
          }}>
            <h3 style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>{card.label}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {(card.value ?? 0).toLocaleString()}
              </p>
              {card.change !== undefined && (
                <span style={{
                  fontSize: '0.85rem', fontWeight: '600',
                  color: card.change >= 0 ? '#10b981' : '#ef4444',
                }}>
                  {card.change >= 0 ? '▲' : '▼'} {Math.abs(card.change)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 7일 추이 차트 */}
      <div style={{
        background: 'white', padding: '1.5rem', borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>최근 7일 추이</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} tick={{ fill: '#6b7280' }} />
              <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="조회수" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="방문자" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            아직 데이터가 없습니다. 사이트 방문이 기록되면 차트가 표시됩니다.
          </div>
        )}
      </div>

      {/* 오늘 상위 페이지 */}
      <div style={{
        background: 'white', padding: '1.5rem', borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>오늘 인기 페이지</h3>
        {data.topPages?.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>순위</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>페이지</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {data.topPages.map((page, i) => (
                <tr key={page.path} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '600', color: '#374151' }}>{i + 1}</td>
                  <td style={{ padding: '0.75rem', color: '#1f2937', fontFamily: 'monospace', fontSize: '0.9rem' }}>{page.path}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{page.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            오늘 방문 데이터가 아직 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
