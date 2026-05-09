'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

// 재사용 가능한 인라인 인증 모달 (로그인 / 회원가입 한 모달, 두 뷰)
//
// Props:
//   isOpen: boolean
//   onClose: () => void
//   onSuccess?: () => void   // 인증 성공 시 호출 (자동 다운로드, 관심제품 등록 등 후속 동작)
//   message?: string         // 안내 메시지
//   defaultMode?: 'login' | 'signup'   // 처음 열릴 때 어느 뷰?
//
// signIn redirect:false로 페이지 이동 없이 인증 처리.
// 회원가입 성공 시 즉시 signIn으로 자동 로그인 후 onSuccess 트리거.
export default function LoginModal({ isOpen, onClose, onSuccess, message, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // signup 전용 필드
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

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
      setMode(defaultMode);
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setCompany('');
      setWebsite('');
      setError('');
      setLoading(false);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (result?.ok) {
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, company, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || '회원가입에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 가입 성공 → 즉시 자동 로그인
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error || !signInRes?.ok) {
        setError('가입은 완료되었으나 자동 로그인에 실패했습니다. 다시 로그인해주세요.');
        setMode('login');
        setLoading(false);
        return;
      }

      if (onSuccess) {
        try { onSuccess(); } catch (err) { console.error('onSuccess error:', err); }
      }
      onClose();
    } catch (err) {
      console.error('LoginModal signup error:', err);
      setError('서버 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const switchMode = (next) => {
    if (loading) return;
    setError('');
    setMode(next);
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

        <h2 id="login-modal-title" className="login-modal-title">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>

        {message && (
          <div className="login-modal-message">
            <span aria-hidden="true">ⓘ</span> {message}
          </div>
        )}

        {error && (
          <div className="login-modal-error" role="alert">{error}</div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
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
            <button type="submit" className="login-modal-submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit}>
            <div className="login-modal-field">
              <label htmlFor="signup-modal-name">이름 <span aria-hidden="true">*</span></label>
              <input
                id="signup-modal-name"
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                disabled={loading}
              />
            </div>
            <div className="login-modal-field">
              <label htmlFor="signup-modal-email">이메일 <span aria-hidden="true">*</span></label>
              <input
                id="signup-modal-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>
            <div className="login-modal-field">
              <label htmlFor="signup-modal-password">비밀번호 <span aria-hidden="true">*</span></label>
              <input
                id="signup-modal-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                disabled={loading}
              />
            </div>
            <div className="login-modal-field">
              <label htmlFor="signup-modal-phone">연락처</label>
              <input
                id="signup-modal-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678 (선택)"
                disabled={loading}
              />
            </div>
            <div className="login-modal-field">
              <label htmlFor="signup-modal-company">회사명</label>
              <input
                id="signup-modal-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="(주)○○ (선택)"
                disabled={loading}
              />
            </div>

            {/* honeypot — 사람에게는 보이지 않음, 봇만 채우게 유도 */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
              <label htmlFor="signup-modal-website">Website</label>
              <input
                id="signup-modal-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <button type="submit" className="login-modal-submit" disabled={loading}>
              {loading ? '가입 처리 중...' : '회원가입'}
            </button>
          </form>
        )}

        <div className="login-modal-footer">
          {mode === 'login' ? (
            <>
              아직 회원이 아니신가요?{' '}
              <button
                type="button"
                className="login-modal-register-link"
                onClick={() => switchMode('signup')}
                disabled={loading}
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                className="login-modal-register-link"
                onClick={() => switchMode('login')}
                disabled={loading}
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
