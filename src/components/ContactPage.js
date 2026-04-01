'use client';

import '../app/styles/globals.css';

export default function ContactPage({ companyInfo }) {

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/support">고객지원</a>
          <span>&gt;</span>
          <span>찾아오시는 길</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>찾아오시는 길</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/support/tech-guide">테크니컬 가이드</a>
          <a href="/support/downloads">자료 다운로드</a>
          <a href="/support/consultation">온라인 상담실</a>
          <a href="/support/notices">공지사항</a>
          <a href="/support/contact" className="active">찾아오시는 길</a>
          <a href="/support/catalog">카탈로그 신청</a>
        </div>
      </div>

      {/* Contact Content */}
      <div className="contact-container">
        {/* Map */}
        <div className="contact-map-section">
          <iframe
              src="https://map.kakao.com/link/map/엘브이에스,37.3658,126.6472"
              className="kakao-map"
              title="엘브이에스 위치"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
        </div>

        {/* Company Info */}
        <div className="contact-info-section">
          <div className="contact-info-card">
            <div className="contact-info-header">
              <h3>(주)엘브이에스</h3>
            </div>
            <div className="contact-info-content">
              <div className="contact-info-item">
                <div className="contact-info-label">주소</div>
                <div className="contact-info-value">
                  인천광역시 연수구 송도미래로 30 B동 801~803호
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-label">TEL</div>
                <div className="contact-info-value">
                  <a href="tel:032-461-1800">032-461-1800</a>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-label">FAX</div>
                <div className="contact-info-value">032-461-1001</div>
              </div>
              <div className="contact-info-actions">
                <a href="https://naver.me/GgtKs8dQ" target="_blank" rel="noopener noreferrer" className="map-link">
                  <span className="map-icon">📍</span> 네이버 지도로 보기
                </a>
                <a href="https://kko.to/s97w" target="_blank" rel="noopener noreferrer" className="map-link">
                  <span className="map-icon">🗺️</span> 카카오맵으로 보기
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Transportation Guide */}
        <div className="transportation-section">
          <h3>교통안내</h3>
          <div className="transportation-grid">
            <div className="transportation-card">
              <h4>🚇 지하철</h4>
              <p>인천 1호선 <strong>지식정보단지역</strong> 1번 출구</p>
            </div>
            <div className="transportation-card">
              <h4>🚌 버스</h4>
              <p>
                16번, 6번
              </p>
            </div>
            <div className="transportation-card">
              <h4>🚗 자가용</h4>
              <p>
                <strong>네비게이션 검색:</strong><br />
                "스마트밸리 B동" 또는 "송도미래로 30"
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
