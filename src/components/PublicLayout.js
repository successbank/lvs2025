'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import SiteFooter from './SiteFooter';
import PageTracker from './PageTracker';
import LayerPopupManager from './LayerPopupManager';

export default function PublicLayout({ companyInfo, navigationData, children }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation companyInfo={companyInfo} navigationData={navigationData} />
      <PageTracker />
      <LayerPopupManager />
      {children}
      <SiteFooter companyInfo={companyInfo} />
    </>
  );
}
