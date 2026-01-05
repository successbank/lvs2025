'use client';

import { useState } from 'react';
import '../app/styles/globals.css';

export default function WhyLedPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };
  const features = [
    {
      id: 1,
      icon: 'flexible',
      title: 'Flexible Shape Design',
      subtitle: '다양하게 적용할 수 있는 LED조명 설계의 용이한 제공',
      description: 'LED조명 시스템은 점광에 가까운 LED를 집합시켜 구성한 제품으로 광학적으로 구현이 쉬우며, 다 조명에 비해 빛의 조사 범위와 조사 각도, 형광등 등 형상적리를 조명 설계에 관련하여 필요에 따라 다양한 조사 구조를 구현할 수 있어, 어떤 환경에도 유연하고 자유로운 조명 시스템 개발이 가능합니다.'
    },
    {
      id: 2,
      icon: 'life',
      title: 'Long Life',
      subtitle: '안정적이고 긴 수명',
      description: '형상적리에 있어 가장 중요한 안정적인 원소 인류을 위해서는 엘브이에스의 LED조명 시스템이 필요합니다. 당사의 LED조명은 연속적 등으로 취도차가 발광되는 시기까지 10,000 ~ 30,000시간으로 타사 조명에 비해 안정적이고 긴 수명을 보장합니다. 엘브이에스의 조명제어 시스템은 반드시 필요할 경우에만 점등 시킬 수 있는 ON/OFF 제어 기술로 발광을 억제시키고, LED의 수명을 비약적으로 연장시킬 수 있습니다. 또한, 조명에 사용하는 기구들은 모두 발광이 잘 되는 알루미늄을 사용함으로써 LED의 자체 발광에 의한 취도 저하를 최소화 하였으며, 수명 또한 최대로 연장하였습니다.'
    },
    {
      id: 3,
      icon: 'response',
      title: 'Fast Response',
      subtitle: '빠르고 정확한 응답속도',
      description: 'LED는 응답 속도가 빠르고 분수개의 조명의 점멸과 단일 조명 내에서 분수개의 블록의 점멸으로 최상의 논리를 발휘하고 카메라와의 동기화와 검출 정도를 높이는 조광이 가능한 고주파로 펄스 변조방식으로 점등이 가능합니다. 엘브이에스의 LED조명은 당사 컨트롤러와 최상의 조합으로 트리거 입력으로부터 10ysec 이하의 속도로 최대 취도까지 도달하는 빠른 응답성을 보장합니다.'
    },
    {
      id: 4,
      icon: 'color',
      title: 'Selectable Color',
      subtitle: '다양한 발광색으로 폭넓은 선택이 가능',
      description: '통상 형태의 조명에서도 사용하는 발광색(파장)에 따라 활상 화상에 큰 변화가 생기는 이유는 조사 파장에 따라 검출체의 특성에 따른 발광 반사율 분광 투과율, 확산율 등이 다르게 변화하기 때문입니다. 엘브이에스 LED는 다양한 발광색을 제공하여, 검출 활성과 검출치 특성에 따라 선택할 수 있는 운영의 폭을 넓혀, 안정적이고 정확한 화상을 제공할 수 있습니다.'
    },
    {
      id: 5,
      icon: 'cost',
      title: 'Low Total Running Cost',
      subtitle: '전체 운영비가 저렴',
      description: '타조명은 도입 비용이 저렴하지만 일상적인 운용 보존에 따른 비용과 공수가 많이 필요로 하여 회상 처리장치 도입의 장점이 반감됩니다. 타 조명을 도입한 경우 스비전화는 LED에 비해 2~10배 이상 발생하며, 광원의 교환 작업이 매월 발생하며, 도입 개수가 늘어날수록 광원 비용과 교체 작업으로인한 생산 진척 비율의 증가도 함께 발생합니다. 긴 수명과 높은 제어성을 자랑하는 엘브이에스의 LED 조명 시스템을 도입하여, 생산성 향상과 더불어 운영 비용의 절감을 경험하실 수 있습니다.'
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="header-top">
        <div className="header-top-content">
          <a href="/about/dealers">대리점 안내</a>
          <a href="/support/tech-guide">기술지원</a>
          <a href="/support/downloads">다운로드 센터</a>
          <a href="/about/careers">인재채용</a>
          <a href="/en">ENGLISH</a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <a href="/" className="logo">
            <div className="logo-text">LVS</div>
          </a>
          <ul className="nav-menu">
            <li>
              <a href="/products">제품소개</a>
              <ul className="dropdown-menu">
                <li><a href="/products/general-lighting">일반조명</a></li>
                <li><a href="/products/power-supply">파워서플라이</a></li>
                <li><a href="/products/led-lightsource">LED LIGHTSOURCE</a></li>
              </ul>
            </li>
            <li>
              <a href="/about" className="active">회사소개</a>
              <ul className="dropdown-menu">
                <li><a href="/about/us">회사소개</a></li>
                <li><a href="/about/organization">개요 및 조직도</a></li>
                <li><a href="/about/why-led" className="active">Why LED</a></li>
                <li><a href="/about/certifications">인증현황</a></li>
                <li><a href="/about/dealers">대리점 안내</a></li>
              </ul>
            </li>
            <li><a href="/support">고객지원</a></li>
          </ul>
          <div className="nav-actions">
            <div className="search-icon">
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <svg viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
          <div className="mobile-menu active">
            <div className="mobile-menu-header">
              <div className="logo-text">LVS</div>
              <div className="mobile-menu-close" onClick={closeMobileMenu}>×</div>
            </div>
            <div className="mobile-menu-items">
              <ul>
                <li><a href="/products" onClick={closeMobileMenu}>제품소개</a></li>
                <li><a href="/about" onClick={closeMobileMenu}>회사소개</a></li>
                <li><a href="/support" onClick={closeMobileMenu}>고객지원</a></li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/about">회사소개</a>
          <span>&gt;</span>
          <span>Why LED</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>Why LED</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/about/us">회사소개</a>
          <a href="/about/organization">개요 및 조직도</a>
          <a href="/about/why-led" className="active">Why LED</a>
          <a href="/about/certifications">인증현황</a>
          <a href="/about/dealers">대리점 안내</a>
        </div>
      </div>



      {/* Features Section */}
      <div className="why-led-content">
        {features.map((feature, index) => (
          <div key={feature.id} className={`feature-item ${index % 2 === 0 ? 'feature-left' : 'feature-right'}`}>
            <div className="feature-icon">
              {feature.icon === 'flexible' && (
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <circle cx="50" cy="50" r="35" stroke="#0066cc" strokeWidth="3" fill="none" />
                  <path d="M 30 50 Q 50 30 70 50 T 70 70" stroke="#0066cc" strokeWidth="2" fill="none" />
                  <circle cx="50" cy="50" r="5" fill="#0066cc" />
                </svg>
              )}
              {feature.icon === 'life' && (
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <rect x="25" y="25" width="50" height="50" rx="5" stroke="#0066cc" strokeWidth="3" fill="none" />
                  <circle cx="50" cy="40" r="8" fill="#0066cc" />
                  <line x1="50" y1="48" x2="50" y2="65" stroke="#0066cc" strokeWidth="3" />
                  <line x1="50" y1="65" x2="40" y2="75" stroke="#0066cc" strokeWidth="3" />
                  <line x1="50" y1="65" x2="60" y2="75" stroke="#0066cc" strokeWidth="3" />
                </svg>
              )}
              {feature.icon === 'response' && (
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <circle cx="50" cy="50" r="35" stroke="#0066cc" strokeWidth="3" fill="none" />
                  <path d="M 50 20 L 50 55 L 70 40" stroke="#0066cc" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {feature.icon === 'color' && (
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <rect x="20" y="20" width="60" height="40" rx="5" stroke="#0066cc" strokeWidth="3" fill="none" />
                  <line x1="20" y1="35" x2="80" y2="35" stroke="#0066cc" strokeWidth="2" />
                  <line x1="20" y1="45" x2="80" y2="45" stroke="#0066cc" strokeWidth="2" />
                  <circle cx="50" cy="70" r="8" fill="#0066cc" />
                </svg>
              )}
              {feature.icon === 'cost' && (
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <circle cx="50" cy="50" r="35" stroke="#0066cc" strokeWidth="3" fill="none" />
                  <text x="50" y="65" fontSize="40" fill="#0066cc" textAnchor="middle" fontWeight="bold">₩</text>
                </svg>
              )}
            </div>
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <h4>{feature.subtitle}</h4>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="company-info">
            <h4>COMPANY INFO</h4>
            <p>
              (주)엘브이에스 대표이사: 김태화 사업자번호: 131-86-14914<br />
              인천광역시 연수구 송도미래로 30 (송도동 214번지) 스마트밸리 B동 801~803호
            </p>
          </div>
          <div className="contact-section">
            <h4>CONTACT US</h4>
            <div className="contact-numbers">
              <div className="contact-item">
                <span>📞 032-461-1800</span>
              </div>
              <div className="contact-item">
                <span>📠 032-461-1001</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>COPYRIGHT(C) (주)엘브이에스. ALL RIGHT RESERVED.</p>
        </div>
      </footer>
    </>
  );
}
