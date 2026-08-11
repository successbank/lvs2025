'use client';

// EN 전용 서브 내비게이션 (about / support 공용)
const NAVS = {
  about: [
    { href: '/en/about/us', label: 'About Us' },
    { href: '/en/about/organization', label: 'Overview & Organization' },
    { href: '/en/about/why-led', label: 'Why LED' },
    { href: '/en/about/certifications', label: 'Certifications' },
    { href: '/en/about/dealers', label: 'Distributors' },
    { href: '/en/about/careers', label: 'Careers' },
  ],
  support: [
    { href: '/en/support/notices', label: 'Notices' },
    { href: '/en/support/tech-guide', label: 'Technical Guides' },
    { href: '/en/support/downloads', label: 'Downloads' },
    { href: '/en/support/consultation', label: 'Online Inquiry' },
    { href: '/en/support/contact', label: 'Location' },
    { href: '/en/support/catalog', label: 'Catalog Request' },
  ],
};

export default function SupportSubNavEn({ section = 'support', active }) {
  const items = NAVS[section] || NAVS.support;
  return (
    <div className="sub-nav">
      <div className="sub-nav-container">
        {items.map((item) => (
          <a key={item.href} href={item.href} className={item.href.endsWith(active) ? 'active' : ''}>
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
