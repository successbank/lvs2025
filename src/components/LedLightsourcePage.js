'use client';

import { useState, useEffect } from 'react';
import { pickProductSummary } from '@/lib/textUtils';
import '../app/styles/globals.css';
import WishlistButton from '@/components/WishlistButton';
import ProductSubNav from '@/components/ui/ProductSubNav';
import { getDict } from '@/lib/i18n';

export default function LedLightsourcePage({ locale = 'ko' }) {
  const t = getDict(locale).products;
  const apiBase = locale === 'en' ? '/api/en' : '/api';
  const base = locale === 'en' ? '/en' : '';
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${apiBase}/products?category=led-lightsource`);
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
          <a href={base || '/'}>Home</a>
          <span>&gt;</span>
          <a href={`${base}/products`}>{t.root}</a>
          <span>&gt;</span>
          <span>LED LIGHTSOURCE</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>LED LIGHTSOURCE</h1>
          <p>{t.headerFallbackDesc}</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <ProductSubNav
        allHref={`${base}/products/led-lightsource`}
        allActive
        allLabel={t.subNavAll}
        items={categories.map((cat) => ({
          key: cat.id,
          href: `${base}/products/led-lightsource/${cat.slug}`,
          label: cat.name,
        }))}
      />

      {/* Products Grid */}
      <div className="products-container">
        {loading ? (
          <div className="loading">{t.loading}</div>
        ) : products.length === 0 ? (
          <div className="no-products-message">
            <div className="no-products-icon">📦</div>
            <h3>{t.comingSoonTitle}</h3>
            <p>{t.comingSoonDesc('LED LIGHTSOURCE')}</p>
            {categories.length > 0 && (
              <div className="subcategories-preview">
                <h4>{t.productCategories}</h4>
                <div className="subcategories-grid">
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`${base}/products/led-lightsource/${cat.slug}`}
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
                <WishlistButton productId={product.id} variant="card" />
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
                  <p className="product-description">{pickProductSummary(product)}</p>
                  <a href={`${base}/products/${product.slug}`} className="product-detail-link">
                    {t.detailLink}
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
