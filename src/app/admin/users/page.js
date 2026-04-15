'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

const FLAG_LABELS = {
  GMAIL_DOT_TRICK: 'Gmail 점회피',
  DISPOSABLE_EMAIL: '일회용메일',
  RANDOM_NAME: '랜덤이름',
  RANDOM_PHONE: '랜덤전화',
  RANDOM_COMPANY: '랜덤회사',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statusCounts, setStatusCounts] = useState({ ACTIVE: 0, SUSPENDED: 0, DELETED: 0 });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '', phone: '', company: '' });
  const [auditOpen, setAuditOpen] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setStatusCounts(data.statusCounts || { ACTIVE: 0, SUSPENDED: 0, DELETED: 0 });
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
    setEditForm({ name: user.name, email: user.email, role: user.role, password: '', phone: user.phone || '', company: user.company || '' });
  };

  const handleSave = async () => {
    try {
      const body = { name: editForm.name, email: editForm.email, role: editForm.role, phone: editForm.phone, company: editForm.company };
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

  const handleSuspend = async (user) => {
    const reason = prompt(`"${user.name}" 회원을 정지합니다. 사유를 입력하세요:`);
    if (reason === null) return;
    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUSPEND', reason }),
      });
      if (!res.ok) throw new Error('정지 처리에 실패했습니다.');
      fetchUsers();
    } catch (error) { alert(error.message); }
  };

  const handleActivate = async (user) => {
    if (!confirm(`"${user.name}" 회원의 정지를 해제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACTIVATE' }),
      });
      if (!res.ok) throw new Error('해제 처리에 실패했습니다.');
      fetchUsers();
    } catch (error) { alert(error.message); }
  };

  const handleSoftDelete = async (user) => {
    const reason = prompt(`"${user.name}" 회원을 삭제합니다(소프트 삭제). 사유를 입력하세요:`);
    if (reason === null) return;
    try {
      const q = new URLSearchParams({ reason });
      const res = await fetch(`/api/users/${user.id}?${q}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '삭제에 실패했습니다.');
      }
      fetchUsers();
    } catch (error) { alert(error.message); }
  };

  const handleHardDelete = async (user) => {
    if (!confirm(`"${user.name}" 회원을 DB에서 영구 삭제합니다. 되돌릴 수 없습니다. 계속하시겠습니까?`)) return;
    const reason = prompt(`영구 삭제 사유를 입력하세요:`);
    if (reason === null) return;
    try {
      const q = new URLSearchParams({ hard: 'true', reason });
      const res = await fetch(`/api/users/${user.id}?${q}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '영구 삭제에 실패했습니다.');
      }
      fetchUsers();
    } catch (error) { alert(error.message); }
  };

  const openAudit = async (user) => {
    setAuditOpen(user);
    setAuditLogs([]);
    try {
      const res = await fetch(`/api/users/${user.id}/audit`);
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (error) {
      console.error(error);
    }
  };

  const statusBadge = (status) => {
    const map = {
      ACTIVE:    { color: '#059669', bg: '#ecfdf5', label: '활성' },
      SUSPENDED: { color: '#d97706', bg: '#fffbeb', label: '정지' },
      DELETED:   { color: '#6b7280', bg: '#f3f4f6', label: '삭제' },
    };
    const s = map[status] || map.ACTIVE;
    return (
      <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', color: s.color, background: s.bg, fontWeight: '600' }}>
        {s.label}
      </span>
    );
  };

  return (
    <AdminLayout title="회원 관리">
      {/* 상태 필터 탭 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { key: '', label: `전체 (${(statusCounts.ACTIVE || 0) + (statusCounts.SUSPENDED || 0) + (statusCounts.DELETED || 0)})` },
          { key: 'ACTIVE', label: `활성 (${statusCounts.ACTIVE || 0})` },
          { key: 'SUSPENDED', label: `정지 (${statusCounts.SUSPENDED || 0})` },
          { key: 'DELETED', label: `삭제 (${statusCounts.DELETED || 0})` },
        ].map(s => (
          <button key={s.key} onClick={() => { setStatusFilter(s.key); setPage(1); }}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.85rem',
              background: statusFilter === s.key ? '#2563eb' : 'white', color: statusFilter === s.key ? 'white' : '#374151', fontWeight: '500' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* 검색 & 역할 필터 */}
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
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>결과 <strong style={{ color: '#111827' }}>{total}</strong>명</span>
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
              <label style={labelStyle}>연락처</label>
              <input style={inputStyle} value={editForm.phone} placeholder="010-1234-5678"
                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>회사이름</label>
              <input style={inputStyle} value={editForm.company} placeholder="회사명"
                onChange={e => setEditForm(p => ({ ...p, company: e.target.value }))} />
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

      {/* 감사로그 모달 */}
      {auditOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             onClick={() => setAuditOpen(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', maxWidth: '720px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{auditOpen.name}의 감사 로그</h3>
              <button onClick={() => setAuditOpen(null)} style={secondaryBtnStyle}>닫기</button>
            </div>
            {auditLogs.length === 0 ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>기록이 없습니다.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ ...thStyle, padding: '0.5rem' }}>시각</th>
                    <th style={{ ...thStyle, padding: '0.5rem' }}>액션</th>
                    <th style={{ ...thStyle, padding: '0.5rem' }}>변경</th>
                    <th style={{ ...thStyle, padding: '0.5rem' }}>관리자</th>
                    <th style={{ ...thStyle, padding: '0.5rem' }}>사유</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.5rem', color: '#6b7280' }}>{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: '#111827' }}>{log.action}</td>
                      <td style={{ padding: '0.5rem', color: '#6b7280' }}>
                        {log.previousStatus || '-'} → {log.newStatus || '-'}
                      </td>
                      <td style={{ padding: '0.5rem', color: '#6b7280' }}>{log.admin?.name || (log.adminId ? log.adminId : '시스템')}</td>
                      <td style={{ padding: '0.5rem', color: '#6b7280' }}>{log.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
              <th style={thStyle}>연락처</th>
              <th style={thStyle}>회사</th>
              <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>역할</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>상태</th>
              <th style={{ ...thStyle, width: '150px', textAlign: 'center' }}>의심 플래그</th>
              <th style={{ ...thStyle, width: '110px', textAlign: 'center' }}>가입일</th>
              <th style={{ ...thStyle, width: '260px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>회원이 없습니다.</td></tr>
            ) : users.map(user => {
              const flags = user.suspicionFlags || [];
              return (
              <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6', background: user.status === 'SUSPENDED' ? '#fffbeb' : user.status === 'DELETED' ? '#f9fafb' : 'transparent' }}>
                <td style={tdStyle}><span style={{ fontWeight: '500', color: '#111827' }}>{user.name}</span></td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{user.email}</td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{user.phone || '-'}</td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{user.company || '-'}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem',
                    color: user.role === 'ADMIN' ? '#dc2626' : '#059669',
                    background: user.role === 'ADMIN' ? '#fef2f2' : '#ecfdf5',
                  }}>
                    {user.role === 'ADMIN' ? '관리자' : '일반'}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{statusBadge(user.status)}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {flags.length === 0 ? <span style={{ color: '#d1d5db' }}>-</span> : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center' }}>
                      {flags.map(f => (
                        <span key={f} style={{ fontSize: '0.65rem', color: '#b91c1c', background: '#fee2e2', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {FLAG_LABELS[f] || f}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button onClick={() => handleEdit(user)} style={actionBtn('#3b82f6')}>수정</button>
                  {user.status === 'ACTIVE' && (
                    <button onClick={() => handleSuspend(user)} style={actionBtn('#d97706')}>정지</button>
                  )}
                  {(user.status === 'SUSPENDED' || user.status === 'DELETED') && (
                    <button onClick={() => handleActivate(user)} style={actionBtn('#059669')}>해제</button>
                  )}
                  {user.status !== 'DELETED' && (
                    <button onClick={() => handleSoftDelete(user)} style={actionBtn('#ef4444')}>삭제</button>
                  )}
                  <button onClick={() => handleHardDelete(user)} style={actionBtn('#7f1d1d')}>영구</button>
                  <button onClick={() => openAudit(user)} style={actionBtn('#6b7280')}>로그</button>
                </td>
              </tr>
              );
            })}
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
const actionBtn = (color) => ({ background: 'transparent', color, border: 'none', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.4rem', textDecoration: 'underline' });
