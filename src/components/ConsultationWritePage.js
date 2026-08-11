'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import '../app/styles/globals.css';
import { getDict } from '@/lib/i18n';

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

export default function ConsultationWritePage({ locale = 'ko' }) {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const t = getDict(locale).consult;
  const tb = getDict(locale).board;
  const apiBase = locale === 'en' ? '/api/en' : '/api';
  const base = locale === 'en' ? '/en' : '';
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
  const profileRef = useRef(null); // 로그인 시 로드한 회원정보 원본(빈 필드 backfill 판단용)

  // 로그인 상태에서만 회원정보로 담당자/이메일/업체명/연락처/직함 자동입력.
  // 로그아웃 상태는 아무것도 하지 않아 기존 동작을 그대로 유지한다.
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!res.ok) return;
        const me = await res.json();
        if (cancelled) return;
        profileRef.current = me;

        // 이미 사용자가 입력한 값은 덮어쓰지 않는다 (빈 필드만 채움).
        setFormData((prev) => ({
          ...prev,
          name: prev.name || me.name || '',
          contactName: prev.contactName || me.name || '',
          company: prev.company || me.company || '',
          contactEmail: prev.contactEmail || me.email || '',
          contactPhone: prev.contactPhone || me.phone || '',
          contactPosition: prev.contactPosition || me.position || '',
        }));
      } catch {
        /* 자동입력 실패는 무시 — 수동 입력으로 폼은 정상 동작 */
      }
    })();

    return () => { cancelled = true; };
  }, [authStatus]);

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
      setAttachmentError(t.maxFilesError(MAX_FILES, attachments.length));
      return;
    }

    const valid = [];
    for (const f of arr) {
      const ext = getExt(f.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setAttachmentError(t.extError(f.name));
        return;
      }
      if (f.size === 0) {
        setAttachmentError(t.emptyFileError(f.name));
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setAttachmentError(t.sizeError(f.name, formatFileSize(f.size)));
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

    // 공백만 입력된 필드는 미입력으로 간주
    const trimmed = {
      name: formData.name.trim(),
      password: formData.password.trim(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      company: formData.company.trim(),
      contactName: formData.contactName.trim(),
      contactPosition: formData.contactPosition.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
    };

    if (
      !trimmed.name || !trimmed.password || !trimmed.title || !trimmed.content ||
      !trimmed.company || !trimmed.contactName || !trimmed.contactPosition ||
      !trimmed.contactEmail || !trimmed.contactPhone
    ) {
      alert(t.validationAll);
      return;
    }

    if (!/^\d{4}$/.test(trimmed.password)) {
      alert(t.validationPw);
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
      fd.append('title', trimmed.title);
      fd.append('content', trimmed.content);
      fd.append('author', trimmed.name);
      fd.append('password', trimmed.password);
      fd.append('isSecret', String(formData.isSecret));
      fd.append('company', trimmed.company);
      fd.append('contactName', trimmed.contactName);
      fd.append('contactPosition', trimmed.contactPosition);
      fd.append('contactEmail', trimmed.contactEmail);
      fd.append('contactPhone', trimmed.contactPhone);
      for (const file of attachments) {
        fd.append('files', file, file.name);
      }

      const res = await fetch(`${apiBase}/posts`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || t.submitFail);
      }

      // 로그인 상태면 입력한 직함을 회원정보에 저장(신규 필드).
      // 연락처·회사이름은 회원정보가 비어 있던 경우에만 채운다(backfill, 기존 값은 덮어쓰지 않음).
      // 상담 등록은 이미 성공했으므로 프로필 저장 실패는 무시한다.
      if (authStatus === 'authenticated') {
        try {
          const updates = { position: trimmed.contactPosition };
          // 프로필을 확실히 로드했고 해당 값이 비어 있던 경우에만 채운다.
          // 로드 실패(prof null) 시엔 기존 값 보호를 위해 backfill하지 않는다.
          const prof = profileRef.current;
          if (prof && !prof.phone) updates.phone = trimmed.contactPhone;
          if (prof && !prof.company) updates.company = trimmed.company;

          await fetch('/api/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        } catch {
          /* 프로필 저장 실패 무시 */
        }
      }

      alert(t.submitted);
      router.push(`${base}/support/consultation`);
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
          <a href={base || '/'}>Home</a>
          <span>&gt;</span>
          <a href={`${base}/support`}>{t.crumbSupport}</a>
          <span>&gt;</span>
          <a href={`${base}/support/consultation`}>{t.crumbBoard}</a>
          <span>&gt;</span>
          <span>{t.crumbWrite}</span>
        </div>
      </div>

      <section className="page-header">
        <div className="page-header-content">
          <h1>{t.headerTitle}</h1>
          <p>{t.headerDesc}</p>
        </div>
      </section>

      <div className="sub-nav">
        <div className="sub-nav-container">
          {tb.supportNav.map((item) => (
            <a key={item.slug} href={`${base}${item.href}`} className={item.slug === 'consultation' ? 'active' : ''}>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="form-container">
        <div className="form-intro">
          <p>{t.intro}</p>
        </div>

        <form onSubmit={handleSubmit} className="catalog-form">
          <table className="form-table">
            <tbody>
              <tr>
                <th>{t.thName} <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder={t.phName}
                  />
                </td>
                <th>{t.thPassword} <span className="required">*</span></th>
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
                    placeholder={t.phPassword}
                  />
                </td>
              </tr>
              <tr>
                <th>{t.thCompany} <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder={t.phCompany}
                  />
                </td>
                <th>{t.thContact} <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder={t.phContact}
                  />
                </td>
              </tr>
              <tr>
                <th>{t.thPosition} <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="contactPosition"
                    value={formData.contactPosition}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder={t.phPosition}
                  />
                </td>
                <th>{t.thEmail} <span className="required">*</span></th>
                <td>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder={t.phEmail}
                  />
                </td>
              </tr>
              <tr>
                <th>{t.thPhone} <span className="required">*</span></th>
                <td colSpan="3">
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="form-input-full"
                    placeholder={t.phPhone}
                  />
                </td>
              </tr>
              <tr>
                <th>{t.thTitle} <span className="required">*</span></th>
                <td colSpan="3">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input-full"
                    placeholder={t.phTitle}
                  />
                </td>
              </tr>
              <tr>
                <th>{t.thContent} <span className="required">*</span></th>
                <td colSpan="3">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="10"
                    className="form-textarea"
                    placeholder={t.phContent}
                  ></textarea>
                </td>
              </tr>
              <tr>
                <th>{t.thAttachments}</th>
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
                    aria-label={t.dropzoneAria}
                  >
                    <p className="consult-dropzone-title">
                      {t.dropTitle1}<span className="consult-dropzone-link">{t.dropLink}</span>{t.dropTitle2}
                    </p>
                    <p className="consult-dropzone-hint">
                      {t.dropHint(MAX_FILES)}
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
                            aria-label={t.removeAria(file.name)}
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
              {submitting ? t.submitting : t.submit}
            </button>
            <button type="button" onClick={() => router.push(`${base}/support/consultation`)} className="btn-cancel">
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
