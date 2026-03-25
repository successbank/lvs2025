'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

const DOMESTIC_DEALERS = [
  {
    id: 1,
    name: '(주) 화인스텍',
    address: '서울시 서초구 양재동 321-2 대덕빌딩 3층',
    tel: '02-579-1274',
    fax: '02-579-1275',
    email: 'fainstec@fainstec.com',
    website: 'www.fainstec.com',
    image: 'branch1.jpg',
  },
  {
    id: 2,
    name: '(주) 비저너스',
    address: '서울 서초구 논현로 87 삼호물산빌딩 B동 1509호(양재동)',
    tel: '02-589-1818~19',
    fax: '02-589-1820',
    email: 'vision@visionus.co.kr',
    website: 'www.visionus.co.kr',
    image: 'branch2.jpg',
  },
  {
    id: 3,
    name: '이미징웍스(주)',
    address: '경기도 수원시 영통구 법조로25, SK ViewLake 에이동 2109호',
    tel: '070-7604-4096',
    fax: '031-624-3078',
    email: 'sales@imagingworks.co.kr',
    website: 'http://imagingworks.co.kr',
    image: 'branch3.jpg',
  },
  {
    id: 4,
    name: '이엑스테크놀러지 (주)',
    address: '경기도 안양시 동안구 관양동 1422-9 부흥빌딩 304호',
    tel: '02-401-2040',
    fax: '02-401-2057',
    email: 'sales@extechnology.co.kr',
    website: 'www.extechnology.co.kr',
    image: 'branch4.jpg',
  },
  {
    id: 5,
    name: '(주) 싸이로드',
    address: '서울시 강남구 대치동 968-5 일동빌딩 9층',
    tel: '070-7018-0720',
    fax: '070-7016-0720',
    email: 'info@cylod.com',
    website: 'www.cylod.com',
    image: 'branch5.jpg',
  },
  {
    id: 6,
    name: 'Sun HighTech',
    address: '경기도 안양시 동안구 관양동 954-6 성지스타위드 1211호',
    tel: '031-345-6390~2',
    fax: '031-345-6393',
    email: 'sales@sunhightech.co.kr',
    website: 'www.sunhightech.co.kr',
    image: 'branch6.jpg',
  },
  {
    id: 7,
    name: '(주) 바이렉스',
    address: '경기도 안양시 동안구 흥안대로 427번길38, 1214호 (관양동, 인덕원성지스타위드)',
    tel: '070-5055-3330',
    fax: '070-8233-5445',
    email: 'sales@virex.co.kr',
    website: 'www.virex.co.kr',
    image: 'branch9.jpg',
  },
  // {
  //   id: 8,
  //   name: '주식회사 프리비전',
  //   address: '서울특별시 송파구 법원로 128, C동 1731호 (문정역 SK V1)',
  //   tel: '02-527-8830',
  //   fax: '050-4199-9496',
  //   email: 'ceo@pre-vision.co.kr',
  //   website: 'http://www.pre-vision.co.kr',
  //   image: 'branch21.jpg',
  // },
];

const INTERNATIONAL_DEALERS = [
  {
    id: 101,
    name: 'Laser Vision System Pte., Ltd.',
    country: 'Singapore',
    flag: '\u{1F1F8}\u{1F1EC}',
    tel: '65-6841-2311 | 65-9023-3211',
    fax: '65-6841-2355',
    email: 'sales@laservision.com.sg',
    website: 'www.laservision.com.sg',
    image: 'branch10.gif',
  },
  {
    id: 102,
    name: 'Alternative Vision Corporation',
    country: 'USA',
    flag: '\u{1F1FA}\u{1F1F8}',
    tel: '+1-520-615-4073',
    email: 'sales@alt-vision.com',
    website: 'www.alt-vision.com',
    image: 'branch11.jpg',
  },
  {
    id: 103,
    name: 'ColS s.r.o.',
    country: 'Slovakia',
    flag: '\u{1F1F8}\u{1F1F0}',
    tel: '+421-948-231-361',
    email: 'pcopjan@cois.sk',
    website: 'www.cois.sk',
    image: 'branch12.jpg',
  },
  {
    id: 104,
    name: 'Nevis Co., Ltd.',
    country: 'Taiwan',
    flag: '\u{1F1F9}\u{1F1FC}',
    tel: '+886-2-2226-9796',
    fax: '+886-2-2226-6586',
    email: 'support@nevis.com.tw',
    website: 'www.nevis.com.tw',
    image: 'branch13.jpg',
  },
  {
    id: 105,
    name: 'imRN Asia Co., Ltd.',
    country: 'Thailand',
    flag: '\u{1F1F9}\u{1F1ED}',
    tel: '087-803-1661',
    fax: '02-889-1198',
    email: 'sale@imRNasia.com',
    website: 'www.imrnasia.com',
    image: 'branch14.jpg',
  },
  // {
  //   id: 106,
  //   name: 'VIETNAM SEBONG VINA',
  //   country: 'Vietnam',
  //   flag: '\u{1F1FB}\u{1F1F3}',
  //   tel: '84.4.3226.2970',
  //   fax: '84.4.3226.2971',
  //   email: 'dhshin@osebong.com',
  //   website: 'www.osebong.com',
  //   image: 'branch15.jpg',
  // },
  {
    id: 107,
    name: 'Abiz Technology Co., Ltd.',
    country: 'Thailand',
    flag: '\u{1F1F9}\u{1F1ED}',
    tel: '+66 (0) 2-275-5475',
    fax: '+66 (0) 2-275-5875',
    email: 'info@abizsensor.com',
    image: 'branch19.png',
  },
];

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

const UNIQUE_COUNTRIES = [...new Set(INTERNATIONAL_DEALERS.map(d => d.country))].length;

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

export default function DealersPage({ companyInfo }) {
  const [filter, setFilter] = useState('all');

  const domesticCount = DOMESTIC_DEALERS.length;
  const internationalCount = INTERNATIONAL_DEALERS.length;
  const totalCount = domesticCount + internationalCount;

  const filteredDealers = filter === 'domestic'
    ? DOMESTIC_DEALERS.map(d => ({ ...d, _type: 'domestic' }))
    : filter === 'international'
      ? INTERNATIONAL_DEALERS.map(d => ({ ...d, _type: 'international' }))
      : [
          ...DOMESTIC_DEALERS.map(d => ({ ...d, _type: 'domestic' })),
          ...INTERNATIONAL_DEALERS.map(d => ({ ...d, _type: 'international' })),
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
              <span className="dealer-stat-number">{UNIQUE_COUNTRIES}</span>
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
                <div className="dealer-cta-value">{companyInfo?.email || 'info@lvs.co.kr'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
