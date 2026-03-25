'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import '../app/styles/globals.css';

export default function BoardViewPage({ boardSlug, postId, section = 'support' }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

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
        let url = `/api/posts/${postId}?incrementView=true`;
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
      setGateError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 비밀번호 확인
      const verifyRes = await fetch(`/api/posts/${postId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: gatePassword }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.verified) {
        setGateError(verifyData.error || '비밀번호가 일치하지 않습니다.');
        return;
      }

      // 비밀번호 저장 후 다시 조회
      sessionStorage.setItem(`post_pw_${postId}`, gatePassword);

      const response = await fetch(`/api/posts/${postId}?incrementView=false&password=${encodeURIComponent(gatePassword)}`);
      const data = await response.json();

      if (data.post && !data.post.requiresPassword) {
        setPost(data.post);
        setAttachments(data.attachments || []);
        setPrevPost(data.prevPost);
        setNextPost(data.nextPost);
        setRequiresPassword(false);
      }
    } catch {
      setGateError('비밀번호 확인에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
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

  const basePath = section === 'about' ? `/about/${boardSlug}` : `/support/${boardSlug}`;

  const supportNav = [
    { href: '/support/tech-guide', slug: 'tech-guide', label: '테크니컬 가이드' },
    { href: '/support/downloads', slug: 'downloads', label: '자료 다운로드' },
    { href: '/support/consultation', slug: 'consultation', label: '온라인 상담실' },
    { href: '/support/notices', slug: 'notices', label: '공지사항' },
    { href: '/support/contact', slug: 'contact', label: '찾아오시는 길' },
    { href: '/support/catalog', slug: 'catalog', label: '카탈로그 신청' },
  ];

  const aboutNav = [
    { href: '/about/us', slug: 'us', label: '회사소개' },
    { href: '/about/organization', slug: 'organization', label: '개요 및 조직도' },
    { href: '/about/why-led', slug: 'why-led', label: 'Why LED' },
    { href: '/about/certifications', slug: 'certifications', label: '인증현황' },
    { href: '/about/dealers', slug: 'dealers', label: '대리점 안내' },
    { href: '/about/careers', slug: 'careers', label: '인재채용' },
  ];

  const navItems = section === 'about' ? aboutNav : supportNav;
  const sectionLabel = section === 'about' ? '회사소개' : '고객지원';

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href={`/${section}`}>{sectionLabel}</a>
          <span>&gt;</span>
          <a href={basePath}>{post?.board_name || '게시판'}</a>
          <span>&gt;</span>
          <span>{requiresPassword ? '비밀글' : (post?.title || '게시물')}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{post?.board_name || '게시판'}</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          {navItems.map((item) => (
            <a key={item.slug} href={item.href} className={boardSlug === item.slug ? 'active' : ''}>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Board View Content */}
      <div className="board-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : !post ? (
          <div className="board-error">
            <p>게시물을 찾을 수 없습니다.</p>
            <a href={basePath} className="btn-primary">목록으로</a>
          </div>
        ) : requiresPassword ? (
          /* 비밀번호 게이트 */
          <div className="board-password-gate">
            <div className="gate-icon">🔒</div>
            <h3>비밀글입니다</h3>
            <p>이 게시물은 비밀글로 등록되었습니다.<br/>비밀번호를 입력해주세요.</p>
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
              <button className="btn-gate-confirm" onClick={handleGateSubmit}>확인</button>
              <a href={basePath} className="btn-gate-list">목록</a>
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
                  <strong>작성자:</strong> {post.author}
                </span>
                <span className="board-meta-item">
                  <strong>작성일:</strong> {formatDate(post.created_at)}
                </span>
                <span className="board-meta-item">
                  <strong>조회수:</strong> {formatNumber(post.view_count)}
                </span>
              </div>
              {boardSlug === 'consultation' && (post.company || post.contact_name || post.contact_email || post.contact_phone) && (
                <div className="board-view-meta consultation-meta">
                  {post.company && (
                    <span className="board-meta-item"><strong>업체명:</strong> {post.company}</span>
                  )}
                  {post.contact_name && (
                    <span className="board-meta-item"><strong>담당자:</strong> {post.contact_name}</span>
                  )}
                  {post.contact_email && (
                    <span className="board-meta-item"><strong>이메일:</strong> {post.contact_email}</span>
                  )}
                  {post.contact_phone && (
                    <span className="board-meta-item"><strong>연락처:</strong> {post.contact_phone}</span>
                  )}
                </div>
              )}
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="board-view-attachments">
                <strong>첨부파일:</strong>
                <ul className="attachment-list">
                  {attachments.map((file) => (
                    <li key={file.id}>
                      <a href={`/api/attachments/${file.id}/download`} className="attachment-link">
                        📎 {file.original_filename}
                        <span className="file-size">({formatFileSize(file.file_size)})</span>
                      </a>
                    </li>
                  ))}
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
                  목록
                </a>
              </div>
            </div>

            {/* Prev/Next Posts */}
            <div className="board-view-prevnext">
              {nextPost && (
                <div className="board-prevnext-item">
                  <span className="prevnext-label">다음글</span>
                  <a href={`${basePath}/${nextPost.id}`} className="prevnext-title">
                    {nextPost.title}
                  </a>
                </div>
              )}
              {prevPost && (
                <div className="board-prevnext-item">
                  <span className="prevnext-label">이전글</span>
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
