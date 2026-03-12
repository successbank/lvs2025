'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import '../app/styles/globals.css';

export default function HomePage({ categories = [], featuredProducts = [], notices = [], companyInfo, sliders = [], partners = [] }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  // Hero slides: sliders first, fallback to featuredProducts
  const heroSlides = sliders.length > 0
    ? sliders.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || '',
        imageUrl: s.imageUrl,
        link: s.link,
        category: null,
      }))
    : featuredProducts.map(p => ({
        id: p.id,
        title: p.name,
        description: p.summary || p.description || '',
        imageUrl: p.images?.[0]?.url || null,
        link: `/products/${p.slug}`,
        category: p.category?.name || null,
      }));

  const hasMultipleSlides = heroSlides.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    hasMultipleSlides ? [Autoplay({ delay: 6000, stopOnInteraction: false })] : []
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const onHeroMouseEnter = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (autoplay) autoplay.stop();
  }, [emblaApi]);

  const onHeroMouseLeave = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (autoplay) autoplay.play();
  }, [emblaApi]);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach((el) => observer.observe(el));
    return () => sections.forEach((el) => observer.unobserve(el));
  }, []);

  // Product categories for tabs
  const productCategories = categories.filter(c => c.children?.length > 0);

  return (
    <>
      {/* Hero Section */}
      <section
        className="hero"
        onMouseEnter={hasMultipleSlides ? onHeroMouseEnter : undefined}
        onMouseLeave={hasMultipleSlides ? onHeroMouseLeave : undefined}
      >
        {heroSlides.length > 0 ? (
          <div className="hero-carousel" ref={emblaRef}>
            <div className="hero-carousel-container">
              {heroSlides.map((slide, index) => (
                <div className="hero-carousel-slide" key={slide.id || index}>
                  <div className="hero-content">
                    <div className="hero-text">
                      {slide.category && (
                        <span className="hero-badge">{slide.category}</span>
                      )}
                      <h1>{slide.title || 'Lighting for Vision System'}</h1>
                      <p className="hero-desc">{slide.description || '산업용 LED 조명의 새로운 기준을 제시합니다'}</p>
                      <div className="hero-buttons">
                        {slide.link && (
                          <a href={slide.link} className="hero-btn-primary">자세히 보기</a>
                        )}
                        <a href="/support/catalog" className="hero-btn-ghost">카탈로그 신청</a>
                      </div>
                    </div>
                    <div className="hero-image">
                      {slide.imageUrl ? (
                        <img src={slide.imageUrl} alt={slide.title || 'LVS Product'} />
                      ) : (
                        <div className="hero-image-fallback">
                          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                            <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                            <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                            <circle cx="100" cy="100" r="20" fill="rgba(59,130,246,0.3)"/>
                            <path d="M100 40 L100 20 M100 160 L100 180 M40 100 L20 100 M160 100 L180 100" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="hero-content">
            <div className="hero-text">
              <h1>Lighting for Vision System</h1>
              <p className="hero-desc">산업용 LED 조명의 새로운 기준을 제시합니다</p>
              <div className="hero-buttons">
                <a href="/products" className="hero-btn-primary">제품 보기</a>
                <a href="/support/catalog" className="hero-btn-ghost">카탈로그 신청</a>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-fallback">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                  <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                  <circle cx="100" cy="100" r="20" fill="rgba(59,130,246,0.3)"/>
                  <path d="M100 40 L100 20 M100 160 L100 180 M40 100 L20 100 M160 100 L180 100" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                </svg>
              </div>
            </div>
          </div>
        )}
        {hasMultipleSlides && (
          <>
            <button className="hero-arrow hero-arrow-prev" onClick={scrollPrev} aria-label="이전 슬라이드">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button className="hero-arrow hero-arrow-next" onClick={scrollNext} aria-label="다음 슬라이드">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <div className="hero-indicators">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  className={`hero-indicator ${selectedIndex === index ? 'active' : ''}`}
                  onClick={() => scrollTo(index)}
                  aria-label={`슬라이드 ${index + 1}`}
                >
                  <span className="hero-indicator-bar"></span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Contact Strip */}
      <section className="contact-strip">
        <div className="contact-strip-inner">
          <div className="contact-strip-item">
            <div className="contact-strip-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className="contact-strip-text">
              <span className="contact-strip-label">고객센터</span>
              <span className="contact-strip-value">{companyInfo?.phone || '032-461-1800'}</span>
            </div>
          </div>
          <div className="contact-strip-item">
            <div className="contact-strip-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div className="contact-strip-text">
              <span className="contact-strip-label">상담시간</span>
              <span className="contact-strip-value">{companyInfo?.workingHours || '평일 09:00~18:00'}</span>
            </div>
          </div>
          <div className="contact-strip-item">
            <div className="contact-strip-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="contact-strip-text">
              <span className="contact-strip-label">오시는 길</span>
              <span className="contact-strip-value">인천 연수구 송도미래로30</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Lineup Section */}
      <section id="products-section" className={`products-lineup animate-on-scroll ${visibleSections.has('products-section') ? 'is-visible' : ''}`}>
        <div className="products-lineup-inner">
          <div className="section-label">PRODUCTS</div>
          <h2 className="section-title">제품 라인업</h2>
          {productCategories.length > 0 && (
            <>
              <div className="product-tabs">
                {productCategories.map((cat, i) => (
                  <button
                    key={cat.id}
                    className={`product-tab ${activeCategory === i ? 'active' : ''}`}
                    onClick={() => setActiveCategory(i)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="product-cards-grid">
                {productCategories[activeCategory]?.children?.map((subcat) => (
                  <a href={`/products/${productCategories[activeCategory].slug}?sub=${subcat.slug}`} key={subcat.id} className="product-lineup-card">
                    <div className="product-lineup-icon">
                      {subcat.iconUrl ? (
                        <img src={subcat.iconUrl} alt={subcat.name} />
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="5"/>
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                      )}
                    </div>
                    <h4>{subcat.name}</h4>
                    {subcat.description && <p>{subcat.description}</p>}
                    <span className="product-lineup-link">자세히 보기 →</span>
                  </a>
                ))}
              </div>
            </>
          )}
          <div className="products-cta">
            <a href="/products" className="products-cta-btn">전체 제품 보기</a>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="info-section" className={`info-section animate-on-scroll ${visibleSections.has('info-section') ? 'is-visible' : ''}`}>
        <div className="info-container">
          {/* Notices */}
          <div className="notice-section">
            <div className="notice-header">
              <h3>공지사항</h3>
              <a href="/support/notices" className="notice-more">더보기 +</a>
            </div>
            <div className="notice-list">
              {notices.slice(0, 4).map((notice) => (
                <a href={`/support/notices/${notice.id}`} key={notice.id} className="notice-list-item">
                  <span className="notice-list-title">{notice.title}</span>
                  <span className="notice-list-date">
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </a>
              ))}
              {notices.length === 0 && (
                <p className="notice-empty">등록된 공지사항이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Service Shortcuts */}
          <div className="services-grid">
            <a href="/support/consultation" className="service-card service-card-red">
              <div className="service-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span>온라인 상담</span>
            </a>
            <a href="/support/contact" className="service-card service-card-blue">
              <div className="service-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span>오시는 길</span>
            </a>
            <a href="/support/catalog" className="service-card service-card-purple">
              <div className="service-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <span>카탈로그 신청</span>
            </a>
            <a href="/about/certifications" className="service-card service-card-green">
              <div className="service-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span>인증현황</span>
            </a>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      {partners.length > 0 && (
        <section id="partners-section" className={`partners-section animate-on-scroll ${visibleSections.has('partners-section') ? 'is-visible' : ''}`}>
          <div className="partners-inner">
            <div className="section-label">PARTNERS</div>
            <h2 className="section-title">파트너사</h2>
            <div className="partners-grid">
              {partners.map((partner) => (
                <div key={partner.id} className="partner-item">
                  {partner.website ? (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer">
                      <img src={partner.logoUrl} alt={partner.name} />
                    </a>
                  ) : (
                    <img src={partner.logoUrl} alt={partner.name} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
