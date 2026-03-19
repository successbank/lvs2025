'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminSliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    type: 'TEXT_IMAGE', title: '', description: '', imageUrl: '', link: '', isActive: true, order: 0,
  });

  // 이미지 업로드 관련 상태
  const [imageUploadMode, setImageUploadMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchSliders(); }, []);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sliders');
      const data = await res.json();
      setSliders(data.sliders || []);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    }
    setLoading(false);
  };

  // ── 이미지 업로드 ──
  const handleImageUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('허용되지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 로컬 미리보기 즉시 표시
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/sliders/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '업로드 실패');
      }
      const { url } = await res.json();
      setFormData(p => ({ ...p, imageUrl: url }));
      setImagePreview(url);
    } catch (error) {
      alert(error.message);
      setImagePreview('');
      setFormData(p => ({ ...p, imageUrl: '' }));
    }
    setUploading(false);
  };

  // ── 드래그 앤 드롭 ──
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
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // ── 활성/비활성 토글 ──
  const handleToggleActive = async (slider) => {
    try {
      const res = await fetch(`/api/sliders/${slider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slider.isActive }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      fetchSliders();
    } catch (error) {
      alert(error.message);
    }
  };

  // ── 순서 이동 ──
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    try {
      const res = await fetch('/api/sliders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliderId1: sliders[index].id,
          sliderId2: sliders[targetIndex].id,
        }),
      });
      if (!res.ok) throw new Error('순서 변경에 실패했습니다.');
      fetchSliders();
    } catch (error) {
      alert(error.message);
    }
  };

  // ── 폼 제출 ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      alert('이미지를 업로드하거나 URL을 입력해주세요.');
      return;
    }

    try {
      let order = parseInt(formData.order) || 0;

      // 신규 추가 시 order 자동 할당
      if (!editingSlider) {
        const maxOrder = sliders.reduce((max, s) => Math.max(max, s.order), 0);
        order = maxOrder + 1;
      }

      const url = editingSlider ? `/api/sliders/${editingSlider.id}` : '/api/sliders';
      const method = editingSlider ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, order }),
      });
      if (!res.ok) throw new Error('저장에 실패했습니다.');

      setShowForm(false);
      setEditingSlider(null);
      resetForm();
      fetchSliders();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      type: slider.type || 'TEXT_IMAGE',
      title: slider.title,
      description: slider.description || '',
      imageUrl: slider.imageUrl,
      link: slider.link || '',
      isActive: slider.isActive,
      order: slider.order,
    });
    setImagePreview(slider.imageUrl || '');
    setImageUploadMode(slider.imageUrl?.startsWith('/uploads/') ? 'upload' : 'url');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/sliders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchSliders();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ type: 'TEXT_IMAGE', title: '', description: '', imageUrl: '', link: '', isActive: true, order: 0 });
    setImagePreview('');
    setImageUploadMode('upload');
    setDragActive(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AdminLayout title="슬라이더 관리">
      {/* 헤더 */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280' }}>총 {sliders.length}개 슬라이더</p>
        <button
          onClick={() => { resetForm(); setEditingSlider(null); setShowForm(true); }}
          style={{
            background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
          }}
        >
          + 슬라이더 추가
        </button>
      </div>

      {/* ── 폼 ── */}
      {showForm && (
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            {editingSlider ? '슬라이더 수정' : '슬라이더 추가'}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* 슬라이더 유형 선택 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>슬라이더 유형</label>
              <div style={{ display: 'flex', gap: '0' }}>
                <button type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'TEXT_IMAGE' }))}
                  style={typeTabStyle(formData.type === 'TEXT_IMAGE')}
                >
                  텍스트 + 이미지
                </button>
                <button type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'FULL_IMAGE' }))}
                  style={{ ...typeTabStyle(formData.type === 'FULL_IMAGE'), borderRadius: '0 6px 6px 0', borderLeft: 'none' }}
                >
                  통이미지 배너
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                {formData.type === 'FULL_IMAGE'
                  ? '전체 영역을 채우는 단일 이미지. 권장: 1920×600px, WebP/JPG, 200KB 이하'
                  : '좌측 텍스트 + 우측 제품 이미지 형태의 기본 배너'}
              </p>
            </div>

            {/* 제목 + 링크 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  {formData.type === 'FULL_IMAGE' ? '대체 텍스트 (alt)' : '제목 *'}
                </label>
                <input style={inputStyle} value={formData.title}
                  required={formData.type === 'TEXT_IMAGE'}
                  placeholder={formData.type === 'FULL_IMAGE' ? '이미지 설명 (접근성용)' : ''}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>
                  {formData.type === 'FULL_IMAGE' ? '클릭 시 이동 링크' : '링크'}
                </label>
                <input style={inputStyle} value={formData.link} placeholder="https://..."
                  onChange={e => setFormData(p => ({ ...p, link: e.target.value }))} />
              </div>
            </div>

            {/* 이미지 입력 — 탭 전환 */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>
                이미지 *
                {formData.type === 'FULL_IMAGE' && (
                  <span style={{ fontWeight: '400', color: '#9ca3af', marginLeft: '0.5rem' }}>
                    (권장 1920×600px)
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: '0', marginBottom: '0.5rem' }}>
                <button type="button"
                  onClick={() => setImageUploadMode('upload')}
                  style={{
                    padding: '0.4rem 1rem', border: '1px solid #d1d5db', cursor: 'pointer',
                    borderRadius: '4px 0 0 4px', fontSize: '0.85rem',
                    background: imageUploadMode === 'upload' ? '#3b82f6' : 'white',
                    color: imageUploadMode === 'upload' ? 'white' : '#374151',
                    borderRight: imageUploadMode === 'upload' ? '1px solid #3b82f6' : 'none',
                  }}
                >
                  파일 업로드
                </button>
                <button type="button"
                  onClick={() => setImageUploadMode('url')}
                  style={{
                    padding: '0.4rem 1rem', border: '1px solid #d1d5db', cursor: 'pointer',
                    borderRadius: '0 4px 4px 0', fontSize: '0.85rem',
                    background: imageUploadMode === 'url' ? '#3b82f6' : 'white',
                    color: imageUploadMode === 'url' ? 'white' : '#374151',
                  }}
                >
                  URL 직접 입력
                </button>
              </div>

              {imageUploadMode === 'upload' ? (
                /* 드래그 앤 드롭 업로드 영역 */
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
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
                      if (e.target.files[0]) handleImageUpload(e.target.files[0]);
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
                        JPG, PNG, WebP, GIF (최대 5MB)
                      </p>
                    </>
                  )}
                </div>
              ) : (
                /* URL 직접 입력 */
                <input
                  style={inputStyle}
                  value={formData.imageUrl}
                  placeholder="https://example.com/image.jpg"
                  onChange={e => {
                    setFormData(p => ({ ...p, imageUrl: e.target.value }));
                    setImagePreview(e.target.value);
                  }}
                />
              )}
            </div>

            {/* 이미지 미리보기 + 설명/활성화 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: formData.type === 'FULL_IMAGE' ? '1fr' : '240px 1fr',
              gap: '1rem', marginTop: '1rem',
            }}>
              <div>
                <label style={labelStyle}>미리보기</label>
                <div style={{
                  width: formData.type === 'FULL_IMAGE' ? '100%' : '240px',
                  height: formData.type === 'FULL_IMAGE' ? '180px' : '120px',
                  background: '#f3f4f6',
                  borderRadius: '6px', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setImagePreview('')}
                    />
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>이미지 없음</span>
                  )}
                </div>
                {formData.type === 'FULL_IMAGE' && (
                  <div style={{
                    marginTop: '0.5rem', padding: '0.5rem 0.75rem',
                    background: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd',
                  }}>
                    <p style={{ fontSize: '0.75rem', color: '#0369a1', margin: 0 }}>
                      <strong>통이미지 가이드:</strong> 1920×600px | 비율 3.2:1 | WebP/JPG | 200KB 이하
                    </p>
                  </div>
                )}
              </div>
              {formData.type === 'TEXT_IMAGE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>설명</label>
                    <textarea
                      style={{ ...inputStyle, height: '60px', resize: 'vertical' }}
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.isActive}
                      onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
                    <span style={{ fontSize: '0.9rem' }}>활성화</span>
                  </label>
                </div>
              )}
              {formData.type === 'FULL_IMAGE' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                  <input type="checkbox" checked={formData.isActive}
                    onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
                  <span style={{ fontSize: '0.9rem' }}>활성화</span>
                </label>
              )}
            </div>

            {/* 버튼 */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={submitBtnStyle}>
                {editingSlider ? '수정' : '등록'}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditingSlider(null); resetForm(); }}
                style={cancelBtnStyle}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 카드 리스트 ── */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
            로딩 중...
          </div>
        ) : sliders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px', color: '#9ca3af' }}>
            슬라이더가 없습니다.
          </div>
        ) : sliders.map((slider, index) => (
          <div key={slider.id} style={{
            background: 'white', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'stretch', overflow: 'hidden',
          }}>
            {/* 좌측 컬러 바 — 활성(초록) / 비활성(빨강) */}
            <div style={{
              width: '4px', flexShrink: 0,
              background: slider.isActive ? '#22c55e' : '#ef4444',
            }} />

            {/* 순서 번호 배지 */}
            <div style={{
              width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '700', color: '#6b7280',
              }}>
                {index + 1}
              </span>
            </div>

            {/* 썸네일 */}
            <div style={{
              width: '200px', height: '100px', background: '#f3f4f6',
              flexShrink: 0, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {slider.imageUrl ? (
                <img
                  src={slider.imageUrl}
                  alt={slider.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>이미지 없음</span>
              )}
            </div>

            {/* 정보 */}
            <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: '600' }}>{slider.title}</span>
                {slider.type === 'FULL_IMAGE' && (
                  <span style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                    background: '#fef3c7', color: '#92400e', fontWeight: '600',
                  }}>
                    통이미지
                  </span>
                )}
              </div>
              {slider.description && (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.15rem' }}>
                  {slider.description}
                </p>
              )}
              {slider.link && (
                <p style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{slider.link}</p>
              )}
            </div>

            {/* 순서 이동 */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              gap: '2px', padding: '0 0.5rem', flexShrink: 0,
            }}>
              <button
                onClick={() => handleMove(index, -1)}
                disabled={index === 0}
                style={arrowBtnStyle(index === 0)}
                title="위로 이동"
              >
                &#9650;
              </button>
              <button
                onClick={() => handleMove(index, 1)}
                disabled={index === sliders.length - 1}
                style={arrowBtnStyle(index === sliders.length - 1)}
                title="아래로 이동"
              >
                &#9660;
              </button>
            </div>

            {/* 활성 토글 + 수정/삭제 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0 1rem', flexShrink: 0,
            }}>
              <button
                onClick={() => handleToggleActive(slider)}
                style={{
                  padding: '0.3rem 0.6rem', borderRadius: '4px', border: 'none',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500',
                  background: slider.isActive ? '#dcfce7' : '#fee2e2',
                  color: slider.isActive ? '#16a34a' : '#dc2626',
                }}
              >
                {slider.isActive ? '활성' : '비활성'}
              </button>
              <button onClick={() => handleEdit(slider)} style={actionBtnStyle('#3b82f6')}>수정</button>
              <button onClick={() => handleDelete(slider.id)} style={actionBtnStyle('#ef4444')}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

// ── 스타일 상수 ──
const typeTabStyle = (active) => ({
  padding: '0.5rem 1.2rem', border: `1px solid ${active ? '#3b82f6' : '#d1d5db'}`,
  cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? '600' : '400',
  background: active ? '#3b82f6' : 'white', color: active ? 'white' : '#374151',
  borderRadius: '6px 0 0 6px', transition: 'all 0.15s ease',
});
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const submitBtnStyle = { background: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' };
const cancelBtnStyle = { background: '#6b7280', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' };
const actionBtnStyle = (color) => ({
  background: 'transparent', color, border: `1px solid ${color}`, borderRadius: '4px',
  padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem',
});
const arrowBtnStyle = (disabled) => ({
  background: disabled ? '#f3f4f6' : 'white',
  color: disabled ? '#d1d5db' : '#6b7280',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  width: '28px', height: '28px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '0.7rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
