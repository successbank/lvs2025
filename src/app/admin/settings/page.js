'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    name: '', ceo: '', businessNumber: '', phone: '', fax: '',
    email: '', address: '', workingHours: '', lunchTime: '', closedDays: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data && !data.error) {
        setSettings({
          name: data.name || '',
          ceo: data.ceo || '',
          businessNumber: data.businessNumber || '',
          phone: data.phone || '',
          fax: data.fax || '',
          email: data.email || '',
          address: data.address || '',
          workingHours: data.workingHours || '',
          lunchTime: data.lunchTime || '',
          closedDays: data.closedDays || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('저장에 실패했습니다.');
      alert('설정이 저장되었습니다.');
    } catch (error) {
      alert(error.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <AdminLayout title="사이트 설정"><div>로딩 중...</div></AdminLayout>;
  }

  return (
    <AdminLayout title="사이트 설정">
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px',
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>회사명</label>
              <input style={inputStyle} value={settings.name}
                onChange={e => setSettings(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>대표이사</label>
              <input style={inputStyle} value={settings.ceo}
                onChange={e => setSettings(p => ({ ...p, ceo: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>사업자번호</label>
              <input style={inputStyle} value={settings.businessNumber}
                onChange={e => setSettings(p => ({ ...p, businessNumber: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>대표전화</label>
              <input style={inputStyle} value={settings.phone}
                onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>팩스</label>
              <input style={inputStyle} value={settings.fax}
                onChange={e => setSettings(p => ({ ...p, fax: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>이메일</label>
              <input style={inputStyle} value={settings.email}
                onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>주소</label>
              <input style={inputStyle} value={settings.address}
                onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>업무시간</label>
              <input style={inputStyle} value={settings.workingHours}
                onChange={e => setSettings(p => ({ ...p, workingHours: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>점심시간</label>
              <input style={inputStyle} value={settings.lunchTime}
                onChange={e => setSettings(p => ({ ...p, lunchTime: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>휴무일</label>
              <input style={inputStyle} value={settings.closedDays}
                onChange={e => setSettings(p => ({ ...p, closedDays: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" disabled={saving} style={{
              background: '#3b82f6', color: 'white', padding: '0.75rem 2rem',
              borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '1rem',
            }}>
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
