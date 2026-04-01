'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const menuItems = [
  { href: '/admin/dashboard', label: '대시보드', icon: '📊' },
  { href: '/admin/products', label: '제품 관리', icon: '📦' },
  { href: '/admin/categories', label: '카테고리 관리', icon: '📁' },
  { href: '/admin/lineup-icons', label: '라인업 아이콘', icon: '🎨' },
  { href: '/admin/inquiries', label: '문의 관리', icon: '💬' },
  { href: '/admin/catalog-requests', label: '카탈로그 신청', icon: '📋' },
  { href: '/admin/notices', label: '공지사항 관리', icon: '📢' },
  { href: '/admin/sliders', label: '슬라이더 관리', icon: '🖼' },
  { href: '/admin/popups', label: '레이어 팝업', icon: '🪟' },
  { href: '/admin/analytics', label: '접속 통계', icon: '📈' },
  { href: '/admin/settings', label: '사이트 설정', icon: '⚙' },
];

export default function AdminLayout({ children, title }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex' }}>
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
                padding: '0.75rem 1.5rem',
                color: pathname.startsWith(item.href) ? 'white' : '#9ca3af',
                textDecoration: 'none', fontSize: '0.9rem',
                background: pathname.startsWith(item.href) ? '#374151' : 'transparent',
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

      <main style={{ marginLeft: '250px', flex: 1, padding: '2rem' }}>
        {title && (
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}
