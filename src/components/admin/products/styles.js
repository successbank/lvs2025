// 관리자 제품 관리 공유 스타일 상수

export const primaryBtnStyle = {
  background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
  borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
};
export const secondaryBtnStyle = {
  background: 'white', color: '#374151', padding: '0.5rem 1rem',
  borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem',
};
export const treePanelStyle = {
  width: '280px', minWidth: '280px', background: 'white', borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem',
  position: 'sticky', top: '1rem', alignSelf: 'flex-start',
  maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
};
export const treeNodeStyle = (active) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.45rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
  background: active ? '#eff6ff' : 'transparent',
  borderRight: active ? '3px solid #3b82f6' : '3px solid transparent',
  color: active ? '#1d4ed8' : '#374151',
  fontWeight: active ? '600' : '400',
  transition: 'all 0.12s ease',
  marginBottom: '1px',
});
export const treeArrowStyle = {
  fontSize: '0.6rem', color: '#9ca3af', cursor: 'pointer',
  width: '16px', textAlign: 'center', userSelect: 'none',
  flexShrink: 0,
};
export const treeBadgeStyle = {
  fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6',
  padding: '0.1rem 0.45rem', borderRadius: '9999px', flexShrink: 0,
  marginLeft: '0.5rem',
};
export const labelStyle = {
  display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151',
};
export const inputStyle = {
  width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem',
};
export const thStyle = {
  padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600',
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
};
export const tdStyle = {
  padding: '0.75rem 1rem', fontSize: '0.9rem',
};
export const badgeStyle = (bg) => ({
  display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px',
  fontSize: '0.75rem', color: 'white', background: bg, marginRight: '0.25rem',
});
export const actionBtn = (color) => ({
  background: 'transparent', color, border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', marginRight: '0.5rem', textDecoration: 'underline',
});

// --- 옵션관리 UX 개선 스타일 ---
export const dragHandleStyle = {
  cursor: 'grab', color: '#9ca3af', fontSize: '1rem', userSelect: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '20px', flexShrink: 0,
};
export const iconBtnStyle = (color = '#9ca3af') => ({
  background: 'none', border: 'none', cursor: 'pointer', color,
  fontSize: '0.9rem', lineHeight: 1, padding: '0.15rem', borderRadius: '3px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
export const undoRedoBtnStyle = (enabled) => ({
  background: 'none', border: '1px solid #d1d5db', borderRadius: '6px',
  padding: '0.3rem 0.5rem', cursor: enabled ? 'pointer' : 'default',
  opacity: enabled ? 1 : 0.3, fontSize: '0.9rem', color: '#374151',
  display: 'flex', alignItems: 'center', gap: '0.25rem',
});
export const errorBannerStyle = {
  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
  padding: '0.75rem 1rem', marginBottom: '1rem',
};
export const errorItemStyle = {
  fontSize: '0.85rem', color: '#991b1b', padding: '0.2rem 0',
  cursor: 'pointer', textDecoration: 'underline',
};
export const seriesItemHoverStyle = {
  position: 'absolute', right: '0.3rem', top: '50%', transform: 'translateY(-50%)',
  display: 'flex', gap: '0.15rem',
};
export const cellContainerStyle = {
  position: 'relative', width: '100%',
};
export const cellIndicatorStyle = {
  position: 'absolute', right: '4px', top: '2px', fontSize: '0.65rem',
  color: '#9ca3af', pointerEvents: 'none', lineHeight: 1,
};
export const newRowHighlight = {
  background: '#fefce8',
};

// --- 제품 옵션 속성 에디터 스타일 ---
export const attrCardStyle = {
  background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '8px',
  padding: '1rem', marginBottom: '0.75rem', position: 'relative',
};
export const attrHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
};
export const attrTypeSelectStyle = {
  padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '4px',
  fontSize: '0.8rem', background: 'white', color: '#374151', cursor: 'pointer',
};
export const tagInputContainerStyle = {
  display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.4rem 0.5rem',
  border: '1px solid #d1d5db', borderRadius: '6px', background: 'white',
  minHeight: '38px', alignItems: 'center', cursor: 'text',
};
export const tagStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
  background: '#e0e7ff', color: '#3730a3', padding: '0.2rem 0.5rem',
  borderRadius: '4px', fontSize: '0.82rem', fontWeight: '500',
  whiteSpace: 'nowrap',
};
export const tagRemoveStyle = {
  background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1',
  fontSize: '1rem', lineHeight: 1, padding: '0 0.1rem', fontWeight: '700',
  display: 'flex', alignItems: 'center',
};
export const tagInputFieldStyle = {
  border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent',
  minWidth: '80px', flex: 1, padding: '0.1rem 0',
};
export const attrUnitInputStyle = {
  width: '60px', padding: '0.25rem 0.4rem', border: '1px solid #d1d5db',
  borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center',
};
export const sectionDividerStyle = {
  borderTop: '2px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem',
};
export const sectionTitleStyle = {
  fontSize: '0.85rem', fontWeight: '600', color: '#374151',
  marginBottom: '0.75rem', display: 'flex', alignItems: 'center',
  justifyContent: 'space-between',
};

// --- PDF 파일 관리 스타일 ---
export const pdfTabStyle = (active) => ({
  padding: '0.35rem 0.75rem', fontSize: '0.82rem', fontWeight: active ? '600' : '400',
  background: active ? '#3b82f6' : 'white', color: active ? 'white' : '#6b7280',
  border: active ? '1px solid #3b82f6' : '1px solid #d1d5db',
  cursor: 'pointer', borderRadius: '6px',
  transition: 'all 0.15s ease',
});
export const pdfDropZoneStyle = (dragActive) => ({
  border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
  borderRadius: '8px', padding: '1.5rem', textAlign: 'center',
  background: dragActive ? '#eff6ff' : '#fafafa',
  cursor: 'pointer', transition: 'all 0.15s ease',
  color: dragActive ? '#2563eb' : '#9ca3af',
});
export const pdfFileItemStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.4rem 0.6rem', background: '#f9fafb',
  border: '1px solid #e5e7eb', borderRadius: '6px',
  fontSize: '0.82rem', color: '#374151',
};

// --- 시리즈 가져오기 모달 스타일 ---
export const importModalOverlayStyle = {
  position: 'fixed', inset: 0, zIndex: 50000,
  background: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};
export const importModalContentStyle = {
  background: 'white', borderRadius: '12px', padding: '1.5rem',
  maxWidth: '700px', width: '95%', maxHeight: '80vh',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  display: 'flex', flexDirection: 'column',
};
export const importProductRowStyle = (isHovered) => ({
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
  background: isHovered ? '#f0f9ff' : 'white',
  border: '1px solid #e5e7eb', transition: 'background 0.12s ease',
});
export const importSeriesCheckStyle = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.6rem 0.75rem', borderRadius: '6px',
  border: '1px solid #e5e7eb', background: '#fafafa',
};
