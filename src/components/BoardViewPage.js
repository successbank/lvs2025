'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import '../app/styles/globals.css';
import { getDict } from '@/lib/i18n';

export default function BoardViewPage({ boardSlug, postId, section = 'support', locale = 'ko' }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const t = getDict(locale).board;
  const apiBase = locale === 'en' ? '/api/en' : '/api';
  const base = locale === 'en' ? '/en' : '';

  const [post, setPost] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // sessionStorage에서 저장된 비밀번호 확인
        const savedPw = sessionStorage.getItem(`post_pw_${postId}`);
        let url = `${apiBase}/posts/${postId}?incrementView=true`;
        if (savedPw) {
          url += `&password=${encodeURIComponent(savedPw)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.post) {
          if (data.post.requiresPassword) {
            setPost(data.post);
            setRequiresPassword(true);
          } else {
            setPost(data.post);
            setAttachments(data.attachments || []);
            setPrevPost(data.prevPost);
            setNextPost(data.nextPost);
            setRequiresPassword(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [postId]);

  const handleGateSubmit = async () => {
    if (!gatePassword) {
      setGateError(t.pwRequired);
      return;
    }

    try {
      // 비밀번호 확인
      const verifyRes = await fetch(`${apiBase}/posts/${postId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: gatePassword }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.verified) {
        setGateError(verifyData.error || t.pwMismatch);
        return;
      }

      // 비밀번호 저장 후 다시 조회
      sessionStorage.setItem(`post_pw_${postId}`, gatePassword);

      const response = await fetch(`${apiBase}/posts/${postId}?incrementView=false&password=${encodeURIComponent(gatePassword)}`);
      const data = await response.json();

      if (data.post && !data.post.requiresPassword) {
        setPost(data.post);
        setAttachments(data.attachments || []);
        setPrevPost(data.prevPost);
        setNextPost(data.nextPost);
        setRequiresPassword(false);
      }
    } catch {
      setGateError(t.pwFail);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
  };

  const basePath = section === 'about' ? `${base}/about/${boardSlug}` : `${base}/support/${boardSlug}`;

  const navItems = section === 'about' ? t.aboutNav : t.supportNav;
  const sectionLabel = section === 'about' ? t.sectionAbout : t.sectionSupport;

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href={base || '/'}>Home</a>
          <span>&gt;</span>
          <a href={`${base}/${section}`}>{sectionLabel}</a>
          <span>&gt;</span>
          <a href={basePath}>{post?.board_name || t.fallbackName}</a>
          <span>&gt;</span>
          <span>{requiresPassword ? t.secretCrumb : (post?.title || t.fallbackPost)}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{post?.board_name || t.fallbackName}</h1>
          <p>{t.headerFallbackDesc}</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          {navItems.map((item) => (
            <a key={item.slug} href={`${base}${item.href}`} className={boardSlug === item.slug ? 'active' : ''}>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Board View Content */}
      <div className="board-container">
        {loading ? (
          <div className="loading">{t.loading}</div>
        ) : !post ? (
          <div className="board-error">
            <p>{t.notFound}</p>
            <a href={basePath} className="btn-primary">{t.toList}</a>
          </div>
        ) : requiresPassword ? (
          /* 비밀번호 게이트 */
          <div className="board-password-gate">
            <div className="gate-icon">🔒</div>
            <h3>{t.pwGateTitle}</h3>
            <p>{t.pwGateDesc1}<br/>{t.pwGateDesc2}</p>
            <input
              type="password"
              className="password-input"
              value={gatePassword}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setGatePassword(val);
                setGateError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
              inputMode="numeric"
              maxLength={4}
              placeholder="····"
              autoFocus
            />
            <div className="password-error">{gateError}</div>
            <div className="gate-buttons">
              <button className="btn-gate-confirm" onClick={handleGateSubmit}>{t.confirm}</button>
              <a href={basePath} className="btn-gate-list">{t.list}</a>
            </div>
          </div>
        ) : (
          <>
            {/* Post Header */}
            <div className="board-view-header">
              <h2 className="board-view-title">
                {post.is_secret && <span className="secret-icon">🔒</span>}
                {post.title}
              </h2>
              <div className="board-view-meta">
                <span className="board-meta-item">
                  <strong>{t.metaAuthor}</strong> {post.author}
                </span>
                <span className="board-meta-item">
                  <strong>{t.metaDate}</strong> {formatDate(post.created_at)}
                </span>
                <span className="board-meta-item">
                  <strong>{t.metaViews}</strong> {formatNumber(post.view_count)}
                </span>
              </div>
              {boardSlug === 'consultation' && (post.company || post.contact_name || post.contact_position || post.contact_email || post.contact_phone) && (
                <div className="board-view-meta consultation-meta">
                  {post.company && (
                    <span className="board-meta-item"><strong>{t.metaCompany}</strong> {post.company}</span>
                  )}
                  {post.contact_name && (
                    <span className="board-meta-item"><strong>{t.metaContact}</strong> {post.contact_name}</span>
                  )}
                  {post.contact_position && (
                    <span className="board-meta-item"><strong>{t.metaPosition}</strong> {post.contact_position}</span>
                  )}
                  {post.contact_email && (
                    <span className="board-meta-item"><strong>{t.metaEmail}</strong> {post.contact_email}</span>
                  )}
                  {post.contact_phone && (
                    <span className="board-meta-item"><strong>{t.metaPhone}</strong> {post.contact_phone}</span>
                  )}
                </div>
              )}
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="board-view-attachments">
                <strong>{t.attachmentsLabel}</strong>
                <ul className="attachment-list">
                  {attachments.map((file) => {
                    const unavailable = file.is_available === false;
                    if (unavailable) {
                      return (
                        <li key={file.id}>
                          <button
                            type="button"
                            className="attachment-link"
                            style={{
                              color: '#999',
                              cursor: 'not-allowed',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              font: 'inherit',
                              textAlign: 'left',
                            }}
                            onClick={() => alert(t.fileUnavailableAlert)}
                          >
                            📎 {file.original_filename}
                            <span className="file-size">
                              ({formatFileSize(file.file_size)})
                            </span>
                            <span style={{ marginLeft: 8, color: '#c00', fontSize: '0.85em' }}>
                              {t.preparing}
                            </span>
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={file.id}>
                        <a
                          href={`${apiBase}/attachments/${file.id}/download`}
                          className="attachment-link"
                        >
                          📎 {file.original_filename}
                          <span className="file-size">
                            ({formatFileSize(file.file_size)})
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Post Content */}
            <div
              className="board-view-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Navigation */}
            <div className="board-view-navigation">
              <div className="board-nav-buttons">
                <a href={basePath} className="btn-list">
                  {t.list}
                </a>
              </div>
            </div>

            {/* Prev/Next Posts */}
            <div className="board-view-prevnext">
              {nextPost && (
                <div className="board-prevnext-item">
                  <span className="prevnext-label">{t.nextPostLabel}</span>
                  <a href={`${basePath}/${nextPost.id}`} className="prevnext-title">
                    {nextPost.title}
                  </a>
                </div>
              )}
              {prevPost && (
                <div className="board-prevnext-item">
                  <span className="prevnext-label">{t.prevPostLabel}</span>
                  <a href={`${basePath}/${prevPost.id}`} className="prevnext-title">
                    {prevPost.title}
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
