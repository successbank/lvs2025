'use client';

import '../app/styles/globals.css';
import { getDict } from '@/lib/i18n';

export default function ProductsMainPage({ categories = [], locale = 'ko' }) {
  const t = getDict(locale).products;
  const base = locale === 'en' ? '/en' : '';
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href={base || '/'}>Home</a>
          <span>&gt;</span>
          <span>{t.root}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{t.root}</h1>
          <p>{t.headerFallbackDesc}</p>
        </div>
      </section>

      {/* Category Showcase Sections */}
      <div className="products-main-container">
        {categories.map((category, index) => (
          <section
            key={category.id}
            className={`category-showcase ${index % 2 === 1 ? 'category-showcase-alt' : ''}`}
          >
            <div className="category-showcase-inner">
              {/* 중앙 정렬 헤더 */}
              <div className="category-showcase-header">
                <h2 className="category-showcase-title">{category.name}</h2>
                <p className="category-showcase-subtitle">
                  {category.description || t.lineupSuffix(category.name)}
                </p>
              </div>

              {/* 4열 대형 카드 그리드 */}
              <div className="category-showcase-grid">
                {category.children && category.children.length > 0 ? (
                  category.children.map((sub) => (
                    <a
                      key={sub.id}
                      href={`${base}/products/${category.slug}/${sub.slug}`}
                      className="subcategory-card-v2"
                    >
                      <div className="subcategory-card-v2-image">
                        {sub.iconUrl ? (
                          <img src={sub.iconUrl} alt={sub.name} />
                        ) : (
                          <div className="subcategory-card-v2-placeholder">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                              <circle cx="12" cy="12" r="5"/>
                              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="subcategory-card-v2-info">
                        <h3 className="subcategory-card-v2-name">{sub.name}</h3>
                        {sub.description && (
                          <p className="subcategory-card-v2-desc">{sub.description}</p>
                        )}
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="no-subcategories">{t.noSubcategories}</p>
                )}
              </div>

              {/* 중앙 정렬 CTA */}
              <div className="category-showcase-cta-wrap">
                <a href={`${base}/products/${category.slug}`} className="category-showcase-cta">
                  {t.viewAll} <span className="cta-arrow">→</span>
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
