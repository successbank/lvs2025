'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PageTracker() {
  const pathname = usePathname();
  const timerRef = useRef(null);

  useEffect(() => {
    // /admin 경로 제외
    if (pathname.startsWith('/admin')) return;

    // 디바운스 300ms
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // 제품 상세 페이지 slug 추출
      const productMatch = pathname.match(/^\/products\/([^/]+)$/);
      const isProductDetail = productMatch &&
        !['general-lighting', 'power-supply', 'led-lightsource'].includes(productMatch[1]);
      const productSlug = isProductDetail ? productMatch[1] : null;

      const payload = {
        path: pathname,
        referrer: document.referrer || null,
        productSlug,
      };

      fetch('/api/tracking/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // 추적 실패는 무시
      });
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return null;
}
