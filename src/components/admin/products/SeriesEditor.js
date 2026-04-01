'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { primaryBtnStyle, secondaryBtnStyle, inputStyle, dragHandleStyle, iconBtnStyle, cellContainerStyle, cellIndicatorStyle, newRowHighlight } from './styles';
import PdfFileManager from './PdfFileManager';
import ConfirmModal from '@/components/ui/ConfirmModal';
import InputModal from '@/components/ui/InputModal';
import CsvPreviewModal from '@/components/ui/CsvPreviewModal';
import { useToast } from '@/components/ui/ToastProvider';
import useDragReorder from '@/hooks/useDragReorder';
import useKeyboardNavigation from '@/hooks/useKeyboardNavigation';

export default function SeriesEditor({ series, onChange, onDelete }) {
  const toast = useToast();
  const tableRef = useRef(null);
  const { handleCellKeyDown, handleCellFocus } = useKeyboardNavigation(tableRef);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [newRowIds, setNewRowIds] = useState(new Set());

  // --- Modal states ---
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', dangerLevel: 'normal', onConfirm: () => {} });
  const [inputModal, setInputModal] = useState({ open: false, title: '', label: '', placeholder: '', defaultValue: '', validate: null, onConfirm: () => {} });
  const [csvModal, setCsvModal] = useState({ open: false, parsedRows: [], columns: [] });

  // --- Drag reorder for rows ---
  const handleRowReorder = useCallback((fromIdx, toIdx) => {
    const newRows = [...series.rows];
    const [dragged] = newRows.splice(fromIdx, 1);
    newRows.splice(toIdx, 0, dragged);
    onChange({ ...series, rows: newRows });
  }, [series, onChange]);

  const { getDragProps, getDragStyle, dragIndex } = useDragReorder(handleRowReorder);

  // --- Helpers ---
  const updateField = (field, value) => {
    onChange({ ...series, [field]: value });
  };

  // --- Column management ---
  const addColumn = () => {
    setInputModal({
      open: true, title: '컬럼 추가', label: '새 컬럼 이름',
      placeholder: '예: Voltage', defaultValue: '',
      validate: (v) => !v ? '컬럼 이름을 입력하세요.' : null,
      onConfirm: (name) => {
        const newColumns = [...series.columns, name];
        const newRows = series.rows.map(row => [...row, '']);
        onChange({ ...series, columns: newColumns, rows: newRows });
        setInputModal(prev => ({ ...prev, open: false }));
        toast.success(`"${name}" 컬럼이 추가되었습니다.`);
      },
    });
  };

  const renameColumn = (idx) => {
    setInputModal({
      open: true, title: '컬럼 이름 변경', label: '새 이름',
      placeholder: '', defaultValue: series.columns[idx],
      validate: (v) => !v ? '컬럼 이름을 입력하세요.' : null,
      onConfirm: (name) => {
        const newColumns = [...series.columns];
        newColumns[idx] = name;
        onChange({ ...series, columns: newColumns });
        setInputModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const deleteColumn = (idx) => {
    if (series.columns.length <= 1) {
      toast.warning('최소 1개 컬럼이 필요합니다.');
      return;
    }
    setConfirmModal({
      open: true, title: '컬럼 삭제',
      message: `"${series.columns[idx]}" 컬럼과 해당 데이터를 삭제하시겠습니까?`,
      dangerLevel: 'danger',
      onConfirm: () => {
        const newColumns = series.columns.filter((_, i) => i !== idx);
        const newRows = series.rows.map(row => row.filter((_, i) => i !== idx));
        onChange({ ...series, columns: newColumns, rows: newRows });
        setConfirmModal(prev => ({ ...prev, open: false }));
        toast.success('컬럼이 삭제되었습니다.');
      },
    });
  };

  // --- Row management ---
  const addRow = () => {
    const newRow = series.columns.map(() => '');
    const newIdx = series.rows.length;
    onChange({ ...series, rows: [...series.rows, newRow] });
    setNewRowIds(prev => new Set(prev).add(newIdx));
    setTimeout(() => {
      setNewRowIds(prev => { const s = new Set(prev); s.delete(newIdx); return s; });
    }, 2000);
  };

  const deleteRow = (idx) => {
    setConfirmModal({
      open: true, title: '행 삭제',
      message: `${idx + 1}번 행을 삭제하시겠습니까?`,
      dangerLevel: 'warning',
      onConfirm: () => {
        const newRows = series.rows.filter((_, i) => i !== idx);
        onChange({ ...series, rows: newRows });
        setConfirmModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const duplicateRow = (idx) => {
    const newRows = [...series.rows];
    const clone = [...series.rows[idx]];
    newRows.splice(idx + 1, 0, clone);
    onChange({ ...series, rows: newRows });
    const newIdx = idx + 1;
    setNewRowIds(prev => new Set(prev).add(newIdx));
    setTimeout(() => {
      setNewRowIds(prev => { const s = new Set(prev); s.delete(newIdx); return s; });
    }, 2000);
    toast.info(`${idx + 1}번 행이 복제되었습니다.`);
  };

  const updateCell = (rowIdx, colIdx, value) => {
    const newRows = series.rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => ci === colIdx ? value : cell) : row
    );
    onChange({ ...series, rows: newRows });
  };

  // --- CSV paste ---
  const handleTablePaste = useCallback((e) => {
    const text = e.clipboardData?.getData('text/plain') || '';
    if (!text.includes('\t') && !text.includes('\n')) return;
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2 && !text.includes('\t')) return;

    e.preventDefault();
    const parsedRows = lines.map(line => {
      const cells = line.split('\t');
      const padded = [...cells];
      while (padded.length < series.columns.length) padded.push('');
      return padded.slice(0, series.columns.length);
    });

    setCsvModal({ open: true, parsedRows, columns: series.columns });
  }, [series.columns]);

  const handleCsvConfirm = useCallback((rows, mode) => {
    const baseRows = mode === 'replace' ? [] : series.rows;
    const startIdx = baseRows.length;
    onChange({ ...series, rows: [...baseRows, ...rows] });

    const ids = new Set();
    rows.forEach((_, i) => ids.add(startIdx + i));
    setNewRowIds(ids);
    setTimeout(() => setNewRowIds(new Set()), 3000);

    setCsvModal({ open: false, parsedRows: [], columns: [] });
    toast.success(`${rows.length}개 행이 ${mode === 'replace' ? '대체' : '추가'}되었습니다.`);
  }, [series, onChange, toast]);

  // --- Textarea autosize ---
  const handleAutosize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.max(28, e.target.scrollHeight) + 'px';
  };

  // --- Cell helpers ---
  const isUrl = (v) => /^https?:\/\//i.test(v);
  const lineCount = (v) => (v || '').split('\n').length;

  // --- Series delete ---
  const handleDeleteSeries = () => {
    setConfirmModal({
      open: true, title: '시리즈 삭제',
      message: `"${series.name || '(이름 없음)'}" 시리즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      dangerLevel: 'danger',
      onConfirm: () => {
        onDelete();
        setConfirmModal(prev => ({ ...prev, open: false }));
        toast.success('시리즈가 삭제되었습니다.');
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Series name */}
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
            onClick={handleDeleteSeries}
            style={{ ...secondaryBtnStyle, color: '#ef4444', borderColor: '#fca5a5', whiteSpace: 'nowrap', padding: '0.5rem 0.75rem' }}
          >
            시리즈 삭제
          </button>
        </div>
      </div>

      {/* Column management */}
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

      {/* Data table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>데이터 행 ({series.rows.length}개)</label>
          <button onClick={addRow} style={{ ...primaryBtnStyle, padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>+ 행 추가</button>
        </div>
        <div
          ref={tableRef}
          style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          onPaste={handleTablePaste}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${series.columns.length * 150 + 92}px` }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.5rem 0.2rem', fontSize: '0.75rem', color: '#9ca3af', width: '24px', textAlign: 'center' }}></th>
                <th style={{ padding: '0.5rem 0.4rem', fontSize: '0.75rem', color: '#9ca3af', width: '32px', textAlign: 'center' }}>#</th>
                {series.columns.map((col, idx) => (
                  <th key={idx} style={{ padding: '0.5rem 0.4rem', fontSize: '0.78rem', fontWeight: '600', color: '#6b7280', textAlign: 'left', borderLeft: '1px solid #e5e7eb' }}>
                    {col}
                  </th>
                ))}
                <th style={{ padding: '0.5rem 0.4rem', width: '60px', borderLeft: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {series.rows.length === 0 ? (
                <tr>
                  <td colSpan={series.columns.length + 3} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                    데이터가 없습니다. "행 추가" 버튼을 클릭하거나 Excel에서 붙여넣기하세요.
                  </td>
                </tr>
              ) : series.rows.map((row, rowIdx) => {
                const rowDragStyle = getDragStyle(rowIdx);
                const isNewRow = newRowIds.has(rowIdx);
                const isHovered = hoveredRow === rowIdx;
                return (
                  <tr
                    key={rowIdx}
                    style={{
                      borderTop: '1px solid #e5e7eb',
                      ...rowDragStyle,
                      background: isNewRow ? '#fefce8' : (isHovered && dragIndex === null ? '#f9fafb' : rowDragStyle.background),
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={() => setHoveredRow(rowIdx)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Drag handle */}
                    <td style={{ padding: '0.3rem 0.1rem', textAlign: 'center' }}>
                      <span {...getDragProps(rowIdx)} style={dragHandleStyle} title="드래그하여 순서 변경">
                        ⠿
                      </span>
                    </td>
                    {/* Row number */}
                    <td style={{ padding: '0.3rem 0.4rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                      {rowIdx + 1}
                    </td>
                    {/* Cells */}
                    {series.columns.map((_, colIdx) => {
                      const val = row[colIdx] || '';
                      const lc = lineCount(val);
                      return (
                        <td key={colIdx} style={{ padding: '0.2rem 0.3rem', borderLeft: '1px solid #e5e7eb' }}>
                          <div style={cellContainerStyle}>
                            <textarea
                              data-row={rowIdx}
                              data-col={colIdx}
                              value={val}
                              onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                              onInput={handleAutosize}
                              onFocus={e => {
                                handleCellFocus(val);
                                e.target.style.borderColor = '#93c5fd';
                                e.target.style.background = 'white';
                                handleAutosize(e);
                              }}
                              onBlur={e => {
                                e.target.style.borderColor = 'transparent';
                                e.target.style.background = 'transparent';
                              }}
                              onKeyDown={e => handleCellKeyDown(e, rowIdx, colIdx, (origVal) => updateCell(rowIdx, colIdx, origVal))}
                              style={{
                                width: '100%', padding: '0.3rem', border: '1px solid transparent',
                                borderRadius: '3px', fontSize: '0.82rem', resize: 'none',
                                minHeight: '28px', lineHeight: '1.3', background: 'transparent',
                                overflow: 'hidden',
                              }}
                              rows={1}
                            />
                            {isUrl(val) && (
                              <a
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ ...cellIndicatorStyle, color: '#3b82f6', pointerEvents: 'auto', cursor: 'pointer', textDecoration: 'none' }}
                                title="링크 열기"
                                onClick={e => e.stopPropagation()}
                              >
                                ↗
                              </a>
                            )}
                            {lc >= 2 && !isUrl(val) && (
                              <span style={{ ...cellIndicatorStyle, bottom: '2px', top: 'auto' }}>
                                {lc}줄
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {/* Actions */}
                    <td style={{ padding: '0.3rem 0.2rem', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.15rem' }}>
                        <button
                          onClick={() => duplicateRow(rowIdx)}
                          style={iconBtnStyle('#6b7280')}
                          title="행 복제"
                        >
                          ⧉
                        </button>
                        <button
                          onClick={() => deleteRow(rowIdx)}
                          style={iconBtnStyle('#ef4444')}
                          title="행 삭제"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Files */}
      <PdfFileManager
        pdfFiles={series.pdfFiles || []}
        onChange={files => onChange({ ...series, pdfFiles: files })}
      />

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        dangerLevel={confirmModal.dangerLevel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
      <InputModal
        isOpen={inputModal.open}
        title={inputModal.title}
        label={inputModal.label}
        placeholder={inputModal.placeholder}
        defaultValue={inputModal.defaultValue}
        validate={inputModal.validate}
        onConfirm={inputModal.onConfirm}
        onCancel={() => setInputModal(prev => ({ ...prev, open: false }))}
      />
      <CsvPreviewModal
        isOpen={csvModal.open}
        parsedRows={csvModal.parsedRows}
        columns={csvModal.columns}
        onConfirm={handleCsvConfirm}
        onCancel={() => setCsvModal({ open: false, parsedRows: [], columns: [] })}
      />
    </div>
  );
}
