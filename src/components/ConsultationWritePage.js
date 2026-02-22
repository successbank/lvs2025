'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../app/styles/globals.css';

export default function ConsultationWritePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    title: '',
    content: '',
    isSecret: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.password || !formData.title || !formData.content) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // 먼저 consultation 게시판 ID 조회
      const boardRes = await fetch('/api/boards?slug=consultation');
      const boardData = await boardRes.json();

      if (!boardData.board) {
        throw new Error('게시판을 찾을 수 없습니다.');
      }

      const boardId = boardData.board.id;

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          title: formData.title,
          content: formData.content,
          author: formData.name,
          password: formData.password,
          isSecret: formData.isSecret,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '등록에 실패했습니다.');
      }

      alert('상담이 등록되었습니다.');
      router.push('/support/consultation');
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/support">고객지원</a>
          <span>&gt;</span>
          <a href="/support/consultation">온라인 상담실</a>
          <span>&gt;</span>
          <span>상담 작성</span>
        </div>
      </div>

      <section className="page-header">
        <div className="page-header-content">
          <h1>온라인 상담실</h1>
          <p>제품 문의 및 기술 상담을 등록해 주세요.</p>
        </div>
      </section>

      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/support/tech-guide">테크니컬 가이드</a>
          <a href="/support/downloads">자료 다운로드</a>
          <a href="/support/consultation" className="active">온라인 상담실</a>
          <a href="/support/notices">공지사항</a>
          <a href="/support/contact">찾아오시는 길</a>
          <a href="/support/catalog">카탈로그 신청</a>
        </div>
      </div>

      <div className="form-container">
        <div className="form-intro">
          <p>상담 내용을 작성해 주세요. 빠른 시일 내에 답변 드리겠습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="catalog-form">
          <table className="form-table">
            <tbody>
              <tr>
                <th>이름 <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="이름을 입력해주세요"
                  />
                </td>
                <th>비밀번호 <span className="required">*</span></th>
                <td>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="수정/삭제 시 필요합니다"
                  />
                </td>
              </tr>
              <tr>
                <th>제목 <span className="required">*</span></th>
                <td colSpan="3">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input-full"
                    placeholder="상담 제목을 입력해주세요"
                  />
                </td>
              </tr>
              <tr>
                <th>내용 <span className="required">*</span></th>
                <td colSpan="3">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="10"
                    className="form-textarea"
                    placeholder="상담 내용을 입력해주세요"
                  ></textarea>
                </td>
              </tr>
              <tr>
                <th>옵션</th>
                <td colSpan="3">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="isSecret"
                      checked={formData.isSecret}
                      onChange={handleInputChange}
                    />
                    비밀글로 등록
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? '등록 중...' : '등록'}
            </button>
            <button type="button" onClick={() => router.push('/support/consultation')} className="btn-cancel">
              취소
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
