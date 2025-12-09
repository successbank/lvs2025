'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LVS 관리자 페이지</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{session.user.name}님</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>대시보드</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>총 제품 수</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-</p>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>카테고리 수</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-</p>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>미답변 문의</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-</p>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>공지사항</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-</p>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>빠른 메뉴</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <a href="/admin/products" style={{ padding: '1rem', background: '#eff6ff', borderRadius: '4px', textDecoration: 'none', color: '#1e40af', fontWeight: '500' }}>
                제품 관리
              </a>
              <a href="/admin/categories" style={{ padding: '1rem', background: '#eff6ff', borderRadius: '4px', textDecoration: 'none', color: '#1e40af', fontWeight: '500' }}>
                카테고리 관리
              </a>
              <a href="/admin/inquiries" style={{ padding: '1rem', background: '#eff6ff', borderRadius: '4px', textDecoration: 'none', color: '#1e40af', fontWeight: '500' }}>
                문의 관리
              </a>
              <a href="/admin/notices" style={{ padding: '1rem', background: '#eff6ff', borderRadius: '4px', textDecoration: 'none', color: '#1e40af', fontWeight: '500' }}>
                공지사항 관리
              </a>
              <a href="/admin/sliders" style={{ padding: '1rem', background: '#eff6ff', borderRadius: '4px', textDecoration: 'none', color: '#1e40af', fontWeight: '500' }}>
                슬라이더 관리
              </a>
              <a href="/admin/settings" style={{ padding: '1rem', background: '#eff6ff', borderRadius: '4px', textDecoration: 'none', color: '#1e40af', fontWeight: '500' }}>
                사이트 설정
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
