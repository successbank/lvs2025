'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import SiteFooter from './SiteFooter';
import PageTracker from './PageTracker';

export default function PublicLayout({ companyInfo, children }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation companyInfo={companyInfo} />
      <PageTracker />
      {children}
      <SiteFooter companyInfo={companyInfo} />
    </>
  );
}
