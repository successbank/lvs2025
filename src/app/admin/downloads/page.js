'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';

const DOWNLOADS_BOARD_SLUG = 'downloads';

export default function AdminDownloads() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchField, setSearchField] = useState('all');

  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // 게시물 상세 + 첨부 보유

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '20',
      });
      if (search) {
        params.set('search', search);
        params.set('searchField', searchField);
      }
      const res = await fetch(`/api/admin/downloads?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('list fetch failed:', err);
    }
    setLoading(false);
  }, [page, search, searchField]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (id) => {
    if (!confirm('이 게시물과 모든 첨부파일을 삭제합니다. 계속할까요?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchList();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}?incrementView=false`);
      const data = await res.json();
      if (data.post) {
        setEditingPost({ ...data.post, attachments: data.attachments || [] });
      }
    } catch (err) {
      alert('게시물 조회에 실패했습니다.');
    }
  };

  const formatDate = (s) => new Date(s).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <AdminLayout title="다운로드 관리">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ color: '#6b7280' }}>
          총 <strong style={{ color: '#111827' }}>{pagination.total || 0}</strong>건
          {items.some(it => it.has_unavailable) && (
            <span style={{ marginLeft: '0.75rem', background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>
              ⚠ 누락 첨부 보유 게시물 있음
            </span>
          )}
        </div>
        <button onClick={() => setShowWriteModal(true)} style={primaryBtnStyle}>+ 자료 등록</button>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <select value={searchField} onChange={e => setSearchField(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
        </select>
        <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="검색어" style={{ ...inputStyle, width: '320px' }} />
        <button type="submit" style={secondaryBtnStyle}>검색</button>
        {search && (
          <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} style={{ ...secondaryBtnStyle, color: '#dc2626' }}>초기화</button>
        )}
      </form>

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '70px' }}>번호</th>
              <th style={thStyle}>제목</th>
              <th style={{ ...thStyle, width: '110px' }}>작성자</th>
              <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>첨부</th>
              <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>다운로드</th>
              <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>조회</th>
              <th style={{ ...thStyle, width: '160px' }}>등록일</th>
              <th style={{ ...thStyle, width: '140px', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>로딩 중...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>게시물이 없습니다.</td></tr>
            ) : items.map((it, idx) => (
              <tr key={it.id} style={{ borderBottom: '1px solid #e5e7eb', background: it.has_unavailable ? '#fef2f2' : (it.is_notice ? '#fffbeb' : 'white') }}>
                <td style={tdStyle}>
                  {it.is_notice ? (
                    <span style={{ background: '#ef4444', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>공지</span>
                  ) : ((pagination.total || 0) - ((page - 1) * 20) - idx)}
                </td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '500' }}>{it.title}</span>
                  {it.has_unavailable && (
                    <span style={{ marginLeft: '0.5rem', background: '#dc2626', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                      ⚠ 재업로드 필요
                    </span>
                  )}
                </td>
                <td style={tdStyle}>{it.author}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{it.attachment_count}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{it.total_download_count}</td>
                <td style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>{it.view_count}</td>
                <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>{formatDate(it.created_at)}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => openEdit(it.id)} style={actionBtn('#3b82f6')}>수정</button>
                  <button onClick={() => handleDelete(it.id)} style={actionBtn('#ef4444')}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db',
                background: page === i + 1 ? '#3b82f6' : 'white', color: page === i + 1 ? 'white' : '#374151', cursor: 'pointer' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showWriteModal && (
        <WriteModal
          onClose={() => setShowWriteModal(false)}
          onSuccess={() => { setShowWriteModal(false); fetchList(); }}
        />
      )}

      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => { setEditingPost(null); fetchList(); }}
          onRefresh={(refreshed) => setEditingPost(refreshed)}
        />
      )}
    </AdminLayout>
  );
}

// =============================================
// 등록 모달 (제목/내용/공지/첨부)
// =============================================
function WriteModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', content: '', isNotice: false });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('boardSlug', DOWNLOADS_BOARD_SLUG);
      fd.append('title', form.title);
      fd.append('content', form.content);
      fd.append('author', '관리자');
      fd.append('isNotice', String(form.isNotice));
      for (const f of files) fd.append('files', f, f.name);

      const res = await fetch('/api/posts', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '등록 실패');
      }
      alert('등록되었습니다.');
      onSuccess();
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  };

  return (
    <ModalShell title="자료 등록" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>제목 *</label>
          <input style={inputStyle} value={form.title} required
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>내용 *</label>
          <textarea style={{ ...inputStyle, height: '180px' }} value={form.content} required
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>첨부파일 (최대 10개, 개당 10MB)</label>
          <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.jpg,.jpeg,.png,.gif,.webp,.zip" />
          {files.length > 0 && (
            <ul style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
              {files.map((f, i) => <li key={i}>📎 {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>)}
            </ul>
          )}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="checkbox" checked={form.isNotice}
            onChange={e => setForm(p => ({ ...p, isNotice: e.target.checked }))} />
          공지로 상단 고정
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" style={primaryBtnStyle} disabled={submitting}>
            {submitting ? '등록 중...' : '등록'}
          </button>
          <button type="button" onClick={onClose} style={secondaryBtnStyle}>취소</button>
        </div>
      </form>
    </ModalShell>
  );
}

