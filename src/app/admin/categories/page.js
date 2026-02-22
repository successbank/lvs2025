'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', parentId: '', order: 0,
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?includeChildren=true');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
          order: parseInt(formData.order) || 0,
        }),
      });
      if (!res.ok) throw new Error('저장에 실패했습니다.');
      setShowForm(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', parentId: '', order: 0 });
    setEditingCategory(null);
  };

  // 부모 카테고리만 필터링 (parentId가 null인 것)
  const parentCategories = categories.filter(c => !c.parentId);

  return (
    <AdminLayout title="카테고리 관리">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ color: '#6b7280' }}>총 {categories.length}개 카테고리</p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
            borderRadius: '4px', border: 'none', cursor: 'pointer',
          }}
        >
          + 카테고리 추가
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
        }}>
          <h3 style={{ marginBottom: '1rem' }}>카테고리 추가</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>카테고리명 *</label>
                <input style={inputStyle} value={formData.name} required
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>슬러그 *</label>
                <input style={inputStyle} value={formData.slug} required
                  onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>부모 카테고리</label>
                <select style={inputStyle} value={formData.parentId}
                  onChange={e => setFormData(p => ({ ...p, parentId: e.target.value }))}>
                  <option value="">없음 (최상위)</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>정렬 순서</label>
                <input type="number" style={inputStyle} value={formData.order}
                  onChange={e => setFormData(p => ({ ...p, order: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>설명</label>
                <input style={inputStyle} value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={submitBtnStyle}>등록</button>
              <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>취소</button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>카테고리가 없습니다.</div>
        ) : (
          <div style={{ padding: '1rem' }}>
            {parentCategories.map(category => (
              <div key={category.id} style={{ marginBottom: '1rem' }}>
                <div style={{
                  padding: '0.75rem 1rem', background: '#f3f4f6', borderRadius: '6px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontWeight: '600',
                }}>
                  <span>{category.name} <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '0.85rem' }}>/{category.slug}</span></span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>순서: {category.order}</span>
                </div>
                {category.children && category.children.length > 0 && (
                  <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    {category.children.map(child => (
                      <div key={child.id} style={{
                        padding: '0.5rem 1rem', borderLeft: '2px solid #e5e7eb',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '0.9rem',
                      }}>
                        <span>└ {child.name} <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>/{child.slug}</span></span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>순서: {child.order}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const submitBtnStyle = { background: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' };
const cancelBtnStyle = { background: '#6b7280', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' };
