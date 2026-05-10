'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';

// /admin/dealers — 대리점 관리 (인증서 관리 패턴 복제)
// 탭: 국내 / 국제, 카드 리스트 드래그앤드롭 순서변경, CRUD + 이미지 업로드 + 활성 토글

const DEALER_IMAGE_BASE = '/images/dealers/';

const TYPE_LABEL = { DOMESTIC: '국내', INTERNATIONAL: '국제' };

const EMPTY_FORM = {
  type: 'DOMESTIC',
  name: '',
  address: '',
  tel: '',
  fax: '',
  email: '',
  website: '',
  country: '',
  flag: '',
  image: '',
  isActive: true,
};

export default function AdminDealers() {
  const [activeTab, setActiveTab] = useState('DOMESTIC');
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dealers?includeAll=true');
      const data = await res.json();
      setDealers(data.dealers || []);
    } catch (error) {
      console.error('Failed to fetch dealers:', error);
    }
    setLoading(false);
  };

  const filteredDealers = useMemo(() => {
    return dealers.filter(d => d.type === activeTab);
  }, [dealers, activeTab]);

  const domesticCount = useMemo(() => dealers.filter(d => d.type === 'DOMESTIC').length, [dealers]);
  const internationalCount = useMemo(() => dealers.filter(d => d.type === 'INTERNATIONAL').length, [dealers]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/dealers/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '업로드 실패');
      }
      const data = await res.json();
      return data.filename;
    } catch (error) {
      alert(error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filename = await handleImageUpload(file);
    if (filename) setFormData(p => ({ ...p, image: filename }));
    e.target.value = '';
  };

  const openCreate = () => {
    resetForm();
    setFormData(p => ({ ...p, type: activeTab }));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.name) {
      alert('대리점명과 구분(국내/국제)은 필수입니다.');
      return;
    }
    try {
      const url = editing ? `/api/dealers/${editing.id}` : '/api/dealers';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '저장에 실패했습니다.');
      }
      setShowForm(false);
      resetForm();
      fetchAll();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleActive = async (dealer) => {
    try {
      const res = await fetch(`/api/dealers/${dealer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !dealer.isActive }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      fetchAll();
    } catch (error) { alert(error.message); }
  };

  const handleEdit = (dealer) => {
    setEditing(dealer);
    setFormData({
      type: dealer.type,
      name: dealer.name || '',
      address: dealer.address || '',
      tel: dealer.tel || '',
      fax: dealer.fax || '',
      email: dealer.email || '',
      website: dealer.website || '',
      country: dealer.country || '',
      flag: dealer.flag || '',
      image: dealer.image || '',
      isActive: dealer.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/dealers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchAll();
    } catch (error) { alert(error.message); }
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, type: activeTab });
    setEditing(null);
  };

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) { resetDragState(); return; }
    const reordered = [...filteredDealers];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    const reorderedIds = reordered.map(d => d.id);
    // 전체 dealers 배열에서 같은 type 항목들의 order만 업데이트
    const newDealers = [...dealers];
    reordered.forEach((d, i) => {
      const idx = newDealers.findIndex(x => x.id === d.id);
      if (idx >= 0) newDealers[idx] = { ...newDealers[idx], order: i + 1 };
    });
    setDealers(newDealers);
    setPendingOrderIds(reorderedIds);
    setOrderChanged(true);
    resetDragState();
  };
  const handleDragEnd = () => resetDragState();
  const resetDragState = () => { setDragIndex(null); setDragOverIndex(null); };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/dealers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, orderedIds: pendingOrderIds }),
      });
      if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
      setOrderChanged(false); setPendingOrderIds([]);
      fetchAll();
    } catch (error) { alert(error.message); }
    setSavingOrder(false);
  };
  const cancelOrder = () => { setOrderChanged(false); setPendingOrderIds([]); fetchAll(); };

  return (
    <AdminLayout title="대리점 관리">
      {/* 탭 */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
        {['DOMESTIC', 'INTERNATIONAL'].map(t => {
          const isActive = activeTab === t;
          const count = t === 'DOMESTIC' ? domesticCount : internationalCount;
          return (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setOrderChanged(false); setPendingOrderIds([]); }}
              style={{
                padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#3b82f6' : '#6b7280',
                borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                marginBottom: '-2px', fontSize: '0.95rem',
              }}
            >
              {TYPE_LABEL[t]} 대리점 ({count})
            </button>
          );
        })}
      </div>

      {/* 헤더 */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {TYPE_LABEL[activeTab]} 대리점 <strong style={{ color: '#111827' }}>{filteredDealers.length}</strong>건
        </p>
        <button onClick={openCreate} style={primaryBtnStyle}>+ 대리점 추가</button>
      </div>

      {/* 순서 변경 안내 배너 */}
      {orderChanged && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#92400e', fontSize: '0.9rem' }}>순서가 변경되었습니다. 저장하지 않으면 사라집니다.</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={cancelOrder} style={{ ...secondaryBtnStyle, padding: '0.4rem 1rem' }}>취소</button>
            <button onClick={saveOrder} disabled={savingOrder} style={{ ...primaryBtnStyle, padding: '0.4rem 1rem', opacity: savingOrder ? 0.6 : 1 }}>
              {savingOrder ? '저장 중...' : '순서 저장'}
            </button>
          </div>
        </div>
      )}

      {/* 폼 (추가/수정) */}
      {showForm && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editing ? '대리점 수정' : '대리점 추가'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>구분 *</label>
                <select style={inputStyle} value={formData.type} required onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}>
                  <option value="DOMESTIC">국내</option>
                  <option value="INTERNATIONAL">국제</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>대리점명 *</label>
                <input style={inputStyle} value={formData.name} required onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>주소</label>
                <input style={inputStyle} value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>전화</label>
                <input style={inputStyle} value={formData.tel} onChange={e => setFormData(p => ({ ...p, tel: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>팩스</label>
                <input style={inputStyle} value={formData.fax} onChange={e => setFormData(p => ({ ...p, fax: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>이메일</label>
                <input type="email" style={inputStyle} value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>웹사이트</label>
                <input style={inputStyle} value={formData.website} onChange={e => setFormData(p => ({ ...p, website: e.target.value }))} placeholder="www.example.com" />
              </div>
              {formData.type === 'INTERNATIONAL' && (
                <>
                  <div>
                    <label style={labelStyle}>국가</label>
                    <input style={inputStyle} value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} placeholder="USA, Singapore..." />
                  </div>
                  <div>
                    <label style={labelStyle}>국기 (emoji)</label>
                    <input style={inputStyle} value={formData.flag} onChange={e => setFormData(p => ({ ...p, flag: e.target.value }))} placeholder="🇺🇸 🇸🇬..." />
                  </div>
                </>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>로고 이미지</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {formData.image && (
                    <img
                      src={`${DEALER_IMAGE_BASE}${formData.image}`}
                      alt="미리보기"
                      style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.5rem', background: '#f9fafb' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={onFileChange}
                      disabled={uploading}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    {uploading && <p style={{ fontSize: '0.85rem', color: '#3b82f6' }}>업로드 중...</p>}
                    <input
                      style={{ ...inputStyle, fontSize: '0.85rem' }}
                      placeholder="또는 파일명 직접 입력 (예: branch1.jpg)"
                      value={formData.image}
                      onChange={e => setFormData(p => ({ ...p, image: e.target.value }))}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      이미지 위치: <code>/images/dealers/</code> · 신규 업로드 시 자동으로 dealer-XXX.webp로 저장
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>활성 여부</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{formData.isActive ? '활성 (프론트 노출)' : '비활성 (숨김)'}</span>
                </label>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={primaryBtnStyle} disabled={uploading}>{editing ? '수정' : '등록'}</button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={secondaryBtnStyle}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 테이블 */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}></th>
              <th style={{ ...thStyle, width: '70px' }}>로고</th>
              <th style={thStyle}>대리점명</th>
              <th style={{ ...thStyle, width: '160px' }}>{activeTab === 'DOMESTIC' ? '주소(요약)' : '국가'}</th>
              <th style={{ ...thStyle, width: '140px' }}>연락처</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>활성</th>
              <th style={{ ...thStyle, width: '60px', textAlign: 'center' }}>순서</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>로딩 중...</td></tr>
            ) : filteredDealers.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>등록된 대리점이 없습니다.</td></tr>
            ) : filteredDealers.map((dealer, idx) => (
              <tr
                key={dealer.id}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={e => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  background: dragOverIndex === idx ? '#eff6ff' : 'white',
                  cursor: 'move',
                  opacity: dragIndex === idx ? 0.5 : 1,
                }}
              >
                <td style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>⠿</td>
                <td style={tdStyle}>
                  {dealer.image ? (
                    <img
                      src={`${DEALER_IMAGE_BASE}${dealer.image}`}
                      alt={dealer.name}
                      style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e5e7eb', padding: '0.25rem', background: '#f9fafb' }}
                      onError={(e) => { e.target.style.opacity = 0.3; }}
                    />
                  ) : (
                    <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '500' }}>{dealer.flag ? `${dealer.flag} ` : ''}{dealer.name}</div>
                  {dealer.website && (
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.15rem' }}>{dealer.website}</div>
                  )}
                </td>
                <td style={{ ...tdStyle, fontSize: '0.85rem', color: '#6b7280' }}>
                  {activeTab === 'DOMESTIC' ? (dealer.address || '—') : (dealer.country || '—')}
                </td>
                <td style={{ ...tdStyle, fontSize: '0.85rem', color: '#6b7280' }}>
                  {dealer.tel || '—'}
                  {dealer.email && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.15rem' }}>{dealer.email}</div>}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleActive(dealer)}
                    style={{ ...toggleStyle, background: dealer.isActive ? '#3b82f6' : '#d1d5db', border: 'none', cursor: 'pointer' }}
                    aria-label="활성 토글"
                  >
                    <span style={{ ...toggleKnobStyle, transform: dealer.isActive ? 'translateX(18px)' : 'translateX(2px)' }} />
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>{dealer.order}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => handleEdit(dealer)} style={actionBtn('#3b82f6')}>수정</button>
                  <button onClick={() => handleDelete(dealer.id)} style={actionBtn('#ef4444')}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

// === 스타일 (인증서 페이지와 동일 톤) ===
const primaryBtnStyle = { background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' };
const secondaryBtnStyle = { background: 'white', color: '#374151', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const actionBtn = (color) => ({ background: 'transparent', color, border: 'none', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.5rem', textDecoration: 'underline' });
const toggleStyle = { display: 'inline-block', width: '36px', height: '20px', borderRadius: '10px', position: 'relative', transition: 'background 0.2s ease' };
const toggleKnobStyle = { width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', transition: 'transform 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' };
