'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function OrganizationPage({ companyInfo }) {
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
                <li><a href="/about/organization" className="active">개요 및 조직도</a></li>
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
          <span>개요 및 조직도</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>개요 및 조직도</h1>
          <p>Organization Structure</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us">회사소개</a>
          <a href="/about/organization" className="active">개요 및 조직도</a>
          <a href="/about/why-led">Why LED</a>
          <a href="/about/certifications">인증현황</a>
          <a href="/about/dealers">대리점 안내</a>
        </div>
      </div>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          {/* Company Overview */}
          <div className="company-intro">
            <h2>회사 개요</h2>
            <div className="company-info-grid" style={{ marginTop: '30px' }}>
              <div className="info-card">
                <div className="info-label">회사명</div>
                <div className="info-value">{companyInfo?.name || '(주)엘브이에스'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">대표이사</div>
                <div className="info-value">{companyInfo?.ceo || '김태화'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">설립일</div>
                <div className="info-value">2005년 1월</div>
              </div>
              <div className="info-card">
                <div className="info-label">사업자등록번호</div>
                <div className="info-value">{companyInfo?.business_number || '131-86-14914'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">업종</div>
                <div className="info-value">산업용 LED 조명 제조 및 판매</div>
              </div>
              <div className="info-card">
                <div className="info-label">주요사업</div>
                <div className="info-value">머신비전용 조명, 일반조명, 파워서플라이</div>
              </div>
              <div className="info-card">
                <div className="info-label">본사 주소</div>
                <div className="info-value">{companyInfo?.address || '인천광역시 연수구 송도미래로 30'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">연락처</div>
                <div className="info-value">
                  Tel: {companyInfo?.phone || '032-461-1800'}<br/>
                  Fax: {companyInfo?.fax || '032-461-1001'}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">임직원 수</div>
                <div className="info-value">약 25명</div>
              </div>
            </div>
          </div>

          {/* Organization Chart */}
          <div className="org-chart">
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '40px', textAlign: 'center' }}>조직도</h2>

            {/* CEO Level */}
            <div className="org-level">
              <div className="org-boxes" style={{ maxWidth: '300px', margin: '0 auto' }}>
                <div className="org-box ceo">
                  <div className="org-title">대표이사</div>
                  <div className="org-name">{companyInfo?.ceo || '김태화'}</div>
                </div>
              </div>
            </div>

            {/* Executive Level */}
            <div className="org-level">
              <div className="org-boxes">
                <div className="org-box">
                  <div className="org-title">경영지원본부</div>
                  <div className="org-name">총무/인사/회계</div>
                </div>
                <div className="org-box">
                  <div className="org-title">연구개발본부</div>
                  <div className="org-name">제품개발/기술연구</div>
                </div>
                <div className="org-box">
                  <div className="org-title">생산본부</div>
                  <div className="org-name">제조/품질관리</div>
                </div>
                <div className="org-box">
                  <div className="org-title">영업본부</div>
                  <div className="org-name">국내/해외 영업</div>
                </div>
              </div>
            </div>

            {/* Department Level */}
            <div className="org-level">
              <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '20px' }}>경영지원본부</h3>
              <div className="org-boxes">
                <div className="org-box">
                  <div className="org-title">총무팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">인사팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">회계팀</div>
                </div>
              </div>
            </div>

            <div className="org-level">
              <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '20px' }}>연구개발본부</h3>
              <div className="org-boxes">
                <div className="org-box">
                  <div className="org-title">기술연구팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">제품개발팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">설계팀</div>
                </div>
              </div>
            </div>

            <div className="org-level">
              <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '20px' }}>생산본부</h3>
              <div className="org-boxes">
                <div className="org-box">
                  <div className="org-title">생산관리팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">제조팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">품질관리팀</div>
                </div>
              </div>
            </div>

            <div className="org-level">
              <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '20px' }}>영업본부</h3>
              <div className="org-boxes">
                <div className="org-box">
                  <div className="org-title">국내영업팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">해외영업팀</div>
                </div>
                <div className="org-box">
                  <div className="org-title">고객지원팀</div>
                </div>
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
