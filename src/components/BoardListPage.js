'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoginModal from './LoginModal';
import '../app/styles/globals.css';
import { getDict } from '@/lib/i18n';

export default function BoardListPage({ boardSlug, section = 'support', locale = 'ko' }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const t = getDict(locale).board;
  const apiBase = locale === 'en' ? '/api/en' : '/api';
  const base = locale === 'en' ? '/en' : '';

  const [board, setBoard] = useState(null);
  const [notices, setNotices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchField, setSearchField] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postAttachments, setPostAttachments] = useState([]);

  // 비밀번호 모달 상태
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 회원 전용 다운로드 — 인라인 로그인 모달 + 보류 중인 첨부
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const triggerAttachmentDownload = (attId) => {
    // 브라우저 기본 다운로드 동작 보존 (Content-Disposition: attachment)
    window.location.href = `${apiBase}/attachments/${attId}/download`;
  };

  const handleAttachmentClick = (e, file) => {
    // /support/downloads 게시판은 회원 전용 — 비로그인이면 LoginModal 표시
    if (boardSlug === 'downloads' && !session) {
      e.preventDefault();
      setPendingAttachment(file);
      setLoginModalOpen(true);
      return;
    }
    // 로그인 상태면 <a>의 href 기본 동작 그대로 다운로드 진행
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Get board info
        const boardResponse = await fetch(`${apiBase}/boards?slug=${boardSlug}`);
        const boardData = await boardResponse.json();

        if (!boardData.board) {
          console.error('Board not found');
          setLoading(false);
          return;
        }

        setBoard(boardData.board);

        // Get posts
        const searchParams = new URLSearchParams({
          boardSlug,
          page: currentPage.toString(),
          limit: boardData.board.posts_per_page?.toString() || '10',
        });

        if (searchQuery) {
          searchParams.append('search', searchQuery);
          searchParams.append('searchField', searchField);
        }

        const postsResponse = await fetch(`${apiBase}/posts?${searchParams}`);
        const postsData = await postsResponse.json();

        setNotices(postsData.notices || []);
        setPosts(postsData.posts || []);
        setPagination(postsData.pagination);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [boardSlug, currentPage, searchQuery, searchField]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchKeyword);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (locale === 'en') {
      return date.toLocaleDateString('en-CA', { year: '2-digit', month: '2-digit', day: '2-digit' });
    }
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
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

  const handlePostClick = async (e, post) => {
    e.preventDefault();

    // 상담/카탈로그 게시판 비밀글 처리
    if ((boardSlug === 'consultation' || boardSlug === 'catalog') && post.is_secret && !isAdmin) {
      setPasswordTarget(post);
      setPasswordInput('');
      setPasswordError('');
      setPasswordModalOpen(true);
      return;
    }

    // 다운로드 게시판은 모달로 표시
    if (boardSlug === 'downloads') {
      try {
        const response = await fetch(`${apiBase}/posts/${post.id}?incrementView=true`);
        const data = await response.json();

        if (data.post) {
          setSelectedPost(data.post);
          setPostAttachments(data.attachments || []);
          setModalOpen(true);
          document.body.style.overflow = 'hidden';
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      }
      return;
    }

    // 기본: 상세 페이지 이동
    window.location.href = `${basePath}/${post.id}`;
  };

  const handlePasswordSubmit = async () => {
    if (!passwordInput) {
      setPasswordError(t.pwRequired);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/posts/${passwordTarget.id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();

      if (data.verified) {
        sessionStorage.setItem(`post_pw_${passwordTarget.id}`, passwordInput);
        setPasswordModalOpen(false);
        window.location.href = `${basePath}/${passwordTarget.id}`;
      } else {
        setPasswordError(data.error || t.pwMismatch);
      }
    } catch {
      setPasswordError(t.pwFail);
    }
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPasswordTarget(null);
    setPasswordInput('');
    setPasswordError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPost(null);
    setPostAttachments([]);
    document.body.style.overflow = '';
  };

  const PageButton = ({ page, isCurrent }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`pagination-button ${isCurrent ? 'active' : ''}`}
    >
      {page}
    </button>
  );

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const { currentPage: current, totalPages } = pagination;

    // 이전 버튼
    if (current > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(current - 1)}
          className="pagination-button"
        >
          {t.prevPage}
        </button>
      );
    }

    // 페이지 번호
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(totalPages, current + 2);

    if (startPage > 1) {
      pages.push(<PageButton key={1} page={1} isCurrent={current === 1} />);
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(<PageButton key={i} page={i} isCurrent={current === i} />);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(<PageButton key={totalPages} page={totalPages} isCurrent={current === totalPages} />);
    }

    // 다음 버튼
    if (current < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setCurrentPage(current + 1)}
          className="pagination-button"
        >
          {t.nextPage}
        </button>
      );
    }

    return <div className="pagination">{pages}</div>;
  };

  // 게시물 제목 렌더링 (비밀글 처리)
  const renderPostTitle = (post) => {
    if ((boardSlug === 'consultation' || boardSlug === 'catalog') && post.is_secret && !isAdmin) {
      return (
        <>
          <span className="secret-icon">🔒</span>
          <span className="secret-title">{t.secretPostTitle}</span>
        </>
      );
    }
    return (
      <>
        {(boardSlug === 'consultation' || boardSlug === 'catalog') && post.is_secret && (
          <span className="secret-icon">🔒</span>
        )}
        {post.title}
        {post.attachment_count > 0 && (
          <span className="attachment-icon">📎</span>
        )}
      </>
    );
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
          <span>{board?.name || t.fallbackName}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{board?.name || t.fallbackName}</h1>
          <p>{board?.description || t.headerFallbackDesc}</p>
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

      {/* Board Content */}
      <div className="board-container">
        {loading ? (
          <div className="loading">{t.loading}</div>
        ) : (
          <>
            {/* Board Table */}
            <table className="board-table">
              <thead>
                <tr>
                  <th className="board-col-number">{t.thNumber}</th>
                  <th className="board-col-title">{t.thTitle}</th>
                  <th className="board-col-author">{t.thAuthor}</th>
                  <th className="board-col-date">{t.thDate}</th>
                  <th className="board-col-views">{t.thViews}</th>
                </tr>
              </thead>
              <tbody>
                {/* 공지사항 */}
                {notices.map((notice) => (
                  <tr key={notice.id} className="board-notice-row">
                    <td className="board-col-number">
                      <span className="notice-badge">{t.noticeBadge}</span>
                    </td>
                    <td className="board-col-title">
                      <a
                        href={`${basePath}/${notice.id}`}
                        className="board-title-link"
                        onClick={(e) => handlePostClick(e, notice)}
                      >
                        {notice.title}
                        {notice.attachment_count > 0 && (
                          <span className="attachment-icon">📎</span>
                        )}
                      </a>
                    </td>
                    <td className="board-col-author">{notice.author}</td>
                    <td className="board-col-date">{formatDate(notice.created_at)}</td>
                    <td className="board-col-views">{formatNumber(notice.view_count)}</td>
                  </tr>
                ))}

                {/* 일반 게시물 */}
                {posts.length === 0 && notices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="board-empty">
                      {t.empty}
                    </td>
                  </tr>
                ) : (
                  posts.map((post, index) => {
                    const postNumber = pagination
                      ? pagination.totalCount - (pagination.currentPage - 1) * pagination.limit - index
                      : index + 1;

                    return (
                      <tr key={post.id}>
                        <td className="board-col-number">{postNumber}</td>
                        <td className="board-col-title">
                          <a
                            href={`${basePath}/${post.id}`}
                            className="board-title-link"
                            onClick={(e) => handlePostClick(e, post)}
                          >
                            {renderPostTitle(post)}
                          </a>
                        </td>
                        <td className="board-col-author">{post.author}</td>
                        <td className="board-col-date">{formatDate(post.created_at)}</td>
                        <td className="board-col-views">{formatNumber(post.view_count)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Write Button + Search Form */}
            {(boardSlug === 'consultation' || boardSlug === 'catalog') && (
              <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                <a href={`${basePath}/write`}
                  style={{
                    display: 'inline-block', padding: '0.5rem 1.25rem',
                    background: '#2c5f8a', color: 'white', borderRadius: '4px',
                    textDecoration: 'none', fontSize: '0.9rem',
                  }}>
                  {boardSlug === 'catalog' ? t.writeCatalog : t.writeConsult}
                </a>
              </div>
            )}
            <div className="board-search">
              <form onSubmit={handleSearch}>
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="board-search-select"
                >
                  <option value="all">{t.searchAll}</option>
                  <option value="title">{t.searchTitle}</option>
                  <option value="content">{t.searchContent}</option>
                  <option value="author">{t.searchAuthor}</option>
                </select>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="board-search-input"
                />
                <button type="submit" className="board-search-button">
                  {t.searchBtn}
                </button>
              </form>
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>

      {/* 다운로드 모달 */}
      {modalOpen && selectedPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <div className="modal-header">
              <h2 className="modal-title">{selectedPost.title}</h2>
              <div className="modal-meta">
                <span className="modal-meta-item">
                  <strong>{t.metaAuthor}</strong> {selectedPost.author}
                </span>
                <span className="modal-meta-item">
                  <strong>{t.metaDate}</strong> {formatDate(selectedPost.created_at)}
                </span>
                <span className="modal-meta-item">
                  <strong>{t.metaViews}</strong> {formatNumber(selectedPost.view_count)}
                </span>
              </div>
            </div>

            {postAttachments.length > 0 && (
              <div className="modal-attachments">
                <strong>{t.attachmentsLabel}</strong>
                <ul className="modal-attachment-list">
                  {postAttachments.map((file) => {
                    const unavailable = file.is_available === false;
                    if (unavailable) {
                      return (
                        <li key={file.id}>
                          <button
                            type="button"
                            className="modal-attachment-link"
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
                            <span className="modal-file-size">
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
                          className="modal-attachment-link"
                          onClick={(e) => handleAttachmentClick(e, file)}
                        >
                          📎 {file.original_filename}
                          <span className="modal-file-size">
                            ({formatFileSize(file.file_size)})
                          </span>
                          {boardSlug === 'downloads' && !session && (
                            <span style={{ marginLeft: 8, color: '#2563eb', fontSize: '0.8em' }}>
                              {t.membersOnlyTag}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div
              className="modal-body"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
          </div>
        </div>
      )}

      {/* 비밀번호 확인 모달 */}
      {passwordModalOpen && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePasswordModal}>×</button>
            <h3>{t.pwModalTitle}</h3>
            <p>{t.pwDesc}</p>
            <input
              type="password"
              className="password-input"
              value={passwordInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPasswordInput(val);
                setPasswordError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              inputMode="numeric"
              maxLength={4}
              placeholder="····"
              autoFocus
            />
            <div className="password-error">{passwordError}</div>
            <div className="password-buttons">
              <button className="btn-password-cancel" onClick={closePasswordModal}>{t.cancel}</button>
              <button className="btn-password-confirm" onClick={handlePasswordSubmit}>{t.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* 회원 전용 다운로드 — 인라인 로그인 모달 */}
      <LoginModal
        locale={locale}
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          if (pendingAttachment) {
            triggerAttachmentDownload(pendingAttachment.id);
            setPendingAttachment(null);
          }
        }}
        message={t.loginRequiredMsg}
      />
    </>
  );
}
