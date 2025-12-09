'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function LedSubcategoryPage({ subcategorySlug }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subcategory, setSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [siblingCategories, setSiblingCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 먼저 서브카테고리 정보를 가져옴
        const categoryResponse = await fetch(`/api/categories?slug=${subcategorySlug}`);
        const categoryData = await categoryResponse.json();

        if (categoryData.category) {
          setSubcategory(categoryData.category);

          // 같은 부모를 가진 다른 카테고리들 가져오기
          if (categoryData.category.parentId) {
            const siblingsResponse = await fetch(`/api/categories?parentId=${categoryData.category.parentId}`);
            const siblingsData = await siblingsResponse.json();
            setSiblingCategories(siblingsData.categories || []);
          }

          // 해당 카테고리의 제품들 가져오기
          const productsResponse = await fetch(`/api/products?categoryId=${categoryData.category.id}`);
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subcategorySlug]);

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
        <a href="/products">제품소개</a>
        <span>&gt;</span>
        <a href="/products/led-lightsource">LED LIGHTSOURCE</a>
        <span>&gt;</span>
        <span>{subcategory?.name}</span>
      </div>

      {/* Page Title */}
      <div className="page-title">
        <h1>{subcategory?.name || 'LED LIGHTSOURCE'}</h1>
        <p>{subcategory?.description || '엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.'}</p>
      </div>

      {/* Sub Navigation */}
      <div className="sub-nav-container">
        <a href="/products/led-lightsource">전체보기</a>
        {siblingCategories.map((cat) => (
          <a
            key={cat.id}
            href={`/products/led-lightsource/${cat.slug}`}
            className={cat.slug === subcategorySlug ? 'active' : ''}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Products Grid */}
      <div className="products-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="no-products">제품이 없습니다.</div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.mainImage || '/images/placeholder-product.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/images/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-model">{product.modelName}</p>
                  <p className="product-description">{product.summary || product.description || '-'}</p>
                  <a href={`/products/${product.slug}`} className="product-detail-link">
                    상세보기 →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
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
