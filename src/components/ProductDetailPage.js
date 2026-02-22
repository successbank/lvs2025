'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function ProductDetailPage({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', password: '', content: '' });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);

  const seriesList = product.seriesData?.series || [];
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  const images = product.images || [];

  const openInquiry = () => {
    setInquiryOpen(true);
    setInquirySuccess(false);
    setInquiryForm({ name: '', password: '', content: '' });
    document.body.style.overflow = 'hidden';
  };

  const closeInquiry = () => {
    setInquiryOpen(false);
    setInquirySuccess(false);
    document.body.style.overflow = '';
  };

  const openSeriesModal = (idx) => {
    setActiveSeriesIndex(idx);
    setSeriesModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeSeriesModal = () => {
    setSeriesModalOpen(false);
    document.body.style.overflow = '';
  };

  const renderCell = (cellValue) => {
    if (!cellValue) return '';
    // PDF/DWG 다운로드 링크 감지
    if (typeof cellValue === 'string' && cellValue.match(/\.pdf$/i)) {
      return <a href={cellValue} target="_blank" rel="noopener noreferrer" className="series-download-link">PDF</a>;
    }
    if (typeof cellValue === 'string' && (cellValue.includes('sub06') || cellValue.match(/\.dwg$/i))) {
      return <a href="/support/downloads" className="series-download-link">DWG</a>;
    }
    // 줄바꿈 처리
    if (typeof cellValue === 'string' && cellValue.includes('\n')) {
      return cellValue.split('\n').map((line, i) => (
        <span key={i}>{line}{i < cellValue.split('\n').length - 1 && <br />}</span>
      ));
    }
    return cellValue;
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    if (!inquiryForm.name || !inquiryForm.password || !inquiryForm.content) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!/^\d{4}$/.test(inquiryForm.password)) {
      alert('비밀번호는 4자리 숫자로 입력해주세요.');
      return;
    }

    setInquirySubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: 'board-consultation',
          title: `[제품문의] ${product.name}`,
          content: inquiryForm.content,
          author: inquiryForm.name,
          password: inquiryForm.password,
          isSecret: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '문의 등록에 실패했습니다.');
      }

      setInquirySuccess(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/products">제품소개</a>
          {product.category?.parent && (
            <>
              <span>&gt;</span>
              <a href={`/products/${product.category.parent.slug}`}>{product.category.parent.name}</a>
            </>
          )}
          <span>&gt;</span>
          <a href={`/products/${product.category?.slug || ''}`}>{product.category?.name}</a>
          <span>&gt;</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{product.name}</h1>
          <p>{product.summary || '엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.'}</p>
        </div>
      </section>

      {/* Product Detail */}
      <div className="product-detail-container">
        <div className="product-detail-wrapper">
          {/* Product Images */}
          <div className="product-detail-images">
            <div className="main-image">
              <img
                src={images[selectedImage]?.url || mainImage?.url || '/images/placeholder-product.jpg'}
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder-product.jpg';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-model">
              <span className="label">모델명:</span>
              <span className="value">{product.modelName}</span>
            </div>

            {product.summary && (
              <div className="product-summary">{product.summary}</div>
            )}

            <div className="product-meta">
              <div className="meta-item">
                <span className="label">제조사:</span>
                <span className="value">{product.manufacturer}</span>
              </div>
              <div className="meta-item">
                <span className="label">원산지:</span>
                <span className="value">{product.origin}</span>
              </div>
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="meta-item">
                  <span className="label">색상 옵션:</span>
                  <span className="value">{product.colorOptions.join(', ')}</span>
                </div>
              )}
              {product.voltageOptions && product.voltageOptions.length > 0 && (
                <div className="meta-item">
                  <span className="label">전압 옵션:</span>
                  <span className="value">{product.voltageOptions.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="product-actions">
              <button onClick={openInquiry} className="btn btn-primary">문의하기</button>
              <a href="/support/downloads" className="btn btn-secondary">자료 다운로드</a>
            </div>

            {seriesList.length > 0 && (
              <div className="series-buttons">
                {seriesList.map((series, idx) => (
                  <button
                    key={idx}
                    className="btn btn-series"
                    onClick={() => openSeriesModal(idx)}
                  >
                    {series.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.description && product.description !== '-' && (
          <div className="product-description-section">
            <h2>제품 설명</h2>
            <div className="description-content" dangerouslySetInnerHTML={{ __html: product.description }}>
            </div>
          </div>
        )}

        {/* Specifications */}
        {product.specs && product.specs.length > 0 && (
          <div className="product-specs-section">
            <h2>제품 사양</h2>
            <table className="specs-table">
              <tbody>
                {product.specs.map((spec) => (
                  <tr key={spec.id}>
                    <th>{spec.label}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2>관련 제품</h2>
            <div className="related-products-grid">
              {product.relatedProducts.map((related) => (
                <div key={related.id} className="product-card">
                  <a href={`/products/${related.slug}`}>
                    <div className="product-image">
                      <img
                        src={related.images?.[0]?.url || '/images/placeholder-product.jpg'}
                        alt={related.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <h3>{related.name}</h3>
                      <p className="product-model">{related.modelName}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 문의하기 모달 */}
      {inquiryOpen && (
        <div className="modal-overlay" onClick={closeInquiry}>
          <div className="inquiry-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeInquiry}>×</button>

            {inquirySuccess ? (
              <div className="inquiry-success">
                <div className="inquiry-success-icon">✓</div>
                <h3>문의가 등록되었습니다</h3>
                <p>빠른 시일 내에 답변 드리겠습니다.<br/>입력하신 비밀번호로 상담실에서 확인하실 수 있습니다.</p>
                <a href="/support/consultation" className="inquiry-success-link">
                  상담실 바로가기
                </a>
              </div>
            ) : (
              <>
                <h2>제품 문의</h2>
                <p className="inquiry-subtitle">{product.name}에 대해 문의하기</p>

                <form onSubmit={handleInquirySubmit} className="inquiry-form">
                  <div className="inquiry-form-row">
                    <div className="inquiry-form-group">
                      <label>이름 <span className="required">*</span></label>
                      <input
                        type="text"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="이름을 입력해주세요"
                        required
                      />
                    </div>
                    <div className="inquiry-form-group">
                      <label>비밀번호 <span className="required">*</span></label>
                      <input
                        type="password"
                        value={inquiryForm.password}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setInquiryForm(prev => ({ ...prev, password: val }));
                        }}
                        placeholder="숫자 4자리"
                        inputMode="numeric"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="inquiry-form-group">
                    <label>제목</label>
                    <input
                      type="text"
                      value={`[제품문의] ${product.name}`}
                      disabled
                    />
                  </div>

                  <div className="inquiry-form-group">
                    <label>문의 내용 <span className="required">*</span></label>
                    <textarea
                      value={inquiryForm.content}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="문의 내용을 입력해주세요"
                      rows={5}
                      required
                    />
                  </div>

                  <div className="inquiry-notice">
                    비밀글로 등록되며, 입력하신 비밀번호로 확인하실 수 있습니다.
                  </div>

                  <div className="inquiry-buttons">
                    <button type="button" className="btn-inquiry-cancel" onClick={closeInquiry}>
                      취소
                    </button>
                    <button type="submit" className="btn-inquiry-submit" disabled={inquirySubmitting}>
                      {inquirySubmitting ? '등록 중...' : '문의 등록'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 시리즈 테이블 모달 */}
      {seriesModalOpen && seriesList[activeSeriesIndex] && (
        <div className="modal-overlay" onClick={closeSeriesModal}>
          <div className="series-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeSeriesModal}>×</button>
            <h2>{seriesList[activeSeriesIndex].name}</h2>

            {seriesList.length > 1 && (
              <div className="series-tabs">
                {seriesList.map((series, idx) => (
                  <button
                    key={idx}
                    className={`series-tab ${idx === activeSeriesIndex ? 'active' : ''}`}
                    onClick={() => setActiveSeriesIndex(idx)}
                  >
                    {series.name.replace(' Series List', '')}
                  </button>
                ))}
              </div>
            )}

            <div className="series-table-wrapper">
              <table className="series-table">
                <thead>
                  <tr>
                    {seriesList[activeSeriesIndex].columns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {seriesList[activeSeriesIndex].rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx}>{renderCell(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
