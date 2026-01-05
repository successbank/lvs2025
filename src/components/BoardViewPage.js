'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function BoardViewPage({ boardSlug, postId }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [post, setPost] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/posts/${postId}?incrementView=true`);
        const data = await response.json();

        if (data.post) {
          setPost(data.post);
          setAttachments(data.attachments || []);
          setPrevPost(data.prevPost);
          setNextPost(data.nextPost);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [postId]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
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
          <a href={`/support/${boardSlug}`}>{post?.board_name || '게시판'}</a>
          <span>&gt;</span>
          <span>{post?.title || '게시물'}</span>
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
          <a href="/support/tech-guide" className={boardSlug === 'tech-guide' ? 'active' : ''}>테크니컬 가이드</a>
          <a href="/support/downloads" className={boardSlug === 'downloads' ? 'active' : ''}>자료 다운로드</a>
          <a href="/support/consultation" className={boardSlug === 'consultation' ? 'active' : ''}>온라인 상담실</a>
          <a href="/support/notices" className={boardSlug === 'notices' ? 'active' : ''}>공지사항</a>
          <a href="/support/contact" className={boardSlug === 'contact' ? 'active' : ''}>찾아오시는 길</a>
          <a href="/support/catalog" className={boardSlug === 'catalog' ? 'active' : ''}>카탈로그 신청</a>
        </div>
      </div>

      {/* Board View Content */}
      <div className="board-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : !post ? (
          <div className="board-error">
            <p>게시물을 찾을 수 없습니다.</p>
            <a href={`/support/${boardSlug}`} className="btn-primary">목록으로</a>
          </div>
        ) : (
          <>
            {/* Post Header */}
            <div className="board-view-header">
              <h2 className="board-view-title">{post.title}</h2>
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
                <a href={`/support/${boardSlug}`} className="btn-list">
                  목록
                </a>
              </div>
            </div>

            {/* Prev/Next Posts */}
            <div className="board-view-prevnext">
              {nextPost && (
                <div className="board-prevnext-item">
                  <span className="prevnext-label">다음글</span>
                  <a href={`/support/${boardSlug}/${nextPost.id}`} className="prevnext-title">
                    {nextPost.title}
                  </a>
                </div>
              )}
              {prevPost && (
                <div className="board-prevnext-item">
                  <span className="prevnext-label">이전글</span>
                  <a href={`/support/${boardSlug}/${prevPost.id}`} className="prevnext-title">
                    {prevPost.title}
                  </a>
                </div>
              )}
            </div>
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
