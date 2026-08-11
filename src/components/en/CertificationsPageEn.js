'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import '../../app/styles/globals.css';
import SupportSubNavEn from './SupportSubNavEn';

const CERT_IMAGE_BASE = '/images/certifications/';

// 인증 카테고리 key → 영문 라벨 (DB 라벨은 한국어)
const CATEGORY_LABELS_EN = {
  system: 'System Certification',
  product: 'Product Certification',
};

// "PS 인증서" 류의 제목을 영문 표기로 치환
const certTitleEn = (title) =>
  (title || '')
    .replace(/인증서/g, 'Certificate')
    .replace(/\s{2,}/g, ' ')
    .trim();

export default function CertificationsPageEn({ certifications = [], categories = [] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const labelFor = (cat) => CATEGORY_LABELS_EN[cat?.key] || cat?.label || '';

  const filters = useMemo(() => {
    const all = { key: 'all', label: 'All', count: certifications.length };
    const byCat = categories.map((cat) => ({
      key: cat.key,
      label: labelFor(cat),
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
          <a href="/en">Home</a>
          <span>&gt;</span>
          <a href="/en/about/us">Company</a>
          <span>&gt;</span>
          <span>Certifications</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>Certifications</h1>
          <p>LVS researches lighting technology that inspires every workplace.</p>
        </div>
      </section>

      <SupportSubNavEn section="about" active="/about/certifications" />

      {/* Intro Section */}
      <section className="cert-intro-section">
        <div className="cert-intro-inner">
          <h2 className="cert-intro-title">Certifications That Prove LVS Quality</h2>
          <p className="cert-intro-desc">
            Certificates from accredited bodies at home and abroad guarantee the safety and quality of our products.
          </p>
          <div className="cert-stats">
            <div className="cert-stat-item">
              <span className="cert-stat-number">25+</span>
              <span className="cert-stat-label">Certificates</span>
            </div>
            <div className="cert-stat-divider" />
            <div className="cert-stat-item">
              <span className="cert-stat-number">CE</span>
              <span className="cert-stat-label">European Safety</span>
            </div>
            <div className="cert-stat-divider" />
            <div className="cert-stat-item">
              <span className="cert-stat-number">20+ yrs</span>
              <span className="cert-stat-label">Certification History</span>
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
                  {labelFor(cert.category)}
                </span>
                <div className="cert-image">
                  <img
                    src={`${CERT_IMAGE_BASE}${cert.image}`}
                    alt={certTitleEn(cert.title)}
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
                <h3>{certTitleEn(cert.title)}</h3>
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
              alt={certTitleEn(currentCert.title)}
            />
            <div className="cert-lightbox-title">{certTitleEn(currentCert.title)}</div>
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
