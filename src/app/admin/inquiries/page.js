'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => { fetchInquiries(); }, [currentPage, filterStatus]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let url = `/api/inquiries?page=${currentPage}&limit=20`;
      if (filterStatus) url += `&status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      setInquiries(data.inquiries || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    }
    setLoading(false);
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`);
      const data = await res.json();
      setSelectedInquiry(data);
      setReplyText(data.reply || '');
    } catch (error) {
      console.error('Failed to fetch inquiry:', error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) { alert('답변을 입력해주세요.'); return; }
    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText, status: 'ANSWERED' }),
      });
      if (!res.ok) throw new Error('답변 저장에 실패했습니다.');
      alert('답변이 저장되었습니다.');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchInquiries();
    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  };

  const statusLabel = { PENDING: '대기', ANSWERED: '답변완료', CLOSED: '종료' };
  const statusColor = { PENDING: '#f59e0b', ANSWERED: '#10b981', CLOSED: '#6b7280' };

  return (
    <AdminLayout title="문의 관리">
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>상태:</span>
        {['', 'PENDING', 'ANSWERED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db',
              background: filterStatus === s ? '#3b82f6' : 'white',
              color: filterStatus === s ? 'white' : '#374151',
              cursor: 'pointer', fontSize: '0.85rem',
            }}>
            {s === '' ? '전체' : statusLabel[s]}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.9rem' }}>
          총 {pagination.total || 0}건
        </span>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', padding: '2rem',
            maxWidth: '700px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <h3 style={{ marginBottom: '1rem' }}>문의 상세</h3>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>이름:</strong> {selectedInquiry.name}</p>
              <p><strong>이메일:</strong> {selectedInquiry.email}</p>
              {selectedInquiry.phone && <p><strong>연락처:</strong> {selectedInquiry.phone}</p>}
              {selectedInquiry.company && <p><strong>회사:</strong> {selectedInquiry.company}</p>}
              <p><strong>제목:</strong> {selectedInquiry.title}</p>
              <p><strong>날짜:</strong> {formatDate(selectedInquiry.createdAt)}</p>
            </div>
            <div style={{
              background: '#f9fafb', padding: '1rem', borderRadius: '6px', marginBottom: '1rem',
            }}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedInquiry.content}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>답변</label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{
                  width: '100%', height: '120px', padding: '0.75rem',
                  border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical',
                }}
                placeholder="답변을 입력하세요..."
              />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={handleReply} style={{
                background: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
              }}>답변 저장</button>
              <button onClick={() => setSelectedInquiry(null)} style={{
                background: '#6b7280', color: 'white', padding: '0.5rem 1.5rem',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
              }}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>이름</th>
              <th style={thStyle}>제목</th>
              <th style={thStyle}>등록일</th>
              <th style={thStyle}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</td></tr>
            ) : inquiries.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>문의가 없습니다.</td></tr>
            ) : inquiries.map(inq => (
              <tr key={inq.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px',
                    fontSize: '0.75rem', color: 'white', background: statusColor[inq.status],
                  }}>{statusLabel[inq.status]}</span>
                </td>
                <td style={tdStyle}>{inq.name}</td>
                <td style={tdStyle}>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleViewDetail(inq.id); }}
                    style={{ color: '#3b82f6', textDecoration: 'none' }}>{inq.title}</a>
                </td>
                <td style={tdStyle}>{formatDate(inq.createdAt)}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleViewDetail(inq.id)}
                    style={{ background: 'transparent', color: '#3b82f6', border: 'none', cursor: 'pointer', marginRight: '0.5rem', textDecoration: 'underline', fontSize: '0.85rem' }}>상세</button>
                  <button onClick={() => handleDelete(inq.id)}
                    style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>삭제</button>
                </td>
              </tr>
            ))}
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

const thStyle = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#374151' };
const tdStyle = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
