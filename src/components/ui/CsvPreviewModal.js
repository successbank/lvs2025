'use client';

import { useState } from 'react';

export default function CsvPreviewModal({ isOpen, parsedRows, columns, onConfirm, onCancel }) {
  const [mode, setMode] = useState('append'); // 'append' | 'replace'

  if (!isOpen || !parsedRows || parsedRows.length === 0) return null;

  const previewRows = parsedRows.slice(0, 20);
  const hasMore = parsedRows.length > 20;

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
          maxWidth: '700px', width: '95%', maxHeight: '80vh',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#111827', fontWeight: '600' }}>
          붙여넣기 미리보기
        </h3>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
          {parsedRows.length}개 행이 감지되었습니다. 확인 후 추가하세요.
        </p>

        {/* 모드 선택 */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
            <input type="radio" name="csvMode" checked={mode === 'append'} onChange={() => setMode('append')} />
            기존 행 뒤에 추가
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
            <input type="radio" name="csvMode" checked={mode === 'replace'} onChange={() => setMode('replace')} />
            기존 행 대체
          </label>
        </div>

        {/* 미리보기 테이블 */}
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.4rem', textAlign: 'center', color: '#9ca3af', width: '32px', fontSize: '0.75rem' }}>#</th>
                {columns.map((col, i) => (
                  <th key={i} style={{ padding: '0.4rem 0.5rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', borderLeft: '1px solid #e5e7eb' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: '1px solid #e5e7eb', background: '#fefce8' }}>
                  <td style={{ padding: '0.3rem 0.4rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>{ri + 1}</td>
                  {columns.map((_, ci) => (
                    <td key={ci} style={{ padding: '0.3rem 0.5rem', borderLeft: '1px solid #e5e7eb', color: '#374151' }}>
                      {row[ci] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && (
            <div style={{ padding: '0.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', background: '#f9fafb' }}>
              ... 외 {parsedRows.length - 20}개 행
            </div>
          )}
        </div>

        {/* 버튼 */}
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
            onClick={() => onConfirm(parsedRows, mode)}
            style={{
              padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.88rem',
              border: 'none', background: '#3b82f6', color: 'white',
              cursor: 'pointer', fontWeight: '500',
            }}
          >
            {mode === 'append' ? '추가' : '대체'} ({parsedRows.length}행)
          </button>
        </div>
      </div>
    </div>
  );
}
