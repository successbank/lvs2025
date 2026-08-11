'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../styles/globals.css';

export default function MyPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // 프로필 수정
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // 비밀번호 변경
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // 관심제품
  const [wishlists, setWishlists] = useState([]);
  const [wishlistsLoading, setWishlistsLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/en/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) fetchMe();
  }, [session]);

  useEffect(() => {
    if (session && activeTab === 'wishlist') {
      fetchWishlists();
    }
  }, [session, activeTab]);

  const fetchWishlists = async () => {
    setWishlistsLoading(true);
    try {
      const res = await fetch('/api/wishlist?limit=100', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setWishlists(data.data || []);
    } catch (err) {
      console.error('wishlist fetch error:', err);
    }
    setWishlistsLoading(false);
  };

  const handleRemoveWishlist = async (productId) => {
    setRemovingId(productId);
    try {
      const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' });
      if (res.ok) {
        setWishlists((prev) => prev.filter((w) => w.product?.id !== productId));
      } else {
        alert('Failed to remove.');
      }
    } catch (err) {
      console.error('wishlist remove error:', err);
      alert('A server error occurred.');
    }
    setRemovingId(null);
  };

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      setUser(data);
      setName(data.name);
      setPhone(data.phone || '');
      setCompany(data.company || '');
      setPosition(data.position || '');
    } catch {}
    setLoading(false);
  };

  const handleProfileSave = async () => {
    if (!name.trim()) return;
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), company: company.trim(), position: position.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setProfileMsg('Saved.');
      await updateSession({ name: name.trim() });
    } catch (error) {
      setProfileMsg(error.message || 'Failed to save.');
    }
    setProfileSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
      setPwMsg('The new passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg('The new password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPwMsg('Your password has been changed.');
      setPwForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    } catch (error) {
      setPwMsg(error.message || 'Failed to change password.');
    }
    setPwSaving(false);
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/me', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete the account.');
      signOut({ callbackUrl: '/en' });
    } catch (error) {
      alert(error.message);
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Loading...</div>;
  }
  if (!session || !user) return null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/en">Home</a>
          <span>&gt;</span>
          <span>My Page</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>My Page</h1>
          <p>View and update your account information.</p>
        </div>
      </section>

      <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* 최고관리자 바로가기 */}
        {session.user.role === 'ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: '600' }}>You are signed in with an administrator account.</div>
            <a href="/admin/dashboard" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
              Go to Admin Page →
            </a>
          </div>
        )}

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
          {[{ key: 'profile', label: 'My Info' }, { key: 'wishlist', label: 'Wishlist' }, { key: 'password', label: 'Change Password' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: activeTab === tab.key ? '600' : '400', fontSize: '0.95rem',
                color: activeTab === tab.key ? '#2563eb' : '#6b7280',
                borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-2px',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 내 정보 탭 */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Email</label>
              <div style={{ ...valueStyle, color: '#6b7280' }}>{user.email}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678"
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Company</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name"
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Position</label>
              <input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g., Manager, Director, CEO"
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={handleProfileSave} disabled={profileSaving}
                style={{ ...btnPrimary, opacity: profileSaving ? 0.5 : 1 }}>
                {profileSaving ? 'Saving...' : 'Save'}
              </button>
              {profileMsg && <span style={{ fontSize: '0.85rem', marginLeft: '0.75rem', color: profileMsg.includes('Failed') ? '#dc2626' : '#059669' }}>{profileMsg}</span>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Joined</label>
              <div style={valueStyle}>{new Date(user.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <button onClick={handleWithdraw}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* 관심제품 탭 */}
        {activeTab === 'wishlist' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '1.5rem' }}>
            {wishlistsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
            ) : wishlists.length === 0 ? (
              <div className="mypage-wishlist-empty">
                <p>You have no wishlist items yet.</p>
                <a href="/en/products">Browse Products</a>
              </div>
            ) : (
              <div className="mypage-wishlist-grid">
                {wishlists.map((w) => {
                  const p = w.product;
                  if (!p) return null;
                  const thumb = p.images?.[0]?.url || '/images/placeholder-product.jpg';
                  return (
                    <div
                      key={w.id}
                      className={`mypage-wishlist-card${p.isActive === false ? ' is-inactive' : ''}`}
                    >
                      <a href={`/products/${p.slug}`}>
                        <img
                          className="mypage-wishlist-card-thumb"
                          src={thumb}
                          alt={p.images?.[0]?.alt || p.name}
                          onError={(e) => { e.target.src = '/images/placeholder-product.jpg'; }}
                        />
                      </a>
                      <div className="mypage-wishlist-card-body">
                        {p.category?.name && (
                          <div className="mypage-wishlist-card-category">{p.category.name}</div>
                        )}
                        <h3 className="mypage-wishlist-card-name">{p.name}</h3>
                        <div className="mypage-wishlist-card-actions">
                          <a href={`/en/products/${p.slug}`}>View Details</a>
                          <button
                            type="button"
                            className="mypage-wishlist-remove"
                            onClick={() => handleRemoveWishlist(p.id)}
                            disabled={removingId === p.id}
                          >
                            {removingId === p.id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 비밀번호 변경 탭 */}
        {activeTab === 'password' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '2rem' }}>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={pwForm.currentPassword} required
                  onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={pwForm.newPassword} required placeholder="At least 6 characters"
                  onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={pwForm.newPasswordConfirm} required
                  onChange={e => setPwForm(p => ({ ...p, newPasswordConfirm: e.target.value }))}
                  style={inputStyle} />
              </div>
              {pwMsg && <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: pwMsg.includes('has been changed') ? '#059669' : '#dc2626' }}>{pwMsg}</p>}
              <button type="submit" disabled={pwSaving} style={{ ...btnPrimary, opacity: pwSaving ? 0.5 : 1 }}>
                {pwSaving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.375rem', color: '#374151' };
const valueStyle = { fontSize: '0.95rem', color: '#111827', padding: '0.625rem 0' };
const inputStyle = { width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' };
const btnPrimary = { padding: '0.625rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' };
