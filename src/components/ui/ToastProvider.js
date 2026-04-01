'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const TOAST_COLORS = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '#22c55e' },
  error:   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '#ef4444' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '#f59e0b' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '#3b82f6' },
};

const TOAST_ICONS = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
};

const TOAST_DURATION = { success: 3000, error: 5000, warning: 4000, info: 3000 };

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    }, 300);
  }, []);

  const addToast = useCallback((type, message) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message, leaving: false }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), TOAST_DURATION[type] || 3000);
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info:    (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: '1rem', right: '1rem', zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        pointerEvents: 'none', maxWidth: '380px',
      }}>
        {toasts.map(t => {
          const colors = TOAST_COLORS[t.type] || TOAST_COLORS.info;
          return (
            <div
              key={t.id}
              className={t.leaving ? 'toast-slide-out' : 'toast-slide-in'}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                padding: '0.75rem 1rem', borderRadius: '8px',
                background: colors.bg, border: `1px solid ${colors.border}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                pointerEvents: 'auto', minWidth: '280px',
              }}
            >
              <span style={{ fontSize: '1.1rem', color: colors.icon, flexShrink: 0, marginTop: '1px' }}>
                {TOAST_ICONS[t.type]}
              </span>
              <span style={{ flex: 1, fontSize: '0.88rem', color: colors.text, lineHeight: 1.4 }}>
                {t.message}
              </span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: colors.text, opacity: 0.5, fontSize: '1.1rem',
                  lineHeight: 1, padding: '0', flexShrink: 0,
                }}
                title="닫기"
              >
                \u00D7
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
