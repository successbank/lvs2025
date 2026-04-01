'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminCategories() {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <AdminLayout title="카테고리 / 메뉴 관리">
      {/* 탭 네비게이션 */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: activeTab === 'categories' ? '600' : '400',
            color: activeTab === 'categories' ? '#3b82f6' : '#6b7280',
            borderBottom: activeTab === 'categories' ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px', fontSize: '0.95rem',
          }}
        >
          카테고리 관리
        </button>
        <button
          onClick={() => setActiveTab('menus')}
          style={{
            padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: activeTab === 'menus' ? '600' : '400',
            color: activeTab === 'menus' ? '#3b82f6' : '#6b7280',
            borderBottom: activeTab === 'menus' ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px', fontSize: '0.95rem',
          }}
        >
          메뉴 관리
        </button>
      </div>

      {activeTab === 'categories' ? <CategoriesTab /> : <MenusTab />}
    </AdminLayout>
  );
}

// =============================================
// 카테고리 관리 탭 (기존 코드)
// =============================================
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', parentId: '', order: 0,
  });

  const [dragLevel, setDragLevel] = useState(null);
  const [dragParentId, setDragParentId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);

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
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
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

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name, slug: cat.slug, description: cat.description || '',
      parentId: cat.parentId || '', order: cat.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까? 하위 카테고리도 함께 삭제됩니다.')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', parentId: '', order: 0 });
    setEditingCategory(null);
  };

  const parentCategories = categories.filter(c => !c.parentId);

  // 드래그 앤 드롭 — 부모 레벨
  const handleParentDragStart = (e, index) => {
    setDragLevel('parent'); setDragParentId(null); setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleParentDragOver = (e, index) => {
    e.preventDefault();
    if (dragLevel !== 'parent') return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleParentDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragLevel !== 'parent' || dragIndex === null || dragIndex === dropIndex) { resetDragState(); return; }
    const reordered = [...parentCategories];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    const newCategories = categories.map(c => {
      if (!c.parentId) {
        const newIndex = reordered.findIndex(r => r.id === c.id);
        return { ...c, order: newIndex };
      }
      return c;
    });
    setCategories(newCategories);
    setPendingOrderIds(reordered.map(c => c.id));
    setOrderChanged(true);
    resetDragState();
  };

  // 드래그 앤 드롭 — 자식 레벨
  const handleChildDragStart = (e, parentId, index) => {
    setDragLevel('child'); setDragParentId(parentId); setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleChildDragOver = (e, parentId, index) => {
    e.preventDefault();
    if (dragLevel !== 'child' || dragParentId !== parentId) return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleChildDrop = (e, parentId, dropIndex) => {
    e.preventDefault();
    if (dragLevel !== 'child' || dragParentId !== parentId || dragIndex === null || dragIndex === dropIndex) { resetDragState(); return; }
    const parent = categories.find(c => c.id === parentId);
    if (!parent || !parent.children) { resetDragState(); return; }
    const reordered = [...parent.children];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    const newCategories = categories.map(c => {
      if (c.id === parentId) {
        return { ...c, children: reordered.map((child, i) => ({ ...child, order: i })) };
      }
      return c;
    });
    setCategories(newCategories);
    setPendingOrderIds(reordered.map(c => c.id));
    setOrderChanged(true);
    resetDragState();
  };

  const handleDragEnd = () => { resetDragState(); };
  const resetDragState = () => {
    setDragIndex(null); setDragOverIndex(null); setDragLevel(null); setDragParentId(null);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: pendingOrderIds }),
      });
      if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
      setOrderChanged(false); setPendingOrderIds([]);
      fetchCategories();
    } catch (error) { alert(error.message); }
    setSavingOrder(false);
  };

  const cancelOrder = () => {
    setOrderChanged(false); setPendingOrderIds([]);
    fetchCategories();
  };

  return (
    <>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          총 <strong style={{ color: '#111827' }}>{parentCategories.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0)}</strong>개 카테고리
        </p>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={primaryBtnStyle}>+ 카테고리 추가</button>
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
          <h3 style={{ marginBottom: '1rem' }}>{editingCategory ? '카테고리 수정' : '카테고리 추가'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>카테고리명 *</label>
                <input style={inputStyle} value={formData.name} required onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>슬러그 *</label>
                <input style={inputStyle} value={formData.slug} required onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>부모 카테고리</label>
                <select style={inputStyle} value={formData.parentId} onChange={e => setFormData(p => ({ ...p, parentId: e.target.value }))}>
                  <option value="">없음 (최상위)</option>
                  {parentCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>정렬 순서</label>
                <input type="number" style={inputStyle} value={formData.order} onChange={e => setFormData(p => ({ ...p, order: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>설명</label>
                <input style={inputStyle} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={primaryBtnStyle}>{editingCategory ? '수정' : '등록'}</button>
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
              <th style={thStyle}>카테고리명</th>
              <th style={thStyle}>슬러그</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>제품수</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>순서</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
            ) : parentCategories.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>카테고리가 없습니다.</td></tr>
            ) : parentCategories.map((category, pIndex) => {
              const isPDragging = dragLevel === 'parent' && dragIndex === pIndex;
              const isPDragOver = dragLevel === 'parent' && dragOverIndex === pIndex && dragIndex !== null;
              const pInsertAbove = isPDragOver && dragIndex > pIndex;
              const pInsertBelow = isPDragOver && dragIndex < pIndex;
              return (
                <CategoryGroup key={category.id}>
                  <tr draggable onDragStart={(e) => handleParentDragStart(e, pIndex)} onDragOver={(e) => handleParentDragOver(e, pIndex)} onDrop={(e) => handleParentDrop(e, pIndex)} onDragEnd={handleDragEnd}
                    style={{ background: isPDragOver ? '#eff6ff' : '#f9fafb', borderTop: pInsertAbove ? '2px solid #3b82f6' : 'none', borderBottom: pInsertBelow ? '2px solid #3b82f6' : '1px solid #e5e7eb', opacity: isPDragging ? 0.4 : 1, transition: 'background 0.15s ease' }}>
                    <td style={{ ...tdStyle, textAlign: 'center', cursor: 'grab', color: '#9ca3af', userSelect: 'none', fontSize: '1.1rem' }}>⠿</td>
                    <td style={tdStyle}><span style={{ fontWeight: '600', color: '#111827' }}>{category.name}</span></td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>/{category.slug}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={countBadgeStyle}>{(category._count?.products || 0) + (category.children || []).reduce((s, c) => s + (c._count?.products || 0), 0)}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>{category.order}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button onClick={() => handleEdit(category)} style={actionBtn('#3b82f6')}>수정</button>
                      <button onClick={() => handleDelete(category.id)} style={actionBtn('#ef4444')}>삭제</button>
                    </td>
                  </tr>
                  {category.children && category.children.map((child, cIndex) => {
                    const isCDragging = dragLevel === 'child' && dragParentId === category.id && dragIndex === cIndex;
                    const isCDragOver = dragLevel === 'child' && dragParentId === category.id && dragOverIndex === cIndex && dragIndex !== null;
                    const cInsertAbove = isCDragOver && dragIndex > cIndex;
                    const cInsertBelow = isCDragOver && dragIndex < cIndex;
                    return (
                      <tr key={child.id} draggable onDragStart={(e) => handleChildDragStart(e, category.id, cIndex)} onDragOver={(e) => handleChildDragOver(e, category.id, cIndex)} onDrop={(e) => handleChildDrop(e, category.id, cIndex)} onDragEnd={handleDragEnd}
                        style={{ borderTop: cInsertAbove ? '2px solid #3b82f6' : 'none', borderBottom: cInsertBelow ? '2px solid #3b82f6' : '1px solid #f3f4f6', opacity: isCDragging ? 0.4 : 1, background: isCDragOver ? '#eff6ff' : 'white', transition: 'background 0.15s ease' }}>
                        <td style={{ ...tdStyle, textAlign: 'center', cursor: 'grab', color: '#d1d5db', userSelect: 'none', fontSize: '1rem' }}>⠿</td>
                        <td style={{ ...tdStyle, paddingLeft: '2.5rem' }}><span style={{ color: '#6b7280' }}>└</span> <span style={{ color: '#374151' }}>{child.name}</span></td>
                        <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '0.85rem' }}>/{child.slug}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}><span style={countBadgeStyle}>{child._count?.products || 0}</span></td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>{child.order}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button onClick={() => handleEdit(child)} style={actionBtn('#3b82f6')}>수정</button>
                          <button onClick={() => handleDelete(child.id)} style={actionBtn('#ef4444')}>삭제</button>
                        </td>
                      </tr>
                    );
                  })}
                </CategoryGroup>
              );
            })}
          </tbody>
        </table>
      </div>

      {!loading && parentCategories.length > 0 && (
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.75rem' }}>
          행을 드래그하여 카테고리 순서를 변경할 수 있습니다 (같은 레벨 내에서만 이동)
        </p>
      )}
    </>
  );
}

