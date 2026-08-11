'use client';

import '../../app/styles/globals.css';
import SupportSubNavEn from './SupportSubNavEn';

export default function AboutUsPageEn({ companyInfo, history = [] }) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/en">Home</a>
          <span>&gt;</span>
          <a href="/en/about/us">Company</a>
          <span>&gt;</span>
          <span>About Us</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>About Us</h1>
          <p>Lighting for Vision System</p>
        </div>
      </section>

      <SupportSubNavEn section="about" active="/about/us" />

      {/* Company Introduction */}
      <section className="content-section">
        <div className="container">
          <div className="company-intro">
            <h2>Growing Together with Our Customers</h2>
            <div className="intro-text">
              <p>
                LVS Co., Ltd. is an industrial LED lighting specialist providing
                optimal lighting solutions for machine vision systems.
              </p>
              <p>
                With over 20 years of experience and technical expertise, we accurately
                analyze customer requirements and propose the best lighting solutions.
              </p>
              <p>
                Through continuous R&amp;D we develop innovative products,
                always putting customer satisfaction first.
              </p>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="vision-mission">
            <div className="vm-card">
              <h3>Vision</h3>
              <p>A global leader in machine vision lighting</p>
            </div>
            <div className="vm-card">
              <h3>Mission</h3>
              <p>Creating customer value with the highest quality and technology</p>
            </div>
            <div className="vm-card">
              <h3>Core Values</h3>
              <p>Innovation, Quality, Customer Satisfaction, Integrity</p>
            </div>
          </div>

          {/* Company Info Grid */}
          <div className="company-info-grid">
            <div className="info-card">
              <div className="info-label">Company</div>
              <div className="info-value">LVS Co., Ltd.</div>
            </div>
            <div className="info-card">
              <div className="info-label">CEO</div>
              <div className="info-value">Taehwa Kim</div>
            </div>
            <div className="info-card">
              <div className="info-label">Business Reg. No.</div>
              <div className="info-value">{companyInfo?.business_number || '131-86-14914'}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Address</div>
              <div className="info-value">B-801~803, 30 Songdomirae-ro, Yeonsu-gu, Incheon, Republic of Korea</div>
            </div>
            <div className="info-card">
              <div className="info-label">Tel</div>
              <div className="info-value">{companyInfo?.phone ? `+82-${(companyInfo.phone || '').replace(/^0/, '')}` : '+82-32-461-1800'}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Fax</div>
              <div className="info-value">{companyInfo?.fax ? `+82-${(companyInfo.fax || '').replace(/^0/, '')}` : '+82-32-461-1001'}</div>
            </div>
          </div>

          {/* Company History */}
          {history.length > 0 && (
            <div className="company-history">
              <h2>History</h2>
              <div className="history-timeline">
                {history.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-year">
                      {item.year}{item.month ? `.${String(item.month).padStart(2, '0')}` : ''}
                    </div>
                    <div className="history-content">
                      <h4>{item.title}</h4>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
