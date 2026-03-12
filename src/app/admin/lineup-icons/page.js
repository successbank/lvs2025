'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminLineupIcons() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({}); // { [categoryId]: true }
  const [uploadModal, setUploadModal] = useState(null); // categoryId or null
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?includeChildren=true&parentId=null');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
    setLoading(false);
  };

  // 자동 생성 (단일)
  const handleGenerate = async (categoryId) => {
    setProcessing(p => ({ ...p, [categoryId]: true }));
    try {
      const res = await fetch(`/api/categories/${categoryId}/generate-icon`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '자동 생성에 실패했습니다.');
      } else {
        await fetchCategories();
      }
    } catch (error) {
      alert('자동 생성 중 오류가 발생했습니다.');
    }
    setProcessing(p => ({ ...p, [categoryId]: false }));
  };

  // 전체 자동 생성
  const handleGenerateAll = async () => {
    if (!confirm('모든 카테고리의 아이콘을 자동 생성하시겠습니까?')) return;

    const allCats = [];
    categories.forEach(parent => {
      allCats.push(parent);
      if (parent.children) parent.children.forEach(child => allCats.push(child));
    });

    for (const cat of allCats) {
      await handleGenerate(cat.id);
    }
  };

  // 직접 업로드
  const handleUpload = async (file) => {
    if (!file || !uploadModal) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('허용되지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const uploadRes = await fetch('/api/categories/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || '업로드 실패');
      }
      const { url } = await uploadRes.json();

      // iconUrl 업데이트
      const updateRes = await fetch(`/api/categories/${uploadModal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iconUrl: url }),
      });
      if (!updateRes.ok) throw new Error('아이콘 업데이트 실패');

      setUploadModal(null);
      await fetchCategories();
    } catch (error) {
      alert(error.message);
    }
    setUploading(false);
  };

  // 아이콘 삭제
  const handleRemoveIcon = async (categoryId) => {
    if (!confirm('아이콘을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iconUrl: null }),
      });
      if (!res.ok) throw new Error('아이콘 삭제 실패');
      await fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  // 드래그 앤 드롭
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  // 카테고리 카드 렌더링
  const renderCategoryCard = (cat) => (
    <div key={cat.id} style={cardStyle}>
      <div style={cardIconArea}>
        {cat.iconUrl ? (
          <img
            src={cat.iconUrl}
            alt={cat.name}
            style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9ca3af', fontSize: '0.8rem',
          }}>
            아이콘 없음
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' }}>
        {cat.name}
      </div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => handleGenerate(cat.id)}
          disabled={processing[cat.id]}
          style={{
            ...smallBtnStyle,
            background: processing[cat.id] ? '#9ca3af' : '#3b82f6',
          }}
        >
          {processing[cat.id] ? '생성중...' : '자동생성'}
        </button>
        <button
          onClick={() => { setUploadModal(cat.id); }}
          style={{ ...smallBtnStyle, background: '#10b981' }}
        >
          업로드
        </button>
        {cat.iconUrl && (
          <button
            onClick={() => handleRemoveIcon(cat.id)}
            style={{ ...smallBtnStyle, background: '#ef4444' }}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout title="라인업 아이콘 관리">
      {/* 헤더 */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280' }}>
          각 카테고리의 아이콘을 관리합니다. 제품 썸네일에서 자동 생성하거나 직접 업로드할 수 있습니다.
        </p>
        <button onClick={handleGenerateAll} style={generateAllBtnStyle}>
          전체 자동 생성
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
          로딩 중...
        </div>
      ) : categories.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px', color: '#9ca3af' }}>
          카테고리가 없습니다.
        </div>
      ) : (
        categories.map((parent) => (
          <div key={parent.id} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
              {parent.name}
            </h3>

            {/* 부모 카테고리 카드 */}
            <div style={gridStyle}>
              {renderCategoryCard(parent)}

              {/* 자식 카테고리 카드 */}
              {parent.children && parent.children.map((child) => renderCategoryCard(child))}
            </div>
          </div>
        ))
      )}

      {/* 업로드 모달 */}
      {uploadModal && (
        <div
          style={overlayStyle}
          onClick={(e) => { if (e.target === e.currentTarget) setUploadModal(null); }}
        >
          <div style={modalStyle}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>아이콘 이미지 업로드</h3>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: '8px', padding: '2rem', textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? '#eff6ff' : '#f9fafb',
                transition: 'all 0.2s',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files[0]) handleUpload(e.target.files[0]);
                }}
              />
              {uploading ? (
                <p style={{ color: '#3b82f6', fontWeight: '500' }}>업로드 중...</p>
              ) : (
                <>
                  <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
                    클릭하거나 이미지를 드래그하여 업로드
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                    JPG, PNG, WebP, GIF (최대 5MB) → 200×200 WebP로 변환
                  </p>
                </>
              )}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button
                onClick={() => setUploadModal(null)}
                style={{ background: '#6b7280', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ── 스타일 상수 ──
const cardStyle = {
  background: 'white', borderRadius: '8px', padding: '1rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
};

const cardIconArea = {
  width: '100px', height: '100px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: '0.5rem',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '1rem',
};

const smallBtnStyle = {
  color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px',
  border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500',
};

const generateAllBtnStyle = {
  background: '#8b5cf6', color: 'white', padding: '0.5rem 1rem',
  borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
  whiteSpace: 'nowrap',
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalStyle = {
  background: 'white', borderRadius: '12px', padding: '1.5rem',
  width: '90%', maxWidth: '480px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};
