'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '../app/styles/globals.css';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'zip',
];
const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',');

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExt(name) {
  const dot = (name || '').lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}

export default function ConsultationWritePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    company: '',
    contactName: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: '',
    title: '',
    content: '',
    isSecret: true,
  });
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addFiles = (incoming) => {
    setAttachmentError('');
    const arr = Array.from(incoming || []);
    if (arr.length === 0) return;

    if (attachments.length + arr.length > MAX_FILES) {
      setAttachmentError(`첨부파일은 최대 ${MAX_FILES}개까지 업로드할 수 있습니다. (현재 ${attachments.length}개)`);
      return;
    }

    const valid = [];
    for (const f of arr) {
      const ext = getExt(f.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setAttachmentError(`허용되지 않는 확장자입니다: ${f.name}`);
        return;
      }
      if (f.size === 0) {
        setAttachmentError(`빈 파일은 업로드할 수 없습니다: ${f.name}`);
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setAttachmentError(`파일당 최대 10MB까지 가능합니다: ${f.name} (${formatFileSize(f.size)})`);
        return;
      }
      valid.push(f);
    }

    setAttachments(prev => [...prev, ...valid]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };
  const handleDropzoneKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name || !formData.password || !formData.title || !formData.content ||
      !formData.company || !formData.contactName || !formData.contactPosition ||
      !formData.contactEmail || !formData.contactPhone
    ) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!/^\d{4}$/.test(formData.password)) {
      alert('비밀번호는 4자리 숫자로 입력해주세요.');
      return;
    }

    if (attachmentError) {
      alert(attachmentError);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('boardSlug', 'consultation');
      fd.append('title', formData.title);
      fd.append('content', formData.content);
      fd.append('author', formData.name);
      fd.append('password', formData.password);
      fd.append('isSecret', String(formData.isSecret));
      fd.append('company', formData.company || '');
      fd.append('contactName', formData.contactName || '');
      fd.append('contactPosition', formData.contactPosition || '');
      fd.append('contactEmail', formData.contactEmail || '');
      fd.append('contactPhone', formData.contactPhone || '');
      for (const file of attachments) {
        fd.append('files', file, file.name);
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
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
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    className="form-input"
                    placeholder="숫자 4자리 (수정/삭제 시 필요)"
                  />
                </td>
              </tr>
              <tr>
                <th>업체명 <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="업체명을 입력해주세요"
                  />
                </td>
                <th>담당자 <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="담당자명을 입력해주세요"
                  />
                </td>
              </tr>
              <tr>
                <th>직함 <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="contactPosition"
                    value={formData.contactPosition}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="예: 과장, 팀장, 대표"
                  />
                </td>
                <th>이메일 <span className="required">*</span></th>
                <td>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="이메일을 입력해주세요"
                  />
                </td>
              </tr>
              <tr>
                <th>연락처 <span className="required">*</span></th>
                <td colSpan="3">
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="form-input-full"
                    placeholder="연락처를 입력해주세요"
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
                <th>첨부파일</th>
                <td colSpan="3">
                  <div
                    className={`consult-dropzone${dragActive ? ' is-dragover' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleDropzoneClick}
                    onKeyDown={handleDropzoneKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label="파일 첨부 영역. 클릭하거나 파일을 끌어다 놓으세요."
                  >
                    <p className="consult-dropzone-title">
                      파일을 끌어다 놓거나 <span className="consult-dropzone-link">클릭하여 선택</span>하세요
                    </p>
                    <p className="consult-dropzone-hint">
                      최대 {MAX_FILES}개 · 개당 10MB 이하 · pdf, doc, xls, ppt, hwp, jpg, png, gif, webp, zip
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ACCEPT_ATTR}
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </div>

                  {attachmentError && (
                    <p className="consult-attachment-error" role="alert">
                      {attachmentError}
                    </p>
                  )}

                  {attachments.length > 0 && (
                    <ul className="consult-attachment-list">
                      {attachments.map((file, idx) => (
                        <li key={`${file.name}-${idx}`} className="consult-attachment-item">
                          <span className="consult-attachment-icon" aria-hidden="true">📎</span>
                          <span className="consult-attachment-name">{file.name}</span>
                          <span className="consult-attachment-size">{formatFileSize(file.size)}</span>
                          <button
                            type="button"
                            className="consult-attachment-remove"
                            onClick={() => removeAttachment(idx)}
                            aria-label={`${file.name} 삭제`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
