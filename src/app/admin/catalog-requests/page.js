'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminCatalogRequests() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchRequests(); }, [currentPage, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = `/api/catalog-requests?page=${currentPage}&limit=20`;
      if (filterStatus) url += `&status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data.requests || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch catalog requests:', error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/catalog-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/catalog-requests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  };

  const statusLabel = { PENDING: '대기', PROCESSING: '처리중', COMPLETED: '완료', CANCELLED: '취소' };
  const statusColor = { PENDING: '#f59e0b', PROCESSING: '#3b82f6', COMPLETED: '#10b981', CANCELLED: '#6b7280' };

  return (
    <AdminLayout title="카탈로그 신청 관리">
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>상태:</span>
        {['', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map(s => (
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

      <div style={{
        background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>신청인</th>
              <th style={thStyle}>연락처</th>
              <th style={thStyle}>회사</th>
              <th style={thStyle}>주소</th>
              <th style={thStyle}>신청일</th>
              <th style={thStyle}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>신청이 없습니다.</td></tr>
            ) : requests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px',
                    fontSize: '0.75rem', color: 'white', background: statusColor[req.status],
                  }}>{statusLabel[req.status]}</span>
                </td>
                <td style={tdStyle}>{req.name}</td>
                <td style={tdStyle}>{req.phone}</td>
                <td style={tdStyle}>{req.company || '-'}</td>
                <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {req.address}
                </td>
                <td style={tdStyle}>{formatDate(req.createdAt)}</td>
                <td style={tdStyle}>
                  <select
                    value={req.status}
                    onChange={e => handleStatusChange(req.id, e.target.value)}
                    style={{ padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', marginRight: '0.5rem' }}
                  >
                    {Object.entries(statusLabel).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <button onClick={() => handleDelete(req.id)}
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
