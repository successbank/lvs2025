'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getDict, localeFromPathname, stripLocale, withLocale, togglePath } from '@/lib/i18n';

export default function Navigation({ companyInfo, navigationData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [liveMenus, setLiveMenus] = useState(null);
  const [productSubcategories, setProductSubcategories] = useState({});
  const [expandedMenus, setExpandedMenus] = useState([]);
  const pathname = usePathname();
  const { data: session } = useSession();

  const locale = localeFromPathname(pathname);
  const t = getDict(locale).nav;
  // 로케일별 API 프리픽스 — EN은 /api/en/* (번역 데이터)
  const apiBase = locale === 'en' ? '/api/en' : '/api';
  // 내부 링크에 로케일 프리픽스 적용 (KR은 원본 그대로)
  const L = (url) => withLocale(url, locale);

  // 클라이언트에서 최신 메뉴 데이터 fetch (캐시 우회)
  useEffect(() => {
    fetch(`${apiBase}/menu-items`)
      .then(res => res.json())
      .then(data => {
        if (data.menuItems && data.menuItems.length > 0) {
          setLiveMenus(data.menuItems);
        }
      })
      .catch(() => {});
  }, [apiBase]);

  // 모바일 메뉴용 제품 하위 카테고리 fetch (slug → children 매핑)
  useEffect(() => {
    fetch(`${apiBase}/categories?parentId=null&includeChildren=true`)
      .then(res => res.json())
      .then(data => {
        if (!data.categories) return;
        const map = {};
        data.categories.forEach(cat => {
          if (cat.children && cat.children.length > 0) {
            map[cat.slug] = cat.children;
          }
        });
        setProductSubcategories(map);
      })
      .catch(() => {});
  }, [apiBase]);

  // /products/{slug} 형태의 url에서 slug 추출
  const getCategorySlug = (url) => {
    const match = /^\/products\/([^/?#]+)/.exec(url || '');
    return match ? match[1] : null;
  };

  const getSubmenus = (url) => {
    const slug = getCategorySlug(url);
    return slug ? (productSubcategories[slug] || []) : [];
  };

  const toggleSubmenu = (id) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 우선순위: 클라이언트 fetch > 서버 prop > 폴백
  // EN은 서버 prop(한국어 라벨)을 건너뛰고 영문 폴백 메뉴 사용
  const menus = locale === 'en'
    ? (liveMenus || t.fallbackMenus)
    : (liveMenus || (navigationData && navigationData.length > 0 ? navigationData : t.fallbackMenus));

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
    setExpandedMenus([]);
    document.body.style.overflow = '';
  };

  // 활성 표시는 로케일 프리픽스를 제거한 경로로 비교 (KR/EN 동일 동작)
  const isActive = (url) => stripLocale(pathname).startsWith(url);

  return (
    <>
      {/* Header Top Bar */}
      <div className={`header-top ${isScrolled ? 'header-top-hidden' : ''}`}>
        <div className="header-top-content">
          <span className="header-tagline">{t.tagline}</span>
          <div className="header-top-links">
            <a
              href={togglePath(pathname, 'ko')}
              aria-label="한국어"
              style={locale === 'ko' ? { fontWeight: 700, textDecoration: 'underline' } : undefined}
            >ko</a>
            <span className="header-divider">|</span>
            <a
              href={togglePath(pathname, 'en')}
              aria-label="English"
              style={locale === 'en' ? { fontWeight: 700, textDecoration: 'underline' } : undefined}
            >en</a>
            <span className="header-divider">|</span>
            <a href={L('/about/dealers')}>{t.dealers}</a>
            <span className="header-divider">|</span>
            <a href={L('/support/tech-guide')}>{t.techSupport}</a>
            <span className="header-divider">|</span>
            <a href={L('/support/downloads')}>{t.downloadCenter}</a>
            <span className="header-divider">|</span>
            <a href={L('/about/careers')}>{t.careers}</a>
            <span className="header-divider">|</span>
            {session ? (
              <>
                <a href={L('/mypage')}>{session.user.name}{t.memberSuffix}</a>
                <span className="header-divider">|</span>
                <a href="#" onClick={(e) => { e.preventDefault(); signOut({ callbackUrl: locale === 'en' ? '/en' : '/' }); }}>{t.logout}</a>
              </>
            ) : (
              <>
                <a href={L('/login')}>{t.login}</a>
                <span className="header-divider">|</span>
                <a href={L('/register')}>{t.register}</a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`main-nav ${isScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <a href={locale === 'en' ? '/en' : '/'} className="logo">
            <img src="/images/logo.png" alt={t.logoAlt} className="logo-img" />
          </a>
          <ul className="nav-menu">
            {menus.map(item => (
              <li key={item.id}>
                <a href={L(item.url)} className={isActive(item.url) ? 'active' : ''}>{item.label}</a>
                {item.type === 'dropdown' && item.children && item.children.length > 0 && (
                  <ul className="dropdown-menu">
                    {item.children.map(child => (
                      <li key={child.id}><a href={L(child.url)}>{child.label}</a></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <a href={L('/support/consultation')} className="nav-cta-btn">{t.consultCta}</a>
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
              <div className="mobile-menu-group-title">{t.productsGroup}</div>
              <ul>
                <li><a href={L('/products')} onClick={closeMobileMenu}>{t.allProducts}</a></li>
                {productMenus.map(item => {
                  const submenus = getSubmenus(item.url);
                  const isExpanded = expandedMenus.includes(item.id);
                  const categorySlug = getCategorySlug(item.url);
                  return (
                    <li key={item.id} className={submenus.length > 0 ? 'mobile-menu-has-sub' : ''}>
                      <div className="mobile-menu-row">
                        <a href={L(item.url)} onClick={closeMobileMenu}>{item.label}</a>
                        {submenus.length > 0 && (
                          <button
                            type="button"
                            className={`mobile-submenu-toggle ${isExpanded ? 'is-open' : ''}`}
                            aria-expanded={isExpanded}
                            aria-label={t.submenuAria(item.label, isExpanded)}
                            onClick={() => toggleSubmenu(item.id)}
                          >
                            {isExpanded ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 5v14M5 12h14"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                      {submenus.length > 0 && isExpanded && (
                        <ul className="mobile-submenu">
                          {submenus.map(sub => (
                            <li key={sub.id}>
                              <a
                                href={L(`/products/${categorySlug}/${sub.slug}`)}
                                onClick={closeMobileMenu}
                              >
                                {sub.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
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
                      <li key={child.id}><a href={L(child.url)} onClick={closeMobileMenu}>{child.label}</a></li>
                    ))
                  : <li><a href={L(item.url)} onClick={closeMobileMenu}>{item.label}</a></li>
                }
              </ul>
            </div>
          ))}
        </div>
        <div className="mobile-menu-bottom">
          <a href={L('/support/consultation')} className="mobile-cta-btn" onClick={closeMobileMenu}>{t.consultCta}</a>
          <a href={`tel:${companyInfo?.phone || '032-461-1800'}`} className="mobile-phone">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {companyInfo?.phone || '032-461-1800'}
          </a>
        </div>
      </div>
    </>
  );
}
