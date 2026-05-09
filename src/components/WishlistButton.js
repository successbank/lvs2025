'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';

// 관심제품 토글 버튼 — 제품 상세/카드 양쪽 재사용
//
// Props:
//   productId: string (필수)
//   variant?: 'detail' | 'card'  (기본 'detail')
//
// 동작:
//   - 마운트 시 /api/wishlist/check로 등록 여부 조회
//   - 클릭: 비로그인 → LoginModal 표시 / 로그인 → POST·DELETE 토글
//   - 로그인 모달 onSuccess → 자동으로 POST 호출하여 클릭한 제품 등록
export default function WishlistButton({ productId, variant = 'detail' }) {
  const { data: session, status } = useSession();
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // 등록 여부 동기화
  const refresh = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/wishlist/check?productId=${encodeURIComponent(productId)}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      setRegistered(!!data.registered);
    } catch (err) {
      console.error('wishlist check error:', err);
    }
  }, [productId]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      setRegistered(false);
      return;
    }
    refresh();
  }, [status, refresh]);

  const register = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setRegistered(true);
      } else if (res.status === 401) {
        setModalOpen(true);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || '관심제품 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('wishlist register error:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const unregister = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRegistered(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || '관심제품 해제에 실패했습니다.');
      }
    } catch (err) {
      console.error('wishlist unregister error:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (status !== 'authenticated') {
      setModalOpen(true);
      return;
    }
    if (registered) unregister();
    else register();
  };

  const handleAuthSuccess = () => {
    // 모달이 닫힌 직후 세션 갱신을 기다리지 않고 즉시 등록 시도 — POST에 쿠키 이미 동기화됨
    register();
  };

  const baseClass = variant === 'card' ? 'wishlist-card-icon' : 'wishlist-btn';
  const className = `${baseClass}${registered ? ' is-active' : ''}${loading ? ' is-loading' : ''}`;

  const ariaLabel = registered ? '관심제품에서 제거' : '관심제품에 추가';
  const title = ariaLabel;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={handleClick}
        disabled={loading}
        aria-label={ariaLabel}
        aria-pressed={registered}
        title={title}
      >
        {variant === 'card' ? (
          // 카드: 하트 아이콘만
          <span className="wishlist-heart" aria-hidden="true">
            {registered ? '♥' : '♡'}
          </span>
        ) : (
          // 상세: 하트 + 텍스트
          <>
            <span className="wishlist-heart" aria-hidden="true">{registered ? '♥' : '♡'}</span>
            <span className="wishlist-label">
              {registered ? '관심제품 등록됨' : '관심제품'}
            </span>
          </>
        )}
      </button>

      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleAuthSuccess}
        message="관심제품에 추가하려면 로그인이 필요합니다."
      />
    </>
  );
}
