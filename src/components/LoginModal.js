'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

// 재사용 가능한 인라인 로그인 모달
//
// Props:
//   isOpen: boolean
//   onClose: () => void
//   onSuccess?: () => void   // 로그인 성공 시 호출 (자동 다운로드 등 후속 동작)
//   message?: string         // 안내 메시지 (예: "회원 전용 자료입니다")
//
// signIn redirect:false로 페이지 이동 없이 로그인 처리
export default function LoginModal({ isOpen, onClose, onSuccess, message }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ESC 키로 닫기 + 배경 스크롤 차단
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, loading, onClose]);

  // 모달 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (result?.ok) {
        // 로그인 성공 → 후속 동작 트리거 후 닫기
        if (onSuccess) {
          try { onSuccess(); } catch (err) { console.error('onSuccess error:', err); }
        }
        onClose();
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('LoginModal signIn error:', err);
      setError('서버 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return (
    <div
      className="login-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={onClose}
    >
      <div
        className="login-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          onClick={onClose}
          aria-label="닫기"
          disabled={loading}
        >
          ×
        </button>

        <h2 id="login-modal-title" className="login-modal-title">로그인</h2>

        {message && (
          <div className="login-modal-message">
            <span aria-hidden="true">ⓘ</span> {message}
          </div>
        )}

        {error && (
          <div className="login-modal-error" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-modal-field">
            <label htmlFor="login-modal-email">이메일</label>
            <input
              id="login-modal-email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>
          <div className="login-modal-field">
            <label htmlFor="login-modal-password">비밀번호</label>
            <input
              id="login-modal-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="login-modal-submit"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-modal-footer">
          아직 회원이 아니신가요?{' '}
          <a href="/register" className="login-modal-register-link">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
