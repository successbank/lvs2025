'use client';

import { useState, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../styles/globals.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const loginInProgress = useRef(false);
  const router = useRouter();
  const { data: session } = useSession();

  // 로그인 진행 중이거나 환영 팝업 표시 중에는 리다이렉트하지 않음
  if (session && !welcomeName && !loginInProgress.current) {
    router.push('/en');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    loginInProgress.current = true;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      loginInProgress.current = false;
    } else {
      try {
        const res = await fetch('/api/me');
        const me = await res.json();
        setWelcomeName(me.name || 'Member');
      } catch {
        setWelcomeName('Member');
      }
    }
    setLoading(false);
  };

  const handleWelcomeClose = () => {
    loginInProgress.current = false;
    setWelcomeName('');
    router.push('/en');
    router.refresh();
  };

  return (
    <>
    {/* 환영 레이어 팝업 */}
    {welcomeName && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={handleWelcomeClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <div style={{
          position: 'relative', background: 'white', borderRadius: '16px', padding: '2.5rem 2rem',
          textAlign: 'center', maxWidth: '380px', width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeInUp 0.3s ease',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Welcome, {welcomeName}!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Welcome to LVS.
          </p>
          <button onClick={handleWelcomeClose}
            style={{ padding: '0.75rem 2.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>
            OK
          </button>
        </div>
        <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    )}

    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/en"><img src="/images/logo.png" alt="LVS" style={{ height: '40px', marginBottom: '1rem' }} /></a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>Sign In</h1>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="example@email.com"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Enter your password"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
            Don&apos;t have an account? <a href="/en/register" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>Sign Up</a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
