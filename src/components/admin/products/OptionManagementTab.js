'use client';

import { useState, useEffect } from 'react';
import SeriesEditor from './SeriesEditor';
import SeriesPreview from './SeriesPreview';
import { primaryBtnStyle, secondaryBtnStyle, inputStyle, thStyle, tdStyle, badgeStyle, actionBtn } from './styles';

export default function OptionManagementTab() {
  // --- 제품 목록 뷰 ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // --- 에디터 뷰 ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [seriesData, setSeriesData] = useState(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchProducts(); }, [page, searchQuery]);

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

  // --- 제품 선택 → 에디터 진입 ---
  const selectProduct = (product) => {
    const sd = product.seriesData
      ? JSON.parse(JSON.stringify(product.seriesData))
      : { series: [] };
    // 행 길이 정규화
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
    setSelectedProduct(product);
    setSeriesData(sd);
    setActiveSeriesIndex(0);
    setHasChanges(false);
  };

  const goBack = () => {
    if (hasChanges && !confirm('저장하지 않은 변경사항이 있습니다. 돌아가시겠습니까?')) return;
    setSelectedProduct(null);
    setSeriesData(null);
    setHasChanges(false);
  };

  // --- 시리즈 CRUD ---
  const addSeries = () => {
    const sd = { ...seriesData, series: [...seriesData.series, { name: '새 시리즈', columns: ['No.', 'Model Name'], rows: [], pdfFiles: [] }] };
    setSeriesData(sd);
    setActiveSeriesIndex(sd.series.length - 1);
    setHasChanges(true);
  };

  const updateSeries = (idx, updated) => {
    const newSeries = [...seriesData.series];
    newSeries[idx] = updated;
    setSeriesData({ ...seriesData, series: newSeries });
    setHasChanges(true);
  };

  const deleteSeries = (idx) => {
    const newSeries = seriesData.series.filter((_, i) => i !== idx);
    setSeriesData({ ...seriesData, series: newSeries });
    setActiveSeriesIndex(Math.max(0, activeSeriesIndex >= newSeries.length ? newSeries.length - 1 : activeSeriesIndex));
    setHasChanges(true);
  };

  // --- 유효성 검증 ---
  const validate = () => {
    for (const s of seriesData.series) {
      if (!s.name || !s.name.trim()) return '시리즈 이름을 입력해주세요.';
      if (!s.columns || s.columns.length === 0) return `"${s.name}" 시리즈에 최소 1개 컬럼이 필요합니다.`;
    }
    return null;
  };

  // --- 저장 ---
  const handleSave = async () => {
    const error = validate();
    if (error) { alert(error); return; }

    setSaving(true);
    try {
      // 빈 pdfFiles 필터링, 행 패딩/트림
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
      const payload = cleaned.series.length === 0 ? null : cleaned;

      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesData: payload }),
      });
      if (!res.ok) throw new Error('저장에 실패했습니다.');

      setHasChanges(false);
      // 목록 갱신
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, seriesData: payload } : p
      ));
      setSelectedProduct(prev => ({ ...prev, seriesData: payload }));
      if (payload) setSeriesData(JSON.parse(JSON.stringify(payload)));
      alert('저장되었습니다.');
    } catch (error) {
      alert(error.message);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('변경사항을 취소하시겠습니까?')) return;
    selectProduct(selectedProduct);
  };

  // =====================
  // 에디터 뷰
  // =====================
  if (selectedProduct) {
    return (
      <div>
        {/* 상단 바 */}
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

        {/* 메인 영역: 사이드바 + 에디터 */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {/* 시리즈 사이드바 */}
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
              seriesData.series.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveSeriesIndex(idx)}
                  style={{
                    padding: '0.5rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
                    marginBottom: '2px',
                    background: activeSeriesIndex === idx ? '#eff6ff' : 'transparent',
                    borderRight: activeSeriesIndex === idx ? '3px solid #3b82f6' : '3px solid transparent',
                    color: activeSeriesIndex === idx ? '#1d4ed8' : '#374151',
                    fontWeight: activeSeriesIndex === idx ? '600' : '400',
                    fontSize: '0.85rem', transition: 'all 0.12s ease',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                    {s.name || '(이름 없음)'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6', padding: '0.1rem 0.35rem', borderRadius: '9999px', flexShrink: 0, marginLeft: '0.3rem' }}>
                    {s.rows.length}행
                  </span>
                </div>
              ))
            )}
            <button onClick={addSeries} style={{ ...primaryBtnStyle, width: '100%', marginTop: '0.75rem', padding: '0.4rem', fontSize: '0.85rem' }}>
              + 시리즈 추가
            </button>
          </div>

          {/* 시리즈 에디터 영역 */}
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

        {/* 미리보기 모달 */}
        {showPreview && (
          <SeriesPreview
            seriesData={seriesData}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    );
  }

  // =====================
  // 제품 목록 뷰
  // =====================
  return (
    <div>
      {/* 검색바 */}
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

      {/* 제품 테이블 */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '56px' }}>이미지</th>
              <th style={thStyle}>모델명</th>
              <th style={thStyle}>제품명</th>
              <th style={thStyle}>카테고리</th>
              <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>시리즈 수</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>제품이 없습니다.</td></tr>
            ) : products.map(product => {
              const seriesCount = product.seriesData?.series?.length || 0;
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

      {/* 페이지네이션 */}
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
