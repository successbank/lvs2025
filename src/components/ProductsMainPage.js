'use client';

import '../app/styles/globals.css';

export default function ProductsMainPage({ categories = [] }) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <span>제품소개</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>제품소개</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
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
                  {category.description || `${category.name} 제품 라인업`}
                </p>
              </div>

              {/* 4열 대형 카드 그리드 */}
              <div className="category-showcase-grid">
                {category.children && category.children.length > 0 ? (
                  category.children.map((sub) => (
                    <a
                      key={sub.id}
                      href={`/products/${category.slug}/${sub.slug}`}
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
                  <p className="no-subcategories">서브카테고리가 준비 중입니다.</p>
                )}
              </div>

              {/* 중앙 정렬 CTA */}
              <div className="category-showcase-cta-wrap">
                <a href={`/products/${category.slug}`} className="category-showcase-cta">
                  전체 보기 <span className="cta-arrow">→</span>
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
