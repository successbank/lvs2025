'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function AboutUsPage({ companyInfo, history = [] }) {
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
                <li><a href="/about/us" className="active">회사소개</a></li>
                <li><a href="/about/organization">개요 및 조직도</a></li>
                <li><a href="/about/why-led">Why LED</a></li>
                <li><a href="/about/certifications">인증현황</a></li>
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
          <span>회사소개</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>회사소개</h1>
          <p>Lighting for Vision System</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us" className="active">회사소개</a>
          <a href="/about/organization">개요 및 조직도</a>
          <a href="/about/why-led">Why LED</a>
          <a href="/about/certifications">인증현황</a>
          <a href="/about/dealers">대리점 안내</a>
        </div>
      </div>

      {/* Company Introduction */}
      <section className="content-section">
        <div className="container">
          <div className="company-intro">
            <h2>고객과 함께 성장하는 기업</h2>
            <div className="intro-text">
              <p>
                (주)엘브이에스는 산업용 LED 조명 전문 기업으로,
                머신비전 시스템을 위한 최적의 조명 솔루션을 제공합니다.
              </p>
              <p>
                20년 이상의 경험과 기술력을 바탕으로 고객의 요구사항을 정확히 분석하고,
                최적의 조명 솔루션을 제안합니다.
              </p>
              <p>
                지속적인 연구개발을 통해 혁신적인 제품을 개발하며,
                고객 만족을 최우선으로 생각하는 기업이 되겠습니다.
              </p>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="vision-mission">
            <div className="vm-card">
              <h3>비전</h3>
              <p>머신비전 조명 분야의 글로벌 리더</p>
            </div>
            <div className="vm-card">
              <h3>미션</h3>
              <p>최고의 품질과 기술력으로 고객 가치 창출</p>
            </div>
            <div className="vm-card">
              <h3>핵심가치</h3>
              <p>혁신, 품질, 고객만족, 정직</p>
            </div>
          </div>

          {/* Company Info Grid */}
          <div className="company-info-grid">
            <div className="info-card">
              <div className="info-label">회사명</div>
              <div className="info-value">{companyInfo?.name || '(주)엘브이에스'}</div>
            </div>
            <div className="info-card">
              <div className="info-label">대표이사</div>
              <div className="info-value">{companyInfo?.ceo || '김태화'}</div>
            </div>
            <div className="info-card">
              <div className="info-label">사업자등록번호</div>
              <div className="info-value">{companyInfo?.business_number || '131-86-14914'}</div>
            </div>
            <div className="info-card">
              <div className="info-label">주소</div>
              <div className="info-value">{companyInfo?.address || '인천광역시 연수구 송도미래로 30'}</div>
            </div>
            <div className="info-card">
              <div className="info-label">전화</div>
              <div className="info-value">{companyInfo?.phone || '032-461-1800'}</div>
            </div>
            <div className="info-card">
              <div className="info-label">팩스</div>
              <div className="info-value">{companyInfo?.fax || '032-461-1001'}</div>
            </div>
          </div>

          {/* Company History */}
          <div className="company-history">
            <h2>연혁</h2>
            <div className="history-timeline">
              {history.map((item, index) => (
                <div key={item.id} className="history-item">
                  <div className="history-year">
                    {item.year}{item.month ? `.${String(item.month).padStart(2, '0')}` : ''}
                  </div>
                  <div className="history-content">
                    <h4>{item.title}</h4>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              ))}
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
