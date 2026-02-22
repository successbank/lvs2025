'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function CategoryPage({ categorySlug }) {
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/products?category=${categorySlug}`);
        const data = await response.json();

        // Get category info
        const catResponse = await fetch(`/api/categories?slug=${categorySlug}`);
        const catData = await catResponse.json();

        setCategory(catData.category);
        setSubcategories(data.subcategories || []);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categorySlug]);

  const categoryNames = {
    'general-lighting': '일반조명',
    'power-supply': '파워서플라이',
    'led-lightsource': 'LED LIGHTSOURCE'
  };

  const displayName = category?.name || categoryNames[categorySlug] || '제품';

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/products">제품소개</a>
          <span>&gt;</span>
          <span>{displayName}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{displayName}</h1>
          <p>{category?.description || '엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.'}</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href={`/products/${categorySlug}`} className="active">전체보기</a>
          {subcategories.map((subcat) => (
            <a key={subcat.id} href={`/products/${categorySlug}/${subcat.slug}`}>
              {subcat.name}
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
            <p>곧 다양한 {displayName} 제품을 만나보실 수 있습니다.</p>
            {subcategories.length > 0 && (
              <div className="subcategories-preview">
                <h4>제품 카테고리</h4>
                <div className="subcategories-grid">
                  {subcategories.map((subcat) => (
                    <a
                      key={subcat.id}
                      href={`/products/${categorySlug}/${subcat.slug}`}
                      className="subcategory-card"
                    >
                      <div className="subcategory-icon">💡</div>
                      <div className="subcategory-name">{subcat.name}</div>
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
