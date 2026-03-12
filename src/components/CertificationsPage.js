'use client';

import { useState, useEffect, useCallback } from 'react';
import '../app/styles/globals.css';

const CERT_DATA = [
  { id: 1, title: 'DB,DBS 인증서', image: 'thumb_5a66b7c4012ad.JPG', category: 'system' },
  { id: 2, title: 'EN04 인증서', image: '5b0f53694aa8b.jpg', category: 'system' },
  { id: 3, title: 'EN02 인증서', image: '5b0f4f02269de.jpg', category: 'system' },
  { id: 4, title: 'EN-08 Series CE Certificates', image: 'thumb_5afbd2637efed.jpg', category: 'system' },
  { id: 5, title: 'SHL 인증서', image: 'thumb_5a66c9a28d3e1.JPG', category: 'system' },
  { id: 6, title: 'PT08-N04_LVD 인증서', image: 'thumb_5a66c960d563a.JPG', category: 'product' },
  { id: 7, title: 'PT08-N04 인증서', image: 'thumb_5a66c9480236f.JPG', category: 'product' },
  { id: 8, title: 'PT 인증서', image: 'thumb_5a66c895d9522.JPG', category: 'product' },
  { id: 9, title: 'PS-21 인증서', image: 'thumb_5a66c87aba9c6.JPG', category: 'product' },
  { id: 10, title: 'PS 인증서', image: 'thumb_5a66c864575ac.JPG', category: 'product' },
  { id: 11, title: 'PN 인증서', image: 'thumb_5a66c838e2fae.JPG', category: 'product' },
  { id: 12, title: 'PA10 인증서', image: 'thumb_5a66c81f54b11.JPG', category: 'product' },
  { id: 13, title: 'PA 인증서', image: 'thumb_5a66c808dd7c6.JPG', category: 'product' },
  { id: 14, title: 'ILA-R, ILA-S 인증서', image: 'thumb_5a66c7eeaccb0.JPG', category: 'product' },
  { id: 15, title: 'IFS, IFSM 인증서', image: 'thumb_5a66c7b60ac79.JPG', category: 'product' },
  { id: 16, title: 'IFRK 인증서', image: 'thumb_5a66c78dc254b.JPG', category: 'product' },
  { id: 17, title: 'IFD 인증서', image: 'thumb_5a66c7776f7e0.JPG', category: 'product' },
  { id: 18, title: 'IDM 인증서', image: 'thumb_5a66c75ca4f18.JPG', category: 'product' },
  { id: 19, title: 'ICFV 인증서', image: 'thumb_5a66c675c358e.JPG', category: 'product' },
  { id: 20, title: 'HLS 인증서', image: 'thumb_5a66c65bf1987.JPG', category: 'product' },
  { id: 21, title: 'DS 인증서', image: 'thumb_5a66c63bbc532.JPG', category: 'product' },
  { id: 22, title: 'DRT, DRF 인증서', image: 'thumb_5a66c628b3425.JPG', category: 'product' },
  { id: 23, title: 'DR4 인증서', image: 'thumb_5a66c60c3781c.JPG', category: 'product' },
  { id: 24, title: 'DN 인증서', image: 'thumb_5a66c5e05a13d.JPG', category: 'product' },
  { id: 25, title: 'DL, DLA2 인증서', image: 'thumb_5a66c5c2b6ff2.JPG', category: 'product' },
];

const CERT_IMAGE_BASE = 'http://lvs.webmaker21.kr/ksboard/data/cert/';

const FILTERS = [
  { key: 'all', label: '전체', count: 25 },
  { key: 'product', label: '제품 인증', count: 20 },
  { key: 'system', label: '시스템 인증', count: 5 },
];

export default function CertificationsPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredCerts = activeFilter === 'all'
    ? CERT_DATA
    : CERT_DATA.filter((c) => c.category === activeFilter);

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
            {FILTERS.map((f) => (
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
                  {cert.category === 'system' ? '시스템' : '제품'}
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
