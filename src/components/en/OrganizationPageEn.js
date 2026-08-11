'use client';

import '../../app/styles/globals.css';
import SupportSubNavEn from './SupportSubNavEn';

export default function OrganizationPageEn({ companyInfo }) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/en">Home</a>
          <span>&gt;</span>
          <a href="/en/about/us">Company</a>
          <span>&gt;</span>
          <span>Overview &amp; Organization</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>Overview &amp; Organization</h1>
          <p>Organization Structure</p>
        </div>
      </section>

      <SupportSubNavEn section="about" active="/about/organization" />

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          {/* Company Overview */}
          <div className="ovw-section">
            <h2 className="ovw-section-title">Company Overview</h2>

            <div className="ovw-profile-header">
              <span className="ovw-profile-badge">Since 2006</span>
              <h3 className="ovw-company-name">LVS Co., Ltd.</h3>
              <p className="ovw-company-subtitle">Industrial LED Lighting Specialist</p>
            </div>

            {/* Key Facts Strip */}
            <div className="ovw-keyfacts">
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <span className="ovw-keyfact-value">2006</span>
                <span className="ovw-keyfact-label">Founded</span>
              </div>
              <div className="ovw-keyfact-divider" />
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span className="ovw-keyfact-value">25</span>
                <span className="ovw-keyfact-label">Employees</span>
              </div>
              <div className="ovw-keyfact-divider" />
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <span className="ovw-keyfact-value">LED Lighting</span>
                <span className="ovw-keyfact-label">Core Business</span>
              </div>
              <div className="ovw-keyfact-divider" />
              <div className="ovw-keyfact-item">
                <div className="ovw-keyfact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <span className="ovw-keyfact-value">Songdo, Incheon</span>
                <span className="ovw-keyfact-label">Headquarters</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="ovw-details-table">
              <div className="ovw-details-row">
                <div className="ovw-details-label">CEO</div>
                <div className="ovw-details-value">Taehwa Kim</div>
              </div>
              <div className="ovw-details-row">
                <div className="ovw-details-label">Business Reg. No.</div>
                <div className="ovw-details-value">{companyInfo?.business_number || '131-86-14914'}</div>
              </div>
              <div className="ovw-details-row">
                <div className="ovw-details-label">Head Office</div>
                <div className="ovw-details-value">B-801~803, 30 Songdomirae-ro, Yeonsu-gu, Incheon, Republic of Korea</div>
              </div>
              <div className="ovw-details-row">
                <div className="ovw-details-label">Contact</div>
                <div className="ovw-details-value">
                  Tel: +82-32-461-1800 &nbsp;|&nbsp; Fax: +82-32-461-1001
                </div>
              </div>
            </div>
          </div>

          {/* Organization Chart */}
          <div className="orgchart-section">
            <h2 className="orgchart-section-title">Organization Chart</h2>

            <div className="orgchart-tree">
              <div className="orgchart-ceo-level">
                <div className="orgchart-node orgchart-node--ceo">
                  <div className="orgchart-node-title">CEO</div>
                  <div className="orgchart-node-name">Taehwa Kim</div>
                </div>
              </div>

              <div className="orgchart-connector-vertical" />
              <div className="orgchart-connector-horizontal" />

              <div className="orgchart-divisions">
                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--mgmt">
                    <div className="orgchart-node-title">Management Support</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">General Affairs</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Human Resources</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Accounting</div>
                  </div>
                </div>

                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--rnd">
                    <div className="orgchart-node-title">R&amp;D</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Technology Research</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Product Development</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Design Engineering</div>
                  </div>
                </div>

                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--prod">
                    <div className="orgchart-node-title">Production</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Production Control</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Manufacturing</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Quality Assurance</div>
                  </div>
                </div>

                <div className="orgchart-division">
                  <div className="orgchart-div-connector" />
                  <div className="orgchart-node orgchart-node--division orgchart-node--sales">
                    <div className="orgchart-node-title">Sales</div>
                  </div>
                  <div className="orgchart-teams">
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Domestic Sales</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">International Sales</div>
                    <div className="orgchart-team-connector" />
                    <div className="orgchart-node orgchart-node--team">Customer Support</div>
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
