'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '' });

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, password: '' });
  };

  const handleSave = async () => {
    try {
      const body = { name: editForm.name, email: editForm.email, role: editForm.role };
      if (editForm.password) body.password = editForm.password;
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('수정에 실패했습니다.');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" 회원을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '삭제에 실패했습니다.');
      }
      fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('변경에 실패했습니다.');
      fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <AdminLayout title="회원 관리">
      {/* 검색 & 필터 */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름 또는 이메일 검색"
            style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }} />
          <button type="submit" style={primaryBtnStyle}>검색</button>
        </form>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'USER', 'ADMIN'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.85rem',
                background: roleFilter === r ? '#2563eb' : 'white', color: roleFilter === r ? 'white' : '#374151' }}>
              {r === '' ? '전체' : r === 'ADMIN' ? '관리자' : '일반'}
            </button>
          ))}
        </div>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>총 <strong style={{ color: '#111827' }}>{total}</strong>명</span>
      </div>

      {/* 수정 모달 */}
      {editingUser && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>회원 수정</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>이름</label>
              <input style={inputStyle} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>이메일</label>
              <input style={inputStyle} value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>역할</label>
              <select style={inputStyle} value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                <option value="USER">일반 회원</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>비밀번호 변경 (빈칸이면 유지)</label>
              <input type="password" style={inputStyle} value={editForm.password} placeholder="새 비밀번호"
                onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave} style={primaryBtnStyle}>저장</button>
            <button onClick={() => setEditingUser(null)} style={secondaryBtnStyle}>취소</button>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={thStyle}>이름</th>
              <th style={thStyle}>이메일</th>
              <th style={{ ...thStyle, width: '100px', textAlign: 'center' }}>역할</th>
              <th style={{ ...thStyle, width: '150px', textAlign: 'center' }}>가입일</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>회원이 없습니다.</td></tr>
            ) : users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}><span style={{ fontWeight: '500', color: '#111827' }}>{user.name}</span></td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{user.email}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem',
                    color: user.role === 'ADMIN' ? '#dc2626' : '#059669',
                    background: user.role === 'ADMIN' ? '#fef2f2' : '#ecfdf5',
                  }}>
                    {user.role === 'ADMIN' ? '관리자' : '일반'}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => handleEdit(user)} style={actionBtn('#3b82f6')}>수정</button>
                  <button onClick={() => handleDelete(user.id, user.name)} style={actionBtn('#ef4444')}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ ...secondaryBtnStyle, padding: '0.4rem 0.75rem', opacity: page <= 1 ? 0.5 : 1 }}>이전</button>
          <span style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', color: '#6b7280' }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            style={{ ...secondaryBtnStyle, padding: '0.4rem 0.75rem', opacity: page >= totalPages ? 0.5 : 1 }}>다음</button>
        </div>
      )}
    </AdminLayout>
  );
}

const primaryBtnStyle = { background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' };
const secondaryBtnStyle = { background: 'white', color: '#374151', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const actionBtn = (color) => ({ background: 'transparent', color, border: 'none', cursor: 'pointer', fontSize: '0.85rem', marginRight: '0.5rem', textDecoration: 'underline' });
