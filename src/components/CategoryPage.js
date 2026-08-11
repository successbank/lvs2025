'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';
import WishlistButton from '@/components/WishlistButton';
import ProductSubNav from '@/components/ui/ProductSubNav';
import { getDict } from '@/lib/i18n';

export default function CategoryPage({ categorySlug, locale = 'ko' }) {
  const t = getDict(locale).products;
  const apiBase = locale === 'en' ? '/api/en' : '/api';
  const base = locale === 'en' ? '/en' : '';
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${apiBase}/products?category=${categorySlug}`);
        const data = await response.json();

        // Get category info
        const catResponse = await fetch(`${apiBase}/categories?slug=${categorySlug}`);
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

  const displayName = category?.name || t.categoryNames[categorySlug] || t.fallbackTitle;

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href={base || '/'}>Home</a>
          <span>&gt;</span>
          <a href={`${base}/products`}>{t.root}</a>
          <span>&gt;</span>
          <span>{displayName}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{displayName}</h1>
          <p>{category?.description || t.headerFallbackDesc}</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <ProductSubNav
        allHref={`${base}/products/${categorySlug}`}
        allActive
        allLabel={t.subNavAll}
        items={subcategories.map((subcat) => ({
          key: subcat.id,
          href: `${base}/products/${categorySlug}/${subcat.slug}`,
          label: subcat.name,
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
            <p>{t.comingSoonDesc(displayName)}</p>
            {subcategories.length > 0 && (
              <div className="subcategories-preview">
                <h4>{t.productCategories}</h4>
                <div className="subcategories-grid">
                  {subcategories.map((subcat) => (
                    <a
                      key={subcat.id}
                      href={`${base}/products/${categorySlug}/${subcat.slug}`}
                      className="subcategory-card"
                    >
                      <div className="subcategory-icon">
                        {subcat.iconUrl ? (
                          <img src={subcat.iconUrl} alt={subcat.name}
                               style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        ) : '💡'}
                      </div>
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
                <WishlistButton locale={locale} productId={product.id} variant="card" />
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
