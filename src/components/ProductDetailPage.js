'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function ProductDetailPage({ product }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  const images = product.images || [];

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
        {product.category?.parent && (
          <>
            <span>&gt;</span>
            <a href={`/products/${product.category.parent.slug}`}>{product.category.parent.name}</a>
          </>
        )}
        <span>&gt;</span>
        <a href={`/products/${product.category?.slug || ''}`}>{product.category?.name}</a>
        <span>&gt;</span>
        <span>{product.name}</span>
      </div>

      {/* Product Detail */}
      <div className="product-detail-container">
        <div className="product-detail-wrapper">
          {/* Product Images */}
          <div className="product-detail-images">
            <div className="main-image">
              <img
                src={images[selectedImage]?.url || mainImage?.url || '/images/placeholder-product.jpg'}
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder-product.jpg';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-model">
              <span className="label">모델명:</span>
              <span className="value">{product.modelName}</span>
            </div>

            {product.summary && (
              <div className="product-summary">{product.summary}</div>
            )}

            <div className="product-meta">
              <div className="meta-item">
                <span className="label">제조사:</span>
                <span className="value">{product.manufacturer}</span>
              </div>
              <div className="meta-item">
                <span className="label">원산지:</span>
                <span className="value">{product.origin}</span>
              </div>
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="meta-item">
                  <span className="label">색상 옵션:</span>
                  <span className="value">{product.colorOptions.join(', ')}</span>
                </div>
              )}
              {product.voltageOptions && product.voltageOptions.length > 0 && (
                <div className="meta-item">
                  <span className="label">전압 옵션:</span>
                  <span className="value">{product.voltageOptions.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="product-actions">
              <a href="/support/contact" className="btn btn-primary">문의하기</a>
              <a href="/support/downloads" className="btn btn-secondary">자료 다운로드</a>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && product.description !== '-' && (
          <div className="product-description-section">
            <h2>제품 설명</h2>
            <div className="description-content">
              {product.description}
            </div>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="product-specs-section">
            <h2>제품 사양</h2>
            <table className="specs-table">
              <tbody>
                {product.specifications.map((spec) => (
                  <tr key={spec.id}>
                    <th>{spec.name}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2>관련 제품</h2>
            <div className="related-products-grid">
              {product.relatedProducts.map((related) => (
                <div key={related.id} className="product-card">
                  <a href={`/products/${related.slug}`}>
                    <div className="product-image">
                      <img
                        src={related.images?.[0]?.url || '/images/placeholder-product.jpg'}
                        alt={related.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <h3>{related.name}</h3>
                      <p className="product-model">{related.modelName}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
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
