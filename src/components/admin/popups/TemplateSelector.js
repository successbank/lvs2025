'use client';

import { getAllTemplates } from '@/lib/popupTemplates';
import TemplateRenderer from './TemplateRenderer';

/**
 * 템플릿 갤러리 선택 컴포넌트
 * 2열 그리드로 10개 템플릿 카드를 표시하고, 클릭 시 선택 상태를 부모에 전달
 */
export default function TemplateSelector({ selectedId, onSelect }) {
  const templates = getAllTemplates();

  // 각 템플릿의 미니 프리뷰 데모 데이터
  const demoData = {
    'new-product': { headline: '신제품 출시', subHeadline: 'HPLS Series', badgeText: 'NEW', ctaText: '자세히 보기' },
    'exhibition': { headline: 'LED 조명 박람회', subHeadline: 'LVS가 함께합니다', eventDate: '2026.04.15~18' },
    'seasonal-promotion': { headline: '봄맞이 프로모션', discountText: '20% OFF', ctaText: '프로모션 보기' },
    'technical-seminar': { headline: '기술 세미나', subHeadline: '조명 설계 교육', eventDate: '4월 20일' },
    'system-maintenance': { headline: '시스템 점검', periodText: '04.10 02:00~06:00' },
    'certification': { headline: 'ISO 인증 획득', badgeText: 'CERTIFIED', ctaText: '인증 현황' },
    'catalog-download': { headline: '2026 카탈로그', subHeadline: '최신 제품 라인업', ctaText: '다운로드' },
    'technical-guide': { headline: '기술자료 업데이트', subHeadline: '설계 가이드' },
    'online-consultation': { headline: '제품 상담', subHeadline: '전문 엔지니어 답변', ctaText: '상담하기' },
    'company-notice': { headline: '안내사항', body: '공지 내용이 여기에 표시됩니다.' },
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
        템플릿 선택
      </label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        {templates.map((tmpl) => {
          const isSelected = selectedId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelect(tmpl.id)}
              style={{
                border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                overflow: 'hidden',
                background: isSelected ? '#eff6ff' : 'white',
                transition: 'all 0.15s',
              }}
            >
              {/* 미니 프리뷰 */}
              <div style={{
                height: '120px',
                overflow: 'hidden',
                transform: 'scale(0.5)',
                transformOrigin: 'top left',
                width: '200%',
                pointerEvents: 'none',
              }}>
                <TemplateRenderer templateId={tmpl.id} data={demoData[tmpl.id] || { headline: tmpl.name }} />
              </div>

              {/* 정보 */}
              <div style={{ padding: '8px 10px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: tmpl.colorTheme, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: '0.85rem', fontWeight: '600',
                    color: isSelected ? '#2563eb' : '#374151',
                  }}>
                    {tmpl.name}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.75rem', color: '#9ca3af', margin: '2px 0 0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {tmpl.description}
                </p>
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div style={{
                  background: '#3b82f6', color: 'white', textAlign: 'center',
                  padding: '4px', fontSize: '0.75rem', fontWeight: '600',
                }}>
                  선택됨
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