// =============================================
// 메뉴 관리 탭
// =============================================
function MenusTab() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: '', url: '', type: 'link', parentId: '', order: 0,
  });

  const [dragLevel, setDragLevel] = useState(null);
  const [dragParentId, setDragParentId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);

  useEffect(() => { fetchMenuItems(); }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu-items?includeAll=true');
      const data = await res.json();
      setMenuItems(data.menuItems || []);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
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
      fetchMenuItems();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      label: item.label, url: item.url, type: item.type,
      parentId: item.parentId || '', order: item.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까? 하위 메뉴도 함께 삭제됩니다.')) return;
    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchMenuItems();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      fetchMenuItems();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ label: '', url: '', type: 'link', parentId: '', order: 0 });
    setEditingItem(null);
  };

  const topLevelMenus = menuItems;

  // 드래그 앤 드롭 — 부모 레벨
  const handleParentDragStart = (e, index) => {
    setDragLevel('parent'); setDragParentId(null); setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleParentDragOver = (e, index) => {
    e.preventDefault();
    if (dragLevel !== 'parent') return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleParentDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragLevel !== 'parent' || dragIndex === null || dragIndex === dropIndex) { resetDragState(); return; }
    const reordered = [...topLevelMenus];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    setMenuItems(reordered.map((item, i) => ({ ...item, order: i })));
    setPendingOrderIds(reordered.map(c => c.id));
    setOrderChanged(true);
    resetDragState();
  };

  // 드래그 앤 드롭 — 자식 레벨
  const handleChildDragStart = (e, parentId, index) => {
    setDragLevel('child'); setDragParentId(parentId); setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleChildDragOver = (e, parentId, index) => {
    e.preventDefault();
    if (dragLevel !== 'child' || dragParentId !== parentId) return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleChildDrop = (e, parentId, dropIndex) => {
    e.preventDefault();
    if (dragLevel !== 'child' || dragParentId !== parentId || dragIndex === null || dragIndex === dropIndex) { resetDragState(); return; }
    const parent = menuItems.find(c => c.id === parentId);
    if (!parent || !parent.children) { resetDragState(); return; }
    const reordered = [...parent.children];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    setMenuItems(menuItems.map(c => {
      if (c.id === parentId) return { ...c, children: reordered.map((child, i) => ({ ...child, order: i })) };
      return c;
    }));
    setPendingOrderIds(reordered.map(c => c.id));
    setOrderChanged(true);
    resetDragState();
  };

  const handleDragEnd = () => { resetDragState(); };
  const resetDragState = () => {
    setDragIndex(null); setDragOverIndex(null); setDragLevel(null); setDragParentId(null);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/menu-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: pendingOrderIds }),
      });
      if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
      setOrderChanged(false); setPendingOrderIds([]);
      fetchMenuItems();
    } catch (error) { alert(error.message); }
    setSavingOrder(false);
  };

  const cancelOrder = () => {
    setOrderChanged(false); setPendingOrderIds([]);
    fetchMenuItems();
  };

  return (
    <>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <p style={{ color: '#1e40af', fontSize: '0.85rem', margin: 0 }}>
          사이트 상단 네비게이션에 표시되는 메뉴를 관리합니다. 유형이 <strong>"드롭다운"</strong>인 메뉴는 하위 메뉴를 가질 수 있습니다.
        </p>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          총 <strong style={{ color: '#111827' }}>{topLevelMenus.reduce((sum, m) => sum + 1 + (m.children?.length || 0), 0)}</strong>개 메뉴 항목
        </p>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={primaryBtnStyle}>+ 메뉴 추가</button>
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
          <h3 style={{ marginBottom: '1rem' }}>{editingItem ? '메뉴 수정' : '메뉴 추가'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>메뉴명 *</label>
                <input style={inputStyle} value={formData.label} required onChange={e => setFormData(p => ({ ...p, label: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>URL *</label>
                <input style={inputStyle} value={formData.url} required placeholder="/products/general-lighting" onChange={e => setFormData(p => ({ ...p, url: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>유형</label>
                <select style={inputStyle} value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}>
                  <option value="link">링크</option>
                  <option value="dropdown">드롭다운</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>상위 메뉴</label>
                <select style={inputStyle} value={formData.parentId} onChange={e => setFormData(p => ({ ...p, parentId: e.target.value }))}>
                  <option value="">없음 (최상위)</option>
                  {topLevelMenus.filter(m => m.type === 'dropdown').map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>정렬 순서</label>
                <input type="number" style={inputStyle} value={formData.order} onChange={e => setFormData(p => ({ ...p, order: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={primaryBtnStyle}>{editingItem ? '수정' : '등록'}</button>
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
              <th style={thStyle}>메뉴명</th>
              <th style={thStyle}>URL</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>유형</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>활성</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>순서</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
            ) : topLevelMenus.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>메뉴 항목이 없습니다.</td></tr>
            ) : topLevelMenus.map((item, pIndex) => {
              const isPDragging = dragLevel === 'parent' && dragIndex === pIndex;
              const isPDragOver = dragLevel === 'parent' && dragOverIndex === pIndex && dragIndex !== null;
              const pInsertAbove = isPDragOver && dragIndex > pIndex;
              const pInsertBelow = isPDragOver && dragIndex < pIndex;
              return (
                <CategoryGroup key={item.id}>
                  <tr draggable onDragStart={(e) => handleParentDragStart(e, pIndex)} onDragOver={(e) => handleParentDragOver(e, pIndex)} onDrop={(e) => handleParentDrop(e, pIndex)} onDragEnd={handleDragEnd}
                    style={{ background: isPDragOver ? '#eff6ff' : '#f9fafb', borderTop: pInsertAbove ? '2px solid #3b82f6' : 'none', borderBottom: pInsertBelow ? '2px solid #3b82f6' : '1px solid #e5e7eb', opacity: isPDragging ? 0.4 : 1, transition: 'background 0.15s ease' }}>
                    <td style={{ ...tdStyle, textAlign: 'center', cursor: 'grab', color: '#9ca3af', userSelect: 'none', fontSize: '1.1rem' }}>⠿</td>
                    <td style={tdStyle}><span style={{ fontWeight: '600', color: '#111827' }}>{item.label}</span></td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{item.url}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', color: item.type === 'dropdown' ? '#7c3aed' : '#059669', background: item.type === 'dropdown' ? '#ede9fe' : '#ecfdf5' }}>
                        {item.type === 'dropdown' ? '드롭다운' : '링크'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div onClick={() => handleToggleActive(item)} style={{ ...toggleStyle, background: item.isActive ? '#3b82f6' : '#d1d5db', cursor: 'pointer' }}>
                        <div style={{ ...toggleKnobStyle, transform: item.isActive ? 'translateX(16px)' : 'translateX(2px)' }} />
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>{item.order}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button onClick={() => handleEdit(item)} style={actionBtn('#3b82f6')}>수정</button>
                      <button onClick={() => handleDelete(item.id)} style={actionBtn('#ef4444')}>삭제</button>
                    </td>
                  </tr>
                  {item.children && item.children.map((child, cIndex) => {
                    const isCDragging = dragLevel === 'child' && dragParentId === item.id && dragIndex === cIndex;
                    const isCDragOver = dragLevel === 'child' && dragParentId === item.id && dragOverIndex === cIndex && dragIndex !== null;
                    const cInsertAbove = isCDragOver && dragIndex > cIndex;
                    const cInsertBelow = isCDragOver && dragIndex < cIndex;
                    return (
                      <tr key={child.id} draggable onDragStart={(e) => handleChildDragStart(e, item.id, cIndex)} onDragOver={(e) => handleChildDragOver(e, item.id, cIndex)} onDrop={(e) => handleChildDrop(e, item.id, cIndex)} onDragEnd={handleDragEnd}
                        style={{ borderTop: cInsertAbove ? '2px solid #3b82f6' : 'none', borderBottom: cInsertBelow ? '2px solid #3b82f6' : '1px solid #f3f4f6', opacity: isCDragging ? 0.4 : 1, background: isCDragOver ? '#eff6ff' : 'white', transition: 'background 0.15s ease' }}>
                        <td style={{ ...tdStyle, textAlign: 'center', cursor: 'grab', color: '#d1d5db', userSelect: 'none', fontSize: '1rem' }}>⠿</td>
                        <td style={{ ...tdStyle, paddingLeft: '2.5rem' }}><span style={{ color: '#6b7280' }}>└</span> <span style={{ color: '#374151' }}>{child.label}</span></td>
                        <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '0.85rem' }}>{child.url}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', color: '#059669', background: '#ecfdf5' }}>링크</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div onClick={() => handleToggleActive(child)} style={{ ...toggleStyle, background: child.isActive ? '#3b82f6' : '#d1d5db', cursor: 'pointer' }}>
                            <div style={{ ...toggleKnobStyle, transform: child.isActive ? 'translateX(16px)' : 'translateX(2px)' }} />
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>{child.order}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button onClick={() => handleEdit(child)} style={actionBtn('#3b82f6')}>수정</button>
                          <button onClick={() => handleDelete(child.id)} style={actionBtn('#ef4444')}>삭제</button>
                        </td>
                      </tr>
                    );
                  })}
                </CategoryGroup>
              );
            })}
          </tbody>
        </table>
      </div>

      {!loading && topLevelMenus.length > 0 && (
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.75rem' }}>
          행을 드래그하여 메뉴 순서를 변경할 수 있습니다 (같은 레벨 내에서만 이동)
        </p>
      )}
    </>
  );
}

// Fragment 래퍼
function CategoryGroup({ children }) {
  return <>{children}</>;
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
