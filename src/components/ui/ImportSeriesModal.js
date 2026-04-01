'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  importModalOverlayStyle, importModalContentStyle,
  importProductRowStyle, importSeriesCheckStyle,
} from '@/components/admin/products/styles';

export default function ImportSeriesModal({ isOpen, currentProductId, onImport, onCancel }) {
  const [step, setStep] = useState(1); // 1: product select, 2: series select
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkedSeries, setCheckedSeries] = useState(new Set());
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Fetch products with series
  const fetchProducts = useCallback(async (query) => {
    setLoading(true);
    try {
      let url = '/api/products?limit=100';
      if (query) url += `&search=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      // Filter: only products with series, exclude current product
      const filtered = (data.products || []).filter(p =>
        p.id !== currentProductId &&
        p.seriesData?.series?.length > 0
      );
      setProducts(filtered);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
    setLoading(false);
  }, [currentProductId]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchInput('');
      setSearchQuery('');
      setSelectedProduct(null);
      setCheckedSeries(new Set());
      fetchProducts('');
    }
  }, [isOpen, fetchProducts]);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    setSearchQuery(q);
    fetchProducts(q);
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setCheckedSeries(new Set());
    setStep(2);
  };

  const goBackToStep1 = () => {
    setStep(1);
    setSelectedProduct(null);
    setCheckedSeries(new Set());
  };

  const toggleSeries = (idx) => {
    setCheckedSeries(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    const allSeries = selectedProduct?.seriesData?.series || [];
    if (checkedSeries.size === allSeries.length) {
      setCheckedSeries(new Set());
    } else {
      setCheckedSeries(new Set(allSeries.map((_, i) => i)));
    }
  };

  const handleImport = () => {
    if (checkedSeries.size === 0) return;
    const allSeries = selectedProduct?.seriesData?.series || [];
    const selected = [...checkedSeries].sort().map(idx => allSeries[idx]);
    onImport(selected);
  };

  if (!isOpen) return null;

  const btnBase = {
    padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.88rem',
    cursor: 'pointer', fontWeight: '500',
  };

  return (
    <div onClick={onCancel} style={importModalOverlayStyle}>
      <div onClick={e => e.stopPropagation()} style={importModalContentStyle}>

        {/* Step 1: Product selection */}
        {step === 1 && (
          <>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', color: '#111827', fontWeight: '600' }}>
              기존 시리즈 가져오기
            </h3>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="제품명 또는 모델명으로 검색..."
                style={{
                  flex: 1, padding: '0.45rem 0.6rem', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '0.85rem',
                }}
              />
              <button type="submit" style={{ ...btnBase, background: '#3b82f6', color: 'white', border: 'none' }}>
                검색
              </button>
            </form>

            {/* Product list */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>로딩 중...</div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                  {searchQuery ? '검색 결과가 없습니다.' : '시리즈가 있는 다른 제품이 없습니다.'}
                </div>
              ) : (
                products.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={importProductRowStyle(hoveredIdx === idx)}
                  >
                    {p.mainImage ? (
                      <img src={p.mainImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#9ca3af', flexShrink: 0, border: '1px solid #e5e7eb' }}>No img</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '500', color: '#111827', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.modelName || p.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.category?.name || '-'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#8b5cf6', background: '#f5f3ff', padding: '0.15rem 0.5rem', borderRadius: '9999px', flexShrink: 0, fontWeight: '500' }}>
                      {p.seriesData.series.length}개 시리즈
                    </div>
                    <span style={{ color: '#9ca3af', flexShrink: 0 }}>&#8250;</span>
                  </div>
                ))
              )}
            </div>

            {/* Cancel button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={onCancel} style={{ ...btnBase, border: '1px solid #d1d5db', background: 'white', color: '#374151' }}>
                취소
              </button>
            </div>
          </>
        )}

        {/* Step 2: Series selection */}
        {step === 2 && selectedProduct && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                onClick={goBackToStep1}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '0.9rem', padding: 0 }}
              >
                &#8249; 뒤로
              </button>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#111827', fontWeight: '600' }}>
                {selectedProduct.modelName || selectedProduct.name} 에서 가져오기
              </h3>
            </div>

            {/* Series checkboxes */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(selectedProduct.seriesData?.series || []).map((s, idx) => (
                <label key={idx} style={{ ...importSeriesCheckStyle, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checkedSeries.has(idx)}
                    onChange={() => toggleSeries(idx)}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', color: '#111827', fontSize: '0.88rem' }}>
                      {s.name || `시리즈 ${idx + 1}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>
                      컬럼 {(s.columns || []).length}개 / 행 {(s.rows || []).length}개 / PDF {(s.pdfFiles || []).length}개
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Toggle all + action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button
                onClick={toggleAll}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '0.82rem', textDecoration: 'underline', padding: 0 }}
              >
                {checkedSeries.size === (selectedProduct.seriesData?.series || []).length ? '전체 해제' : '전체 선택'}
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={goBackToStep1} style={{ ...btnBase, border: '1px solid #d1d5db', background: 'white', color: '#374151' }}>
                  뒤로
                </button>
                <button
                  onClick={handleImport}
                  disabled={checkedSeries.size === 0}
                  style={{
                    ...btnBase, border: 'none', background: '#3b82f6', color: 'white',
                    opacity: checkedSeries.size === 0 ? 0.5 : 1,
                    cursor: checkedSeries.size === 0 ? 'default' : 'pointer',
                  }}
                >
                  가져오기 ({checkedSeries.size}개)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
