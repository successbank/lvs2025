'use client';

import '../app/styles/globals.css';

const CERT_DATA = [
  { id: 1, title: 'DB,DBS 인증서', image: 'thumb_5a66b7c4012ad.JPG' },
  { id: 2, title: 'EN04 인증서', image: '5b0f53694aa8b.jpg' },
  { id: 3, title: 'EN02 인증서', image: '5b0f4f02269de.jpg' },
  { id: 4, title: 'EN-08 Series CE Certificates', image: 'thumb_5afbd2637efed.jpg' },
  { id: 5, title: 'SHL 인증서', image: 'thumb_5a66c9a28d3e1.JPG' },
  { id: 6, title: 'PT08-N04_LVD 인증서', image: 'thumb_5a66c960d563a.JPG' },
  { id: 7, title: 'PT08-N04 인증서', image: 'thumb_5a66c9480236f.JPG' },
  { id: 8, title: 'PT 인증서', image: 'thumb_5a66c895d9522.JPG' },
  { id: 9, title: 'PS-21 인증서', image: 'thumb_5a66c87aba9c6.JPG' },
  { id: 10, title: 'PS 인증서', image: 'thumb_5a66c864575ac.JPG' },
  { id: 11, title: 'PN 인증서', image: 'thumb_5a66c838e2fae.JPG' },
  { id: 12, title: 'PA10 인증서', image: 'thumb_5a66c81f54b11.JPG' },
  { id: 13, title: 'PA 인증서', image: 'thumb_5a66c808dd7c6.JPG' },
  { id: 14, title: 'ILA-R, ILA-S 인증서', image: 'thumb_5a66c7eeaccb0.JPG' },
  { id: 15, title: 'IFS, IFSM 인증서', image: 'thumb_5a66c7b60ac79.JPG' },
  { id: 16, title: 'IFRK 인증서', image: 'thumb_5a66c78dc254b.JPG' },
  { id: 17, title: 'IFD 인증서', image: 'thumb_5a66c7776f7e0.JPG' },
  { id: 18, title: 'IDM 인증서', image: 'thumb_5a66c75ca4f18.JPG' },
  { id: 19, title: 'ICFV 인증서', image: 'thumb_5a66c675c358e.JPG' },
  { id: 20, title: 'HLS 인증서', image: 'thumb_5a66c65bf1987.JPG' },
  { id: 21, title: 'DS 인증서', image: 'thumb_5a66c63bbc532.JPG' },
  { id: 22, title: 'DRT, DRF 인증서', image: 'thumb_5a66c628b3425.JPG' },
  { id: 23, title: 'DR4 인증서', image: 'thumb_5a66c60c3781c.JPG' },
  { id: 24, title: 'DN 인증서', image: 'thumb_5a66c5e05a13d.JPG' },
  { id: 25, title: 'DL, DLA2 인증서', image: 'thumb_5a66c5c2b6ff2.JPG' },
];

const CERT_IMAGE_BASE = 'http://lvs.webmaker21.kr/ksboard/data/cert/';

export default function CertificationsPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/about">회사소개</a>
          <span>&gt;</span>
          <span>인증현황</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>인증현황</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us">회사소개</a>
          <a href="/about/organization">개요 및 조직도</a>
          <a href="/about/why-led">Why LED</a>
          <a href="/about/certifications" className="active">인증현황</a>
          <a href="/about/dealers">대리점 안내</a>
        </div>
      </div>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          <div className="cert-grid">
            {CERT_DATA.map((cert) => (
              <div key={cert.id} className="cert-card">
                <div className="cert-image">
                  <img
                    src={`${CERT_IMAGE_BASE}${cert.image}`}
                    alt={cert.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('cert-image-fallback');
                    }}
                  />
                </div>
                <h3>{cert.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
