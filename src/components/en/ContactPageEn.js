'use client';

import '../../app/styles/globals.css';
import SupportSubNavEn from './SupportSubNavEn';

export default function ContactPageEn() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/en">Home</a>
          <span>&gt;</span>
          <a href="/en/support">Support</a>
          <span>&gt;</span>
          <span>Location</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>Location</h1>
          <p>LVS researches lighting technology that inspires every workplace.</p>
        </div>
      </section>

      <SupportSubNavEn section="support" active="/support/contact" />

      {/* Contact Content */}
      <div className="contact-container">
        {/* Map — Google Maps embed (API 키 불필요) */}
        <div className="contact-map-section">
          <iframe
            src="https://maps.google.com/maps?q=37.3658,126.6478&hl=en&z=16&output=embed"
            className="kakao-map"
            title="LVS Location"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Company Info */}
        <div className="contact-info-section">
          <div className="contact-info-card">
            <div className="contact-info-header">
              <h3>LVS Co., Ltd.</h3>
            </div>
            <div className="contact-info-content">
              <div className="contact-info-item">
                <div className="contact-info-label">Address</div>
                <div className="contact-info-value">
                  B-801~803, 30 Songdomirae-ro, Yeonsu-gu, Incheon, Republic of Korea
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-label">TEL</div>
                <div className="contact-info-value">
                  <a href="tel:+82-32-461-1800">+82-32-461-1800</a>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-label">FAX</div>
                <div className="contact-info-value">+82-32-461-1001</div>
              </div>
              <div className="contact-info-actions">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=37.3658,126.6478"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  <span className="map-icon">📍</span> Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Transportation Guide */}
        <div className="transportation-section">
          <h3>Getting Here</h3>
          <div className="transportation-grid">
            <div className="transportation-card">
              <h4>🚇 Subway</h4>
              <p>Incheon Line 1, <strong>BIT Zone Station</strong> (Jisik-jeongbo-danji), Exit 1</p>
            </div>
            <div className="transportation-card">
              <h4>🚌 Bus</h4>
              <p>Routes 16 and 6</p>
            </div>
            <div className="transportation-card">
              <h4>🚗 By Car</h4>
              <p>
                <strong>Navigation search:</strong><br />
                &quot;Smart Valley Building B&quot; or &quot;30 Songdomirae-ro&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
