'use client';

import { useState, useEffect } from 'react';
import TemplateRenderer from '@/components/admin/popups/TemplateRenderer';

const getCookieName = (id) => `popup_dismiss_${id}`;

const isDismissed = (id) => {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${getCookieName(id)}=`);
};

const dismissForToday = (id) => {
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  document.cookie = `${getCookieName(id)}=1; expires=${midnight.toUTCString()}; path=/`;
};

const getPositionStyle = (position) => {
  const styles = {
    CENTER: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    TOP_LEFT: { top: '100px', left: '20px' },
    TOP_RIGHT: { top: '100px', right: '20px' },
    BOTTOM_LEFT: { bottom: '20px', left: '20px' },
    BOTTOM_RIGHT: { bottom: '20px', right: '20px' },
  };
  return styles[position] || styles.CENTER;
};

export default function LayerPopupManager() {
  const [popups, setPopups] = useState([]);
  const [visiblePopups, setVisiblePopups] = useState([]);
  const [dismissedInSession, setDismissedInSession] = useState(new Set());

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch('/api/popups?active=true');
        const data = await res.json();
        const allPopups = data.popups || [];
        const filtered = allPopups.filter(p => !isDismissed(p.id));
        setPopups(filtered);
      } catch (error) {
        console.error('Failed to fetch popups:', error);
      }
    };
    fetchPopups();
  }, []);

  useEffect(() => {
    if (popups.length === 0) {
      setVisiblePopups([]);
      return;
    }

    // 같은 위치: 스택(첫 번째만 표시), 다른 위치: 동시 표시
    const byPosition = {};
    popups.forEach(p => {
      if (dismissedInSession.has(p.id)) return;
      const pos = p.position || 'CENTER';
      if (!byPosition[pos]) byPosition[pos] = [];
      byPosition[pos].push(p);
    });

    const visible = [];
    Object.values(byPosition).forEach(group => {
      if (group.length > 0) visible.push(group[0]);
    });

    setVisiblePopups(visible);
  }, [popups, dismissedInSession]);

  const handleClose = (popup) => {
    setDismissedInSession(prev => new Set([...prev, popup.id]));
  };

  const handleDismissToday = (popup) => {
    dismissForToday(popup.id);
    setDismissedInSession(prev => new Set([...prev, popup.id]));
  };

  if (visiblePopups.length === 0) return null;

  return (
    <>
      {/* 오버레이 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.4)', zIndex: 14999,
      }} />

      {visiblePopups.map(popup => (
        <PopupItem
          key={popup.id}
          popup={popup}
          onClose={() => handleClose(popup)}
          onDismissToday={() => handleDismissToday(popup)}
        />
      ))}
    </>
  );
}

function PopupItem({ popup, onClose, onDismissToday }) {
  const [checkDismiss, setCheckDismiss] = useState(false);

  const handleCloseClick = () => {
    if (checkDismiss) {
      onDismissToday();
    } else {
      onClose();
    }
  };

  const handleImageClick = () => {
    if (popup.link) {
      window.open(popup.link, popup.linkTarget || '_self');
    }
  };

  const isTemplate = popup.templateId && popup.templateData;

  return (
    <div style={{
      position: 'fixed',
      ...getPositionStyle(popup.position),
      zIndex: 15000,
      width: `${popup.width}px`,
      maxWidth: '90vw',
      maxHeight: '85vh',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      background: 'white',
    }}>
      {isTemplate ? (
        /* 템플릿 렌더링 */
        <div style={{ maxHeight: 'calc(85vh - 50px)', overflowY: 'auto' }}>
          <TemplateRenderer templateId={popup.templateId} data={popup.templateData} />
        </div>
      ) : (
        /* 기존 이미지 렌더링 */
        <div
          onClick={handleImageClick}
          style={{ cursor: popup.link ? 'pointer' : 'default', lineHeight: 0 }}
        >
          <picture>
            {popup.mobileImageUrl && (
              <source media="(max-width: 768px)" srcSet={popup.mobileImageUrl} />
            )}
            <img
              src={popup.imageUrl}
              alt={popup.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: `calc(85vh - 50px)`,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </picture>
        </div>
      )}

      {/* 하단 바 */}
      <div style={{
        padding: '0.6rem 0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #e5e7eb',
        background: 'white',
      }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          cursor: 'pointer', fontSize: '0.85rem', color: '#6b7280',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={checkDismiss}
            onChange={(e) => setCheckDismiss(e.target.checked)}
          />
          오늘 하루 안 보기
        </label>
        <button
          onClick={handleCloseClick}
          style={{
            background: '#6b7280', color: 'white', border: 'none',
            padding: '0.35rem 1rem', borderRadius: '4px',
            cursor: 'pointer', fontSize: '0.85rem',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
