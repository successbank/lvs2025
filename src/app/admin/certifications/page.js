'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminCertifications() {
  const [activeTab, setActiveTab] = useState('certs');

  return (
    <AdminLayout title="인증 관리">
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('certs')}
          style={{
            padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: activeTab === 'certs' ? '600' : '400',
            color: activeTab === 'certs' ? '#3b82f6' : '#6b7280',
            borderBottom: activeTab === 'certs' ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px', fontSize: '0.95rem',
          }}
        >
          인증서 관리
        </button>
        <button
          onClick={() => setActiveTab('cats')}
          style={{
            padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: activeTab === 'cats' ? '600' : '400',
            color: activeTab === 'cats' ? '#3b82f6' : '#6b7280',
            borderBottom: activeTab === 'cats' ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px', fontSize: '0.95rem',
          }}
        >
          카테고리 관리
        </button>
      </div>

      {activeTab === 'certs' ? <CertsTab /> : <CategoriesTab />}
    </AdminLayout>
  );
}

// =============================================
// 인증서 관리 탭
// =============================================
function CertsTab() {
  const [certs, setCerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', image: '', categoryId: '', isActive: true,
  });

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, catRes] = await Promise.all([
        fetch('/api/certifications?includeAll=true'),
        fetch('/api/certification-categories?includeAll=true'),
      ]);
      const cData = await cRes.json();
      const catData = await catRes.json();
      setCerts(cData.certifications || []);
      setCategories(catData.categories || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
    setLoading(false);
  };

  const filteredCerts = useMemo(() => {
    if (filterCategoryId === 'all') return certs;
    return certs.filter(c => c.categoryId === filterCategoryId);
  }, [certs, filterCategoryId]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/certifications/upload', { method: 'POST', body: fd });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image || !formData.categoryId) {
      alert('제목, 이미지, 카테고리는 필수입니다.');
      return;
    }
    try {
      const url = editing ? `/api/certifications/${editing.id}` : '/api/certifications';
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

  const handleToggleActive = async (cert) => {
    try {
      const res = await fetch(`/api/certifications/${cert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cert.isActive }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      fetchAll();
    } catch (error) { alert(error.message); }
  };

  const handleEdit = (cert) => {
    setEditing(cert);
    setFormData({
      title: cert.title, image: cert.image,
      categoryId: cert.categoryId, isActive: cert.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchAll();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', image: '', categoryId: '', isActive: true });
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
    const source = filteredCerts;
    const reordered = [...source];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    const reorderedIds = reordered.map(c => c.id);
    const newCerts = [...certs];
    reordered.forEach((c, i) => {
      const idx = newCerts.findIndex(x => x.id === c.id);
      if (idx >= 0) newCerts[idx] = { ...newCerts[idx], order: i };
    });
    setCerts(newCerts);
    setPendingOrderIds(reorderedIds);
    setOrderChanged(true);
    resetDragState();
  };
  const handleDragEnd = () => resetDragState();
  const resetDragState = () => { setDragIndex(null); setDragOverIndex(null); };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/certifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: pendingOrderIds }),
      });
      if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
      setOrderChanged(false); setPendingOrderIds([]);
      fetchAll();
    } catch (error) { alert(error.message); }
    setSavingOrder(false);
  };
  const cancelOrder = () => { setOrderChanged(false); setPendingOrderIds([]); fetchAll(); };

  return (
    <>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            총 <strong style={{ color: '#111827' }}>{filteredCerts.length}</strong>건
          </p>
          <select
            value={filterCategoryId}
            onChange={e => setFilterCategoryId(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: '160px' }}
          >
            <option value="all">전체 카테고리</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
          </select>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={primaryBtnStyle}>+ 인증서 추가</button>
      </div>

      {orderChanged && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#92400e', fontSize: '0.9rem' }}>순서가 변경되었습니다. 저장하지 않으면 변경사항이 사라집니다.</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={cancelOrder} style={{ ...secondaryBtnStyle, padding: '0.4rem 1rem' }}>취소</button>
            <button onClick={saveOrder} disabled={savingOrder} style={{ ...primaryBtnStyle, padding: '0.4rem 1rem', opacity: savingOrder ? 0.6 : 1 }}>
              {savingOrder ? '저장 중...' : '순서 저장'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editing ? '인증서 수정' : '인증서 추가'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>제목 *</label>
                <input style={inputStyle} value={formData.title} required onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>카테고리 *</label>
                <select style={inputStyle} value={formData.categoryId} required onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">선택...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>이미지 *</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {formData.image && (
                    <img
                      src={`/images/certifications/${formData.image}`}
                      alt="미리보기"
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
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
                      placeholder="또는 파일명 직접 입력 (예: ce-db-dbs.jpg)"
                      value={formData.image}
                      onChange={e => setFormData(p => ({ ...p, image: e.target.value }))}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      이미지 위치: <code>/images/certifications/</code> · 신규 업로드 시 자동으로 cert-XXX.webp로 저장
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
                  <span style={{ fontSize: '0.9rem' }}>{formData.isActive ? '활성' : '비활성'}</span>
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

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}></th>
              <th style={{ ...thStyle, width: '60px' }}>이미지</th>
              <th style={thStyle}>제목</th>
              <th style={{ ...thStyle, width: '140px' }}>카테고리</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>활성</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>순서</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>로딩 중...</td></tr>
            ) : filteredCerts.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>인증서가 없습니다.</td></tr>
            ) : filteredCerts.map((cert, idx) => (
              <tr
                key={cert.id}
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
                  <img
                    src={`/images/certifications/${cert.image}`}
                    alt={cert.title}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                    onError={(e) => { e.target.style.opacity = 0.3; }}
                  />
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '500' }}>{cert.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.15rem' }}>{cert.image}</div>
                </td>
                <td style={tdStyle}>
                  <span style={countBadgeStyle}>{cert.category?.label || '-'}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleActive(cert)}
                    style={{ ...toggleStyle, background: cert.isActive ? '#3b82f6' : '#d1d5db', border: 'none', cursor: 'pointer' }}
                    aria-label="활성 토글"
                  >
                    <span style={{ ...toggleKnobStyle, transform: cert.isActive ? 'translateX(18px)' : 'translateX(2px)' }} />
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>{cert.order}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => handleEdit(cert)} style={actionBtn('#3b82f6')}>수정</button>
                  <button onClick={() => handleDelete(cert.id)} style={actionBtn('#ef4444')}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// =============================================
// 카테고리 관리 탭
// =============================================
function CategoriesTab() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ key: '', label: '', isActive: true });

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);

  useEffect(() => { fetchCats(); }, []);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/certification-categories?includeAll=true');
      const data = await res.json();
      setCats(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.key || !formData.label) {
      alert('key, label은 필수입니다.');
      return;
    }
    try {
      const url = editing ? `/api/certification-categories/${editing.id}` : '/api/certification-categories';
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
      fetchCats();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const res = await fetch(`/api/certification-categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      fetchCats();
    } catch (error) { alert(error.message); }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setFormData({ key: cat.key, label: cat.label, isActive: cat.isActive });
    setShowForm(true);
  };

  const handleDelete = async (cat) => {
    if (cat._count?.certifications > 0) {
      alert(`이 카테고리에 인증서 ${cat._count.certifications}건이 있어 삭제할 수 없습니다.`);
      return;
    }
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/certification-categories/${cat.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '삭제에 실패했습니다.');
      }
      fetchCats();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ key: '', label: '', isActive: true });
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
    const reordered = [...cats];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    setCats(reordered.map((c, i) => ({ ...c, order: i })));
    setPendingOrderIds(reordered.map(c => c.id));
    setOrderChanged(true);
    resetDragState();
  };
  const handleDragEnd = () => resetDragState();
  const resetDragState = () => { setDragIndex(null); setDragOverIndex(null); };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/certification-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: pendingOrderIds }),
      });
      if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
      setOrderChanged(false); setPendingOrderIds([]);
      fetchCats();
    } catch (error) { alert(error.message); }
    setSavingOrder(false);
  };
  const cancelOrder = () => { setOrderChanged(false); setPendingOrderIds([]); fetchCats(); };

  return (
    <>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          총 <strong style={{ color: '#111827' }}>{cats.length}</strong>개 카테고리
        </p>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={primaryBtnStyle}>+ 카테고리 추가</button>
      </div>

      {orderChanged && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#92400e', fontSize: '0.9rem' }}>순서가 변경되었습니다.</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={cancelOrder} style={{ ...secondaryBtnStyle, padding: '0.4rem 1rem' }}>취소</button>
            <button onClick={saveOrder} disabled={savingOrder} style={{ ...primaryBtnStyle, padding: '0.4rem 1rem', opacity: savingOrder ? 0.6 : 1 }}>
              {savingOrder ? '저장 중...' : '순서 저장'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editing ? '카테고리 수정' : '카테고리 추가'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Key (영문 슬러그) *</label>
                <input
                  style={inputStyle}
                  value={formData.key}
                  required
                  placeholder="예: system, product, etc"
                  onChange={e => setFormData(p => ({ ...p, key: e.target.value }))}
                />
              </div>
              <div>
                <label style={labelStyle}>표시명 *</label>
                <input
                  style={inputStyle}
                  value={formData.label}
                  required
                  placeholder="예: 시스템 인증"
                  onChange={e => setFormData(p => ({ ...p, label: e.target.value }))}
                />
              </div>
              <div>
                <label style={labelStyle}>활성 여부</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{formData.isActive ? '활성' : '비활성'}</span>
                </label>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={primaryBtnStyle}>{editing ? '수정' : '등록'}</button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={secondaryBtnStyle}>취소</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}></th>
              <th style={thStyle}>표시명</th>
              <th style={{ ...thStyle, width: '180px' }}>Key</th>
              <th style={{ ...thStyle, width: '100px', textAlign: 'center' }}>인증서</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>활성</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>순서</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>로딩 중...</td></tr>
            ) : cats.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>카테고리가 없습니다.</td></tr>
            ) : cats.map((cat, idx) => (
              <tr
                key={cat.id}
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
                <td style={{ ...tdStyle, fontWeight: '500' }}>{cat.label}</td>
                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#6b7280', fontSize: '0.85rem' }}>{cat.key}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={countBadgeStyle}>{cat._count?.certifications || 0}건</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleActive(cat)}
                    style={{ ...toggleStyle, background: cat.isActive ? '#3b82f6' : '#d1d5db', border: 'none', cursor: 'pointer' }}
                    aria-label="활성 토글"
                  >
                    <span style={{ ...toggleKnobStyle, transform: cat.isActive ? 'translateX(18px)' : 'translateX(2px)' }} />
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>{cat.order}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => handleEdit(cat)} style={actionBtn('#3b82f6')}>수정</button>
                  <button onClick={() => handleDelete(cat)} style={actionBtn('#ef4444')}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// === 스타일 상수 (categories/page.js와 동일 톤) ===
const primaryBtnStyle = {
  background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
  borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
};
const secondaryBtnStyle = {
  background: 'white', color: '#374151', padding: '0.5rem 1rem',
  borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem',
};
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const countBadgeStyle = {
  display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px',
  fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6',
};
const actionBtn = (color) => ({
  background: 'transparent', color, border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', marginRight: '0.5rem', textDecoration: 'underline',
});
const toggleStyle = {
  display: 'inline-block', width: '36px', height: '20px', borderRadius: '10px',
  position: 'relative', transition: 'background 0.2s ease',
};
const toggleKnobStyle = {
  width: '16px', height: '16px', borderRadius: '50%', background: 'white',
  position: 'absolute', top: '2px', transition: 'transform 0.2s ease',
  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
};
