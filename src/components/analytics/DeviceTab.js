'use client';

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const DEVICE_COLORS = {
  desktop: '#3b82f6',
  mobile: '#10b981',
  tablet: '#f59e0b',
};

const DEVICE_LABELS = {
  desktop: '데스크톱',
  mobile: '모바일',
  tablet: '태블릿',
};

const PRESET_RANGES = [
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
];

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

export default function DeviceTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(30);

  const today = new Date();
  const [fromDate, setFromDate] = useState(formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(formatDate(today));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/devices?from=${fromDate}&to=${toDate}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [fromDate, toDate]);

  const handlePreset = (days) => {
    setActivePreset(days);
    const now = new Date();
    setToDate(formatDate(now));
    setFromDate(formatDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000)));
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>;

  const pieData = (data?.pieData || []).map(d => ({
    name: DEVICE_LABELS[d.name] || d.name,
    value: d.value,
    color: DEVICE_COLORS[d.name] || '#6b7280',
  }));

  const totalViews = pieData.reduce((sum, d) => sum + d.value, 0);

  const barData = (data?.dailyData || []).map(d => ({
    date: (() => { const s = typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().split('T')[0]; const [,m,day] = s.split('-'); return `${parseInt(m)}월 ${parseInt(day)}일`; })(),
    데스크톱: d.desktop,
    모바일: d.mobile,
    태블릿: d.tablet,
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* 파이차트 */}
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>기기별 비율</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              {/* 상세 수치 */}
              <div style={{ marginTop: '1rem' }}>
                {pieData.map(d => (
                  <div key={d.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: d.color }} />
                      <span style={{ fontSize: '0.9rem' }}>{d.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '600' }}>{d.value.toLocaleString()}</span>
                      <span style={{ color: '#6b7280', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                        ({totalViews > 0 ? Math.round((d.value / totalViews) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>데이터 없음</div>
          )}
        </div>

        {/* 기기별 일별 추이 바차트 */}
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>기기별 일별 추이</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="데스크톱" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="모바일" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="태블릿" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>데이터 없음</div>
          )}
        </div>
      </div>
    </div>
  );
}
