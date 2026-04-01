'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

// 폴백 메뉴 데이터 (DB 데이터가 없을 때 사용)
const fallbackMenus = [
  { id: 'f1', label: '일반조명', url: '/products/general-lighting', type: 'link', children: [] },
  { id: 'f2', label: '파워서플라이', url: '/products/power-supply', type: 'link', children: [] },
  { id: 'f3', label: 'LED LIGHTSOURCE', url: '/products/led-lightsource', type: 'link', children: [] },
  { id: 'f4', label: '회사소개', url: '/about', type: 'dropdown', children: [
    { id: 'f4-1', label: '회사소개', url: '/about/us' },
    { id: 'f4-2', label: '개요 및 조직도', url: '/about/organization' },
    { id: 'f4-3', label: 'Why LED', url: '/about/why-led' },
    { id: 'f4-4', label: '인증현황', url: '/about/certifications' },
    { id: 'f4-5', label: '대리점 안내', url: '/about/dealers' },
  ]},
  { id: 'f5', label: '고객지원', url: '/support', type: 'dropdown', children: [
    { id: 'f5-1', label: '공지사항', url: '/support/notices' },
    { id: 'f5-2', label: '기술자료', url: '/support/tech-guide' },
    { id: 'f5-3', label: '다운로드', url: '/support/downloads' },
    { id: 'f5-4', label: '온라인 상담', url: '/support/consultation' },
    { id: 'f5-5', label: '찾아오시는 길', url: '/support/contact' },
    { id: 'f5-6', label: '카탈로그 신청', url: '/support/catalog' },
  ]},
];

export default function Navigation({ companyInfo, navigationData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [liveMenus, setLiveMenus] = useState(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  // 클라이언트에서 최신 메뉴 데이터 fetch (캐시 우회)
  useEffect(() => {
    fetch('/api/menu-items')
      .then(res => res.json())
      .then(data => {
        if (data.menuItems && data.menuItems.length > 0) {
          setLiveMenus(data.menuItems);
        }
      })
      .catch(() => {});
  }, []);

  // 우선순위: 클라이언트 fetch > 서버 prop > 폴백
  const menus = liveMenus || (navigationData && navigationData.length > 0 ? navigationData : fallbackMenus);

  // 모바일 메뉴용 그룹 분류: 제품 메뉴와 나머지 분리
  const productMenus = menus.filter(m => m.url.startsWith('/products'));
  const otherMenus = menus.filter(m => !m.url.startsWith('/products'));

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

  const isActive = (url) => pathname.startsWith(url);

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
            {session ? (
              <>
                <span style={{ color: '#d1d5db' }}>{session.user.name}님</span>
                <span className="header-divider">|</span>
                <a href="#" onClick={(e) => { e.preventDefault(); signOut({ callbackUrl: '/' }); }}>로그아웃</a>
              </>
            ) : (
              <>
                <a href="/login">로그인</a>
                <span className="header-divider">|</span>
                <a href="/register">회원가입</a>
              </>
            )}
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
            {menus.map(item => (
              <li key={item.id}>
                <a href={item.url} className={isActive(item.url) ? 'active' : ''}>{item.label}</a>
                {item.type === 'dropdown' && item.children && item.children.length > 0 && (
                  <ul className="dropdown-menu">
                    {item.children.map(child => (
                      <li key={child.id}><a href={child.url}>{child.label}</a></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
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

      {/* Mobile Menu */}
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
          {/* 제품 메뉴 그룹 */}
          {productMenus.length > 0 && (
            <div className="mobile-menu-group">
              <div className="mobile-menu-group-title">제품소개</div>
              <ul>
                <li><a href="/products" onClick={closeMobileMenu}>전체 제품</a></li>
                {productMenus.map(item => (
                  <li key={item.id}><a href={item.url} onClick={closeMobileMenu}>{item.label}</a></li>
                ))}
              </ul>
            </div>
          )}
          {/* 나머지 메뉴 그룹 */}
          {otherMenus.map(item => (
            <div key={item.id} className="mobile-menu-group">
              <div className="mobile-menu-group-title">{item.label}</div>
              <ul>
                {item.type === 'dropdown' && item.children && item.children.length > 0
                  ? item.children.map(child => (
                      <li key={child.id}><a href={child.url} onClick={closeMobileMenu}>{child.label}</a></li>
                    ))
                  : <li><a href={item.url} onClick={closeMobileMenu}>{item.label}</a></li>
                }
              </ul>
            </div>
          ))}
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
