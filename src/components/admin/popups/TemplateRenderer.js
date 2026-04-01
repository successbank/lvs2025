'use client';

import { getTemplate } from '@/lib/popupTemplates';

/**
 * 공유 렌더러: 관리자 미리보기 + 소비자 표시 양쪽에서 사용
 * templateId + data를 받아 해당 템플릿의 render()로 구조를 생성하고 React 엘리먼트로 변환
 */
export default function TemplateRenderer({ templateId, data = {} }) {
  const template = getTemplate(templateId);
  if (!template) return <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>알 수 없는 템플릿</div>;

  const r = template.render(data);

  return (
    <div style={r.containerStyle}>
      {/* 배지 */}
      {r.badge && <div style={r.badge.style}>{r.badge.text}</div>}

      {/* 아이콘 */}
      {r.icon && <div style={r.icon.style}>{r.icon.text}</div>}

      {/* 할인 텍스트 (프로모션) */}
      {r.discount && <div style={r.discount.style}>{r.discount.text}</div>}

      {/* 헤더 */}
      {r.header && (
        <div style={r.header.style}>
          {/* 기술자료 안내 — 아이콘+콘텐츠 레이아웃 */}
          {r.header.icon && <span style={r.header.icon.style}>{r.header.icon.text}</span>}
          {r.header.content ? (
            <div>
              {r.header.content.eyebrow && <p style={r.header.content.eyebrow.style}>{r.header.content.eyebrow.text}</p>}
              <h2 style={r.header.content.headline.style}>{r.header.content.headline.text}</h2>
              {r.header.content.subHeadline && <p style={r.header.content.subHeadline.style}>{r.header.content.subHeadline.text}</p>}
            </div>
          ) : (
            <>
              {r.header.badge && <div style={r.header.badge.style}>{r.header.badge.text}</div>}
              {r.header.eyebrow && <p style={r.header.eyebrow.style}>{r.header.eyebrow.text}</p>}
              <h2 style={r.header.headline.style}>{r.header.headline.text}</h2>
              {r.header.subHeadline && <p style={r.header.subHeadline.style}>{r.header.subHeadline.text}</p>}
            </>
          )}
        </div>
      )}

      {/* 이미지 */}
      {r.image && <img src={r.image.src} alt="" style={r.image.style} />}

      {/* 이벤트 정보 (전시회/세미나) */}
      {r.eventInfo && (
        <div style={r.eventInfo.style}>
          {r.eventInfo.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '0.88rem' }}>
              <span>{item.icon}</span>
              <span style={{ fontWeight: '600', minWidth: '36px' }}>{item.label}</span>
              <span style={{ opacity: 0.9 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* 구분선 (카탈로그) */}
      {r.divider && <div style={r.divider.style} />}

      {/* 본문 */}
      {r.body && <p style={r.body.style}>{r.body.text}</p>}

      {/* 기간 (프로모션/점검) */}
      {r.period && <div style={r.period.style}>{r.period.text}</div>}

      {/* 리스트 항목 (전시회/점검) */}
      {r.listItems && (
        <ul style={r.listItems.style}>
          {r.listItems.items.map((item, i) => (
            <li key={i} style={r.listItems.itemStyle}>
              <span style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: '6px', height: '6px', borderRadius: '50%',
                background: r.listItems.bulletColor,
              }} />
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* 연락처 (온라인 상담) */}
      {r.contactInfo && (
        <div style={r.contactInfo.style}>
          <span>{r.contactInfo.icon}</span>
          <span style={r.contactInfo.phone.style}>{r.contactInfo.phone.text}</span>
        </div>
      )}

      {/* CTA 버튼 그룹 (온라인 상담 — 듀얼 CTA) */}
      {r.ctaGroup && (
        <div style={r.ctaGroup.style}>
          {r.ctaGroup.cta && (
            <a href={r.ctaGroup.cta.link} target={r.ctaGroup.cta.target} style={r.ctaGroup.cta.style}>
              {r.ctaGroup.cta.text}
            </a>
          )}
          {r.ctaGroup.secondaryCta && (
            <a href={r.ctaGroup.secondaryCta.link} style={r.ctaGroup.secondaryCta.style}>
              {r.ctaGroup.secondaryCta.text}
            </a>
          )}
        </div>
      )}

      {/* 단일 CTA */}
      {r.cta && (
        <div>
          <a href={r.cta.link} target={r.cta.target} style={r.cta.style}>
            {r.cta.text}
          </a>
          {/* 전시회 보조 CTA */}
          {r.secondaryCta && (
            <a href={r.secondaryCta.link} style={r.secondaryCta.style}>
              {r.secondaryCta.text}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
