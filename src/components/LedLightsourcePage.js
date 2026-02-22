'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function LedLightsourcePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/products?category=led-lightsource');
        const data = await response.json();
        setCategories(data.subcategories || []);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/products">제품소개</a>
          <span>&gt;</span>
          <span>LED LIGHTSOURCE</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>LED LIGHTSOURCE</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/products/led-lightsource" className="active">전체보기</a>
          {categories.map((cat) => (
            <a key={cat.id} href={`/products/led-lightsource/${cat.slug}`}>
              {cat.name}
            </a>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="no-products-message">
            <div className="no-products-icon">📦</div>
            <h3>준비 중인 제품입니다</h3>
            <p>곧 다양한 LED LIGHTSOURCE 제품을 만나보실 수 있습니다.</p>
            {categories.length > 0 && (
              <div className="subcategories-preview">
                <h4>제품 카테고리</h4>
                <div className="subcategories-grid">
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/products/led-lightsource/${cat.slug}`}
                      className="subcategory-card"
                    >
                      <div className="subcategory-icon">💡</div>
                      <div className="subcategory-name">{cat.name}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
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
    </>
  );
}
