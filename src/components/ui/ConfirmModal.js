'use client';

import { useEffect, useRef } from 'react';

const DANGER_COLORS = {
  normal:  { confirm: '#3b82f6', hover: '#2563eb' },
  warning: { confirm: '#f59e0b', hover: '#d97706' },
  danger:  { confirm: '#ef4444', hover: '#dc2626' },
};

export default function ConfirmModal({
  isOpen, title, message, confirmText = '확인', cancelText = '취소',
  dangerLevel = 'normal', onConfirm, onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    confirmRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const colors = DANGER_COLORS[dangerLevel] || DANGER_COLORS.normal;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 50000,
        background: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '12px', padding: '1.5rem',
          maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {title && (
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#111827', fontWeight: '600' }}>
            {title}
          </h3>
        )}
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.88rem',
              border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            style={{
              padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.88rem',
              border: 'none', background: colors.confirm, color: 'white',
              cursor: 'pointer', fontWeight: '500',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
