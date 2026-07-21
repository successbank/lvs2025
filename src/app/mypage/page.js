'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../styles/globals.css';

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
      router.push('/login');
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
        alert('해제에 실패했습니다.');
      }
    } catch (err) {
      console.error('wishlist remove error:', err);
      alert('서버 오류가 발생했습니다.');
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
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), company: company.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setProfileMsg('저장되었습니다.');
      await updateSession({ name: name.trim() });
    } catch (error) {
      setProfileMsg(error.message || '수정에 실패했습니다.');
    }
    setProfileSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
      setPwMsg('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg('새 비밀번호는 6자 이상이어야 합니다.');
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
      setPwMsg('비밀번호가 변경되었습니다.');
      setPwForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    } catch (error) {
      setPwMsg(error.message || '변경에 실패했습니다.');
    }
    setPwSaving(false);
  };

  const handleWithdraw = async () => {
    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      const res = await fetch('/api/me', { method: 'DELETE' });
      if (!res.ok) throw new Error('탈퇴에 실패했습니다.');
      signOut({ callbackUrl: '/' });
    } catch (error) {
      alert(error.message);
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>로딩 중...</div>;
  }
  if (!session || !user) return null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <span>마이페이지</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>마이페이지</h1>
          <p>회원 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
      </section>

      <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* 최고관리자 바로가기 */}
        {session.user.role === 'ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: '600' }}>최고관리자 계정으로 로그인되어 있습니다.</div>
            <a href="/admin/dashboard" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
              최고관리자 페이지 이동 →
            </a>
          </div>
        )}

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
          {[{ key: 'profile', label: '내 정보' }, { key: 'wishlist', label: '관심제품' }, { key: 'password', label: '비밀번호 변경' }].map(tab => (
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
              <label style={labelStyle}>이메일</label>
              <div style={{ ...valueStyle, color: '#6b7280' }}>{user.email}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>이름</label>
              <input value={name} onChange={e => setName(e.target.value)}
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>연락처</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678"
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>회사이름</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="회사명"
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={handleProfileSave} disabled={profileSaving}
                style={{ ...btnPrimary, opacity: profileSaving ? 0.5 : 1 }}>
                {profileSaving ? '저장 중...' : '저장'}
              </button>
              {profileMsg && <span style={{ fontSize: '0.85rem', marginLeft: '0.75rem', color: profileMsg.includes('실패') ? '#dc2626' : '#059669' }}>{profileMsg}</span>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>가입일</label>
              <div style={valueStyle}>{new Date(user.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <button onClick={handleWithdraw}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                회원 탈퇴
              </button>
            </div>
          </div>
        )}

        {/* 관심제품 탭 */}
        {activeTab === 'wishlist' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '1.5rem' }}>
            {wishlistsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>불러오는 중...</div>
            ) : wishlists.length === 0 ? (
              <div className="mypage-wishlist-empty">
                <p>아직 등록한 관심제품이 없습니다.</p>
                <a href="/products">제품 둘러보기</a>
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
                          <a href={`/products/${p.slug}`}>상세보기</a>
                          <button
                            type="button"
                            className="mypage-wishlist-remove"
                            onClick={() => handleRemoveWishlist(p.id)}
                            disabled={removingId === p.id}
                          >
                            {removingId === p.id ? '해제 중...' : '해제'}
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
                <label style={labelStyle}>현재 비밀번호</label>
                <input type="password" value={pwForm.currentPassword} required
                  onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>새 비밀번호</label>
                <input type="password" value={pwForm.newPassword} required placeholder="6자 이상"
                  onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>새 비밀번호 확인</label>
                <input type="password" value={pwForm.newPasswordConfirm} required
                  onChange={e => setPwForm(p => ({ ...p, newPasswordConfirm: e.target.value }))}
                  style={inputStyle} />
              </div>
              {pwMsg && <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: pwMsg.includes('변경되었') ? '#059669' : '#dc2626' }}>{pwMsg}</p>}
              <button type="submit" disabled={pwSaving} style={{ ...btnPrimary, opacity: pwSaving ? 0.5 : 1 }}>
                {pwSaving ? '변경 중...' : '비밀번호 변경'}
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
