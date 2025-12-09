'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function DealersPage({ companyInfo, dealers = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
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
                <li><a href="/about/certifications">인증현황</a></li>
                <li><a href="/about/dealers" className="active">대리점 안내</a></li>
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
          <span>대리점 안내</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>대리점 안내</h1>
          <p>Dealer Network</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us">회사소개</a>
          <a href="/about/organization">개요 및 조직도</a>
          <a href="/about/why-led">Why LED</a>
          <a href="/about/certifications">인증현황</a>
          <a href="/about/dealers" className="active">대리점 안내</a>
        </div>
      </div>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          <div className="company-intro">
            <h2>전국 대리점 네트워크</h2>
            <div className="intro-text">
              <p>
                (주)엘브이에스는 전국 각지에 대리점 네트워크를 구축하여
                고객님께 빠르고 정확한 서비스를 제공합니다.
              </p>
              <p>
                제품 구매, 기술 상담, A/S 등 모든 서비스를 가까운 대리점에서 받으실 수 있습니다.
              </p>
            </div>
          </div>

          {/* 국내 대리점 */}
          <div className="dealer-section">
            <h3 className="dealer-section-title">국내 대리점</h3>
            <div className="dealer-grid">
              {dealers.filter(d => d.type === 'domestic').map((dealer) => (
                <div key={dealer.id} className="dealer-card">
                  {dealer.logo_url && (
                    <div className="dealer-logo">
                      <img src={dealer.logo_url} alt={dealer.name} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="dealer-header">
                    <div className="dealer-name">{dealer.name}</div>
                    <div className="dealer-region">{dealer.region}</div>
                  </div>
                  <div className="dealer-info">
                    <div className="dealer-info-item">
                      <div className="dealer-info-label">주소</div>
                      <div className="dealer-info-value">{dealer.address}</div>
                    </div>
                    {dealer.phone && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">전화</div>
                        <div className="dealer-info-value">{dealer.phone}</div>
                      </div>
                    )}
                    {dealer.fax && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">팩스</div>
                        <div className="dealer-info-value">{dealer.fax}</div>
                      </div>
                    )}
                    {dealer.email && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">이메일</div>
                        <div className="dealer-info-value">{dealer.email}</div>
                      </div>
                    )}
                    {dealer.contact_person && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">담당자</div>
                        <div className="dealer-info-value">{dealer.contact_person}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 해외 대리점 */}
          <div className="dealer-section" style={{ marginTop: '60px' }}>
            <h3 className="dealer-section-title">해외 대리점</h3>
            <div className="dealer-grid">
              {dealers.filter(d => d.type === 'international').map((dealer) => (
                <div key={dealer.id} className="dealer-card">
                  {dealer.logo_url && (
                    <div className="dealer-logo">
                      <img src={dealer.logo_url} alt={dealer.name} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="dealer-header">
                    <div className="dealer-name">{dealer.name}</div>
                    <div className="dealer-region">{dealer.region}</div>
                  </div>
                  <div className="dealer-info">
                    <div className="dealer-info-item">
                      <div className="dealer-info-label">주소</div>
                      <div className="dealer-info-value">{dealer.address}</div>
                    </div>
                    {dealer.phone && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">전화</div>
                        <div className="dealer-info-value">{dealer.phone}</div>
                      </div>
                    )}
                    {dealer.fax && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">팩스</div>
                        <div className="dealer-info-value">{dealer.fax}</div>
                      </div>
                    )}
                    {dealer.email && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">이메일</div>
                        <div className="dealer-info-value">{dealer.email}</div>
                      </div>
                    )}
                    {dealer.contact_person && (
                      <div className="dealer-info-item">
                        <div className="dealer-info-label">담당자</div>
                        <div className="dealer-info-value">{dealer.contact_person}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dealer Inquiry */}
          <div style={{ marginTop: '80px', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', padding: '60px 40px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px' }}>
              대리점 개설 문의
            </h3>
            <p style={{ fontSize: '16px', marginBottom: '30px', opacity: '0.9' }}>
              (주)엘브이에스의 대리점이 되어 함께 성장하실 파트너를 모집합니다.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '5px' }}>전화 문의</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{companyInfo?.phone || '032-461-1800'}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '5px' }}>이메일 문의</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{companyInfo?.email || 'info@lvs.co.kr'}</div>
              </div>
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
