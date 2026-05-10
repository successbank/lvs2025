'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

// 대리점 데이터는 DB(`dealers` 테이블)에서 page.js → props.dealers로 전달.
// 어드민에서 추가/수정/삭제/순서변경 가능. 시드: database/2026-05-10-seed-dealers.sql

const DEALER_IMAGE_BASE = '/images/dealers/';

function extractCity(address) {
  if (!address) return '';
  const match = address.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기도\s*\S+?시|충[북남]|전[북남]|경[북남]|강원|제주|서울특별시|서울시)/);
  if (match) {
    let city = match[1];
    city = city.replace(/특별시|광역시/, '');
    if (city.startsWith('경기도')) {
      city = city.replace('경기도', '').trim();
      city = '경기 ' + city;
    }
    return city;
  }
  return '';
}

/* SVG Icons */
const IconMapPin = () => (
  <svg className="dealer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPhone = () => (
  <svg className="dealer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconPrinter = () => (
  <svg className="dealer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconMail = () => (
  <svg className="dealer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconGlobe = () => (
  <svg className="dealer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

function DealerCard({ dealer, isInternational }) {
  const city = isInternational ? dealer.country : extractCity(dealer.address);
  const badgeLabel = isInternational ? dealer.flag : '\u{1F1F0}\u{1F1F7}';
  const cardClass = `dealer-card ${isInternational ? 'dealer-card--international' : 'dealer-card--domestic'}`;

  const websiteUrl = dealer.website
    ? dealer.website.startsWith('http') ? dealer.website : `http://${dealer.website}`
    : null;

  return (
    <div className={cardClass}>
      <div className="dealer-card-logo">
        <span className="dealer-card-badge">{badgeLabel}</span>
        <img
          src={`${DEALER_IMAGE_BASE}${dealer.image}`}
          alt={dealer.name}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      <div className="dealer-card-body">
        <h4 className="dealer-card-name">{dealer.name}</h4>
        {city && <div className="dealer-card-location">{city}</div>}
        <div className="dealer-card-contacts">
          {dealer.address && (
            <div className="dealer-contact-row">
              <IconMapPin />
              <span>{dealer.address}</span>
            </div>
          )}
          <div className="dealer-contact-row">
            <IconPhone />
            <span>{dealer.tel}</span>
          </div>
          {dealer.fax && (
            <div className="dealer-contact-row">
              <IconPrinter />
              <span>{dealer.fax}</span>
            </div>
          )}
          <div className="dealer-contact-row">
            <IconMail />
            <span>{dealer.email}</span>
          </div>
        </div>
      </div>
      {websiteUrl && (
        <div className="dealer-card-footer">
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="dealer-website-btn">
            <IconGlobe />
            <span>Homepage</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default function DealersPage({ companyInfo, dealers = [] }) {
  const [filter, setFilter] = useState('all');

  const domestic = dealers.filter((d) => d.type === 'DOMESTIC');
  const international = dealers.filter((d) => d.type === 'INTERNATIONAL');
  const domesticCount = domestic.length;
  const internationalCount = international.length;
  const totalCount = domesticCount + internationalCount;
  const uniqueCountries = [...new Set(international.map((d) => d.country).filter(Boolean))].length;

  const filteredDealers = filter === 'domestic'
    ? domestic.map(d => ({ ...d, _type: 'domestic' }))
    : filter === 'international'
      ? international.map(d => ({ ...d, _type: 'international' }))
      : [
          ...domestic.map(d => ({ ...d, _type: 'domestic' })),
          ...international.map(d => ({ ...d, _type: 'international' })),
        ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/about">회사소개</a>
          <span>&gt;</span>
          <span>대리점 안내</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>대리점 안내</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us">회사소개</a>
          <a href="/about/organization">개요 및 조직도</a>
          <a href="/about/why-led">Why LED</a>
          <a href="/about/certifications">인증현황</a>
          <a href="/about/dealers" className="active">대리점 안내</a>
          <a href="/about/careers">인재채용</a>
        </div>
      </div>

      {/* Intro Section with Stats */}
      <section className="dealer-intro-section">
        <div className="dealer-intro-inner">
          <h2 className="dealer-intro-title">LVS Global Dealer Network</h2>
          <p className="dealer-intro-desc">
            국내외 전문 파트너와 함께 산업용 LED 조명 솔루션을 제공합니다.
          </p>
          <div className="dealer-stats">
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{totalCount}</span>
              <span className="dealer-stat-label">전체 대리점</span>
            </div>
            <span className="dealer-stat-divider" />
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{domesticCount}</span>
              <span className="dealer-stat-label">국내</span>
            </div>
            <span className="dealer-stat-divider" />
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{internationalCount}</span>
              <span className="dealer-stat-label">해외</span>
            </div>
            <span className="dealer-stat-divider" />
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{uniqueCountries}</span>
              <span className="dealer-stat-label">국가</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          {/* Tab Filter */}
          <div className="dealer-tabs">
            <button
              className={`dealer-tab-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체 ({totalCount})
            </button>
            <button
              className={`dealer-tab-btn ${filter === 'domestic' ? 'active' : ''}`}
              onClick={() => setFilter('domestic')}
            >
              국내 대리점 ({domesticCount})
            </button>
            <button
              className={`dealer-tab-btn ${filter === 'international' ? 'active' : ''}`}
              onClick={() => setFilter('international')}
            >
              해외 대리점 ({internationalCount})
            </button>
          </div>

          {/* Dealer Grid */}
          <div className="dealer-grid">
            {filteredDealers.map((dealer) => (
              <DealerCard
                key={dealer.id}
                dealer={dealer}
                isInternational={dealer._type === 'international'}
              />
            ))}
          </div>

          {/* Dealer Inquiry CTA */}
          <div className="dealer-inquiry-cta">
            <h3 className="dealer-cta-title">대리점 개설 문의</h3>
            <p className="dealer-cta-desc">(주)엘브이에스의 대리점이 되어 함께 성장하실 파트너를 모집합니다.</p>
            <div className="dealer-cta-contacts">
              <div className="dealer-cta-item">
                <div className="dealer-cta-label">전화 문의</div>
                <div className="dealer-cta-value">{companyInfo?.phone || '032-461-1800'}</div>
              </div>
              <div className="dealer-cta-item">
                <div className="dealer-cta-label">이메일 문의</div>
                <div className="dealer-cta-value">{companyInfo?.email || 'chris@lvs.co.kr'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
