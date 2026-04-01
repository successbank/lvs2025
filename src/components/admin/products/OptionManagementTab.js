'use client';

import { useState, useEffect, useCallback } from 'react';
import SeriesEditor from './SeriesEditor';
import SeriesPreview from './SeriesPreview';
import ProductOptionsEditor from './ProductOptionsEditor';
import {
  primaryBtnStyle, secondaryBtnStyle, inputStyle, thStyle, tdStyle,
  badgeStyle, actionBtn, dragHandleStyle, iconBtnStyle, undoRedoBtnStyle,
  errorBannerStyle, errorItemStyle, sectionDividerStyle,
} from './styles';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ImportSeriesModal from '@/components/ui/ImportSeriesModal';
import { useToast } from '@/components/ui/ToastProvider';
import useUndoRedo from '@/hooks/useUndoRedo';
import useDragReorder from '@/hooks/useDragReorder';

export default function OptionManagementTab() {
  const toast = useToast();

  // --- Product list view ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // --- Editor view ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Composite state: { seriesData, productOptions }
  const { state: editorState, setState: setEditorState, undo, redo, canUndo, canRedo, reset: resetUndo } = useUndoRedo(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hoveredSeriesIdx, setHoveredSeriesIdx] = useState(null);

  // --- Confirm modal for navigation ---
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', dangerLevel: 'normal', onConfirm: () => {} });
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Derived state from composite
  const seriesData = editorState?.seriesData || { series: [] };
  const productOptions = editorState?.productOptions || { attributes: [] };
  const hasChanges = canUndo;

  const setSeriesData = (sd) => {
    setEditorState({ ...editorState, seriesData: sd });
  };

  const setProductOptions = (po) => {
    setEditorState({ ...editorState, productOptions: po });
  };

  useEffect(() => { fetchProducts(); }, [page, searchQuery]);

  // --- Ctrl+Z / Ctrl+Y global shortcuts ---
  useEffect(() => {
    if (!selectedProduct) return;
    const handleKey = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        if (isInput) return;
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        if (isInput) return;
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedProduct, undo, redo]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?page=${page}&limit=20`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => { e.preventDefault(); setSearchQuery(searchInput.trim()); setPage(1); };
  const clearSearch = () => { setSearchInput(''); setSearchQuery(''); setPage(1); };

  // --- Select product → enter editor ---
  const selectProduct = (product) => {
    const sd = product.seriesData
      ? JSON.parse(JSON.stringify(product.seriesData))
      : { series: [] };
    if (sd.series) {
      sd.series.forEach(s => {
        s.rows = (s.rows || []).map(row => {
          const padded = [...row];
          while (padded.length < (s.columns || []).length) padded.push('');
          return padded.slice(0, (s.columns || []).length);
        });
        s.pdfFiles = s.pdfFiles || [];
      });
    }
    const po = product.productOptions
      ? JSON.parse(JSON.stringify(product.productOptions))
      : { attributes: [] };

    setSelectedProduct(product);
    resetUndo({ seriesData: sd, productOptions: po });
    setActiveSeriesIndex(0);
    setValidationErrors([]);
  };

  const goBack = () => {
    if (hasChanges) {
      setConfirmModal({
        open: true, title: '변경사항 확인',
        message: '저장하지 않은 변경사항이 있습니다. 돌아가시겠습니까?',
        dangerLevel: 'warning',
        onConfirm: () => {
          setSelectedProduct(null);
          resetUndo(null);
          setValidationErrors([]);
          setConfirmModal(prev => ({ ...prev, open: false }));
        },
      });
    } else {
      setSelectedProduct(null);
      resetUndo(null);
      setValidationErrors([]);
    }
  };

  // --- Series CRUD ---
  const addSeries = () => {
    const sd = { ...seriesData, series: [...seriesData.series, { name: '새 시리즈', columns: ['No.', 'Model Name'], rows: [], pdfFiles: [] }] };
    setSeriesData(sd);
    setActiveSeriesIndex(sd.series.length - 1);
  };

  const updateSeries = (idx, updated) => {
    const newSeries = [...seriesData.series];
    newSeries[idx] = updated;
    setSeriesData({ ...seriesData, series: newSeries });
  };

  const deleteSeries = (idx) => {
    const newSeries = seriesData.series.filter((_, i) => i !== idx);
    setSeriesData({ ...seriesData, series: newSeries });
    setActiveSeriesIndex(Math.max(0, activeSeriesIndex >= newSeries.length ? newSeries.length - 1 : activeSeriesIndex));
  };

  const duplicateSeries = (idx) => {
    const original = seriesData.series[idx];
    const clone = JSON.parse(JSON.stringify(original));
    clone.name = (clone.name || '') + ' (복사)';
    const newSeries = [...seriesData.series];
    newSeries.splice(idx + 1, 0, clone);
    setSeriesData({ ...seriesData, series: newSeries });
    setActiveSeriesIndex(idx + 1);
    toast.info(`"${original.name}" 시리즈가 복제되었습니다.`);
  };

  // --- Import series from other products ---
  const importSeries = (seriesList) => {
    const clones = seriesList.map(s => {
      const clone = JSON.parse(JSON.stringify(s));
      clone.name = (clone.name || '') + ' (가져옴)';
      return clone;
    });
    const newSeries = [...seriesData.series, ...clones];
    setSeriesData({ ...seriesData, series: newSeries });
    setActiveSeriesIndex(newSeries.length - clones.length);
    setImportModalOpen(false);
    toast.success(`${clones.length}개 시리즈를 가져왔습니다.`);
  };

  // --- Series drag reorder ---
  const handleSeriesReorder = useCallback((fromIdx, toIdx) => {
    const newSeries = [...seriesData.series];
    const [dragged] = newSeries.splice(fromIdx, 1);
    newSeries.splice(toIdx, 0, dragged);
    setSeriesData({ ...seriesData, series: newSeries });

    if (activeSeriesIndex === fromIdx) {
      setActiveSeriesIndex(toIdx);
    } else if (fromIdx < activeSeriesIndex && toIdx >= activeSeriesIndex) {
      setActiveSeriesIndex(activeSeriesIndex - 1);
    } else if (fromIdx > activeSeriesIndex && toIdx <= activeSeriesIndex) {
      setActiveSeriesIndex(activeSeriesIndex + 1);
    }
  }, [seriesData, activeSeriesIndex, editorState]);

  const { getDragProps: getSeriesDragProps, getDragStyle: getSeriesDragStyle } = useDragReorder(handleSeriesReorder);

  // --- Validation ---
  const validate = () => {
    const errors = [];
    const warnings = [];
    const nameSet = new Set();

    seriesData.series.forEach((s, idx) => {
      if (!s.name || !s.name.trim()) {
        errors.push({ idx, message: `시리즈 ${idx + 1}: 이름이 비어있습니다.` });
      } else if (nameSet.has(s.name.trim().toLowerCase())) {
        errors.push({ idx, message: `시리즈 ${idx + 1}: 이름 "${s.name}"이 중복됩니다.` });
      }
      nameSet.add((s.name || '').trim().toLowerCase());

      if (!s.columns || s.columns.length === 0) {
        errors.push({ idx, message: `"${s.name || `시리즈 ${idx + 1}`}": 최소 1개 컬럼이 필요합니다.` });
      }

      const colNames = new Set();
      (s.columns || []).forEach(col => {
        const lc = col.trim().toLowerCase();
        if (colNames.has(lc)) {
          errors.push({ idx, message: `"${s.name || `시리즈 ${idx + 1}`}": 컬럼명 "${col}"이 중복됩니다.` });
        }
        colNames.add(lc);
      });

      const emptyRows = (s.rows || []).filter(row => row.every(cell => !cell || !cell.trim()));
      if (emptyRows.length > 0) {
        warnings.push({ idx, message: `"${s.name || `시리즈 ${idx + 1}`}": 빈 행 ${emptyRows.length}개가 있습니다.` });
      }

      (s.pdfFiles || []).forEach((url, pi) => {
        if (url && url.trim() && !/^(https?:\/\/|\/uploads\/)/i.test(url.trim())) {
          errors.push({ idx, message: `"${s.name || `시리즈 ${idx + 1}`}": PDF URL ${pi + 1}번이 올바르지 않습니다.` });
        }
      });
    });

    return { errors, warnings };
  };

  // --- Save ---
  const handleSave = async () => {
    const { errors, warnings } = validate();

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error(`${errors.length}개의 오류가 있습니다. 수정 후 다시 시도하세요.`);
      return;
    }

    if (warnings.length > 0) {
      setConfirmModal({
        open: true, title: '경고 확인',
        message: `${warnings.map(w => w.message).join('\n')}\n\n그래도 저장하시겠습니까?`,
        dangerLevel: 'warning',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, open: false }));
          executeSave();
        },
      });
      return;
    }

    executeSave();
  };

  const executeSave = async () => {
    setValidationErrors([]);
    setSaving(true);
    try {
      const cleaned = {
        series: seriesData.series.map(s => ({
          ...s,
          pdfFiles: (s.pdfFiles || []).filter(u => u && u.trim()),
          rows: s.rows.map(row => {
            const padded = [...row];
            while (padded.length < s.columns.length) padded.push('');
            return padded.slice(0, s.columns.length);
          }),
        })),
      };
      const seriesPayload = cleaned.series.length === 0 ? null : cleaned;
      const optionsPayload = productOptions.attributes && productOptions.attributes.length > 0
        ? productOptions
        : null;

      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesData: seriesPayload,
          productOptions: optionsPayload,
        }),
      });
      if (!res.ok) throw new Error('저장에 실패했습니다.');

      // Update list and reset undo history
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id
          ? { ...p, seriesData: seriesPayload, productOptions: optionsPayload }
          : p
      ));
      setSelectedProduct(prev => ({ ...prev, seriesData: seriesPayload, productOptions: optionsPayload }));

      const newSeriesData = seriesPayload
        ? JSON.parse(JSON.stringify(seriesPayload))
        : { series: [] };
      const newProductOptions = optionsPayload
        ? JSON.parse(JSON.stringify(optionsPayload))
        : { attributes: [] };
      resetUndo({ seriesData: newSeriesData, productOptions: newProductOptions });

      toast.success('저장되었습니다.');
    } catch (error) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setConfirmModal({
        open: true, title: '변경사항 취소',
        message: '변경사항을 취소하시겠습니까?',
        dangerLevel: 'warning',
        onConfirm: () => {
          selectProduct(selectedProduct);
          setConfirmModal(prev => ({ ...prev, open: false }));
        },
      });
    } else {
      selectProduct(selectedProduct);
    }
  };

  // =====================
  // Editor view
  // =====================
  if (selectedProduct) {
    return (
      <div>
        {/* Validation errors banner */}
        {validationErrors.length > 0 && (
          <div style={errorBannerStyle}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.35rem' }}>
              저장할 수 없습니다 ({validationErrors.length}개 오류)
            </div>
            {validationErrors.map((err, i) => (
              <div
                key={i}
                style={errorItemStyle}
                onClick={() => setActiveSeriesIndex(err.idx)}
              >
                {err.message}
              </div>
            ))}
          </div>
        )}

        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1rem', background: 'white', padding: '1rem',
          borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={goBack} style={{ ...secondaryBtnStyle, padding: '0.4rem 0.8rem' }}>
              ← 목록으로
            </button>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>제품:</span>{' '}
              <strong style={{ color: '#111827' }}>{selectedProduct.modelName}</strong>
              <span style={{ color: '#6b7280', marginLeft: '0.5rem', fontSize: '0.85rem' }}>{selectedProduct.name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Undo/Redo */}
            <button onClick={undo} disabled={!canUndo} style={undoRedoBtnStyle(canUndo)} title="실행취소 (Ctrl+Z)">
              ↩
            </button>
            <button onClick={redo} disabled={!canRedo} style={undoRedoBtnStyle(canRedo)} title="다시실행 (Ctrl+Y)">
              ↪
            </button>
            <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 0.25rem' }} />
            {hasChanges && <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '500' }}>변경됨</span>}
            <button onClick={() => setShowPreview(true)} style={{ ...secondaryBtnStyle, padding: '0.4rem 0.8rem' }} disabled={seriesData.series.length === 0}>
              미리보기
            </button>
            <button onClick={handleCancel} style={{ ...secondaryBtnStyle, padding: '0.4rem 0.8rem' }}>
              취소
            </button>
            <button onClick={handleSave} disabled={saving || !hasChanges} style={{ ...primaryBtnStyle, padding: '0.4rem 1rem', opacity: (saving || !hasChanges) ? 0.6 : 1 }}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* Section 1: Product Options Editor */}
        <div style={{
          background: 'white', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem',
          marginBottom: '1rem',
        }}>
          <ProductOptionsEditor
            productOptions={productOptions}
            onChange={setProductOptions}
          />
        </div>

        {/* Section 2: Series Data (sidebar + editor) */}
        <div style={sectionDividerStyle}>
          <div style={{
            fontSize: '0.85rem', fontWeight: '600', color: '#374151',
            marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            시리즈 데이터
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {/* Series sidebar */}
          <div style={{
            width: '220px', minWidth: '220px', background: 'white', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              시리즈 목록
            </div>
            {seriesData.series.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>시리즈가 없습니다.</p>
            ) : (
              seriesData.series.map((s, idx) => {
                const seriesDragStyle = getSeriesDragStyle(idx);
                const isActive = activeSeriesIndex === idx;
                const isHovered = hoveredSeriesIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveSeriesIndex(idx)}
                    onMouseEnter={() => setHoveredSeriesIdx(idx)}
                    onMouseLeave={() => setHoveredSeriesIdx(null)}
                    style={{
                      padding: '0.5rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
                      marginBottom: '2px', position: 'relative',
                      background: isActive ? '#eff6ff' : seriesDragStyle.background || 'transparent',
                      borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                      borderTop: seriesDragStyle.borderTop,
                      borderBottom: seriesDragStyle.borderBottom,
                      opacity: seriesDragStyle.opacity,
                      color: isActive ? '#1d4ed8' : '#374151',
                      fontWeight: isActive ? '600' : '400',
                      fontSize: '0.85rem', transition: 'all 0.12s ease',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <span
                      {...getSeriesDragProps(idx)}
                      style={{ ...dragHandleStyle, fontSize: '0.85rem', width: '14px' }}
                      onClick={e => e.stopPropagation()}
                      title="드래그하여 순서 변경"
                    >
                      ⠿
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                      {s.name || '(이름 없음)'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6', padding: '0.1rem 0.35rem', borderRadius: '9999px', flexShrink: 0 }}>
                      {s.rows.length}행
                    </span>
                    {isHovered && (
                      <div style={{ display: 'flex', gap: '0.1rem', flexShrink: 0, marginLeft: '0.15rem' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateSeries(idx); }}
                          style={iconBtnStyle('#6b7280')}
                          title="시리즈 복제"
                        >
                          ⧉
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSeries(idx); }}
                          style={iconBtnStyle('#ef4444')}
                          title="시리즈 삭제"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <button onClick={addSeries} style={{ ...primaryBtnStyle, width: '100%', marginTop: '0.75rem', padding: '0.4rem', fontSize: '0.85rem' }}>
              + 시리즈 추가
            </button>
            <button onClick={() => setImportModalOpen(true)} style={{ ...secondaryBtnStyle, width: '100%', marginTop: '0.35rem', padding: '0.4rem', fontSize: '0.82rem' }}>
              기존 시리즈 가져오기
            </button>
          </div>

          {/* Series editor area */}
          <div style={{ flex: 1, minWidth: 0, background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
            {seriesData.series.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>시리즈 데이터가 없습니다.</p>
                <p style={{ fontSize: '0.85rem' }}>"시리즈 추가" 버튼을 클릭하여 시작하세요.</p>
              </div>
            ) : seriesData.series[activeSeriesIndex] ? (
              <SeriesEditor
                series={seriesData.series[activeSeriesIndex]}
                onChange={(updated) => updateSeries(activeSeriesIndex, updated)}
                onDelete={() => deleteSeries(activeSeriesIndex)}
              />
            ) : null}
          </div>
        </div>

        {/* Preview modal */}
        {showPreview && (
          <SeriesPreview
            seriesData={seriesData}
            onClose={() => setShowPreview(false)}
          />
        )}

        {/* Confirm modal */}
        <ConfirmModal
          isOpen={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          dangerLevel={confirmModal.dangerLevel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        />

        {/* Import series modal */}
        <ImportSeriesModal
          isOpen={importModalOpen}
          currentProductId={selectedProduct.id}
          onImport={importSeries}
          onCancel={() => setImportModalOpen(false)}
        />
      </div>
    );
  }

  // =====================
  // Product list view
  // =====================
  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="모델명, 제품명으로 검색..."
            style={{ width: '100%', padding: '0.6rem 0.75rem', paddingRight: searchInput ? '2rem' : '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', background: 'white' }}
          />
          {searchInput && (
            <button type="button" onClick={clearSearch} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem' }}>×</button>
          )}
        </div>
        <button type="submit" style={{ ...primaryBtnStyle, padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}>검색</button>
      </form>

      {searchQuery && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#1e40af', fontSize: '0.9rem' }}>"<strong>{searchQuery}</strong>" 검색 결과: <strong>{pagination.total || 0}</strong>건</span>
          <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'underline' }}>검색 초기화</button>
        </div>
      )}

      {/* Product table */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '56px' }}>이미지</th>
              <th style={thStyle}>모델명</th>
              <th style={thStyle}>제품명</th>
              <th style={thStyle}>카테고리</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>옵션</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>시리즈</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>제품이 없습니다.</td></tr>
            ) : products.map(product => {
              const seriesCount = product.seriesData?.series?.length || 0;
              const optionCount = product.productOptions?.attributes?.length || 0;
              return (
                <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ ...tdStyle, padding: '0.4rem 0.5rem' }}>
                    {product.mainImage ? (
                      <img src={product.mainImage} alt={product.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', display: 'block', border: '1px solid #e5e7eb' }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', background: '#f9fafb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: '0.65rem', border: '1px solid #e5e7eb' }}>No img</div>
                    )}
                  </td>
                  <td style={tdStyle}><span style={{ fontWeight: '500', color: '#111827' }}>{product.modelName}</span></td>
                  <td style={tdStyle}>{product.name}</td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{product.category?.name || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {optionCount > 0 ? (
                      <span style={badgeStyle('#10b981')}>{optionCount}개</span>
                    ) : (
                      <span style={{ color: '#d1d5db' }}>-</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {seriesCount > 0 ? (
                      <span style={badgeStyle('#8b5cf6')}>{seriesCount}개</span>
                    ) : (
                      <span style={{ color: '#d1d5db' }}>-</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => selectProduct(product)} style={actionBtn('#3b82f6')}>편집</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', background: page === i + 1 ? '#3b82f6' : 'white', color: page === i + 1 ? 'white' : '#374151', cursor: 'pointer' }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
