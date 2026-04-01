'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import TemplateSelector from '@/components/admin/popups/TemplateSelector';
import TemplateDataForm from '@/components/admin/popups/TemplateDataForm';
import TemplateRenderer from '@/components/admin/popups/TemplateRenderer';
import { getTemplate } from '@/lib/popupTemplates';

const POSITION_OPTIONS = [
  { value: 'TOP_LEFT', label: '좌상단' },
  { value: 'TOP_RIGHT', label: '우상단' },
  { value: 'CENTER', label: '중앙' },
  { value: 'BOTTOM_LEFT', label: '좌하단' },
  { value: 'BOTTOM_RIGHT', label: '우하단' },
];

const POSITION_LABEL = {
  CENTER: '중앙', TOP_LEFT: '좌상단', TOP_RIGHT: '우상단',
  BOTTOM_LEFT: '좌하단', BOTTOM_RIGHT: '우하단',
};

export default function AdminPopups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [formData, setFormData] = useState({
    title: '', imageUrl: '', mobileImageUrl: '',
    link: '', linkTarget: '_self',
    position: 'CENTER', width: 500, height: 500,
    startDate: '', endDate: '', isActive: true, order: 0,
  });

  // ── 팝업 모드: 'image' | 'template' ──
  const [popupMode, setPopupMode] = useState('image');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateData, setTemplateData] = useState({});

  // 이미지 업로드 상태
  const [imageUploadMode, setImageUploadMode] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // 모바일 이미지 업로드 상태
  const [mobileUploading, setMobileUploading] = useState(false);
  const [mobileImagePreview, setMobileImagePreview] = useState('');
  const [mobileDragActive, setMobileDragActive] = useState(false);
  const mobileFileInputRef = useRef(null);
  const [useMobileImage, setUseMobileImage] = useState(false);

  // 미리보기
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchPopups(); }, []);

  const fetchPopups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/popups');
      const data = await res.json();
      setPopups(data.popups || []);
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    }
    setLoading(false);
  };

  // ── 템플릿 선택 시 기본값 적용 ──
  const handleTemplateSelect = (templateId) => {
    const tmpl = getTemplate(templateId);
    if (!tmpl) return;

    // 기존과 다른 템플릿을 선택하면 데이터 초기화
    if (templateId !== selectedTemplateId) {
      setTemplateData({});
    }
    setSelectedTemplateId(templateId);

    // 템플릿 기본 크기/위치 적용
    setFormData(p => ({
      ...p,
      width: tmpl.defaultWidth,
      height: tmpl.defaultHeight,
      position: tmpl.defaultPosition,
    }));
  };

  // ── 모드 전환 시 상태 정리 ──
  const handleModeChange = (mode) => {
    setPopupMode(mode);
    if (mode === 'image') {
      setSelectedTemplateId(null);
      setTemplateData({});
    }
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

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('device', 'pc');
      const res = await fetch('/api/popups/upload', { method: 'POST', body: fd });
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

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
  };

  // ── 모바일 이미지 업로드 ──
  const handleMobileImageUpload = async (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) { alert('허용되지 않는 파일 형식입니다.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('파일 크기는 5MB를 초과할 수 없습니다.'); return; }

    setMobileImagePreview(URL.createObjectURL(file));
    setMobileUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('device', 'mobile');
      const res = await fetch('/api/popups/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || '업로드 실패');
      const { url } = await res.json();
      setFormData(p => ({ ...p, mobileImageUrl: url }));
      setMobileImagePreview(url);
    } catch (error) {
      alert(error.message);
      setMobileImagePreview('');
      setFormData(p => ({ ...p, mobileImageUrl: '' }));
    }
    setMobileUploading(false);
  };

  const handleMobileDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setMobileDragActive(true);
    if (e.type === 'dragleave') setMobileDragActive(false);
  };

  const handleMobileDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setMobileDragActive(false);
    if (e.dataTransfer.files?.[0]) handleMobileImageUpload(e.dataTransfer.files[0]);
  };

  // ── 활성/비활성 토글 ──
  const handleToggleActive = async (popup) => {
    try {
      const res = await fetch(`/api/popups/${popup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !popup.isActive }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      fetchPopups();
    } catch (error) {
      alert(error.message);
    }
  };

  // ── 순서 이동 ──
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= popups.length) return;

    try {
      const res = await fetch('/api/popups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          popupId1: popups[index].id,
          popupId2: popups[targetIndex].id,
        }),
      });
      if (!res.ok) throw new Error('순서 변경에 실패했습니다.');
      fetchPopups();
    } catch (error) {
      alert(error.message);
    }
  };

  // ── 폼 제출 ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 이미지 모드 검증
    if (popupMode === 'image' && !formData.imageUrl) {
      alert('이미지를 업로드하거나 URL을 입력해주세요.');
      return;
    }

    // 템플릿 모드 검증
    if (popupMode === 'template') {
      if (!selectedTemplateId) {
        alert('템플릿을 선택해주세요.');
        return;
      }
      if (!templateData.headline) {
        alert('제목(headline)을 입력해주세요.');
        return;
      }
    }

    try {
      let order = parseInt(formData.order) || 0;

      if (!editingPopup) {
        const maxOrder = popups.reduce((max, p) => Math.max(max, p.order), 0);
        order = maxOrder + 1;
      }

      const url = editingPopup ? `/api/popups/${editingPopup.id}` : '/api/popups';
      const method = editingPopup ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        order,
        mobileImageUrl: useMobileImage ? formData.mobileImageUrl : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        // 템플릿 모드일 때만 templateId/templateData 설정
        templateId: popupMode === 'template' ? selectedTemplateId : null,
        templateData: popupMode === 'template' ? templateData : null,
        // 템플릿 모드에서는 imageUrl이 null일 수 있음
        imageUrl: popupMode === 'template' ? (formData.imageUrl || null) : formData.imageUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      if (!res.ok) throw new Error('저장에 실패했습니다.');

      setShowForm(false);
      setEditingPopup(null);
      resetForm();
      fetchPopups();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (popup) => {
    setEditingPopup(popup);
    const toLocalDatetime = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setFormData({
      title: popup.title,
      imageUrl: popup.imageUrl || '',
      mobileImageUrl: popup.mobileImageUrl || '',
      link: popup.link || '',
      linkTarget: popup.linkTarget || '_self',
      position: popup.position || 'CENTER',
      width: popup.width || 500,
      height: popup.height || 500,
      startDate: toLocalDatetime(popup.startDate),
      endDate: toLocalDatetime(popup.endDate),
      isActive: popup.isActive,
      order: popup.order,
    });
    setImagePreview(popup.imageUrl || '');
    setMobileImagePreview(popup.mobileImageUrl || '');
    setImageUploadMode(popup.imageUrl?.startsWith('/uploads/') ? 'upload' : 'url');
    setUseMobileImage(!!popup.mobileImageUrl);

    // 템플릿 모드 감지
    if (popup.templateId && popup.templateData) {
      setPopupMode('template');
      setSelectedTemplateId(popup.templateId);
      setTemplateData(popup.templateData);
    } else {
      setPopupMode('image');
      setSelectedTemplateId(null);
      setTemplateData({});
    }

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/popups/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchPopups();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', imageUrl: '', mobileImageUrl: '',
      link: '', linkTarget: '_self',
      position: 'CENTER', width: 500, height: 500,
      startDate: '', endDate: '', isActive: true, order: 0,
    });
    setImagePreview('');
    setMobileImagePreview('');
    setImageUploadMode('upload');
    setDragActive(false);
    setMobileDragActive(false);
    setUseMobileImage(false);
    setShowPreview(false);
    setPopupMode('image');
    setSelectedTemplateId(null);
    setTemplateData({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // ── 미리보기 위치 스타일 ──
  const getPreviewPositionStyle = () => {
    const base = { position: 'absolute' };
    switch (formData.position) {
      case 'TOP_LEFT': return { ...base, top: '80px', left: '20px' };
      case 'TOP_RIGHT': return { ...base, top: '80px', right: '20px' };
      case 'BOTTOM_LEFT': return { ...base, bottom: '20px', left: '20px' };
      case 'BOTTOM_RIGHT': return { ...base, bottom: '20px', right: '20px' };
      default: return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <AdminLayout title="레이어 팝업 관리">
      {/* 헤더 */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#6b7280' }}>총 {popups.length}개 팝업</p>
        <button
          onClick={() => { resetForm(); setEditingPopup(null); setShowForm(true); }}
          style={{
            background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
          }}
        >
          + 팝업 추가
        </button>
      </div>

      {/* ── 폼 ── */}
      {showForm && (
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            {editingPopup ? '팝업 수정' : '팝업 추가'}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* 제목 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>제목 *</label>
              <input style={inputStyle} value={formData.title} required
                placeholder="관리용 팝업 제목"
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>

            {/* ── 모드 선택 탭 ── */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>팝업 유형</label>
              <div style={{ display: 'flex', gap: '0', marginBottom: '0.75rem' }}>
                <button type="button"
                  onClick={() => handleModeChange('image')}
                  style={{
                    padding: '0.5rem 1.25rem', cursor: 'pointer',
                    borderRadius: '6px 0 0 6px', fontSize: '0.88rem', fontWeight: '500',
                    border: '1px solid #d1d5db',
                    background: popupMode === 'image' ? '#3b82f6' : 'white',
                    color: popupMode === 'image' ? 'white' : '#374151',
                    borderRight: popupMode === 'image' ? '1px solid #3b82f6' : 'none',
                  }}
                >
                  이미지 팝업
                </button>
                <button type="button"
                  onClick={() => handleModeChange('template')}
                  style={{
                    padding: '0.5rem 1.25rem', cursor: 'pointer',
                    borderRadius: '0 6px 6px 0', fontSize: '0.88rem', fontWeight: '500',
                    border: '1px solid #d1d5db',
                    background: popupMode === 'template' ? '#8b5cf6' : 'white',
                    color: popupMode === 'template' ? 'white' : '#374151',
                  }}
                >
                  템플릿 팝업
                </button>
              </div>
            </div>

            {/* ═══ 이미지 모드 ═══ */}
            {popupMode === 'image' && (
              <>
                {/* 이미지 입력 — 탭 전환 */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>PC 이미지 *</label>
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
                    <div
                      onDragEnter={handleDrag} onDragOver={handleDrag}
                      onDragLeave={handleDrag} onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
                        borderRadius: '8px', padding: '2rem', textAlign: 'center',
                        cursor: 'pointer', background: dragActive ? '#eff6ff' : '#f9fafb',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input ref={fileInputRef} type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display: 'none' }}
                        onChange={(e) => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); }}
                      />
                      {uploading ? (
                        <p style={{ color: '#3b82f6', fontWeight: '500' }}>업로드 중...</p>
                      ) : (
                        <>
                          <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>클릭하거나 이미지를 드래그하여 업로드</p>
                          <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>JPG, PNG, WebP, GIF (최대 5MB)</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <input style={inputStyle} value={formData.imageUrl}
                      placeholder="https://example.com/image.jpg"
                      onChange={e => {
                        setFormData(p => ({ ...p, imageUrl: e.target.value }));
                        setImagePreview(e.target.value);
                      }}
                    />
                  )}
                </div>

                {/* 미리보기 + 모바일 이미지 */}
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>미리보기</label>
                    <div style={{
                      width: '200px', height: '150px', background: '#f3f4f6',
                      borderRadius: '6px', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="미리보기"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={() => setImagePreview('')} />
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>이미지 없음</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                      <input type="checkbox" checked={useMobileImage}
                        onChange={e => setUseMobileImage(e.target.checked)} />
                      <span style={{ fontSize: '0.9rem' }}>모바일 이미지 별도 등록</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>(미설정 시 PC 이미지 사용)</span>
                    </label>

                    {useMobileImage && (
                      <div style={{ padding: '1rem', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a' }}>
                        <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>모바일 이미지</label>
                        <div
                          onDragEnter={handleMobileDrag} onDragOver={handleMobileDrag}
                          onDragLeave={handleMobileDrag} onDrop={handleMobileDrop}
                          onClick={() => mobileFileInputRef.current?.click()}
                          style={{
                            border: `2px dashed ${mobileDragActive ? '#f59e0b' : '#d1d5db'}`,
                            borderRadius: '8px', padding: '1.5rem', textAlign: 'center',
                            cursor: 'pointer', background: mobileDragActive ? '#fef9c3' : 'white',
                            transition: 'all 0.2s',
                          }}
                        >
                          <input ref={mobileFileInputRef} type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            style={{ display: 'none' }}
                            onChange={(e) => { if (e.target.files[0]) handleMobileImageUpload(e.target.files[0]); }}
                          />
                          {mobileUploading ? (
                            <p style={{ color: '#f59e0b', fontWeight: '500' }}>업로드 중...</p>
                          ) : (
                            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>클릭하거나 모바일용 이미지를 드래그하여 업로드</p>
                          )}
                        </div>
                        {mobileImagePreview && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <div style={{
                              width: '150px', height: '100px', background: '#f3f4f6',
                              borderRadius: '6px', overflow: 'hidden',
                            }}>
                              <img src={mobileImagePreview} alt="모바일 미리보기"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                onError={() => setMobileImagePreview('')} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 링크 + 타겟 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>클릭 시 이동 링크</label>
                    <input style={inputStyle} value={formData.link} placeholder="https://..."
                      onChange={e => setFormData(p => ({ ...p, link: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>링크 타겟</label>
                    <select style={inputStyle} value={formData.linkTarget}
                      onChange={e => setFormData(p => ({ ...p, linkTarget: e.target.value }))}>
                      <option value="_self">현재 창</option>
                      <option value="_blank">새 창</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ═══ 템플릿 모드 ═══ */}
            {popupMode === 'template' && (
              <>
                {/* 템플릿 갤러리 */}
                <TemplateSelector
                  selectedId={selectedTemplateId}
                  onSelect={handleTemplateSelect}
                />

                {/* 템플릿 데이터 입력 */}
                {selectedTemplateId && (
                  <TemplateDataForm
                    templateId={selectedTemplateId}
                    data={templateData}
                    onChange={setTemplateData}
                  />
                )}
              </>
            )}

            {/* ═══ 공통: 위치/크기/기간/활성화 ═══ */}

            {/* 위치 선택 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>표시 위치</label>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 80px)',
                gridTemplateRows: 'repeat(3, 40px)', gap: '4px',
                justifyContent: 'start',
              }}>
                {['TOP_LEFT', null, 'TOP_RIGHT', null, 'CENTER', null, 'BOTTOM_LEFT', null, 'BOTTOM_RIGHT'].map((pos, i) => (
                  pos ? (
                    <button key={pos} type="button"
                      onClick={() => setFormData(p => ({ ...p, position: pos }))}
                      style={{
                        border: `2px solid ${formData.position === pos ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500',
                        background: formData.position === pos ? '#eff6ff' : 'white',
                        color: formData.position === pos ? '#3b82f6' : '#6b7280',
                        transition: 'all 0.15s',
                      }}
                    >
                      {POSITION_LABEL[pos]}
                    </button>
                  ) : (
                    <div key={`empty-${i}`} />
                  )
                ))}
              </div>
            </div>

            {/* 크기 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>너비 (px)</label>
                <input style={inputStyle} type="number" min="100" max="1200"
                  value={formData.width}
                  onChange={e => setFormData(p => ({ ...p, width: parseInt(e.target.value) || 500 }))} />
              </div>
              <div>
                <label style={labelStyle}>높이 (px)</label>
                <input style={inputStyle} type="number" min="100" max="1200"
                  value={formData.height}
                  onChange={e => setFormData(p => ({ ...p, height: parseInt(e.target.value) || 500 }))} />
              </div>
            </div>

            {/* 날짜 범위 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>시작일 <span style={{ fontWeight: '400', color: '#9ca3af' }}>(비워두면 즉시)</span></label>
                <input style={inputStyle} type="datetime-local" value={formData.startDate}
                  onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>종료일 <span style={{ fontWeight: '400', color: '#9ca3af' }}>(비워두면 무기한)</span></label>
                <input style={inputStyle} type="datetime-local" value={formData.endDate}
                  onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>

            {/* 활성화 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isActive}
                  onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
                <span style={{ fontSize: '0.9rem' }}>활성화</span>
              </label>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setShowPreview(true)} style={{
                background: '#8b5cf6', color: 'white', padding: '0.5rem 1rem',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
              }}>
                미리보기
              </button>
              <button type="submit" style={submitBtnStyle}>
                {editingPopup ? '수정' : '등록'}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditingPopup(null); resetForm(); }}
                style={cancelBtnStyle}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 미리보기 모달 ── */}
      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 15000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            position: 'relative', width: '90vw', height: '80vh',
            background: '#e5e7eb', borderRadius: '12px', overflow: 'hidden',
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '0.75rem 1rem', background: '#374151', color: 'white',
              fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>
                팝업 미리보기 — 유형: {popupMode === 'template' ? '템플릿' : '이미지'},
                위치: {POSITION_LABEL[formData.position]},
                크기: {formData.width}x{formData.height}px
              </span>
              <button onClick={() => setShowPreview(false)} style={{
                background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem',
              }}>✕</button>
            </div>
            <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 44px)' }}>
              <div style={{
                ...getPreviewPositionStyle(),
                width: `${Math.min(formData.width, 600)}px`,
                maxWidth: '90%',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}>
                {/* 콘텐츠: 템플릿 or 이미지 */}
                {popupMode === 'template' && selectedTemplateId ? (
                  <div style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
                    <TemplateRenderer templateId={selectedTemplateId} data={templateData} />
                  </div>
                ) : imagePreview ? (
                  <img src={imagePreview} alt="팝업 미리보기"
                    style={{ width: '100%', display: 'block' }} />
                ) : (
                  <div style={{
                    height: '200px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#9ca3af',
                  }}>
                    {popupMode === 'template' ? '템플릿을 선택하세요' : '이미지 없음'}
                  </div>
                )}
                <div style={{
                  padding: '0.75rem', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', borderTop: '1px solid #e5e7eb', fontSize: '0.85rem',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280' }}>
                    <input type="checkbox" disabled /> 오늘 하루 안 보기
                  </label>
                  <button style={{
                    background: '#6b7280', color: 'white', border: 'none',
                    padding: '0.35rem 1rem', borderRadius: '4px', cursor: 'pointer',
                  }}>닫기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 카드 리스트 ── */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
            로딩 중...
          </div>
        ) : popups.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px', color: '#9ca3af' }}>
            팝업이 없습니다.
          </div>
        ) : popups.map((popup, index) => (
          <div key={popup.id} style={{
            background: 'white', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'stretch', overflow: 'hidden',
          }}>
            {/* 좌측 컬러 바 */}
            <div style={{
              width: '4px', flexShrink: 0,
              background: popup.isActive ? '#22c55e' : '#ef4444',
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
              width: '120px', height: '90px', background: '#f3f4f6',
              flexShrink: 0, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {popup.templateId ? (
                <div style={{
                  transform: 'scale(0.22)', transformOrigin: 'top left',
                  width: '455%', height: '455%', pointerEvents: 'none',
                }}>
                  <TemplateRenderer templateId={popup.templateId} data={popup.templateData || {}} />
                </div>
              ) : popup.imageUrl ? (
                <img src={popup.imageUrl} alt={popup.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>이미지 없음</span>
              )}
            </div>

            {/* 정보 */}
            <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: '600' }}>{popup.title}</span>
                {popup.templateId && (
                  <span style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                    background: '#f3e8ff', color: '#7c3aed', fontWeight: '600',
                  }}>
                    템플릿
                  </span>
                )}
                <span style={{
                  fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                  background: '#e0e7ff', color: '#3730a3', fontWeight: '600',
                }}>
                  {POSITION_LABEL[popup.position] || popup.position}
                </span>
                <span style={{
                  fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                  background: '#f3f4f6', color: '#6b7280',
                }}>
                  {popup.width}x{popup.height}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                기간: {formatDate(popup.startDate)} ~ {formatDate(popup.endDate)}
              </p>
              {popup.templateId && (
                <p style={{ fontSize: '0.8rem', color: '#8b5cf6', margin: '0.15rem 0 0' }}>
                  {getTemplate(popup.templateId)?.name || popup.templateId}
                </p>
              )}
              {!popup.templateId && popup.link && (
                <p style={{ fontSize: '0.8rem', color: '#3b82f6', margin: '0.15rem 0 0' }}>{popup.link}</p>
              )}
            </div>

            {/* 순서 이동 */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              gap: '2px', padding: '0 0.5rem', flexShrink: 0,
            }}>
              <button onClick={() => handleMove(index, -1)} disabled={index === 0}
                style={arrowBtnStyle(index === 0)} title="위로 이동">&#9650;</button>
              <button onClick={() => handleMove(index, 1)} disabled={index === popups.length - 1}
                style={arrowBtnStyle(index === popups.length - 1)} title="아래로 이동">&#9660;</button>
            </div>

            {/* 활성 토글 + 수정/삭제 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0 1rem', flexShrink: 0,
            }}>
              <button onClick={() => handleToggleActive(popup)} style={{
                padding: '0.3rem 0.6rem', borderRadius: '4px', border: 'none',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500',
                background: popup.isActive ? '#dcfce7' : '#fee2e2',
                color: popup.isActive ? '#16a34a' : '#dc2626',
              }}>
                {popup.isActive ? '활성' : '비활성'}
              </button>
              <button onClick={() => handleEdit(popup)} style={actionBtnStyle('#3b82f6')}>수정</button>
              <button onClick={() => handleDelete(popup.id)} style={actionBtnStyle('#ef4444')}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

// ── 스타일 상수 ──
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
  border: '1px solid #e5e7eb', borderRadius: '4px',
  width: '28px', height: '28px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '0.7rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
