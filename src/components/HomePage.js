'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function HomePage({ categories = [], featuredProducts = [], notices = [], companyInfo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productFinderOpen, setProductFinderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const openProductFinder = () => {
    setProductFinderOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeProductFinder = () => {
    setProductFinderOpen(false);
    document.body.style.overflow = '';
    setCurrentStep(1);
    setSelectedOption(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
              <a href="/about">회사소개</a>
              <ul className="dropdown-menu">
                <li><a href="/about/us">회사소개</a></li>
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
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a href={`/products?category=${cat.slug}`} onClick={closeMobileMenu}>
                      {cat.name}
                    </a>
                  </li>
                ))}
                <li><a href="/about" onClick={closeMobileMenu}>회사소개</a></li>
                <li><a href="/support" onClick={closeMobileMenu}>고객지원</a></li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="product-image">
            <div className="product-showcase">
              <div className="product-inner">
                <div className="product-lens"></div>
                <div className="product-label">
                  {featuredProducts[currentSlide]?.modelName || 'HPLS-CW150-V2'}
                </div>
              </div>
            </div>
          </div>
          <div className="product-info">
            <h1>{featuredProducts[currentSlide]?.name || 'HPLS-CW150-V2'}</h1>
            <h2>{featuredProducts[currentSlide]?.summary || 'Designed to Replace 250W Metal Halide Light'}</h2>
            <p>Lighting for Vision System</p>
            <div className="carousel-indicators">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={currentSlide === index ? 'active' : ''}
                  onClick={() => setCurrentSlide(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="contact-banner">
        <div className="contact-banner-content">
          <div className="contact-banner-title">
            <h3>고객센터</h3>
          </div>
          <div className="contact-banner-info">
            <div className="contact-phone">
              <div className="contact-phone-number">
                {companyInfo?.phone || '032-461-1800'}
              </div>
            </div>
            <div className="contact-hours">
              상담시간 : {companyInfo?.workingHours || '평일 09:00~18:00'}<br/>
              점심시간 : {companyInfo?.lunchTime || '12:00~13:00'} / {companyInfo?.closedDays || '일요일, 공휴일 휴무'}
            </div>
          </div>
        </div>
      </section>

      {/* Standard Lighting */}
      <section className="standard-lighting">
        <div className="section-header">
          <h2>Standard Lighting</h2>
          <p>엘브이에스는 모든 현장에 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
        <div className="lighting-grid">
          {categories.map((category) =>
            category.children?.slice(0, 4).map((subcat) => (
              <div key={subcat.id} className="lighting-item">
                <div className="lighting-image-placeholder">💡</div>
                <h4>{subcat.name}</h4>
                <p>{subcat.description || ''}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Notices */}
      <section className="info-section">
        <div className="info-container">
          <div className="notice-section">
            <h3>공지사항</h3>
            <div className="notice-cards">
              {notices.slice(0, 2).map((notice) => (
                <div key={notice.id} className="notice-card">
                  <div className="notice-date">
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                  <a href={`/support/notices/${notice.id}`} className="notice-title">
                    {notice.title}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="services-box">
            <h3>서비스 바로가기</h3>
            <div className="service-icons">
              <div className="service-item">
                <div className="service-icon">💬</div>
                <p>온라인 상담실</p>
              </div>
              <div className="service-item">
                <div className="service-icon">📍</div>
                <p>오시는 길</p>
              </div>
              <div className="service-item">
                <div className="service-icon">📄</div>
                <p>카달로그 신청</p>
              </div>
              <div className="service-item">
                <div className="service-icon">✓</div>
                <p>인증현황</p>
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
              사업자번호: {companyInfo?.businessNumber || '131-86-14914'}<br/>
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
