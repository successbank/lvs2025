'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function LedSubcategoryPage({ subcategorySlug }) {
  const [subcategory, setSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [siblingCategories, setSiblingCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const categoryResponse = await fetch(`/api/categories?slug=${subcategorySlug}`);
        const categoryData = await categoryResponse.json();

        if (categoryData.category) {
          setSubcategory(categoryData.category);

          if (categoryData.category.parentId) {
            const siblingsResponse = await fetch(`/api/categories?parentId=${categoryData.category.parentId}`);
            const siblingsData = await siblingsResponse.json();
            setSiblingCategories(siblingsData.categories || []);
          }

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

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/products">제품소개</a>
          <span>&gt;</span>
          <a href="/products/led-lightsource">LED LIGHTSOURCE</a>
          <span>&gt;</span>
          <span>{subcategory?.name}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{subcategory?.name || 'LED LIGHTSOURCE'}</h1>
          <p>{subcategory?.description || '엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.'}</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
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
    </>
  );
}
