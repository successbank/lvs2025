'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 카테고리 필터
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);

  // 트리 펼침/접기
  const [expandedIds, setExpandedIds] = useState(new Set());

  // 폼
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    modelName: '', name: '', slug: '', description: '', summary: '',
    categoryId: '', manufacturer: 'LVS', origin: '대한민국',
    isNew: false, isFeatured: false,
  });

  // 드래그 앤 드롭
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const selectedParent = categories.find(c => c.id === selectedParentId);
  const isFiltered = selectedParentId !== null;
  const pageLimit = isFiltered ? 200 : 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedParentId, selectedChildId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?page=${currentPage}&limit=${isFiltered ? 200 : 20}`;
      if (selectedChildId) {
        url += `&categoryId=${selectedChildId}`;
      } else if (selectedParentId) {
        const parent = categories.find(c => c.id === selectedParentId);
        if (parent) url += `&category=${parent.slug}`;
      }
      const res = await fetch(url);
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

  // === 트리 헬퍼 ===
  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sumChildProducts = (cat) => {
    const own = cat._count?.products || 0;
    const childSum = (cat.children || []).reduce((s, c) => s + (c._count?.products || 0), 0);
    return own + childSum;
  };

  // === 카테고리 선택 핸들러 ===
  const handleSelectParent = (parentId) => {
    setSelectedParentId(parentId);
    setSelectedChildId(null);
    setCurrentPage(1);
    setOrderChanged(false);
    // 자동 펼침
    if (parentId) {
      setExpandedIds(prev => new Set(prev).add(parentId));
    }
  };

  const handleSelectChild = (childId, parentId) => {
    setSelectedParentId(parentId);
    setSelectedChildId(childId);
    setCurrentPage(1);
    setOrderChanged(false);
  };

  // === 드래그 앤 드롭 핸들러 ===
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
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newProducts = [...products];
    const [dragged] = newProducts.splice(dragIndex, 1);
    newProducts.splice(dropIndex, 0, dragged);
    setProducts(newProducts);
    setOrderChanged(true);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const orderedIds = products.map(p => p.id);
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
      setOrderChanged(false);
    } catch (error) {
      alert(error.message);
    }
    setSavingOrder(false);
  };

  const cancelOrder = () => {
    setOrderChanged(false);
    fetchProducts();
  };

  // === 폼 핸들러 ===
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

  const handleAddProduct = () => {
    resetForm();
    // 현재 선택된 카테고리를 폼에 미리 설정
    if (selectedChildId) {
      setFormData(prev => ({ ...prev, categoryId: selectedChildId }));
    } else if (selectedParentId) {
      setFormData(prev => ({ ...prev, categoryId: selectedParentId }));
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  // 카테고리 flat 리스트 (폼 셀렉트용)
  const flatCategories = categories.reduce((acc, cat) => {
    acc.push(cat);
    if (cat.children) acc.push(...cat.children);
    return acc;
  }, []);

  // 현재 필터 표시 텍스트
  const filterText = selectedChildId
    ? `${selectedParent?.name} > ${selectedParent?.children?.find(c => c.id === selectedChildId)?.name}`
    : selectedParent?.name || '';

  const colCount = isFiltered ? 7 : 8;

  // 전체 제품 수 합산
  const totalProductCount = categories.reduce((sum, cat) => sum + sumChildProducts(cat), 0);

  return (
    <AdminLayout title="제품 관리">
      {/* 헤더 */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          총 <strong style={{ color: '#111827' }}>{pagination.total || 0}</strong>개 제품
          {isFiltered && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#3b82f6' }}>
              ({filterText})
            </span>
          )}
        </p>
        <button onClick={handleAddProduct} style={primaryBtnStyle}>+ 제품 추가</button>
      </div>

      {/* 분할 레이아웃: 트리 + 제품 패널 */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>

        {/* 좌측: 카테고리 트리 패널 */}
        <div style={treePanelStyle}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            카테고리
          </div>

          {/* 전체 노드 */}
          <div
            onClick={() => handleSelectParent(null)}
            style={treeNodeStyle(selectedParentId === null && selectedChildId === null)}
          >
            <span style={{ fontSize: '0.85rem' }}>전체</span>
            <span style={treeBadgeStyle}>{totalProductCount}</span>
          </div>

          {/* 루트 카테고리 */}
          {categories.map(cat => {
            const isExpanded = expandedIds.has(cat.id);
            const isSelected = selectedParentId === cat.id && selectedChildId === null;
            const hasChildren = cat.children && cat.children.length > 0;

            return (
              <div key={cat.id}>
                {/* 부모 노드 */}
                <div
                  onClick={() => handleSelectParent(cat.id)}
                  style={treeNodeStyle(isSelected)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
                    {hasChildren ? (
                      <span
                        onClick={(e) => toggleExpand(cat.id, e)}
                        style={treeArrowStyle}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    ) : (
                      <span style={{ width: '16px', display: 'inline-block' }} />
                    )}
                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                  </div>
                  <span style={treeBadgeStyle}>{sumChildProducts(cat)}</span>
                </div>

                {/* 자식 노드 */}
                {hasChildren && isExpanded && (
                  <div>
                    {cat.children.map(child => {
                      const isChildSelected = selectedChildId === child.id;
                      return (
                        <div
                          key={child.id}
                          onClick={() => handleSelectChild(child.id, cat.id)}
                          style={{
                            ...treeNodeStyle(isChildSelected),
                            paddingLeft: '2rem',
                          }}
                        >
                          <span style={{ fontSize: '0.83rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                            {child.name}
                          </span>
                          <span style={treeBadgeStyle}>{child._count?.products || 0}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 우측: 제품 패널 */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* 순서 변경 알림바 */}
          {orderChanged && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px',
              padding: '0.75rem 1rem', marginBottom: '1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: '#92400e', fontSize: '0.9rem' }}>
                순서가 변경되었습니다. 저장하지 않으면 변경사항이 사라집니다.
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={cancelOrder} style={{ ...secondaryBtnStyle, padding: '0.4rem 1rem' }}>
                  취소
                </button>
                <button onClick={saveOrder} disabled={savingOrder}
                  style={{ ...primaryBtnStyle, padding: '0.4rem 1rem', opacity: savingOrder ? 0.6 : 1 }}>
                  {savingOrder ? '저장 중...' : '순서 저장'}
                </button>
              </div>
            </div>
          )}

          {/* 제품 등록/수정 폼 */}
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
                  <button type="submit" style={primaryBtnStyle}>
                    {editingProduct ? '수정' : '등록'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }}
                    style={secondaryBtnStyle}>
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 제품 테이블 */}
          <div style={{
            background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}></th>
                  <th style={{ ...thStyle, width: '56px' }}>이미지</th>
                  <th style={thStyle}>모델명</th>
                  <th style={thStyle}>제품명</th>
                  {!isFiltered && <th style={thStyle}>카테고리</th>}
                  <th style={{ ...thStyle, width: '100px' }}>상태</th>
                  <th style={{ ...thStyle, width: '60px', textAlign: 'center' }}>조회수</th>
                  <th style={{ ...thStyle, width: '110px', textAlign: 'center' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={colCount} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                      로딩 중...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={colCount} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                      제품이 없습니다.
                    </td>
                  </tr>
                ) : products.map((product, index) => {
                  const isDragging = dragIndex === index;
                  const isDragOver = dragOverIndex === index && dragIndex !== null;
                  const insertAbove = isDragOver && dragIndex > index;
                  const insertBelow = isDragOver && dragIndex < index;

                  return (
                    <tr
                      key={product.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{
                        borderBottom: insertBelow ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderTop: insertAbove ? '2px solid #3b82f6' : 'none',
                        opacity: isDragging ? 0.4 : 1,
                        background: isDragOver ? '#eff6ff' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* 드래그 핸들 */}
                      <td style={{
                        ...tdStyle, textAlign: 'center', cursor: 'grab',
                        color: '#9ca3af', userSelect: 'none', fontSize: '1.1rem',
                      }}>
                        ⠿
                      </td>
                      {/* 썸네일 */}
                      <td style={{ ...tdStyle, padding: '0.4rem 0.5rem' }}>
                        {product.mainImage ? (
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            draggable={false}
                            style={{
                              width: '44px', height: '44px', objectFit: 'cover',
                              borderRadius: '4px', display: 'block', border: '1px solid #e5e7eb',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '44px', height: '44px', background: '#f9fafb', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#d1d5db', fontSize: '0.65rem', border: '1px solid #e5e7eb',
                          }}>
                            No img
                          </div>
                        )}
                      </td>
                      {/* 모델명 */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '500', color: '#111827' }}>{product.modelName}</span>
                      </td>
                      {/* 제품명 */}
                      <td style={tdStyle}>{product.name}</td>
                      {/* 카테고리 (전체 보기에서만) */}
                      {!isFiltered && (
                        <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>
                          {product.category?.name || '-'}
                        </td>
                      )}
                      {/* 상태 */}
                      <td style={tdStyle}>
                        {product.isNew && <span style={badgeStyle('#3b82f6')}>NEW</span>}
                        {product.isFeatured && <span style={badgeStyle('#f59e0b')}>추천</span>}
                        {!product.isNew && !product.isFeatured && <span style={{ color: '#d1d5db' }}>-</span>}
                      </td>
                      {/* 조회수 */}
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>
                        {product.viewCount}
                      </td>
                      {/* 관리 */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button onClick={() => handleEdit(product)} style={actionBtn('#3b82f6')}>수정</button>
                        <button onClick={() => handleDelete(product.id)} style={actionBtn('#ef4444')}>삭제</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 드래그 안내 */}
          {!loading && products.length > 1 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.75rem' }}>
              행을 드래그하여 제품 노출 순서를 변경할 수 있습니다
            </p>
          )}

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => { setCurrentPage(i + 1); setOrderChanged(false); }}
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

        </div>{/* 우측 패널 끝 */}

      </div>{/* 분할 레이아웃 끝 */}

    </AdminLayout>
  );
}

// === 스타일 상수 ===
const primaryBtnStyle = {
  background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
  borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
};
const secondaryBtnStyle = {
  background: 'white', color: '#374151', padding: '0.5rem 1rem',
  borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem',
};
// === 트리 스타일 상수 ===
const treePanelStyle = {
  width: '280px', minWidth: '280px', background: 'white', borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem',
  position: 'sticky', top: '1rem', alignSelf: 'flex-start',
  maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
};
const treeNodeStyle = (active) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.45rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
  background: active ? '#eff6ff' : 'transparent',
  borderRight: active ? '3px solid #3b82f6' : '3px solid transparent',
  color: active ? '#1d4ed8' : '#374151',
  fontWeight: active ? '600' : '400',
  transition: 'all 0.12s ease',
  marginBottom: '1px',
});
const treeArrowStyle = {
  fontSize: '0.6rem', color: '#9ca3af', cursor: 'pointer',
  width: '16px', textAlign: 'center', userSelect: 'none',
  flexShrink: 0,
};
const treeBadgeStyle = {
  fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6',
  padding: '0.1rem 0.45rem', borderRadius: '9999px', flexShrink: 0,
  marginLeft: '0.5rem',
};
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const badgeStyle = (bg) => ({
  display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px',
  fontSize: '0.75rem', color: 'white', background: bg, marginRight: '0.25rem',
});
const actionBtn = (color) => ({
  background: 'transparent', color, border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', marginRight: '0.5rem', textDecoration: 'underline',
});
