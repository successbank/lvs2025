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
