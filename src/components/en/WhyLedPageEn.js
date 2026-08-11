'use client';

import '../../app/styles/globals.css';
import SupportSubNavEn from './SupportSubNavEn';

export default function WhyLedPageEn() {
  const features = [
    {
      id: 1,
      icon: 'flexible',
      title: 'Flexible Shape Design',
      subtitle: 'Versatile LED lighting design for any application',
      description: 'An LED lighting system is built from near-point light sources, making it easy to implement optically. Compared with conventional lighting, the illumination area, angle, and fixture shape can all be tailored to the lighting design, enabling flexible and unconstrained lighting system development for any environment.'
    },
    {
      id: 2,
      icon: 'life',
      title: 'Long Life',
      subtitle: 'Stable performance and long service life',
      description: 'Stable light output is essential for machine vision. LVS LED lights maintain their brightness for 10,000 to 30,000 hours of continuous operation — far longer and more stable than conventional lighting. Our lighting control systems use ON/OFF control technology to illuminate only when needed, suppressing heat and dramatically extending LED life. All fixtures are built with heat-dissipating aluminum, minimizing brightness degradation caused by the LED’s own heat and maximizing service life.'
    },
    {
      id: 3,
      icon: 'response',
      title: 'Fast Response',
      subtitle: 'Fast and precise response time',
      description: 'LEDs respond quickly, supporting the strobing of multiple lights or of individual blocks within a single light, and can be driven with high-frequency pulse modulation for camera synchronization and improved detection accuracy. Combined with our controllers, LVS LED lights reach full brightness within 10 µs of a trigger input, guaranteeing outstanding response.'
    },
    {
      id: 4,
      icon: 'color',
      title: 'Selectable Color',
      subtitle: 'A wide choice of emission colors',
      description: 'The captured image changes greatly depending on the emission color (wavelength), because the target’s spectral reflectance, transmittance, and diffusion vary with the illumination wavelength. LVS LEDs are available in a wide range of emission colors, broadening your options to match the inspection target’s characteristics and delivering stable, accurate images.'
    },
    {
      id: 5,
      icon: 'cost',
      title: 'Low Total Running Cost',
      subtitle: 'Lower total cost of ownership',
      description: 'Conventional lighting may be cheaper to introduce, but the routine maintenance cost and labor it requires halve the benefit of a vision system. Its power consumption is 2–10 times that of LEDs, lamp replacement occurs monthly, and as the number of units grows, so do lamp costs and production losses from replacement work. With the long life and high controllability of LVS LED lighting systems, you gain productivity while cutting operating costs.'
    }
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/en">Home</a>
          <span>&gt;</span>
          <a href="/en/about/us">Company</a>
          <span>&gt;</span>
          <span>Why LED</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>Why LED</h1>
          <p>LVS researches lighting technology that inspires every workplace.</p>
        </div>
      </section>

      <SupportSubNavEn section="about" active="/about/why-led" />

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
                  <text x="50" y="65" fontSize="40" fill="#0066cc" textAnchor="middle" fontWeight="bold">$</text>
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
    </>
  );
}
