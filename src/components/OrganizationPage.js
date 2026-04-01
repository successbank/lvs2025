'use client';

import '../app/styles/globals.css';

export default function OrganizationPage({ companyInfo }) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/about">회사소개</a>
          <span>&gt;</span>
          <span>개요 및 조직도</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>개요 및 조직도</h1>
          <p>Organization Structure</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us">회사소개</a>
          <a href="/about/organization" className="active">개요 및 조직도</a>
          <a href="/about/why-led">Why LED</a>
          <a href="/about/certifications">인증현황</a>
          <a href="/about/dealers">대리점 안내</a>
          <a href="/about/careers">인재채용</a>
        </div>
      </div>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          {/* Company Overview */}
          <div className="ovw-section">
            <h2 className="ovw-section-title">회사 개요</h2>

            {/* Profile Header */}
            <div className="ovw-profile-header">
              <span className="ovw-profile-badge">Since 2006</span>
              <h3 className="ovw-company-name">{companyInfo?.name || '(주)엘브이에스'}</h3>
              <p className="ovw-company-subtitle">산업용 LED 조명 전문 기업</p>
            </div>

            {/* Key Facts Strip */}
            <div className="ovw-keyfacts">
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <span className="ovw-keyfact-value">2006</span>
                <span className="ovw-keyfact-label">설립연도</span>
              </div>
              <div className="ovw-keyfact-divider" />
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span className="ovw-keyfact-value">25명</span>
                <span className="ovw-keyfact-label">임직원</span>
              </div>
              <div className="ovw-keyfact-divider" />
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <span className="ovw-keyfact-value">LED 조명</span>
                <span className="ovw-keyfact-label">주요 사업</span>
              </div>
              <div className="ovw-keyfact-divider" />
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <span className="ovw-keyfact-value">인천 송도</span>
                <span className="ovw-keyfact-label">본사 소재지</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="ovw-details-table">
              <div className="ovw-details-row">
                <div className="ovw-details-label">대표이사</div>
                <div className="ovw-details-value">{companyInfo?.ceo || '김태화'}</div>
              </div>
              <div className="ovw-details-row">
                <div className="ovw-details-label">사업자등록번호</div>
                <div className="ovw-details-value">{companyInfo?.business_number || '131-86-14914'}</div>
              </div>
              <div className="ovw-details-row">
                <div className="ovw-details-label">본사 주소</div>
                <div className="ovw-details-value">{companyInfo?.address || '인천광역시 연수구 송도미래로 30 B동 801~803호'}</div>
              </div>
              <div className="ovw-details-row">
                <div className="ovw-details-label">연락처</div>
                <div className="ovw-details-value">
                  Tel: {companyInfo?.phone || '032-461-1800'} &nbsp;|&nbsp; Fax: {companyInfo?.fax || '032-461-1001'}
                </div>
              </div>
            </div>
          </div>

          {/* Organization Chart */}
          <div className="orgchart-section">
            <h2 className="orgchart-section-title">조직도</h2>

            <div className="orgchart-tree">
              {/* CEO */}
              <div className="orgchart-ceo-level">
                <div className="orgchart-node orgchart-node--ceo">
                  <div className="orgchart-node-title">대표이사</div>
                  <div className="orgchart-node-name">{companyInfo?.ceo || '김태화'}</div>
                </div>
              </div>

              {/* Vertical connector from CEO */}
              <div className="orgchart-connector-vertical" />

              {/* Horizontal branch line */}
              <div className="orgchart-connector-horizontal" />

              {/* Division columns */}
              <div className="orgchart-divisions">
                {/* 경영지원본부 */}
                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--mgmt">
                    <div className="orgchart-node-title">경영지원본부</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">총무팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">인사팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">회계팀</div>
                  </div>
                </div>

                {/* 연구개발본부 */}
                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--rnd">
                    <div className="orgchart-node-title">연구개발본부</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">기술연구팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">제품개발팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">설계팀</div>
                  </div>
                </div>

                {/* 생산본부 */}
                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--prod">
                    <div className="orgchart-node-title">생산본부</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">생산관리팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">제조팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">품질관리팀</div>
                  </div>
                </div>

                {/* 영업본부 */}
                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--sales">
                    <div className="orgchart-node-title">영업본부</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">국내영업팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">해외영업팀</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">고객지원팀</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
