'use client';

import { useState, useEffect } from 'react';
import {
  primaryBtnStyle, secondaryBtnStyle, labelStyle, inputStyle,
  thStyle, tdStyle, badgeStyle, actionBtn,
  treePanelStyle, treeNodeStyle, treeArrowStyle, treeBadgeStyle,
} from './styles';

export default function ProductManagementTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    modelName: '', name: '', slug: '', description: '', summary: '',
    categoryId: '', manufacturer: 'LVS', origin: '대한민국',
    isNew: false, isFeatured: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const selectedParent = categories.find(c => c.id === selectedParentId);
  const isFiltered = selectedParentId !== null;

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [currentPage, selectedParentId, selectedChildId, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?page=${currentPage}&limit=${isFiltered ? 200 : 20}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
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

  const handleSearch = (e) => { e.preventDefault(); setSearchQuery(searchInput.trim()); setCurrentPage(1); };
  const clearSearch = () => { setSearchInput(''); setSearchQuery(''); setCurrentPage(1); };

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

  const handleSelectParent = (parentId) => {
    setSelectedParentId(parentId); setSelectedChildId(null); setCurrentPage(1); setOrderChanged(false);
    if (parentId) setExpandedIds(prev => new Set(prev).add(parentId));
  };
  const handleSelectChild = (childId, parentId) => {
    setSelectedParentId(parentId); setSelectedChildId(childId); setCurrentPage(1); setOrderChanged(false);
  };

  const handleDragStart = (e, index) => { setDragIndex(index); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', index.toString()); };
  const handleDragOver = (e, index) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverIndex !== index) setDragOverIndex(index); };
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); setDragOverIndex(null); return; }
    const newProducts = [...products];
    const [dragged] = newProducts.splice(dragIndex, 1);
    newProducts.splice(dropIndex, 0, dragged);
    setProducts(newProducts); setOrderChanged(true); setDragIndex(null); setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const orderedIds = products.map(p => p.id);
      const res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderedIds }) });
      if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
      setOrderChanged(false);
    } catch (error) { alert(error.message); }
    setSavingOrder(false);
  };
  const cancelOrder = () => { setOrderChanged(false); fetchProducts(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('저장에 실패했습니다.');
      setShowForm(false); setEditingProduct(null); resetForm(); fetchProducts();
    } catch (error) { alert(error.message); }
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

  const handleToggleActive = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    } catch (error) { alert(error.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchProducts();
    } catch (error) { alert(error.message); }
  };

  const resetForm = () => {
    setFormData({ modelName: '', name: '', slug: '', description: '', summary: '', categoryId: '', manufacturer: 'LVS', origin: '대한민국', isNew: false, isFeatured: false });
  };

  const handleAddProduct = () => {
    resetForm();
    if (selectedChildId) setFormData(prev => ({ ...prev, categoryId: selectedChildId }));
    else if (selectedParentId) setFormData(prev => ({ ...prev, categoryId: selectedParentId }));
    setEditingProduct(null); setShowForm(true);
  };

  const flatCategories = categories.reduce((acc, cat) => { acc.push(cat); if (cat.children) acc.push(...cat.children); return acc; }, []);
  const filterText = selectedChildId
    ? `${selectedParent?.name} > ${selectedParent?.children?.find(c => c.id === selectedChildId)?.name}`
    : selectedParent?.name || '';
  const colCount = isFiltered ? 8 : 9;
  const totalProductCount = categories.reduce((sum, cat) => sum + sumChildProducts(cat), 0);

  return (
    <>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          총 <strong style={{ color: '#111827' }}>{pagination.total || 0}</strong>개 제품
          {isFiltered && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#3b82f6' }}>({filterText})</span>
          )}
        </p>
        <button onClick={handleAddProduct} style={primaryBtnStyle}>+ 제품 추가</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* 카테고리 트리 */}
        <div style={treePanelStyle}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>카테고리</div>
          <div onClick={() => handleSelectParent(null)} style={treeNodeStyle(selectedParentId === null && selectedChildId === null)}>
            <span style={{ fontSize: '0.85rem' }}>전체</span>
            <span style={treeBadgeStyle}>{totalProductCount}</span>
          </div>
          {categories.map(cat => {
            const isExpanded = expandedIds.has(cat.id);
            const isSelected = selectedParentId === cat.id && selectedChildId === null;
            const hasChildren = cat.children && cat.children.length > 0;
            return (
              <div key={cat.id}>
                <div onClick={() => handleSelectParent(cat.id)} style={treeNodeStyle(isSelected)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
                    {hasChildren ? (
                      <span onClick={(e) => toggleExpand(cat.id, e)} style={treeArrowStyle}>{isExpanded ? '▼' : '▶'}</span>
                    ) : (
                      <span style={{ width: '16px', display: 'inline-block' }} />
                    )}
                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                  </div>
                  <span style={treeBadgeStyle}>{sumChildProducts(cat)}</span>
                </div>
                {hasChildren && isExpanded && (
                  <div>
                    {cat.children.map(child => (
                      <div key={child.id} onClick={() => handleSelectChild(child.id, cat.id)} style={{ ...treeNodeStyle(selectedChildId === child.id), paddingLeft: '2rem' }}>
                        <span style={{ fontSize: '0.83rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{child.name}</span>
                        <span style={treeBadgeStyle}>{child._count?.products || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 제품 패널 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 검색바 */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="모델명, 제품명으로 검색..." style={{ width: '100%', padding: '0.6rem 0.75rem', paddingRight: searchInput ? '2rem' : '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', background: 'white' }} />
              {searchInput && (
                <button type="button" onClick={clearSearch} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem' }}>×</button>
              )}
            </div>
            <button type="submit" style={{ ...primaryBtnStyle, padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}>검색</button>
          </form>

          {searchQuery && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1e40af', fontSize: '0.9rem' }}>"<strong>{searchQuery}</strong>" 검색 결과: <strong>{pagination.total || 0}</strong>건</span>
              <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'underline' }}>검색 초기화</button>
            </div>
          )}

          {orderChanged && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#92400e', fontSize: '0.9rem' }}>순서가 변경되었습니다. 저장하지 않으면 변경사항이 사라집니다.</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={cancelOrder} style={{ ...secondaryBtnStyle, padding: '0.4rem 1rem' }}>취소</button>
                <button onClick={saveOrder} disabled={savingOrder} style={{ ...primaryBtnStyle, padding: '0.4rem 1rem', opacity: savingOrder ? 0.6 : 1 }}>{savingOrder ? '저장 중...' : '순서 저장'}</button>
              </div>
            </div>
          )}

          {showForm && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{editingProduct ? '제품 수정' : '제품 추가'}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>모델명 *</label>
                    <input style={inputStyle} value={formData.modelName} required onChange={e => setFormData(p => ({ ...p, modelName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>제품명 *</label>
                    <input style={inputStyle} value={formData.name} required onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>슬러그 *</label>
                    <input style={inputStyle} value={formData.slug} required onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>카테고리 *</label>
                    <select style={inputStyle} value={formData.categoryId} required onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))}>
                      <option value="">선택</option>
                      {flatCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.parentId ? '  └ ' : ''}{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>제조사</label>
                    <input style={inputStyle} value={formData.manufacturer} onChange={e => setFormData(p => ({ ...p, manufacturer: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>원산지</label>
                    <input style={inputStyle} value={formData.origin} onChange={e => setFormData(p => ({ ...p, origin: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>요약</label>
                    <input style={inputStyle} value={formData.summary} onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>설명</label>
                    <textarea style={{ ...inputStyle, height: '80px' }} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={formData.isNew} onChange={e => setFormData(p => ({ ...p, isNew: e.target.checked }))} /> NEW 뱃지
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} /> 추천 제품
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" style={primaryBtnStyle}>{editingProduct ? '수정' : '등록'}</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} style={secondaryBtnStyle}>취소</button>
                </div>
              </form>
            </div>
          )}

          {/* 제품 테이블 */}
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}></th>
                  <th style={{ ...thStyle, width: '56px' }}>이미지</th>
                  <th style={thStyle}>모델명</th>
                  <th style={thStyle}>제품명</th>
                  {!isFiltered && <th style={thStyle}>카테고리</th>}
                  <th style={{ ...thStyle, width: '100px' }}>상태</th>
                  <th style={{ ...thStyle, width: '60px', textAlign: 'center' }}>활성</th>
                  <th style={{ ...thStyle, width: '60px', textAlign: 'center' }}>조회수</th>
                  <th style={{ ...thStyle, width: '110px', textAlign: 'center' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={colCount} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={colCount} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>제품이 없습니다.</td></tr>
                ) : products.map((product, index) => {
                  const isDragging = dragIndex === index;
                  const isDragOver = dragOverIndex === index && dragIndex !== null;
                  const insertAbove = isDragOver && dragIndex > index;
                  const insertBelow = isDragOver && dragIndex < index;
                  return (
                    <tr key={product.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} style={{ borderBottom: insertBelow ? '2px solid #3b82f6' : '1px solid #e5e7eb', borderTop: insertAbove ? '2px solid #3b82f6' : 'none', opacity: isDragging ? 0.4 : product.isActive === false ? 0.5 : 1, background: isDragOver ? '#eff6ff' : product.isActive === false ? '#fafafa' : 'transparent', transition: 'background 0.15s ease' }}>
                      <td style={{ ...tdStyle, textAlign: 'center', cursor: 'grab', color: '#9ca3af', userSelect: 'none', fontSize: '1.1rem' }}>⠿</td>
                      <td style={{ ...tdStyle, padding: '0.4rem 0.5rem' }}>
                        <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" draggable={false} onClick={(e) => e.stopPropagation()} title="소비자 페이지 보기">
                          {product.mainImage ? (
                            <img src={product.mainImage} alt={product.name} draggable={false} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', display: 'block', border: '1px solid #e5e7eb', cursor: 'pointer' }} />
                          ) : (
                            <div style={{ width: '44px', height: '44px', background: '#f9fafb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: '0.65rem', border: '1px solid #e5e7eb', cursor: 'pointer' }}>No img</div>
                          )}
                        </a>
                      </td>
                      <td style={tdStyle}><span style={{ fontWeight: '500', color: '#111827' }}>{product.modelName}</span></td>
                      <td style={tdStyle}>{product.name}</td>
                      {!isFiltered && <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{product.category?.name || '-'}</td>}
                      <td style={tdStyle}>
                        {product.isNew && <span style={badgeStyle('#3b82f6')}>NEW</span>}
                        {product.isFeatured && <span style={badgeStyle('#f59e0b')}>추천</span>}
                        {product.seriesData?.series?.length > 0 && <span style={badgeStyle('#8b5cf6')}>시리즈</span>}
                        {!product.isNew && !product.isFeatured && !(product.seriesData?.series?.length > 0) && <span style={{ color: '#d1d5db' }}>-</span>}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div onClick={() => handleToggleActive(product)} style={{
                          display: 'inline-block', width: '36px', height: '20px', borderRadius: '10px',
                          background: product.isActive ? '#3b82f6' : '#d1d5db', cursor: 'pointer',
                          position: 'relative', transition: 'background 0.2s ease',
                        }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                            position: 'absolute', top: '2px', transition: 'transform 0.2s ease',
                            transform: product.isActive ? 'translateX(16px)' : 'translateX(2px)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          }} />
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>{product.viewCount}</td>
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

          {!loading && products.length > 1 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.75rem' }}>행을 드래그하여 제품 노출 순서를 변경할 수 있습니다</p>
          )}

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => { setCurrentPage(i + 1); setOrderChanged(false); }} style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', background: currentPage === i + 1 ? '#3b82f6' : 'white', color: currentPage === i + 1 ? 'white' : '#374151', cursor: 'pointer' }}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
