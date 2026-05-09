'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import '../app/styles/globals.css';

const CERT_IMAGE_BASE = '/images/certifications/';

export default function CertificationsPage({ certifications = [], categories = [] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = useMemo(() => {
    const all = { key: 'all', label: '전체', count: certifications.length };
    const byCat = categories.map((cat) => ({
      key: cat.key,
      label: cat.label,
      count: certifications.filter((c) => c.categoryId === cat.id).length,
    }));
    return [all, ...byCat];
  }, [certifications, categories]);

  const filteredCerts = useMemo(() => (
    activeFilter === 'all'
      ? certifications
      : certifications.filter((c) => c.category?.key === activeFilter)
  ), [certifications, activeFilter]);

  const openLightbox = (filteredIdx) => {
    setLightboxIndex(filteredIdx);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev <= 0 ? filteredCerts.length - 1 : prev - 1));
  }, [filteredCerts.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev >= filteredCerts.length - 1 ? 0 : prev + 1));
  }, [filteredCerts.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen, closeLightbox, goPrev, goNext]);

  const currentCert = filteredCerts[lightboxIndex];

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/about">회사소개</a>
          <span>&gt;</span>
          <span>인증현황</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>인증현황</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us">회사소개</a>
          <a href="/about/organization">개요 및 조직도</a>
          <a href="/about/why-led">Why LED</a>
          <a href="/about/certifications" className="active">인증현황</a>
          <a href="/about/dealers">대리점 안내</a>
          <a href="/about/careers">인재채용</a>
        </div>
      </div>

      {/* Intro Section */}
      <section className="cert-intro-section">
        <div className="cert-intro-inner">
          <h2 className="cert-intro-title">LVS의 품질을 증명하는 인증 현황</h2>
          <p className="cert-intro-desc">
            국내외 공인 기관으로부터 취득한 인증서로 제품의 안전성과 품질을 보증합니다.
          </p>
          <div className="cert-stats">
            <div className="cert-stat-item">
              <span className="cert-stat-number">25+</span>
              <span className="cert-stat-label">보유 인증</span>
            </div>
            <div className="cert-stat-divider" />
            <div className="cert-stat-item">
              <span className="cert-stat-number">CE</span>
              <span className="cert-stat-label">유럽 안전 인증</span>
            </div>
            <div className="cert-stat-divider" />
            <div className="cert-stat-item">
              <span className="cert-stat-number">20년+</span>
              <span className="cert-stat-label">인증 이력</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          {/* Filter Tabs */}
          <div className="cert-filter">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`cert-filter-btn${activeFilter === f.key ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* Card Grid */}
          <div className="cert-grid">
            {filteredCerts.map((cert, idx) => (
              <div
                key={cert.id}
                className="cert-card"
                onClick={() => openLightbox(idx)}
              >
                <span className="cert-card-badge">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="cert-card-tag">
                  {cert.category?.label || ''}
                </span>
                <div className="cert-image">
                  <img
                    src={`${CERT_IMAGE_BASE}${cert.image}`}
                    alt={cert.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('cert-image-fallback');
                    }}
                  />
                  <div className="cert-image-overlay">
                    <span className="cert-zoom-icon">&#x1F50D;</span>
                  </div>
                </div>
                <h3>{cert.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && currentCert && (
        <div
          className="cert-lightbox-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          <button className="cert-lightbox-close" onClick={closeLightbox}>
            &times;
          </button>
          <button className="cert-lightbox-nav cert-lightbox-prev" onClick={goPrev}>
            &#8249;
          </button>
          <div className="cert-lightbox-content">
            <img
              className="cert-lightbox-image"
              src={`${CERT_IMAGE_BASE}${currentCert.image}`}
              alt={currentCert.title}
            />
            <div className="cert-lightbox-title">{currentCert.title}</div>
            <div className="cert-lightbox-counter">
              {lightboxIndex + 1} / {filteredCerts.length}
            </div>
          </div>
          <button className="cert-lightbox-nav cert-lightbox-next" onClick={goNext}>
            &#8250;
          </button>
        </div>
      )}
    </>
  );
}
