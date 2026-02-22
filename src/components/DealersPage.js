'use client';

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
    name: '이미징웍스㈜',
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
  {
    id: 8,
    name: '주식회사 프리비전',
    address: '서울특별시 송파구 법원로 128, C동 1731호 (문정역 SK V1)',
    tel: '02-527-8830',
    fax: '050-4199-9496',
    email: 'ceo@pre-vision.co.kr',
    website: 'http://www.pre-vision.co.kr',
    image: 'branch21.jpg',
  },
];

const INTERNATIONAL_DEALERS = [
  {
    id: 101,
    name: 'Laser Vision System Pte., Ltd.',
    country: 'Singapore',
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
    tel: '+1-520-615-4073',
    email: 'sales@alt-vision.com',
    website: 'www.alt-vision.com',
    image: 'branch11.jpg',
  },
  {
    id: 103,
    name: 'ColS s.r.o.',
    country: 'Slovakia',
    tel: '+421-948-231-361',
    email: 'pcopjan@cois.sk',
    website: 'www.cois.sk',
    image: 'branch12.jpg',
  },
  {
    id: 104,
    name: 'Nevis Co., Ltd.',
    country: 'Taiwan',
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
    tel: '087-803-1661',
    fax: '02-889-1198',
    email: 'sale@imRNasia.com',
    website: 'www.imrnasia.com',
    image: 'branch14.jpg',
  },
  {
    id: 106,
    name: 'VIETNAM SEBONG VINA',
    country: 'Vietnam',
    tel: '84.4.3226.2970',
    fax: '84.4.3226.2971',
    email: 'dhshin@osebong.com',
    website: 'www.osebong.com',
    image: 'branch15.jpg',
  },
  {
    id: 107,
    name: 'Abiz Technology Co., Ltd.',
    country: 'Thailand',
    tel: '+66 (0) 2-275-5475',
    fax: '+66 (0) 2-275-5875',
    email: 'info@abizsensor.com',
    image: 'branch19.png',
  },
];

const DEALER_IMAGE_BASE = 'http://lvs.webmaker21.kr/ko/images/';

function DealerCard({ dealer, isInternational }) {
  return (
    <div className="dealer-card">
      <div className="dealer-logo">
        <img
          src={`${DEALER_IMAGE_BASE}${dealer.image}`}
          alt={dealer.name}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      <div className="dealer-header">
        <div className="dealer-name">{dealer.name}</div>
        {isInternational && dealer.country && (
          <div className="dealer-region">{dealer.country}</div>
        )}
      </div>
      <div className="dealer-info">
        {dealer.address && (
          <div className="dealer-info-item">
            <div className="dealer-info-label">주소</div>
            <div className="dealer-info-value">{dealer.address}</div>
          </div>
        )}
        <div className="dealer-info-item">
          <div className="dealer-info-label">TEL</div>
          <div className="dealer-info-value">{dealer.tel}</div>
        </div>
        {dealer.fax && (
          <div className="dealer-info-item">
            <div className="dealer-info-label">FAX</div>
            <div className="dealer-info-value">{dealer.fax}</div>
          </div>
        )}
        <div className="dealer-info-item">
          <div className="dealer-info-label">이메일</div>
          <div className="dealer-info-value">{dealer.email}</div>
        </div>
        {dealer.website && (
          <div className="dealer-info-item">
            <div className="dealer-info-label">홈페이지</div>
            <div className="dealer-info-value">{dealer.website}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DealersPage({ companyInfo }) {
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
        </div>
      </div>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          {/* 국내 대리점 */}
          <div className="dealer-section">
            <h3 className="dealer-section-title">LVS Local Network — 국내대리점</h3>
            <div className="dealer-grid">
              {DOMESTIC_DEALERS.map((dealer) => (
                <DealerCard key={dealer.id} dealer={dealer} isInternational={false} />
              ))}
            </div>
          </div>

          {/* 해외 대리점 */}
          <div className="dealer-section" style={{ marginTop: '60px' }}>
            <h3 className="dealer-section-title">LVS World Wide Network — 해외대리점</h3>
            <div className="dealer-grid">
              {INTERNATIONAL_DEALERS.map((dealer) => (
                <DealerCard key={dealer.id} dealer={dealer} isInternational={true} />
              ))}
            </div>
          </div>

          {/* Dealer Inquiry */}
          <div style={{ marginTop: '80px', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', padding: '60px 40px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px' }}>대리점 개설 문의</h3>
            <p style={{ fontSize: '16px', marginBottom: '30px', opacity: '0.9' }}>(주)엘브이에스의 대리점이 되어 함께 성장하실 파트너를 모집합니다.</p>
            <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '5px' }}>전화 문의</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{companyInfo?.phone || '032-461-1800'}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '5px' }}>이메일 문의</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{companyInfo?.email || 'info@lvs.co.kr'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
