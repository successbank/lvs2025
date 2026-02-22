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

      {/* Categories Grid */}
      <div className="products-main-container">
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <a href={`/products/${category.slug}`}>
                <div className="category-image">
                  <div className="category-icon">💡</div>
                </div>
                <div className="category-info">
                  <h2>{category.name}</h2>
                  <p className="category-description">
                    {category.description || `${category.name} 제품 라인업`}
                  </p>
                  <div className="category-meta">
                    <span className="subcategory-count">
                      {category.children?.length || 0}개 카테고리
                    </span>
                    <span className="product-count">
                      {category._count?.products || 0}개 제품
                    </span>
                  </div>
                  <div className="view-more">
                    자세히 보기 →
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Category Details */}
        <div className="category-details-section">
          {categories.map((category) => (
            <div key={category.id} className="category-detail">
              <h3>{category.name}</h3>
              <div className="subcategories-list">
                {category.children && category.children.length > 0 ? (
                  <ul>
                    {category.children.map((subcat) => (
                      <li key={subcat.id}>
                        <a href={`/products/${category.slug}/${subcat.slug}`}>
                          {subcat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-subcategories">서브카테고리가 준비 중입니다.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
