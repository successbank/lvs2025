'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PERIOD_OPTIONS = [
  { value: 'daily', label: '일별' },
  { value: 'weekly', label: '주별' },
  { value: 'monthly', label: '월별' },
];

const PRESET_RANGES = [
  { label: '오늘', days: 0 },
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
];

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

export default function VisitorTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [activePreset, setActivePreset] = useState(30);

  const today = new Date();
  const [fromDate, setFromDate] = useState(formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(formatDate(today));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/visitors?period=${period}&from=${fromDate}&to=${toDate}`)
      .then(res => res.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setData([]); setLoading(false); });
  }, [period, fromDate, toDate]);

  const handlePreset = (days) => {
    setActivePreset(days);
    const now = new Date();
    setToDate(formatDate(now));
    if (days === 0) {
      setFromDate(formatDate(now));
    } else {
      setFromDate(formatDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000)));
    }
  };

  const chartData = data.map(d => ({
    date: (() => { const s = typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().split('T')[0]; const [,m,day] = s.split('-'); return `${parseInt(m)}월 ${parseInt(day)}일`; })(),
    조회수: d.views,
    방문자: d.uniqueVisitors,
  }));

  const totalViews = data.reduce((sum, d) => sum + d.views, 0);
  const totalVisitors = data.reduce((sum, d) => sum + d.uniqueVisitors, 0);

  return (
    <div>
      {/* 필터 영역 */}
      <div style={{
        background: 'white', padding: '1.5rem', borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
      }}>
        {/* 프리셋 버튼 */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {PRESET_RANGES.map(preset => (
            <button
              key={preset.days}
              onClick={() => handlePreset(preset.days)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: '500',
                background: activePreset === preset.days ? '#3b82f6' : '#f3f4f6',
                color: activePreset === preset.days ? 'white' : '#374151',
              }}
            >
              {preset.label}
            </button>
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

        {/* 기간 토글 */}
        <div style={{ display: 'flex', gap: '0.25rem', background: '#f3f4f6', borderRadius: '6px', padding: '2px' }}>
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              style={{
                padding: '0.4rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: '500',
                background: period === opt.value ? 'white' : 'transparent',
                color: period === opt.value ? '#1f2937' : '#6b7280',
                boxShadow: period === opt.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 합계 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          background: 'white', padding: '1.25rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6',
        }}>
          <h4 style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>기간 총 조회수</h4>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{totalViews.toLocaleString()}</p>
        </div>
        <div style={{
          background: 'white', padding: '1.25rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981',
        }}>
          <h4 style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            {period === 'daily' ? '기간 총 방문자' : '기간별 방문자 합계'}
          </h4>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{totalVisitors.toLocaleString()}</p>
          {period !== 'daily' && (
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              * {period === 'weekly' ? '주' : '월'}별 고유 방문자의 합 (중복 포함)
            </p>
          )}
        </div>
      </div>

      {/* 차트 */}
      <div style={{
        background: 'white', padding: '1.5rem', borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>로딩 중...</div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} tick={{ fill: '#6b7280' }} />
              <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Area type="monotone" dataKey="조회수" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="방문자" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            선택한 기간에 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
