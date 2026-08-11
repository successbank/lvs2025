'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';
import WishlistButton from '@/components/WishlistButton';
import ProductSubNav from '@/components/ui/ProductSubNav';
import { getDict } from '@/lib/i18n';

export default function LedSubcategoryPage({ subcategorySlug, locale = 'ko' }) {
  const t = getDict(locale).products;
  const apiBase = locale === 'en' ? '/api/en' : '/api';
  const base = locale === 'en' ? '/en' : '';
  const [subcategory, setSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [siblingCategories, setSiblingCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const categoryResponse = await fetch(`${apiBase}/categories?slug=${subcategorySlug}`);
        const categoryData = await categoryResponse.json();

        if (categoryData.category) {
          setSubcategory(categoryData.category);

          if (categoryData.category.parentId) {
            const siblingsResponse = await fetch(`${apiBase}/categories?parentId=${categoryData.category.parentId}`);
            const siblingsData = await siblingsResponse.json();
            setSiblingCategories(siblingsData.categories || []);
          }

          const productsResponse = await fetch(`${apiBase}/products?categoryId=${categoryData.category.id}`);
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
          <a href={base || '/'}>Home</a>
          <span>&gt;</span>
          <a href={`${base}/products`}>{t.root}</a>
          <span>&gt;</span>
          <a href={`${base}/products/led-lightsource`}>LED LIGHTSOURCE</a>
          <span>&gt;</span>
          <span>{subcategory?.name}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{subcategory?.name || 'LED LIGHTSOURCE'}</h1>
          <p>{subcategory?.description || t.headerFallbackDesc}</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <ProductSubNav
        allHref={`${base}/products/led-lightsource`}
        allLabel={t.subNavAll}
        items={siblingCategories.map((cat) => ({
          key: cat.id,
          href: `${base}/products/led-lightsource/${cat.slug}`,
          label: cat.name,
          active: cat.slug === subcategorySlug,
        }))}
      />

      {/* Products Grid */}
      <div className="products-container">
        {loading ? (
          <div className="loading">{t.loading}</div>
        ) : products.length === 0 ? (
          <div className="no-products">{locale === 'en' ? 'No products found.' : '제품이 없습니다.'}</div>
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
