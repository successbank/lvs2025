'use client';

import { useEffect } from 'react';

// /en 서브트리에서 <html lang>을 en으로 전환 (언마운트 시 ko 복원)
export default function HtmlLangEn() {
  useEffect(() => {
    document.documentElement.lang = 'en';
    return () => {
      document.documentElement.lang = 'ko';
    };
  }, []);
  return null;
}
