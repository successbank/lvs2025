'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import '../app/styles/globals.css';

export default function BoardListPage({ boardSlug }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Get board info
        const boardResponse = await fetch(`/api/boards?slug=${boardSlug}`);
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

        const postsResponse = await fetch(`/api/posts?${searchParams}`);
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
        const response = await fetch(`/api/posts/${post.id}?incrementView=true`);
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
    window.location.href = `/support/${boardSlug}/${post.id}`;
  };

  const handlePasswordSubmit = async () => {
    if (!passwordInput) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${passwordTarget.id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();

      if (data.verified) {
        sessionStorage.setItem(`post_pw_${passwordTarget.id}`, passwordInput);
        setPasswordModalOpen(false);
        window.location.href = `/support/${boardSlug}/${passwordTarget.id}`;
      } else {
        setPasswordError(data.error || '비밀번호가 일치하지 않습니다.');
      }
    } catch {
      setPasswordError('비밀번호 확인에 실패했습니다.');
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
          ‹ 이전
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
          다음 ›
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
          <span className="secret-title">비밀글입니다.</span>
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

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/support">고객지원</a>
          <span>&gt;</span>
          <span>{board?.name || '게시판'}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>{board?.name || '게시판'}</h1>
          <p>{board?.description || '엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.'}</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/support/tech-guide" className={boardSlug === 'tech-guide' ? 'active' : ''}>테크니컬 가이드</a>
          <a href="/support/downloads" className={boardSlug === 'downloads' ? 'active' : ''}>자료 다운로드</a>
          <a href="/support/consultation" className={boardSlug === 'consultation' ? 'active' : ''}>온라인 상담실</a>
          <a href="/support/notices" className={boardSlug === 'notices' ? 'active' : ''}>공지사항</a>
          <a href="/support/contact" className={boardSlug === 'contact' ? 'active' : ''}>찾아오시는 길</a>
          <a href="/support/catalog" className={boardSlug === 'catalog' ? 'active' : ''}>카탈로그 신청</a>
        </div>
      </div>

      {/* Board Content */}
      <div className="board-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <>
            {/* Board Table */}
            <table className="board-table">
              <thead>
                <tr>
                  <th className="board-col-number">번호</th>
                  <th className="board-col-title">제목</th>
                  <th className="board-col-author">작성자</th>
                  <th className="board-col-date">작성일</th>
                  <th className="board-col-views">조회수</th>
                </tr>
              </thead>
              <tbody>
                {/* 공지사항 */}
                {notices.map((notice) => (
                  <tr key={notice.id} className="board-notice-row">
                    <td className="board-col-number">
                      <span className="notice-badge">공지</span>
                    </td>
                    <td className="board-col-title">
                      <a
                        href={`/support/${boardSlug}/${notice.id}`}
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
                      등록된 게시물이 없습니다.
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
                            href={`/support/${boardSlug}/${post.id}`}
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
                <a href={`/support/${boardSlug}/write`}
                  style={{
                    display: 'inline-block', padding: '0.5rem 1.25rem',
                    background: '#2c5f8a', color: 'white', borderRadius: '4px',
                    textDecoration: 'none', fontSize: '0.9rem',
                  }}>
                  {boardSlug === 'catalog' ? '카탈로그 신청' : '상담 작성'}
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
                  <option value="all">전체</option>
                  <option value="title">제목</option>
                  <option value="content">내용</option>
                  <option value="author">작성자</option>
                </select>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="board-search-input"
                />
                <button type="submit" className="board-search-button">
                  검색
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
                  <strong>작성자:</strong> {selectedPost.author}
                </span>
                <span className="modal-meta-item">
                  <strong>작성일:</strong> {formatDate(selectedPost.created_at)}
                </span>
                <span className="modal-meta-item">
                  <strong>조회수:</strong> {formatNumber(selectedPost.view_count)}
                </span>
              </div>
            </div>

            {postAttachments.length > 0 && (
              <div className="modal-attachments">
                <strong>첨부파일:</strong>
                <ul className="modal-attachment-list">
                  {postAttachments.map((file) => (
                    <li key={file.id}>
                      <a
                        href={`/api/attachments/${file.id}/download`}
                        className="modal-attachment-link"
                      >
                        📎 {file.original_filename}
                        <span className="modal-file-size">({formatFileSize(file.file_size)})</span>
                      </a>
                    </li>
                  ))}
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
            <h3>🔒 비밀글입니다</h3>
            <p>비밀번호를 입력해주세요.</p>
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
              <button className="btn-password-cancel" onClick={closePasswordModal}>취소</button>
              <button className="btn-password-confirm" onClick={handlePasswordSubmit}>확인</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
