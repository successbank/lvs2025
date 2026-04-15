'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

const STATUS_LABEL = { NEW: '신규', IN_PROGRESS: '처리중', DONE: '완료' };
const STATUS_STYLE = {
  NEW:         { color: '#b91c1c', bg: '#fee2e2' },
  IN_PROGRESS: { color: '#92400e', bg: '#fef3c7' },
  DONE:        { color: '#065f46', bg: '#d1fae5' },
};
const TYPE_LABEL = { consultation: '상담', catalog: '카탈로그' };

export default function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [statusCounts, setStatusCounts] = useState({ NEW: 0, IN_PROGRESS: 0, DONE: 0 });
  const [typeCounts, setTypeCounts] = useState({ consultation: 0, catalog: 0 });
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchList(); }, [page, type, status, search]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, type });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/support-inquiries?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      setStatusCounts(data.statusCounts || { NEW: 0, IN_PROGRESS: 0, DONE: 0 });
      setTypeCounts(data.typeCounts || { consultation: 0, catalog: 0 });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const openDetail = async (id) => {
    try {
      const res = await fetch(`/api/admin/support-inquiries/${id}`);
      if (!res.ok) throw new Error('조회 실패');
      const data = await res.json();
      setSelected(data);
      setReplyText(data.admin_reply || '');
      setNoteText(data.admin_note || '');
    } catch (error) { alert(error.message); }
  };

  const saveReply = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/support-inquiries/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText, note: noteText }),
      });
      if (!res.ok) throw new Error('저장 실패');
      await fetchList();
      setSelected(null);
    } catch (error) { alert(error.message); }
    setSaving(false);
  };

  const changeStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/support-inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('상태 변경 실패');
      fetchList();
      if (selected?.id === id) setSelected({ ...selected, admin_status: newStatus });
    } catch (error) { alert(error.message); }
  };

  const remove = async (id) => {
    if (!confirm('문의를 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    try {
      const res = await fetch(`/api/admin/support-inquiries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      if (selected?.id === id) setSelected(null);
      fetchList();
    } catch (error) { alert(error.message); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const statusBadge = (st) => {
    const s = STATUS_STYLE[st] || STATUS_STYLE.NEW;
    return <span style={{ display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, color: s.color, background: s.bg }}>{STATUS_LABEL[st] || st}</span>;
  };

  const typeBadge = (slug) => {
    const bg = slug === 'catalog' ? '#dbeafe' : '#ede9fe';
    const color = slug === 'catalog' ? '#1e40af' : '#5b21b6';
    return <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', color, background: bg, fontWeight: 600 }}>{TYPE_LABEL[slug] || slug}</span>;
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <AdminLayout title="문의 관리">
      {/* 상단 탭: 타입 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `전체 (${typeCounts.consultation + typeCounts.catalog})` },
          { key: 'consultation', label: `상담 (${typeCounts.consultation})` },
          { key: 'catalog',      label: `카탈로그 (${typeCounts.catalog})` },
        ].map(t => (
          <button key={t.key} onClick={() => { setType(t.key); setPage(1); }}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.85rem',
              background: type === t.key ? '#2563eb' : 'white', color: type === t.key ? 'white' : '#374151', fontWeight: 500 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 상태 필터 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>상태:</span>
        {[
          { key: '', label: `전체 (${statusCounts.NEW + statusCounts.IN_PROGRESS + statusCounts.DONE})` },
          { key: 'NEW',         label: `신규 (${statusCounts.NEW})` },
          { key: 'IN_PROGRESS', label: `처리중 (${statusCounts.IN_PROGRESS})` },
          { key: 'DONE',        label: `완료 (${statusCounts.DONE})` },
        ].map(s => (
          <button key={s.key} onClick={() => { setStatus(s.key); setPage(1); }}
            style={{ padding: '0.4rem 0.85rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.8rem', cursor: 'pointer',
              background: status === s.key ? '#10b981' : 'white', color: status === s.key ? 'white' : '#374151' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="제목/내용/작성자/회사/연락처 검색"
          style={{ flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }} />
        <button type="submit" style={primaryBtnStyle}>검색</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }} style={secondaryBtnStyle}>초기화</button>
        )}
        <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.85rem', alignSelf: 'center' }}>결과 {pagination.total}건</span>
      </form>

      {/* 목록 */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '70px' }}>구분</th>
              <th style={{ ...thStyle, width: '80px' }}>상태</th>
              <th style={thStyle}>제목</th>
              <th style={{ ...thStyle, width: '110px' }}>작성자</th>
              <th style={{ ...thStyle, width: '130px' }}>연락처</th>
              <th style={{ ...thStyle, width: '140px' }}>회사</th>
              <th style={{ ...thStyle, width: '140px' }}>등록일</th>
              <th style={{ ...thStyle, width: '200px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>로딩 중...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>문의가 없습니다.</td></tr>
            ) : items.map(it => (
              <tr key={it.id} style={{ borderBottom: '1px solid #f3f4f6', background: it.admin_status === 'NEW' ? '#fefce8' : 'transparent' }}>
                <td style={tdStyle}>{typeBadge(it.board_slug)}</td>
                <td style={tdStyle}>{statusBadge(it.admin_status)}</td>
                <td style={{ ...tdStyle }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); openDetail(it.id); }}
                    style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>
                    {it.title}
                    {!it.admin_read_at && <span style={{ marginLeft: '0.4rem', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700 }}>NEW</span>}
                  </a>
                </td>
                <td style={{ ...tdStyle, color: '#374151' }}>{it.author || it.contact_name || '-'}</td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.8rem' }}>{it.contact_phone || '-'}</td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.8rem' }}>{it.company || '-'}</td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.8rem' }}>{fmt(it.created_at)}</td>
                <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button onClick={() => openDetail(it.id)} style={actionBtn('#3b82f6')}>상세</button>
                  {it.admin_status !== 'IN_PROGRESS' && (
                    <button onClick={() => changeStatus(it.id, 'IN_PROGRESS')} style={actionBtn('#d97706')}>처리중</button>
                  )}
                  {it.admin_status !== 'DONE' && (
                    <button onClick={() => changeStatus(it.id, 'DONE')} style={actionBtn('#059669')}>완료</button>
                  )}
                  <button onClick={() => remove(it.id)} style={actionBtn('#ef4444')}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ ...secondaryBtnStyle, padding: '0.4rem 0.75rem', opacity: page <= 1 ? 0.5 : 1 }}>이전</button>
          <span style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', color: '#6b7280' }}>{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
            style={{ ...secondaryBtnStyle, padding: '0.4rem 0.75rem', opacity: page >= pagination.totalPages ? 0.5 : 1 }}>다음</button>
        </div>
      )}

      {/* 상세 모달 */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', maxWidth: '780px', width: '92%', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {typeBadge(selected.board_slug)}
                {statusBadge(selected.admin_status)}
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} style={secondaryBtnStyle}>닫기</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem 1rem', fontSize: '0.85rem', color: '#374151', background: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
              <div><strong>작성자:</strong> {selected.author || selected.contact_name || '-'}</div>
              <div><strong>이메일:</strong> {selected.author_email || selected.contact_email || '-'}</div>
              <div><strong>연락처:</strong> {selected.contact_phone || '-'}</div>
              <div><strong>회사:</strong> {selected.company || '-'}</div>
              <div><strong>등록일:</strong> {fmt(selected.created_at)}</div>
              <div><strong>최초 열람:</strong> {fmt(selected.admin_read_at)}</div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>문의 내용</label>
              <div style={{ background: '#f9fafb', padding: '0.9rem', borderRadius: '6px', whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#111827', lineHeight: 1.6 }}>
                {selected.content}
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>답변 {selected.admin_reply_at && <span style={{ color: '#6b7280', fontWeight: 400 }}>(마지막 수정 {fmt(selected.admin_reply_at)})</span>}</label>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={5}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                placeholder="답변을 입력하세요. 저장 시 상태가 자동으로 완료로 전환됩니다." />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>내부 메모 (관리자 전용)</label>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical', background: '#fffbeb' }}
                placeholder="처리 담당자/진행 상황 등 내부 메모" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => changeStatus(selected.id, 'NEW')} style={{ ...secondaryBtnStyle, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>신규</button>
                <button onClick={() => changeStatus(selected.id, 'IN_PROGRESS')} style={{ ...secondaryBtnStyle, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>처리중</button>
                <button onClick={() => changeStatus(selected.id, 'DONE')} style={{ ...secondaryBtnStyle, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>완료</button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => remove(selected.id)} style={{ ...secondaryBtnStyle, color: '#ef4444', borderColor: '#fecaca' }}>삭제</button>
                <button onClick={saveReply} disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.6 : 1 }}>
                  {saving ? '저장 중...' : '답변 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const primaryBtnStyle = { background: '#3b82f6', color: 'white', padding: '0.55rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' };
const secondaryBtnStyle = { background: 'white', color: '#374151', padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.85rem' };
const actionBtn = (color) => ({ background: 'transparent', color, border: 'none', cursor: 'pointer', fontSize: '0.78rem', marginRight: '0.35rem', textDecoration: 'underline' });
