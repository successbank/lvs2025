'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../styles/globals.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/"><img src="/images/logo.png" alt="LVS" style={{ height: '40px', marginBottom: '1rem' }} /></a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>로그인</h1>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="example@email.com"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="비밀번호 입력"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
            아직 회원이 아니신가요? <a href="/register" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>회원가입</a>
          </div>
        </div>
      </div>
    </div>
  );
}
