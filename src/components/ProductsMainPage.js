'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function ProductsMainPage({ categories = [] }) {
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
              <a href="/products" className="active">제품소개</a>
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
            <li>
              <a href="/support">고객지원</a>
            </li>
          </ul>
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-menu-close" onClick={closeMobileMenu}>×</button>
            <ul>
              <li><a href="/products" onClick={closeMobileMenu}>제품소개</a></li>
              <li><a href="/about" onClick={closeMobileMenu}>회사소개</a></li>
              <li><a href="/support" onClick={closeMobileMenu}>고객지원</a></li>
            </ul>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span>&gt;</span>
        <span>제품소개</span>
      </div>

      {/* Page Title */}
      <div className="page-title">
        <h1>제품소개</h1>
        <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
      </div>

      {/* Categories Grid */}
      <div className="products-main-container">
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <a href={`/products/${category.slug}`}>
                <div className="category-image">
                  <div className="category-icon">💡</div>
                </div>
                <div className="category-info">
                  <h2>{category.name}</h2>
                  <p className="category-description">
                    {category.description || `${category.name} 제품 라인업`}
                  </p>
                  <div className="category-meta">
                    <span className="subcategory-count">
                      {category.children?.length || 0}개 카테고리
                    </span>
                    <span className="product-count">
                      {category._count?.products || 0}개 제품
                    </span>
                  </div>
                  <div className="view-more">
                    자세히 보기 →
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Category Details */}
        <div className="category-details-section">
          {categories.map((category) => (
            <div key={category.id} className="category-detail">
              <h3>{category.name}</h3>
              <div className="subcategories-list">
                {category.children && category.children.length > 0 ? (
                  <ul>
                    {category.children.map((subcat) => (
                      <li key={subcat.id}>
                        <a href={`/products/${category.slug}/${subcat.slug}`}>
                          {subcat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-subcategories">서브카테고리가 준비 중입니다.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>COMPANY INFO</h4>
            <p>(주)엘브이에스 대표이사: 김태화<br />사업자번호: 131-86-14914<br />
            인천광역시 연수구 송도미래로 30 (송도동 214번지) 스마트밸리 B동 801~803호</p>
          </div>
          <div className="footer-section">
            <h4>CONTACT US</h4>
            <div className="footer-contact">
              <div>📞 032-461-1800</div>
              <div>📠 032-461-1001</div>
            </div>
          </div>
        </div>
        <p className="copyright">COPYRIGHT(C) (주)엘브이에스. ALL RIGHT RESERVED.</p>
      </footer>
    </>
  );
}
