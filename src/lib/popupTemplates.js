/**
 * LVS 레이어팝업 템플릿 정의
 * 10개 B2B 산업용 LED 조명 기업 맞춤 템플릿
 *
 * 각 템플릿: { id, name, description, colorTheme, defaultWidth, defaultHeight, defaultPosition, fields[], render(data) }
 * render()는 React createElement 호출용 — TemplateRenderer에서 사용
 */

// ── 필드 타입: text, textarea, url, listItems, image ──

const TEMPLATES = [
  // ═══════════════════════════════════════════
  // 1. 신제품 출시
  // ═══════════════════════════════════════════
  {
    id: 'new-product',
    name: '신제품 출시',
    description: '새로운 제품 출시 알림 팝업',
    colorTheme: '#3b82f6',
    defaultWidth: 480,
    defaultHeight: 520,
    defaultPosition: 'CENTER',
    fields: [
      { key: 'badgeText', label: '배지 텍스트', type: 'text', placeholder: 'NEW', required: false },
      { key: 'headline', label: '제목', type: 'text', placeholder: '신제품 출시 안내', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: '제품 시리즈명', required: false },
      { key: 'imageUrl', label: '제품 이미지', type: 'image', required: false },
      { key: 'body', label: '본문', type: 'textarea', placeholder: '제품 설명을 입력하세요', required: false },
      { key: 'ctaText', label: '버튼 텍스트', type: 'text', placeholder: '자세히 보기', required: false },
      { key: 'ctaLink', label: '버튼 링크', type: 'url', placeholder: '/products/...', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
    ],
    render: (data) => ({
      type: 'new-product',
      containerStyle: {
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        color: 'white',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      },
      badge: data.badgeText ? {
        text: data.badgeText,
        style: {
          position: 'absolute', top: '16px', right: '16px',
          background: '#ef4444', color: 'white',
          padding: '4px 14px', borderRadius: '4px',
          fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em',
          zIndex: 1,
        },
      } : null,
      header: {
        style: { padding: '32px 28px 16px' },
        headline: { text: data.headline || '', style: { fontSize: '1.5rem', fontWeight: '700', margin: '0 0 6px', lineHeight: '1.3' } },
        subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.95rem', opacity: 0.85, margin: 0, fontWeight: '400' } } : null,
      },
      image: data.imageUrl ? {
        src: data.imageUrl,
        style: {
          width: '100%', height: '180px', objectFit: 'contain',
          background: 'rgba(255,255,255,0.1)', display: 'block',
        },
      } : null,
      body: data.body ? {
        text: data.body,
        style: { padding: '16px 28px', fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.9, margin: 0 },
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '0 28px 28px',
          padding: '10px 28px', borderRadius: '6px',
          background: 'white', color: '#1e40af',
          fontWeight: '600', fontSize: '0.9rem',
          textDecoration: 'none', textAlign: 'center',
          border: 'none', cursor: 'pointer',
        },
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 2. 전시회/박람회
  // ═══════════════════════════════════════════
  {
    id: 'exhibition',
    name: '전시회/박람회',
    description: '전시회 참가 안내 팝업',
    colorTheme: '#f59e0b',
    defaultWidth: 500,
    defaultHeight: 560,
    defaultPosition: 'TOP_RIGHT',
    fields: [
      { key: 'headline', label: '제목', type: 'text', placeholder: '2026 국제 LED 조명 박람회', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: 'LVS가 함께합니다', required: false },
      { key: 'imageUrl', label: '전시회 이미지', type: 'image', required: false },
      { key: 'body', label: '안내 문구', type: 'textarea', placeholder: '전시회 안내 내용', required: false },
      { key: 'eventDate', label: '행사 일정', type: 'text', placeholder: '2026.04.15 ~ 18', required: false },
      { key: 'eventLocation', label: '장소', type: 'text', placeholder: 'COEX 1관 B112', required: false },
      { key: 'eventTime', label: '시간', type: 'text', placeholder: '10:00 ~ 17:00', required: false },
      { key: 'listItems', label: '전시 품목', type: 'listItems', placeholder: '전시 품목 입력', required: false },
      { key: 'ctaText', label: '버튼 텍스트', type: 'text', placeholder: '사전 등록하기', required: false },
      { key: 'ctaLink', label: '버튼 링크', type: 'url', placeholder: 'https://...', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
      { key: 'secondaryCtaText', label: '보조 버튼 텍스트', type: 'text', placeholder: '오시는 길', required: false },
      { key: 'secondaryCtaLink', label: '보조 버튼 링크', type: 'url', placeholder: '/about/...', required: false },
    ],
    render: (data) => ({
      type: 'exhibition',
      containerStyle: {
        background: '#111827',
        color: 'white',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        position: 'relative',
      },
      header: {
        style: { padding: '28px 28px 0', borderBottom: '2px solid #f59e0b' },
        headline: { text: data.headline || '', style: { fontSize: '1.4rem', fontWeight: '700', margin: '0 0 6px', color: '#f59e0b' } },
        subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.9rem', opacity: 0.7, margin: '0 0 16px', fontWeight: '400' } } : null,
      },
      image: data.imageUrl ? {
        src: data.imageUrl,
        style: { width: '100%', height: '160px', objectFit: 'cover', display: 'block' },
      } : null,
      eventInfo: (data.eventDate || data.eventLocation || data.eventTime) ? {
        style: { padding: '16px 28px', background: 'rgba(245,158,11,0.08)' },
        items: [
          data.eventDate && { icon: '\uD83D\uDCC5', label: '일정', value: data.eventDate },
          data.eventLocation && { icon: '\uD83D\uDCCD', label: '장소', value: data.eventLocation },
          data.eventTime && { icon: '\u23F0', label: '시간', value: data.eventTime },
        ].filter(Boolean),
      } : null,
      body: data.body ? {
        text: data.body,
        style: { padding: '12px 28px', fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.8, margin: 0 },
      } : null,
      listItems: data.listItems?.length ? {
        items: data.listItems,
        style: { padding: '0 28px 12px', margin: 0, listStyle: 'none' },
        itemStyle: { fontSize: '0.85rem', padding: '3px 0', opacity: 0.8, paddingLeft: '16px', position: 'relative' },
        bulletColor: '#f59e0b',
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '4px 28px 20px',
          padding: '10px 24px', borderRadius: '6px',
          background: '#f59e0b', color: '#111827',
          fontWeight: '600', fontSize: '0.9rem',
          textDecoration: 'none', border: 'none', cursor: 'pointer',
        },
      } : null,
      secondaryCta: data.secondaryCtaText ? {
        text: data.secondaryCtaText,
        link: data.secondaryCtaLink || '#',
        style: {
          display: 'inline-block', margin: '0 0 20px 0',
          padding: '10px 20px', borderRadius: '6px',
          background: 'transparent', color: '#f59e0b',
          fontWeight: '500', fontSize: '0.85rem',
          textDecoration: 'none', border: '1px solid #f59e0b', cursor: 'pointer',
        },
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 3. 시즌 프로모션
  // ═══════════════════════════════════════════
  {
    id: 'seasonal-promotion',
    name: '시즌 프로모션',
    description: '할인/이벤트 프로모션 팝업',
    colorTheme: '#f97316',
    defaultWidth: 460,
    defaultHeight: 540,
    defaultPosition: 'CENTER',
    fields: [
      { key: 'badgeText', label: '배지', type: 'text', placeholder: 'EVENT', required: false },
      { key: 'discountText', label: '할인 텍스트', type: 'text', placeholder: '20% OFF', required: false },
      { key: 'headline', label: '제목', type: 'text', placeholder: '봄맞이 특별 프로모션', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: '산업용 LED 조명 특가', required: false },
      { key: 'imageUrl', label: '프로모션 이미지', type: 'image', required: false },
      { key: 'body', label: '프로모션 내용', type: 'textarea', placeholder: '프로모션 상세 내용', required: false },
      { key: 'periodText', label: '기간', type: 'text', placeholder: '2026.04.01 ~ 04.30', required: false },
      { key: 'ctaText', label: '버튼 텍스트', type: 'text', placeholder: '프로모션 보기', required: false },
      { key: 'ctaLink', label: '버튼 링크', type: 'url', placeholder: '/products/...', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
    ],
    render: (data) => ({
      type: 'seasonal-promotion',
      containerStyle: {
        background: 'linear-gradient(135deg, #f97316, #ec4899)',
        color: 'white',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      },
      badge: data.badgeText ? {
        text: data.badgeText,
        style: {
          position: 'absolute', top: '20px', left: '-30px',
          background: '#fbbf24', color: '#92400e',
          padding: '4px 40px', fontSize: '0.7rem', fontWeight: '700',
          transform: 'rotate(-12deg)', zIndex: 1,
        },
      } : null,
      discount: data.discountText ? {
        text: data.discountText,
        style: {
          padding: '24px 28px 0', fontSize: '2.5rem', fontWeight: '800',
          letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.2)',
        },
      } : null,
      header: {
        style: { padding: data.discountText ? '8px 28px 0' : '28px 28px 0' },
        headline: { text: data.headline || '', style: { fontSize: '1.4rem', fontWeight: '700', margin: '0 0 4px' } },
        subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.9rem', opacity: 0.85, margin: 0 } } : null,
      },
      image: data.imageUrl ? {
        src: data.imageUrl,
        style: { width: '100%', height: '160px', objectFit: 'contain', display: 'block', margin: '12px 0' },
      } : null,
      body: data.body ? {
        text: data.body,
        style: { padding: '12px 28px', fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.9, margin: 0 },
      } : null,
      period: data.periodText ? {
        text: data.periodText,
        style: {
          margin: '0 28px', padding: '8px 16px', background: 'rgba(0,0,0,0.15)',
          borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500', textAlign: 'center',
        },
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '16px 28px 24px',
          padding: '12px 32px', borderRadius: '30px',
          background: 'white', color: '#f97316',
          fontWeight: '700', fontSize: '0.95rem',
          textDecoration: 'none', border: 'none', cursor: 'pointer',
        },
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 4. 기술 세미나
  // ═══════════════════════════════════════════
  {
    id: 'technical-seminar',
    name: '기술 세미나',
    description: '교육/웨비나 초대 팝업',
    colorTheme: '#2563eb',
    defaultWidth: 440,
    defaultHeight: 500,
    defaultPosition: 'CENTER',
    fields: [
      { key: 'headline', label: '세미나 제목', type: 'text', placeholder: 'LED 조명 설계 기술 세미나', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: '제5회 산업 조명 기술 교육', required: false },
      { key: 'body', label: '세미나 소개', type: 'textarea', placeholder: '세미나 상세 내용', required: false },
      { key: 'eventDate', label: '일정', type: 'text', placeholder: '2026년 4월 20일 (목)', required: false },
      { key: 'eventTime', label: '시간', type: 'text', placeholder: '14:00 ~ 17:00', required: false },
      { key: 'eventLocation', label: '장소', type: 'text', placeholder: '온라인 (Zoom)', required: false },
      { key: 'ctaText', label: '버튼 텍스트', type: 'text', placeholder: '참가 신청', required: false },
      { key: 'ctaLink', label: '버튼 링크', type: 'url', placeholder: 'https://...', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
    ],
    render: (data) => ({
      type: 'technical-seminar',
      containerStyle: {
        background: '#ffffff',
        color: '#1e293b',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        borderLeft: '4px solid #2563eb',
      },
      header: {
        style: { padding: '28px 28px 12px' },
        eyebrow: { text: 'SEMINAR', style: { fontSize: '0.7rem', fontWeight: '700', color: '#2563eb', letterSpacing: '0.1em', margin: '0 0 8px' } },
        headline: { text: data.headline || '', style: { fontSize: '1.3rem', fontWeight: '700', margin: '0 0 6px', color: '#1e293b' } },
        subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.88rem', color: '#64748b', margin: 0 } } : null,
      },
      eventInfo: (data.eventDate || data.eventTime || data.eventLocation) ? {
        style: { padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' },
        items: [
          data.eventDate && { icon: '\uD83D\uDCC5', label: '일정', value: data.eventDate },
          data.eventTime && { icon: '\u23F0', label: '시간', value: data.eventTime },
          data.eventLocation && { icon: '\uD83D\uDCCD', label: '장소', value: data.eventLocation },
        ].filter(Boolean),
      } : null,
      body: data.body ? {
        text: data.body,
        style: { padding: '16px 28px', fontSize: '0.88rem', lineHeight: '1.7', color: '#475569', margin: 0 },
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '4px 28px 24px',
          padding: '10px 28px', borderRadius: '6px',
          background: '#2563eb', color: 'white',
          fontWeight: '600', fontSize: '0.9rem',
          textDecoration: 'none', border: 'none', cursor: 'pointer',
        },
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 5. 시스템 점검
  // ═══════════════════════════════════════════
  {
    id: 'system-maintenance',
    name: '시스템 점검',
    description: '시스템 점검 안내 팝업',
    colorTheme: '#f59e0b',
    defaultWidth: 420,
    defaultHeight: 380,
    defaultPosition: 'CENTER',
    fields: [
      { key: 'badgeText', label: '배지', type: 'text', placeholder: '안내', required: false },
      { key: 'headline', label: '제목', type: 'text', placeholder: '시스템 점검 안내', required: true },
      { key: 'body', label: '안내 내용', type: 'textarea', placeholder: '시스템 점검으로 인해 서비스 이용이 일시적으로 제한됩니다.', required: false },
      { key: 'periodText', label: '점검 기간', type: 'text', placeholder: '2026.04.10 02:00 ~ 06:00', required: false },
      { key: 'listItems', label: '영향 서비스', type: 'listItems', placeholder: '영향 받는 서비스명', required: false },
    ],
    render: (data) => ({
      type: 'system-maintenance',
      containerStyle: {
        background: '#fef3c7',
        color: '#92400e',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      },
      header: {
        style: { padding: '24px 24px 12px', background: '#f59e0b', color: 'white' },
        badge: data.badgeText ? { text: data.badgeText, style: { fontSize: '0.7rem', fontWeight: '700', background: 'rgba(255,255,255,0.25)', display: 'inline-block', padding: '2px 10px', borderRadius: '3px', marginBottom: '8px' } } : null,
        headline: { text: data.headline || '', style: { fontSize: '1.25rem', fontWeight: '700', margin: 0 } },
      },
      body: data.body ? {
        text: data.body,
        style: { padding: '16px 24px 8px', fontSize: '0.88rem', lineHeight: '1.6', margin: 0, color: '#92400e' },
      } : null,
      period: data.periodText ? {
        text: data.periodText,
        style: {
          margin: '4px 24px 12px', padding: '10px 14px',
          background: 'rgba(146,64,14,0.08)', borderRadius: '6px',
          fontSize: '0.9rem', fontWeight: '600', fontFamily: 'monospace',
          textAlign: 'center', color: '#92400e',
        },
      } : null,
      listItems: data.listItems?.length ? {
        items: data.listItems,
        style: { padding: '0 24px 16px', margin: 0, listStyle: 'none' },
        itemStyle: { fontSize: '0.85rem', padding: '3px 0', paddingLeft: '16px', position: 'relative' },
        bulletColor: '#f59e0b',
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 6. 인증 획득
  // ═══════════════════════════════════════════
  {
    id: 'certification',
    name: '인증 획득',
    description: '인증/수상 안내 팝업',
    colorTheme: '#059669',
    defaultWidth: 440,
    defaultHeight: 480,
    defaultPosition: 'BOTTOM_RIGHT',
    fields: [
      { key: 'badgeText', label: '배지', type: 'text', placeholder: 'CERTIFIED', required: false },
      { key: 'headline', label: '인증 제목', type: 'text', placeholder: 'ISO 14001 인증 획득', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: '환경경영시스템 국제 인증', required: false },
      { key: 'imageUrl', label: '인증 이미지', type: 'image', required: false },
      { key: 'body', label: '안내 내용', type: 'textarea', placeholder: '인증 획득 관련 내용', required: false },
      { key: 'ctaText', label: '버튼 텍스트', type: 'text', placeholder: '인증 현황 보기', required: false },
      { key: 'ctaLink', label: '버튼 링크', type: 'url', placeholder: '/about/certifications', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
    ],
    render: (data) => ({
      type: 'certification',
      containerStyle: {
        background: 'linear-gradient(135deg, #047857, #059669)',
        color: 'white',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        position: 'relative',
      },
      badge: data.badgeText ? {
        text: data.badgeText,
        style: {
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.2)', color: 'white',
          padding: '4px 12px', borderRadius: '4px',
          fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em',
        },
      } : null,
      icon: {
        text: '\uD83D\uDEE1\uFE0F',
        style: { padding: '28px 28px 0', fontSize: '2.5rem' },
      },
      header: {
        style: { padding: '12px 28px' },
        headline: { text: data.headline || '', style: { fontSize: '1.35rem', fontWeight: '700', margin: '0 0 6px' } },
        subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.9rem', opacity: 0.85, margin: 0 } } : null,
      },
      image: data.imageUrl ? {
        src: data.imageUrl,
        style: {
          width: '120px', height: '120px', objectFit: 'contain',
          margin: '0 auto', display: 'block',
          background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px',
        },
      } : null,
      body: data.body ? {
        text: data.body,
        style: { padding: '12px 28px', fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.9, margin: 0 },
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '8px 28px 24px',
          padding: '10px 28px', borderRadius: '6px',
          background: 'white', color: '#047857',
          fontWeight: '600', fontSize: '0.9rem',
          textDecoration: 'none', border: 'none', cursor: 'pointer',
        },
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 7. 카탈로그 다운로드
  // ═══════════════════════════════════════════
  {
    id: 'catalog-download',
    name: '카탈로그 다운로드',
    description: '카탈로그/자료 다운로드 유도 팝업',
    colorTheme: '#1e3a8a',
    defaultWidth: 460,
    defaultHeight: 500,
    defaultPosition: 'CENTER',
    fields: [
      { key: 'headline', label: '제목', type: 'text', placeholder: '2026 제품 카탈로그', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: '최신 제품 라인업을 확인하세요', required: false },
      { key: 'body', label: '안내 내용', type: 'textarea', placeholder: '카탈로그 안내 내용', required: false },
      { key: 'ctaText', label: '다운로드 버튼', type: 'text', placeholder: '카탈로그 다운로드', required: false },
      { key: 'ctaLink', label: '다운로드 링크', type: 'url', placeholder: '/support/catalog', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
    ],
    render: (data) => ({
      type: 'catalog-download',
      containerStyle: {
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        color: 'white',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        textAlign: 'center',
      },
      icon: {
        text: '\uD83D\uDCC4',
        style: { paddingTop: '32px', fontSize: '3rem' },
      },
      header: {
        style: { padding: '16px 28px 8px' },
        headline: { text: data.headline || '', style: { fontSize: '1.4rem', fontWeight: '700', margin: '0 0 8px' } },
        subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.9rem', opacity: 0.8, margin: 0 } } : null,
      },
      divider: {
        style: { width: '40px', height: '3px', background: 'rgba(255,255,255,0.4)', margin: '16px auto', borderRadius: '2px' },
      },
      body: data.body ? {
        text: data.body,
        style: { padding: '0 28px 16px', fontSize: '0.88rem', lineHeight: '1.7', opacity: 0.85, margin: 0 },
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '8px 28px 32px',
          padding: '12px 36px', borderRadius: '30px',
          background: 'white', color: '#1e3a8a',
          fontWeight: '700', fontSize: '0.95rem',
          textDecoration: 'none', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 8. 기술자료 안내
  // ═══════════════════════════════════════════
  {
    id: 'technical-guide',
    name: '기술자료 안내',
    description: '기술 문서 업데이트 안내 팝업',
    colorTheme: '#3b82f6',
    defaultWidth: 440,
    defaultHeight: 460,
    defaultPosition: 'TOP_LEFT',
    fields: [
      { key: 'headline', label: '제목', type: 'text', placeholder: '기술자료 업데이트 안내', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: '머신비전 LED 조명 설계 가이드', required: false },
      { key: 'body', label: '안내 내용', type: 'textarea', placeholder: '기술자료 안내 내용', required: false },
      { key: 'ctaText', label: '버튼 텍스트', type: 'text', placeholder: '자료 보기', required: false },
      { key: 'ctaLink', label: '버튼 링크', type: 'url', placeholder: '/support/tech-guide', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
    ],
    render: (data) => ({
      type: 'technical-guide',
      containerStyle: {
        background: '#ffffff',
        color: '#1e293b',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        border: '2px solid #3b82f6',
      },
      header: {
        style: { padding: '24px 24px 12px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
        icon: { text: '\uD83D\uDCD8', style: { fontSize: '1.8rem', flexShrink: 0 } },
        content: {
          eyebrow: { text: 'TECH GUIDE', style: { fontSize: '0.65rem', fontWeight: '700', color: '#3b82f6', letterSpacing: '0.1em', margin: '0 0 4px' } },
          headline: { text: data.headline || '', style: { fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px', color: '#1e293b' } },
          subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.85rem', color: '#64748b', margin: 0 } } : null,
        },
      },
      body: data.body ? {
        text: data.body,
        style: { padding: '12px 24px', fontSize: '0.88rem', lineHeight: '1.7', color: '#475569', margin: 0 },
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '8px 24px 24px',
          padding: '10px 24px', borderRadius: '6px',
          background: '#3b82f6', color: 'white',
          fontWeight: '600', fontSize: '0.88rem',
          textDecoration: 'none', border: 'none', cursor: 'pointer',
        },
      } : null,
    }),
  },

  // ═══════════════════════════════════════════
  // 9. 온라인 상담
  // ═══════════════════════════════════════════
  {
    id: 'online-consultation',
    name: '온라인 상담',
    description: '온라인 상담 유도 팝업',
    colorTheme: '#0d9488',
    defaultWidth: 460,
    defaultHeight: 500,
    defaultPosition: 'BOTTOM_RIGHT',
    fields: [
      { key: 'headline', label: '제목', type: 'text', placeholder: '제품 상담이 필요하신가요?', required: true },
      { key: 'subHeadline', label: '부제목', type: 'text', placeholder: '전문 엔지니어가 답변드립니다', required: false },
      { key: 'body', label: '안내 내용', type: 'textarea', placeholder: '상담 안내 내용', required: false },
      { key: 'contactPhone', label: '연락처', type: 'text', placeholder: '032-461-1800', required: false },
      { key: 'ctaText', label: '상담 버튼', type: 'text', placeholder: '온라인 상담하기', required: false },
      { key: 'ctaLink', label: '상담 링크', type: 'url', placeholder: '/support/consultation', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
      { key: 'secondaryCtaText', label: '보조 버튼', type: 'text', placeholder: '전화 상담', required: false },
      { key: 'secondaryCtaLink', label: '보조 링크', type: 'url', placeholder: 'tel:032-461-1800', required: false },
    ],
    render: (data) => ({
      type: 'online-consultation',
      containerStyle: {
        background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
        color: 'white',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      },
      icon: {
        text: '\uD83D\uDCAC',
        style: { padding: '28px 28px 0', fontSize: '2.5rem' },
      },
      header: {
        style: { padding: '12px 28px' },
        headline: { text: data.headline || '', style: { fontSize: '1.35rem', fontWeight: '700', margin: '0 0 6px' } },
        subHeadline: data.subHeadline ? { text: data.subHeadline, style: { fontSize: '0.9rem', opacity: 0.85, margin: 0 } } : null,
      },
      body: data.body ? {
        text: data.body,
        style: { padding: '8px 28px', fontSize: '0.88rem', lineHeight: '1.6', opacity: 0.9, margin: 0 },
      } : null,
      contactInfo: data.contactPhone ? {
        style: { padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' },
        phone: { text: data.contactPhone, style: { fontSize: '1.1rem', fontWeight: '600' } },
        icon: '\u260E\uFE0F',
      } : null,
      ctaGroup: {
        style: { padding: '8px 28px 24px', display: 'flex', gap: '8px' },
        cta: data.ctaText ? {
          text: data.ctaText,
          link: data.ctaLink || '#',
          target: data.ctaLinkTarget || '_self',
          style: {
            display: 'inline-block', padding: '10px 24px', borderRadius: '6px',
            background: 'white', color: '#0d9488',
            fontWeight: '600', fontSize: '0.9rem',
            textDecoration: 'none', border: 'none', cursor: 'pointer',
          },
        } : null,
        secondaryCta: data.secondaryCtaText ? {
          text: data.secondaryCtaText,
          link: data.secondaryCtaLink || '#',
          style: {
            display: 'inline-block', padding: '10px 20px', borderRadius: '6px',
            background: 'transparent', color: 'white',
            fontWeight: '500', fontSize: '0.88rem',
            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer',
          },
        } : null,
      },
    }),
  },

  // ═══════════════════════════════════════════
  // 10. 회사 공지
  // ═══════════════════════════════════════════
  {
    id: 'company-notice',
    name: '회사 공지',
    description: '일반 회사 공지사항 팝업',
    colorTheme: '#6b7280',
    defaultWidth: 460,
    defaultHeight: 460,
    defaultPosition: 'CENTER',
    fields: [
      { key: 'headline', label: '공지 제목', type: 'text', placeholder: '안내사항', required: true },
      { key: 'body', label: '공지 내용', type: 'textarea', placeholder: '공지 내용을 입력하세요', required: false },
      { key: 'ctaText', label: '버튼 텍스트', type: 'text', placeholder: '자세히 보기', required: false },
      { key: 'ctaLink', label: '버튼 링크', type: 'url', placeholder: '/support/notices', required: false },
      { key: 'ctaLinkTarget', label: '링크 타겟', type: 'select', options: [{ value: '_self', label: '현재 창' }, { value: '_blank', label: '새 창' }], required: false },
    ],
    render: (data) => ({
      type: 'company-notice',
      containerStyle: {
        background: '#ffffff',
        color: '#1e293b',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      },
      header: {
        style: { padding: '20px 24px', background: '#374151', color: 'white' },
        eyebrow: { text: 'NOTICE', style: { fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.1em', opacity: 0.7, margin: '0 0 6px' } },
        headline: { text: data.headline || '', style: { fontSize: '1.25rem', fontWeight: '700', margin: 0 } },
      },
      body: data.body ? {
        text: data.body,
        style: { padding: '20px 24px', fontSize: '0.9rem', lineHeight: '1.8', color: '#475569', margin: 0, whiteSpace: 'pre-line' },
      } : null,
      cta: data.ctaText ? {
        text: data.ctaText,
        link: data.ctaLink || '#',
        target: data.ctaLinkTarget || '_self',
        style: {
          display: 'inline-block', margin: '4px 24px 24px',
          padding: '10px 24px', borderRadius: '6px',
          background: '#374151', color: 'white',
          fontWeight: '600', fontSize: '0.88rem',
          textDecoration: 'none', border: 'none', cursor: 'pointer',
        },
      } : null,
    }),
  },
];

export function getTemplate(templateId) {
  return TEMPLATES.find(t => t.id === templateId) || null;
}

export function getAllTemplates() {
  return TEMPLATES;
}

export function getTemplateFields(templateId) {
  const t = getTemplate(templateId);
  return t ? t.fields : [];
}

export default TEMPLATES;
