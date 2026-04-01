'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../styles/globals.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirm: '' });
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

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.');
      } else {
        router.push('/login?registered=true');
      }
    } catch {
      setError('서버 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const update = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/"><img src="/images/logo.png" alt="LVS" style={{ height: '40px', marginBottom: '1rem' }} /></a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>회원가입</h1>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>이름</label>
              <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} required
                placeholder="홍길동"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>이메일</label>
              <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} required
                placeholder="example@email.com"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>비밀번호</label>
              <input type="password" value={formData.password} onChange={e => update('password', e.target.value)} required
                placeholder="6자 이상"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>비밀번호 확인</label>
              <input type="password" value={formData.passwordConfirm} onChange={e => update('passwordConfirm', e.target.value)} required
                placeholder="비밀번호 재입력"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
            이미 회원이신가요? <a href="/login" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>로그인</a>
          </div>
        </div>
      </div>
    </div>
  );
}
