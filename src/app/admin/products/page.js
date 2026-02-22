'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    modelName: '', name: '', slug: '', description: '', summary: '',
    categoryId: '', manufacturer: 'LVS', origin: '대한민국',
    isNew: false, isFeatured: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${currentPage}&limit=20`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?includeChildren=true');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('저장에 실패했습니다.');

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      modelName: product.modelName, name: product.name, slug: product.slug,
      description: product.description || '', summary: product.summary || '',
      categoryId: product.categoryId, manufacturer: product.manufacturer,
      origin: product.origin, isNew: product.isNew, isFeatured: product.isFeatured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      modelName: '', name: '', slug: '', description: '', summary: '',
      categoryId: '', manufacturer: 'LVS', origin: '대한민국',
      isNew: false, isFeatured: false,
    });
  };

  // 모든 카테고리를 flat 리스트로 변환
  const flatCategories = categories.reduce((acc, cat) => {
    acc.push(cat);
    if (cat.children) acc.push(...cat.children);
    return acc;
  }, []);

  return (
    <AdminLayout title="제품 관리">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ color: '#6b7280' }}>총 {pagination.total || 0}개 제품</p>
        <button
          onClick={() => { resetForm(); setEditingProduct(null); setShowForm(true); }}
          style={{
            background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
            borderRadius: '4px', border: 'none', cursor: 'pointer',
          }}
        >
          + 제품 추가
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
        }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingProduct ? '제품 수정' : '제품 추가'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>모델명 *</label>
                <input style={inputStyle} value={formData.modelName} required
                  onChange={e => setFormData(p => ({ ...p, modelName: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>제품명 *</label>
                <input style={inputStyle} value={formData.name} required
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>슬러그 *</label>
                <input style={inputStyle} value={formData.slug} required
                  onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>카테고리 *</label>
                <select style={inputStyle} value={formData.categoryId} required
                  onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">선택</option>
                  {flatCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parentId ? '  └ ' : ''}{cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>제조사</label>
                <input style={inputStyle} value={formData.manufacturer}
                  onChange={e => setFormData(p => ({ ...p, manufacturer: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>원산지</label>
                <input style={inputStyle} value={formData.origin}
                  onChange={e => setFormData(p => ({ ...p, origin: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>요약</label>
                <input style={inputStyle} value={formData.summary}
                  onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>설명</label>
                <textarea style={{ ...inputStyle, height: '80px' }} value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={formData.isNew}
                    onChange={e => setFormData(p => ({ ...p, isNew: e.target.checked }))} />
                  NEW 뱃지
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={formData.isFeatured}
                    onChange={e => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} />
                  추천 제품
                </label>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={{
                background: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
              }}>
                {editingProduct ? '수정' : '등록'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }}
                style={{
                  background: '#6b7280', color: 'white', padding: '0.5rem 1.5rem',
                  borderRadius: '4px', border: 'none', cursor: 'pointer',
                }}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={thStyle}>모델명</th>
              <th style={thStyle}>제품명</th>
              <th style={thStyle}>카테고리</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>조회수</th>
              <th style={thStyle}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>제품이 없습니다.</td></tr>
            ) : products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{product.modelName}</td>
                <td style={tdStyle}>{product.name}</td>
                <td style={tdStyle}>{product.category?.name || '-'}</td>
                <td style={tdStyle}>
                  {product.isNew && <span style={badgeStyle('#3b82f6')}>NEW</span>}
                  {product.isFeatured && <span style={badgeStyle('#f59e0b')}>추천</span>}
                </td>
                <td style={tdStyle}>{product.viewCount}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleEdit(product)} style={actionBtn('#3b82f6')}>수정</button>
                  <button onClick={() => handleDelete(product.id)} style={actionBtn('#ef4444')}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db',
                background: currentPage === i + 1 ? '#3b82f6' : 'white',
                color: currentPage === i + 1 ? 'white' : '#374151',
                cursor: 'pointer',
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const badgeStyle = (bg) => ({
  display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px',
  fontSize: '0.75rem', color: 'white', background: bg, marginRight: '0.25rem',
});
const actionBtn = (color) => ({
  background: 'transparent', color, border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', marginRight: '0.5rem', textDecoration: 'underline',
});
