'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * 제품 카테고리 서브 내비게이션 (공통)
 *
 * - PC(769px 이상): 기존과 동일하게 전체 항목을 한 줄로 펼쳐 노출
 * - 모바일(768px 이하): 기본 접힘. "전체보기 ▾" 버튼을 눌러야 목록이 펼쳐짐
 *
 * @param {string} allHref      "전체보기" 링크 경로 (상위 카테고리 목록 페이지)
 * @param {boolean} allActive   "전체보기" 항목 활성 여부
 * @param {Array} items         [{ key, href, label, active }]
 */
export default function ProductSubNav({ allHref, allActive = false, items = [] }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  // 바깥 영역 클릭 / Esc 키로 닫기
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="sub-nav sub-nav--collapsible" ref={navRef}>
      <div className="sub-nav-container">
        <button
          type="button"
          className={`sub-nav-toggle ${open ? 'is-open' : ''}`}
          aria-expanded={open}
          aria-controls="product-sub-nav-list"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>전체보기</span>
          <span className="sub-nav-toggle-arrow" aria-hidden="true">▾</span>
        </button>

        <div
          id="product-sub-nav-list"
          className={`sub-nav-list ${open ? 'is-open' : ''}`}
        >
          <a href={allHref} className={allActive ? 'active' : ''}>
            전체보기
          </a>
          {items.map((item) => (
            <a
              key={item.key || item.href}
              href={item.href}
              className={item.active ? 'active' : ''}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