// =============================================
// 수정 모달 — 「저장」 통합: PATCH(제목/내용/공지) + 미업로드 신규 첨부 자동 업로드
// + Broken 첨부 정정 옵션 + 강화된 삭제 경고
// =============================================
function EditModal({ post, onClose, onSuccess, onRefresh }) {
  const [form, setForm] = useState({
    title: post.title || '',
    content: post.content || '',
    isNotice: !!post.is_notice,
  });
  const [submitting, setSubmitting] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pathFixingId, setPathFixingId] = useState(null); // 경로 정정 모달 대상 첨부 id

  const refresh = async () => {
    const res = await fetch(`/api/posts/${post.id}?incrementView=false`);
    const data = await res.json();
    if (data.post) onRefresh({ ...data.post, attachments: data.attachments || [] });
  };

  // 「저장」 통합: 제목/내용/공지 PATCH + 미업로드 신규 첨부 자동 업로드
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. PATCH 본문
      const patchRes = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content, isNotice: form.isNotice }),
      });
      if (!patchRes.ok) throw new Error('수정 실패');

      // 2. 신규 첨부가 input에 선택돼 있으면 함께 업로드 (사용자 누락 방지)
      let uploadedCount = 0;
      if (newFiles.length > 0) {
        const fd = new FormData();
        for (const f of newFiles) fd.append('files', f, f.name);
        const upRes = await fetch(`/api/admin/posts/${post.id}/attachments`, {
          method: 'POST', body: fd,
        });
        if (!upRes.ok) {
          const err = await upRes.json().catch(() => ({}));
          throw new Error(err.error || '첨부 업로드 실패');
        }
        const upData = await upRes.json();
        uploadedCount = (upData.attachments || []).length;
        setNewFiles([]);
      }

      alert(uploadedCount > 0
        ? `수정되었습니다. (첨부 ${uploadedCount}개 추가)`
        : '수정되었습니다.');
      onSuccess();
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  };

  const handleDeleteAttachment = async (att) => {
    const baseMsg = `첨부파일 "${att.original_filename}"을 삭제할까요?`;
    const brokenWarn = !att.is_available
      ? '\n\n⚠ 이 첨부는 디스크 파일이 누락 상태입니다. 삭제하면 DB 기록까지 사라져 복구 단서가 사라집니다.\n💡 디스크에 다른 이름으로 살아 있을 수 있으니 "경로 정정" 옵션을 먼저 시도해보세요.\n\n그래도 삭제할까요?'
      : '\n디스크 파일도 함께 제거됩니다.';
    if (!confirm(baseMsg + brokenWarn)) return;
    try {
      const res = await fetch(`/api/admin/attachments/${att.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('첨부 삭제 실패');
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // 즉시 업로드(보조용 — 저장 통합과 별도로 즉시 추가하고 싶을 때)
  const handleAddAttachmentsImmediate = async () => {
    if (newFiles.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of newFiles) fd.append('files', f, f.name);
      const res = await fetch(`/api/admin/posts/${post.id}/attachments`, {
        method: 'POST', body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '첨부 추가 실패');
      }
      setNewFiles([]);
      await refresh();
    } catch (err) {
      alert(err.message);
    }
    setUploading(false);
  };

  const formatSize = (b) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(2)}MB`;

  return (
    <ModalShell title={`자료 수정: ${post.title}`} onClose={onClose} width="720px">
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>제목 *</label>
          <input style={inputStyle} value={form.title} required
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>내용 *</label>
          <textarea style={{ ...inputStyle, height: '160px' }} value={form.content} required
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="checkbox" checked={form.isNotice}
            onChange={e => setForm(p => ({ ...p, isNotice: e.target.checked }))} />
          공지로 상단 고정
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button type="submit" style={primaryBtnStyle} disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </button>
          <button type="button" onClick={onClose} style={secondaryBtnStyle}>닫기</button>
        </div>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: '#6b7280' }}>
          💡 「저장」을 누르면 제목/내용/공지 변경과 함께 아래에서 선택해둔 신규 첨부파일도 한 번에 업로드됩니다.
        </p>
      </form>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>기존 첨부파일 ({post.attachments.length})</h4>
        {post.attachments.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>첨부 없음</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {post.attachments.map(att => (
              <li key={att.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0.75rem', borderBottom: '1px solid #f3f4f6',
                background: !att.is_available ? '#fef2f2' : 'white',
              }}>
                <div>
                  <span style={{ fontSize: '0.9rem' }}>📎 {att.original_filename}</span>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    {formatSize(att.file_size)} · 다운로드 {att.download_count}회
                  </span>
                  {!att.is_available && (
                    <span style={{ marginLeft: '0.5rem', background: '#dc2626', color: 'white', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                      ⚠ 파일 누락
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {!att.is_available && (
                    <button onClick={() => setPathFixingId(att.id)}
                      style={{ background: 'transparent', color: '#2563eb', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', fontWeight: 500 }}>
                      경로 정정
                    </button>
                  )}
                  <button onClick={() => handleDeleteAttachment(att)}
                    style={{ background: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pathFixingId && (
          <PathFixModal
            attachmentId={pathFixingId}
            attachment={post.attachments.find(a => a.id === pathFixingId)}
            subDir="downloads"
            onClose={() => setPathFixingId(null)}
            onSuccess={async () => { setPathFixingId(null); await refresh(); }}
          />
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
          <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>첨부파일 추가</label>
          <input type="file" multiple onChange={e => setNewFiles(Array.from(e.target.files || []))}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.jpg,.jpeg,.png,.gif,.webp,.zip" />
          {newFiles.length > 0 && (
            <ul style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
              {newFiles.map((f, i) => <li key={i}>📎 {f.name} ({formatSize(f.size)})</li>)}
            </ul>
          )}
          <button type="button" onClick={handleAddAttachmentsImmediate} disabled={uploading || newFiles.length === 0}
            style={{ ...secondaryBtnStyle, marginTop: '0.5rem', opacity: (uploading || newFiles.length === 0) ? 0.6 : 1 }}
            title="즉시 첨부만 추가합니다 (저장 버튼이 한 번에 처리해주므로 보통은 저장만 누르면 됩니다)">
            {uploading ? '업로드 중...' : '즉시 업로드만'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// =============================================
// Broken 첨부 경로 정정 모달
// 디스크 후보 파일 목록에서 선택 → file_path UPDATE
// =============================================
function PathFixModal({ attachmentId, attachment, subDir, onClose, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ subDir });
        if (q) params.set('q', q);
        const res = await fetch(`/api/admin/uploads-list?${params}`);
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error('uploads-list fetch failed:', err);
      }
      setLoading(false);
    };
    load();
  }, [subDir, q]);

  const handlePick = async (filePath) => {
    if (!confirm(`이 첨부의 file_path를 "${filePath}"로 정정합니다.\n원래 파일명("${attachment?.original_filename}")은 그대로 유지됩니다. 계속할까요?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/attachments/${attachmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '경로 정정 실패');
      }
      alert('경로가 정정되었습니다.');
      onSuccess();
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  };

  const formatSize = (b) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(2)}MB`;

  return (
    <ModalShell title="첨부 경로 정정" onClose={onClose} width="640px">
      <p style={{ margin: '0 0 0.75rem', color: '#374151', fontSize: '0.9rem' }}>
        디스크에 살아 있는 파일을 선택하면 이 첨부의 <code>file_path</code>가 새 파일을 가리키도록 업데이트됩니다.
      </p>
      <p style={{ margin: '0 0 1rem', color: '#6b7280', fontSize: '0.8rem' }}>
        대상 첨부: <strong>{attachment?.original_filename}</strong> · 현재 경로 <code>{attachment?.file_path}</code>
      </p>
      <input type="text" value={q} onChange={e => setQ(e.target.value)}
        placeholder="파일명으로 검색 (예: IFSM)"
        style={{ ...inputStyle, marginBottom: '0.75rem' }} />
      <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
        {loading ? (
          <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>로딩 중...</p>
        ) : files.length === 0 ? (
          <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>일치하는 파일이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {files.map(f => (
              <li key={f.file_path} style={{
                padding: '0.5rem 0.75rem', borderBottom: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ minWidth: 0, flex: 1, marginRight: '0.75rem' }}>
                  <div style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>📄 {f.name}</div>
                  {f.raw_name && (
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', wordBreak: 'break-all', marginTop: '0.15rem' }} title="디스크에 저장된 원본 파일명 (인코딩 깨짐)">
                      raw: {f.raw_name}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{formatSize(f.file_size)}</div>
                </div>
                <button onClick={() => handlePick(f.file_path)} disabled={submitting}
                  style={{ ...primaryBtnStyle, padding: '0.3rem 0.75rem', fontSize: '0.85rem', opacity: submitting ? 0.6 : 1 }}>
                  이 파일로 정정
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <button onClick={onClose} style={secondaryBtnStyle}>닫기</button>
      </div>
    </ModalShell>
  );
}

// =============================================
// 모달 외각 컴포넌트
// =============================================
function ModalShell({ title, children, onClose, width = '560px' }) {
  return (
    <div onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: width,
                 maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// =============================================
// 스타일 (categories/page.js 톤 그대로)
// =============================================
const primaryBtnStyle = {
  background: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
  borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
};
const secondaryBtnStyle = {
  background: 'white', color: '#374151', padding: '0.5rem 1rem',
  borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.9rem',
};
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const actionBtn = (color) => ({
  background: 'transparent', color, border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', marginRight: '0.5rem', textDecoration: 'underline',
});
