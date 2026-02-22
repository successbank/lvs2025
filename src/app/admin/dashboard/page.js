'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Stats fetch error:', err));
    }
  }, [session]);

  if (status === 'loading') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    { href: '/admin/dashboard', label: '대시보드', icon: '📊' },
    { href: '/admin/products', label: '제품 관리', icon: '📦' },
    { href: '/admin/categories', label: '카테고리 관리', icon: '📁' },
    { href: '/admin/inquiries', label: '문의 관리', icon: '💬' },
    { href: '/admin/catalog-requests', label: '카탈로그 신청', icon: '📋' },
    { href: '/admin/notices', label: '공지사항 관리', icon: '📢' },
    { href: '/admin/sliders', label: '슬라이더 관리', icon: '🖼' },
    { href: '/admin/settings', label: '사이트 설정', icon: '⚙' },
  ];

  const statCards = [
    { label: '총 제품 수', value: stats?.products, color: '#3b82f6' },
    { label: '카테고리 수', value: stats?.categories, color: '#10b981' },
    { label: '미답변 문의', value: stats?.pendingInquiries, color: '#f59e0b' },
    { label: '카탈로그 신청', value: stats?.pendingCatalogRequests, color: '#8b5cf6' },
    { label: '총 게시물', value: stats?.totalPosts, color: '#6366f1' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px', background: '#1f2937', color: 'white', padding: '1.5rem 0',
        position: 'fixed', top: 0, left: 0, bottom: 0, overflowY: 'auto',
      }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>LVS Admin</h2>
          </a>
        </div>
        <nav>
          {menuItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1.5rem', color: item.href === '/admin/dashboard' ? 'white' : '#9ca3af',
                textDecoration: 'none', fontSize: '0.9rem',
                background: item.href === '/admin/dashboard' ? '#374151' : 'transparent',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid #374151', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            {session.user.name}님
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            style={{
              width: '100%', background: '#ef4444', color: 'white',
              padding: '0.5rem', borderRadius: '4px', border: 'none',
              cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '250px', flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>대시보드</h1>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          {statCards.map(card => (
            <div key={card.label} style={{
              background: 'white', padding: '1.5rem', borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${card.color}`,
            }}>
              <h3 style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>{card.label}</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {card.value !== undefined ? card.value.toLocaleString() : '-'}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>빠른 메뉴</h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
          }}>
            {menuItems.filter(m => m.href !== '/admin/dashboard').map(item => (
              <a key={item.href} href={item.href} style={{
                padding: '1rem', background: '#eff6ff', borderRadius: '4px',
                textDecoration: 'none', color: '#1e40af', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span>{item.icon}</span> {item.label}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
