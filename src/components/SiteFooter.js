'use client';

export default function SiteFooter({ companyInfo }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-text">LVS</span>
            <span className="logo-sub">Lighting for Vision System</span>
          </div>
          <p className="footer-tagline">산업용 LED 조명의 새로운 기준</p>
        </div>
        <div className="footer-col">
          <h4>제품</h4>
          <ul>
            <li><a href="/products/general-lighting">일반조명</a></li>
            <li><a href="/products/power-supply">파워서플라이</a></li>
            <li><a href="/products/led-lightsource">LED LIGHTSOURCE</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>회사</h4>
          <ul>
            <li><a href="/about/us">회사소개</a></li>
            <li><a href="/about/certifications">인증현황</a></li>
            <li><a href="/about/dealers">대리점 안내</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>CONTACT</h4>
          <div className="footer-contact">
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>{companyInfo?.phone || '032-461-1800'}</span>
            </div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>{companyInfo?.fax || '032-461-1001'}</span>
            </div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{companyInfo?.address || '인천시 연수구 송도미래로30 스마트밸리 B동 801호'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-company-info">
            {companyInfo?.name || '(주)엘브이에스'} | 대표이사: {companyInfo?.ceo || '김태화'} | 사업자번호: {companyInfo?.businessNumber || '131-86-14914'}
          </p>
          <p className="footer-copyright">
            COPYRIGHT &copy; {new Date().getFullYear()} {companyInfo?.name || '(주)엘브이에스'}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
