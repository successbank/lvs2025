'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminNotices() {
  const [boards, setBoards] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBoard, setSelectedBoard] = useState('notices');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', isNotice: false });

  useEffect(() => { fetchBoards(); }, []);
  useEffect(() => { fetchPosts(); }, [currentPage, selectedBoard]);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards');
      const data = await res.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?boardSlug=${selectedBoard}&page=${currentPage}&limit=20`);
      const data = await res.json();
      setPosts(data.posts || []);
      setNotices(data.notices || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchPosts();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const board = boards.find(b => b.slug === selectedBoard);
      if (!board) throw new Error('게시판을 찾을 수 없습니다.');

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: board.id,
          title: formData.title,
          content: formData.content,
          isNotice: formData.isNotice,
          author: '관리자',
        }),
      });
      if (!res.ok) throw new Error('등록에 실패했습니다.');
      setShowForm(false);
      setFormData({ title: '', content: '', isNotice: false });
      fetchPosts();
    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  };

  const boardNames = { notices: '공지사항', 'tech-guide': '기술가이드', downloads: '자료다운로드', consultation: '온라인상담' };

  return (
    <AdminLayout title="게시판 관리">
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {Object.entries(boardNames).map(([slug, name]) => (
          <button key={slug} onClick={() => { setSelectedBoard(slug); setCurrentPage(1); }}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db',
              background: selectedBoard === slug ? '#3b82f6' : 'white',
              color: selectedBoard === slug ? 'white' : '#374151',
              cursor: 'pointer', fontSize: '0.85rem',
            }}>
            {name}
          </button>
        ))}
        <button
          onClick={() => setShowForm(true)}
          style={{
            marginLeft: 'auto', background: '#3b82f6', color: 'white',
            padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
          }}
        >
          + 글 작성
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem',
        }}>
          <h3 style={{ marginBottom: '1rem' }}>{boardNames[selectedBoard]} 글 작성</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>제목 *</label>
              <input style={inputStyle} value={formData.title} required
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>내용 *</label>
              <textarea style={{ ...inputStyle, height: '200px' }} value={formData.content} required
                onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={formData.isNotice}
                onChange={e => setFormData(p => ({ ...p, isNotice: e.target.checked }))} />
              공지사항으로 등록
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={submitBtnStyle}>등록</button>
              <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>취소</button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ ...thStyle, width: '60px' }}>번호</th>
              <th style={thStyle}>제목</th>
              <th style={{ ...thStyle, width: '100px' }}>작성자</th>
              <th style={{ ...thStyle, width: '120px' }}>작성일</th>
              <th style={{ ...thStyle, width: '80px' }}>조회</th>
              <th style={{ ...thStyle, width: '80px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</td></tr>
            ) : [...notices, ...posts].length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>게시물이 없습니다.</td></tr>
            ) : (
              <>
                {notices.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #e5e7eb', background: '#fffbeb' }}>
                    <td style={tdStyle}>
                      <span style={{
                        background: '#ef4444', color: 'white', padding: '0.1rem 0.4rem',
                        borderRadius: '4px', fontSize: '0.75rem',
                      }}>공지</span>
                    </td>
                    <td style={tdStyle}>{post.title}</td>
                    <td style={tdStyle}>{post.author}</td>
                    <td style={tdStyle}>{formatDate(post.created_at)}</td>
                    <td style={tdStyle}>{post.view_count}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDelete(post.id)}
                        style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>삭제</button>
                    </td>
                  </tr>
                ))}
                {posts.map((post, idx) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={tdStyle}>{(pagination.total || 0) - ((currentPage - 1) * 20) - idx}</td>
                    <td style={tdStyle}>
                      {post.title}
                      {post.attachment_count > 0 && <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>📎</span>}
                    </td>
                    <td style={tdStyle}>{post.author}</td>
                    <td style={tdStyle}>{formatDate(post.created_at)}</td>
                    <td style={tdStyle}>{post.view_count}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDelete(post.id)}
                        style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>삭제</button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db',
                background: currentPage === i + 1 ? '#3b82f6' : 'white',
                color: currentPage === i + 1 ? 'white' : '#374151', cursor: 'pointer',
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem' };
const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const submitBtnStyle = { background: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' };
const cancelBtnStyle = { background: '#6b7280', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' };
