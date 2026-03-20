'use client';

import { primaryBtnStyle, secondaryBtnStyle, inputStyle } from './styles';

export default function SeriesEditor({ series, onChange, onDelete }) {
  const updateField = (field, value) => {
    onChange({ ...series, [field]: value });
  };

  // --- 컬럼 관리 ---
  const addColumn = () => {
    const name = prompt('새 컬럼 이름을 입력하세요:');
    if (!name || !name.trim()) return;
    const newColumns = [...series.columns, name.trim()];
    const newRows = series.rows.map(row => [...row, '']);
    onChange({ ...series, columns: newColumns, rows: newRows });
  };

  const renameColumn = (idx) => {
    const name = prompt('컬럼 이름 변경:', series.columns[idx]);
    if (name === null) return;
    const newColumns = [...series.columns];
    newColumns[idx] = name;
    onChange({ ...series, columns: newColumns });
  };

  const deleteColumn = (idx) => {
    if (series.columns.length <= 1) { alert('최소 1개 컬럼이 필요합니다.'); return; }
    if (!confirm(`"${series.columns[idx]}" 컬럼을 삭제하시겠습니까?`)) return;
    const newColumns = series.columns.filter((_, i) => i !== idx);
    const newRows = series.rows.map(row => row.filter((_, i) => i !== idx));
    onChange({ ...series, columns: newColumns, rows: newRows });
  };

  // --- 행 관리 ---
  const addRow = () => {
    const newRow = series.columns.map(() => '');
    onChange({ ...series, rows: [...series.rows, newRow] });
  };

  const deleteRow = (idx) => {
    const newRows = series.rows.filter((_, i) => i !== idx);
    onChange({ ...series, rows: newRows });
  };

  const updateCell = (rowIdx, colIdx, value) => {
    const newRows = series.rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => ci === colIdx ? value : cell) : row
    );
    onChange({ ...series, rows: newRows });
  };

  // --- PDF URLs ---
  const addPdfUrl = () => {
    const pdfFiles = [...(series.pdfFiles || []), ''];
    onChange({ ...series, pdfFiles });
  };
  const updatePdfUrl = (idx, value) => {
    const pdfFiles = [...(series.pdfFiles || [])];
    pdfFiles[idx] = value;
    onChange({ ...series, pdfFiles });
  };
  const deletePdfUrl = (idx) => {
    const pdfFiles = (series.pdfFiles || []).filter((_, i) => i !== idx);
    onChange({ ...series, pdfFiles });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 시리즈 이름 */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: '#374151' }}>
          시리즈 이름
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={series.name}
            onChange={e => updateField('name', e.target.value)}
            placeholder="예: HPLS Series List"
          />
          <button
            onClick={() => { if (confirm('이 시리즈를 삭제하시겠습니까?')) onDelete(); }}
            style={{ ...secondaryBtnStyle, color: '#ef4444', borderColor: '#fca5a5', whiteSpace: 'nowrap', padding: '0.5rem 0.75rem' }}
          >
            시리즈 삭제
          </button>
        </div>
      </div>

      {/* 컬럼 관리 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>컬럼 ({series.columns.length}개)</label>
          <button onClick={addColumn} style={{ ...primaryBtnStyle, padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>+ 컬럼 추가</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {series.columns.map((col, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              background: '#f3f4f6', borderRadius: '6px', padding: '0.3rem 0.5rem',
              fontSize: '0.82rem', border: '1px solid #e5e7eb',
            }}>
              <span
                onClick={() => renameColumn(idx)}
                style={{ cursor: 'pointer', color: '#374151' }}
                title="클릭하여 이름 변경"
              >
                {col}
              </span>
              <button
                onClick={() => deleteColumn(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem', lineHeight: 1, padding: '0 0.15rem' }}
                title="컬럼 삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 행/셀 테이블 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>데이터 행 ({series.rows.length}개)</label>
          <button onClick={addRow} style={{ ...primaryBtnStyle, padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>+ 행 추가</button>
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${series.columns.length * 150}px` }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.5rem 0.4rem', fontSize: '0.75rem', color: '#9ca3af', width: '32px', textAlign: 'center' }}>#</th>
                {series.columns.map((col, idx) => (
                  <th key={idx} style={{ padding: '0.5rem 0.4rem', fontSize: '0.78rem', fontWeight: '600', color: '#6b7280', textAlign: 'left', borderLeft: '1px solid #e5e7eb' }}>
                    {col}
                  </th>
                ))}
                <th style={{ padding: '0.5rem 0.4rem', width: '36px', borderLeft: '1px solid #e5e7eb' }}></th>
              </tr>
            </thead>
            <tbody>
              {series.rows.length === 0 ? (
                <tr>
                  <td colSpan={series.columns.length + 2} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                    데이터가 없습니다. "행 추가" 버튼을 클릭하세요.
                  </td>
                </tr>
              ) : series.rows.map((row, rowIdx) => (
                <tr key={rowIdx} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.3rem 0.4rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>{rowIdx + 1}</td>
                  {series.columns.map((_, colIdx) => (
                    <td key={colIdx} style={{ padding: '0.2rem 0.3rem', borderLeft: '1px solid #e5e7eb' }}>
                      <textarea
                        value={row[colIdx] || ''}
                        onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                        style={{
                          width: '100%', padding: '0.3rem', border: '1px solid transparent',
                          borderRadius: '3px', fontSize: '0.82rem', resize: 'vertical',
                          minHeight: '28px', lineHeight: '1.3', background: 'transparent',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#93c5fd'; e.target.style.background = 'white'; }}
                        onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                        rows={1}
                      />
                    </td>
                  ))}
                  <td style={{ padding: '0.3rem 0.2rem', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => deleteRow(rowIdx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem', lineHeight: 1 }}
                      title="행 삭제"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF URLs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>PDF 파일 URLs ({(series.pdfFiles || []).length}개)</label>
          <button onClick={addPdfUrl} style={{ ...primaryBtnStyle, padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>+ PDF URL 추가</button>
        </div>
        {(series.pdfFiles || []).length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0.25rem 0' }}>등록된 PDF URL이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {(series.pdfFiles || []).map((url, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, flex: 1, fontSize: '0.82rem', padding: '0.35rem 0.5rem' }}
                  value={url}
                  onChange={e => updatePdfUrl(idx, e.target.value)}
                  placeholder="https://..."
                />
                <button
                  onClick={() => deletePdfUrl(idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem' }}
                  title="URL 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
