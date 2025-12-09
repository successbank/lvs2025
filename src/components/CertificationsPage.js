'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function CertificationsPage({ companyInfo, certifications = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      {/* Header */}
      <div className="header-top">
        <div className="header-top-content">
          <a href="/about/dealers">대리점 안내</a>
          <a href="/support/tech-guide">기술지원</a>
          <a href="/support/downloads">다운로드 센터</a>
          <a href="/about/careers">인재채용</a>
          <a href="/en">ENGLISH</a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <a href="/" className="logo">
            <div className="logo-text">LVS</div>
          </a>
          <ul className="nav-menu">
            <li>
              <a href="/products">제품소개</a>
              <ul className="dropdown-menu">
                <li><a href="/products/general-lighting">일반조명</a></li>
                <li><a href="/products/power-supply">파워서플라이</a></li>
                <li><a href="/products/led-lightsource">LED LIGHTSOURCE</a></li>
              </ul>
            </li>
            <li>
              <a href="/about" className="active">회사소개</a>
              <ul className="dropdown-menu">
                <li><a href="/about/us">회사소개</a></li>
                <li><a href="/about/organization">개요 및 조직도</a></li>
                <li><a href="/about/why-led">Why LED</a></li>
                <li><a href="/about/certifications" className="active">인증현황</a></li>
                <li><a href="/about/dealers">대리점 안내</a></li>
              </ul>
            </li>
            <li><a href="/support">고객지원</a></li>
          </ul>
          <div className="nav-actions">
            <div className="search-icon">
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <svg viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
          <div className="mobile-menu active">
            <div className="mobile-menu-header">
              <div className="logo-text">LVS</div>
              <div className="mobile-menu-close" onClick={closeMobileMenu}>×</div>
            </div>
            <div className="mobile-menu-items">
              <ul>
                <li><a href="/products" onClick={closeMobileMenu}>제품소개</a></li>
                <li><a href="/about" onClick={closeMobileMenu}>회사소개</a></li>
                <li><a href="/support" onClick={closeMobileMenu}>고객지원</a></li>
              </ul>
            </div>
          </div>
        </>
      )}

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
          <p>Certifications & Patents</p>
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

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          <div className="company-intro">
            <h2>인증 및 특허 현황</h2>
            <div className="intro-text">
              <p>
                (주)엘브이에스는 국제 품질 인증과 다양한 특허를 보유하고 있으며,
                지속적인 기술 개발을 통해 제품의 품질과 신뢰성을 보장합니다.
              </p>
            </div>
          </div>

          {/* Certifications Grid */}
          <div className="cert-grid">
            {certifications.map((cert) => (
              <div key={cert.id} className="cert-card">
                <div className="cert-image">
                  {cert.image_url ? (
                    <img src={cert.image_url} alt={cert.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    '📜'
                  )}
                </div>
                <h3>{cert.title}</h3>
                <p><strong>발급기관:</strong> {cert.issuer}</p>
                {cert.issue_date && <p><strong>발급일:</strong> {formatDate(cert.issue_date)}</p>}
                {cert.certificate_number && <p><strong>인증번호:</strong> {cert.certificate_number}</p>}
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div style={{ marginTop: '80px', background: '#f8f9fa', padding: '40px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '20px', textAlign: 'center' }}>
              품질 경영 방침
            </h3>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <ul style={{ lineHeight: '2', color: '#555', fontSize: '16px' }}>
                <li>고객 만족을 최우선으로 하는 품질 경영 실현</li>
                <li>지속적인 품질 개선 및 혁신 활동 추진</li>
                <li>국제 표준에 부합하는 품질 시스템 구축 및 운영</li>
                <li>친환경 제품 개발 및 사회적 책임 이행</li>
                <li>임직원의 품질 의식 향상 및 전문성 강화</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="company-info">
            <h4>COMPANY INFO</h4>
            <p>
              {companyInfo?.name || '(주)엘브이에스'} 대표이사: {companyInfo?.ceo || '김태화'}
              사업자번호: {companyInfo?.business_number || '131-86-14914'}<br/>
              {companyInfo?.address || '인천시 연수구 송도미래로30 스마트밸리 B동 801호'}
            </p>
          </div>
          <div className="contact-section">
            <h4>CONTACT US</h4>
            <div className="contact-numbers">
              <div className="contact-item">
                <span>📞 {companyInfo?.phone || '032-461-1800'}</span>
              </div>
              <div className="contact-item">
                <span>📠 {companyInfo?.fax || '032-461-1001'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>COPYRIGHT(C) {companyInfo?.name || '(주)엘브이에스'}. ALL RIGHT RESERVED.</p>
        </div>
      </footer>
    </>
  );
}
