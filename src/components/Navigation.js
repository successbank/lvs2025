'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation({ companyInfo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const isProductsActive = pathname.startsWith('/products');
  const isAboutActive = pathname.startsWith('/about');
  const isSupportActive = pathname.startsWith('/support');

  // Sticky nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

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
      {/* Header Top Bar */}
      <div className={`header-top ${isScrolled ? 'header-top-hidden' : ''}`}>
        <div className="header-top-content">
          <span className="header-tagline">산업용 LED 조명 전문기업</span>
          <div className="header-top-links">
            <a href="/about/dealers">대리점 안내</a>
            <span className="header-divider">|</span>
            <a href="/support/tech-guide">기술지원</a>
            <span className="header-divider">|</span>
            <a href="/support/downloads">다운로드 센터</a>
            <span className="header-divider">|</span>
            <a href="/about/careers">인재채용</a>
            <span className="header-divider">|</span>
            <a href="/en">ENGLISH</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`main-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <a href="/" className="logo">
            <img src="/images/logo.png" alt="LVS - Lighting for Vision System" className="logo-img" />
          </a>
          <ul className="nav-menu">
            <li>
              <a href="/products" className={isProductsActive ? 'active' : ''}>제품소개</a>
              <ul className="dropdown-menu">
                <li>
                  <a href="/products/general-lighting">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    일반조명
                  </a>
                </li>
                <li>
                  <a href="/products/power-supply">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    파워서플라이
                  </a>
                </li>
                <li>
                  <a href="/products/led-lightsource">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>
                    LED LIGHTSOURCE
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="/about" className={isAboutActive ? 'active' : ''}>회사소개</a>
              <ul className="dropdown-menu">
                <li><a href="/about/us">회사소개</a></li>
                <li><a href="/about/organization">개요 및 조직도</a></li>
                <li><a href="/about/why-led">Why LED</a></li>
                <li><a href="/about/certifications">인증현황</a></li>
                <li><a href="/about/dealers">대리점 안내</a></li>
              </ul>
            </li>
            <li>
              <a href="/support" className={isSupportActive ? 'active' : ''}>고객지원</a>
              <ul className="dropdown-menu">
                <li><a href="/support/notices">공지사항</a></li>
                <li><a href="/support/tech-guide">기술자료</a></li>
                <li><a href="/support/downloads">다운로드</a></li>
                <li><a href="/support/consultation">온라인 상담</a></li>
                <li><a href="/support/contact">찾아오시는 길</a></li>
                <li><a href="/support/catalog">카탈로그 신청</a></li>
              </ul>
            </li>
          </ul>
          <div className="nav-actions">
            <a href="/support/consultation" className="nav-cta-btn">상담문의</a>
            <div className={`mobile-menu-toggle ${mobileMenuOpen ? 'hamburger-active' : ''}`} onClick={toggleMobileMenu}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - always in DOM for CSS animation */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <img src="/images/logo.png" alt="LVS" className="logo-img mobile-logo-img" />
          <div className="mobile-menu-close" onClick={closeMobileMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
        </div>
        <div className="mobile-menu-items">
          <div className="mobile-menu-group">
            <div className="mobile-menu-group-title">제품소개</div>
            <ul>
              <li><a href="/products" onClick={closeMobileMenu}>전체 제품</a></li>
              <li><a href="/products/general-lighting" onClick={closeMobileMenu}>일반조명</a></li>
              <li><a href="/products/power-supply" onClick={closeMobileMenu}>파워서플라이</a></li>
              <li><a href="/products/led-lightsource" onClick={closeMobileMenu}>LED LIGHTSOURCE</a></li>
            </ul>
          </div>
          <div className="mobile-menu-group">
            <div className="mobile-menu-group-title">회사소개</div>
            <ul>
              <li><a href="/about/us" onClick={closeMobileMenu}>회사소개</a></li>
              <li><a href="/about/organization" onClick={closeMobileMenu}>개요 및 조직도</a></li>
              <li><a href="/about/why-led" onClick={closeMobileMenu}>Why LED</a></li>
              <li><a href="/about/certifications" onClick={closeMobileMenu}>인증현황</a></li>
              <li><a href="/about/dealers" onClick={closeMobileMenu}>대리점 안내</a></li>
            </ul>
          </div>
          <div className="mobile-menu-group">
            <div className="mobile-menu-group-title">고객지원</div>
            <ul>
              <li><a href="/support/notices" onClick={closeMobileMenu}>공지사항</a></li>
              <li><a href="/support/tech-guide" onClick={closeMobileMenu}>기술자료</a></li>
              <li><a href="/support/downloads" onClick={closeMobileMenu}>다운로드</a></li>
              <li><a href="/support/consultation" onClick={closeMobileMenu}>온라인 상담</a></li>
              <li><a href="/support/contact" onClick={closeMobileMenu}>찾아오시는 길</a></li>
              <li><a href="/support/catalog" onClick={closeMobileMenu}>카탈로그 신청</a></li>
            </ul>
          </div>
        </div>
        <div className="mobile-menu-bottom">
          <a href="/support/consultation" className="mobile-cta-btn" onClick={closeMobileMenu}>상담문의</a>
          <a href={`tel:${companyInfo?.phone || '032-461-1800'}`} className="mobile-phone">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {companyInfo?.phone || '032-461-1800'}
          </a>
        </div>
      </div>
    </>
  );
}
