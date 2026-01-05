'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function BoardListPage({ boardSlug }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [board, setBoard] = useState(null);
  const [notices, setNotices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchField, setSearchField] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

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

  return (
    <>
      {/* Header */}
      <div className="header-top">
        <div className="header-top-content">
          <a href="/about/dealers">대리점 안내</a>
          <a href="/support/tech-guide">기술지원</a>
          <a href="/support/downloads">다운로드 센터</a>
          <a href="/about/careers">인재채용</a>
          <a href="/en">ENGLISH</a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <a href="/" className="logo">
            <div className="logo-text">LVS</div>
          </a>
          <ul className="nav-menu">
            <li>
              <a href="/products">제품소개</a>
              <ul className="dropdown-menu">
                <li><a href="/products/general-lighting">일반조명</a></li>
                <li><a href="/products/power-supply">파워서플라이</a></li>
                <li><a href="/products/led-lightsource">LED LIGHTSOURCE</a></li>
              </ul>
            </li>
            <li>
              <a href="/about">회사소개</a>
              <ul className="dropdown-menu">
                <li><a href="/about/us">회사소개</a></li>
                <li><a href="/about/organization">개요 및 조직도</a></li>
                <li><a href="/about/why-led">Why LED</a></li>
                <li><a href="/about/certifications">인증현황</a></li>
                <li><a href="/about/dealers">대리점 안내</a></li>
              </ul>
            </li>
            <li>
              <a href="/support" className="active">고객지원</a>
            </li>
          </ul>
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-menu-close" onClick={closeMobileMenu}>×</button>
            <ul>
              <li><a href="/products" onClick={closeMobileMenu}>제품소개</a></li>
              <li><a href="/about" onClick={closeMobileMenu}>회사소개</a></li>
              <li><a href="/support" onClick={closeMobileMenu}>고객지원</a></li>
            </ul>
          </div>
        </div>
      )}

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
                      <a href={`/support/${boardSlug}/${notice.id}`} className="board-title-link">
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
                          <a href={`/support/${boardSlug}/${post.id}`} className="board-title-link">
                            {post.title}
                            {post.attachment_count > 0 && (
                              <span className="attachment-icon">📎</span>
                            )}
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

            {/* Search Form */}
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

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>COMPANY INFO</h4>
            <p>(주)엘브이에스 대표이사: 김태화<br />사업자번호: 131-86-14914<br />
            인천광역시 연수구 송도미래로 30 (송도동 214번지) 스마트밸리 B동 801~803호</p>
          </div>
          <div className="footer-section">
            <h4>CONTACT US</h4>
            <div className="footer-contact">
              <div>📞 032-461-1800</div>
              <div>📠 032-461-1001</div>
            </div>
          </div>
        </div>
        <p className="copyright">COPYRIGHT(C) (주)엘브이에스. ALL RIGHT RESERVED.</p>
      </footer>
    </>
  );
}
