'use client';

import { useState } from 'react';
import '../../app/styles/globals.css';
import SupportSubNavEn from './SupportSubNavEn';

const DEALER_IMAGE_BASE = '/images/dealers/';

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
  // 영문판은 국내 주소(한국어) 도시 추출을 하지 않는다 — 해외는 국가명 표시
  const city = isInternational ? dealer.country : 'South Korea';
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

export default function DealersPageEn({ companyInfo, dealers = [] }) {
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
          <a href="/en">Home</a>
          <span>&gt;</span>
          <a href="/en/about/us">Company</a>
          <span>&gt;</span>
          <span>Distributors</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>Distributors</h1>
          <p>LVS researches lighting technology that inspires every workplace.</p>
        </div>
      </section>

      <SupportSubNavEn section="about" active="/about/dealers" />

      {/* Intro Section with Stats */}
      <section className="dealer-intro-section">
        <div className="dealer-intro-inner">
          <h2 className="dealer-intro-title">LVS Global Dealer Network</h2>
          <p className="dealer-intro-desc">
            We deliver industrial LED lighting solutions together with expert partners at home and abroad.
          </p>
          <div className="dealer-stats">
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{totalCount}</span>
              <span className="dealer-stat-label">Distributors</span>
            </div>
            <span className="dealer-stat-divider" />
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{domesticCount}</span>
              <span className="dealer-stat-label">Korea</span>
            </div>
            <span className="dealer-stat-divider" />
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{internationalCount}</span>
              <span className="dealer-stat-label">Overseas</span>
            </div>
            <span className="dealer-stat-divider" />
            <div className="dealer-stat-item">
              <span className="dealer-stat-number">{uniqueCountries}</span>
              <span className="dealer-stat-label">Countries</span>
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
              All ({totalCount})
            </button>
            <button
              className={`dealer-tab-btn ${filter === 'domestic' ? 'active' : ''}`}
              onClick={() => setFilter('domestic')}
            >
              Korea ({domesticCount})
            </button>
            <button
              className={`dealer-tab-btn ${filter === 'international' ? 'active' : ''}`}
              onClick={() => setFilter('international')}
            >
              Overseas ({internationalCount})
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
            <h3 className="dealer-cta-title">Become a Distributor</h3>
            <p className="dealer-cta-desc">LVS is looking for partners to grow together as our distributors.</p>
            <div className="dealer-cta-contacts">
              <div className="dealer-cta-item">
                <div className="dealer-cta-label">Phone</div>
                <div className="dealer-cta-value">+82-32-461-1800</div>
              </div>
              <div className="dealer-cta-item">
                <div className="dealer-cta-label">Email</div>
                <div className="dealer-cta-value">{companyInfo?.email || 'chris@lvs.co.kr'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
