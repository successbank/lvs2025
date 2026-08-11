'use client';

import { usePathname } from 'next/navigation';
import { getDict, localeFromPathname, withLocale } from '@/lib/i18n';

export default function SiteFooter({ companyInfo }) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getDict(locale).footer;
  const L = (url) => withLocale(url, locale);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-text">LVS</span>
            <span className="logo-sub">Lighting for Vision System</span>
          </div>
          <p className="footer-tagline">{t.tagline}</p>
        </div>
        <div className="footer-col">
          <h4>{t.colProducts}</h4>
          <ul>
            <li><a href={L('/products/general-lighting')}>{t.generalLighting}</a></li>
            <li><a href={L('/products/power-supply')}>{t.powerSupply}</a></li>
            <li><a href={L('/products/led-lightsource')}>{t.ledLightsource}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t.colCompany}</h4>
          <ul>
            <li><a href={L('/about/us')}>{t.aboutUs}</a></li>
            <li><a href={L('/about/certifications')}>{t.certifications}</a></li>
            <li><a href={L('/about/dealers')}>{t.dealers}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t.colContact}</h4>
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
              <span>{locale === 'en' ? t.fallbackAddress : (companyInfo?.address || t.fallbackAddress)}</span>
            </div>
            <div className="footer-contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>{companyInfo?.email || 'chris@lvs.co.kr'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-company-info">
            {locale === 'en'
              ? <>{t.fallbackCompanyName} | {t.ceoLabel}: {t.fallbackCeo} | {t.bizNumLabel}: {companyInfo?.businessNumber || '131-86-14914'}</>
              : <>{companyInfo?.name || t.fallbackCompanyName} | {t.ceoLabel}: {companyInfo?.ceo || t.fallbackCeo} | {t.bizNumLabel}: {companyInfo?.businessNumber || '131-86-14914'}</>}
          </p>
          <p className="footer-copyright">
            COPYRIGHT &copy; {new Date().getFullYear()} {locale === 'en' ? t.fallbackCompanyName : (companyInfo?.name || t.fallbackCompanyName)}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
