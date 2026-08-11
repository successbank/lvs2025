'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../styles/globals.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirm: '', phone: '', company: '', position: '' });
  const [website, setWebsite] = useState(''); // honeypot — 봇만 채우는 hidden 필드
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    router.push('/en');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('The passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('The password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone, company: formData.company, position: formData.position, website }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign-up failed.');
      } else {
        router.push('/en/login?registered=true');
      }
    } catch {
      setError('A server error occurred.');
    }
    setLoading(false);
  };

  const update = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/en"><img src="/images/logo.png" alt="LVS" style={{ height: '40px', marginBottom: '1rem' }} /></a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>Sign Up</h1>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Honeypot — 봇만 채움. 시각/스크린리더 모두에서 숨김 */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
              <label htmlFor="website-hp">Website</label>
              <input
                id="website-hp"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Name</label>
              <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} required
                placeholder="John Doe"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Email</label>
              <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} required
                placeholder="example@email.com"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Phone <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span></label>
              <input type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)}
                placeholder="+82-10-1234-5678"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Company <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span></label>
              <input type="text" value={formData.company} onChange={e => update('company', e.target.value)}
                placeholder="Company name"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Position <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span></label>
              <input type="text" value={formData.position} onChange={e => update('position', e.target.value)}
                placeholder="e.g., Manager, Director, CEO"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Password</label>
              <input type="password" value={formData.password} onChange={e => update('password', e.target.value)} required
                placeholder="At least 6 characters"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.375rem', color: '#374151' }}>Confirm Password</label>
              <input type="password" value={formData.passwordConfirm} onChange={e => update('passwordConfirm', e.target.value)} required
                placeholder="Re-enter your password"
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
            Already have an account? <a href="/en/login" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
}
