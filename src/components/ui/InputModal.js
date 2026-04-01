'use client';

import { useState, useEffect, useRef } from 'react';

export default function InputModal({
  isOpen, title, label, placeholder = '', defaultValue = '',
  validate, onConfirm, onCancel,
}) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, defaultValue]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (validate) {
      const err = validate(trimmed);
      if (err) { setError(err); return; }
    }
    onConfirm(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  };

  if (!isOpen) return null;

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
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', color: '#111827', fontWeight: '600' }}>
            {title}
          </h3>
        )}
        {label && (
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem', fontWeight: '500' }}>
            {label}
          </label>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '0.5rem 0.6rem', border: `1px solid ${error ? '#fca5a5' : '#d1d5db'}`,
            borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        {error && (
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>{error}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.88rem',
              border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.88rem',
              border: 'none', background: '#3b82f6', color: 'white',
              cursor: 'pointer', fontWeight: '500',
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
