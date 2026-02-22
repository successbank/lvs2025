'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import SiteFooter from './SiteFooter';

export default function PublicLayout({ companyInfo, children }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation companyInfo={companyInfo} />
      {children}
      <SiteFooter companyInfo={companyInfo} />
    </>
  );
}
