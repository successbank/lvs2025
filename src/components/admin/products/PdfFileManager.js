'use client';

import { useState, useRef, useCallback } from 'react';
import { primaryBtnStyle, secondaryBtnStyle, inputStyle, pdfTabStyle, pdfDropZoneStyle, pdfFileItemStyle } from './styles';
import { useToast } from '@/components/ui/ToastProvider';

export default function PdfFileManager({ pdfFiles = [], onChange }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // --- File upload ---
  const handleFiles = useCallback(async (files) => {
    const pdfList = Array.from(files).filter(f => f.type === 'application/pdf');

    if (pdfList.length === 0) {
      toast.warning('PDF 파일만 업로드할 수 있습니다.');
      return;
    }

    if (pdfList.length !== files.length) {
      toast.warning('PDF가 아닌 파일은 제외되었습니다.');
    }

    const oversized = pdfList.filter(f => f.size > 20 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`파일 크기 초과: ${oversized.map(f => f.name).join(', ')} (최대 20MB)`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      pdfList.forEach(f => formData.append('files', f));

      const res = await fetch('/api/products/upload-pdf', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '업로드에 실패했습니다.');
        return;
      }

      const newUrls = data.files.map(f => f.url);
      onChange([...pdfFiles, ...newUrls]);
      toast.success(`${data.files.length}개 PDF가 업로드되었습니다.`);
    } catch (err) {
      toast.error('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [pdfFiles, onChange, toast]);

  // --- Drag & Drop ---
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // --- URL input ---
  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.warning('올바른 URL을 입력하세요. (http:// 또는 https://)');
      return;
    }
    onChange([...pdfFiles, trimmed]);
    setUrlInput('');
    toast.success('URL이 추가되었습니다.');
  };

  const handleUrlKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrl();
    }
  };

  // --- File list actions ---
  const removeFile = (idx) => {
    onChange(pdfFiles.filter((_, i) => i !== idx));
  };

  const isLocal = (url) => url.startsWith('/uploads/');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
          PDF 파일 ({pdfFiles.length}개)
        </label>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
        <button onClick={() => setActiveTab('upload')} style={pdfTabStyle(activeTab === 'upload')}>
          파일 업로드
        </button>
        <button onClick={() => setActiveTab('url')} style={pdfTabStyle(activeTab === 'url')}>
          URL 입력
        </button>
      </div>

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div
          onDragEnter={handleDragIn}
          onDragOver={handleDrag}
          onDragLeave={handleDragOut}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={pdfDropZoneStyle(dragActive)}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files.length > 0) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          {uploading ? (
            <div style={{ color: '#3b82f6', fontSize: '0.9rem' }}>업로드 중...</div>
          ) : (
            <>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>PDF</div>
              <div style={{ fontSize: '0.85rem' }}>PDF 파일을 드래그하거나 클릭하여 업로드</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#9ca3af' }}>
                최대 20MB/파일, 여러 파일 선택 가능
              </div>
            </>
          )}
        </div>
      )}

      {/* URL tab */}
      {activeTab === 'url' && (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <input
            style={{ ...inputStyle, flex: 1, fontSize: '0.82rem', padding: '0.4rem 0.5rem' }}
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            placeholder="https://example.com/document.pdf"
          />
          <button onClick={addUrl} style={{ ...primaryBtnStyle, padding: '0.4rem 0.75rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            추가
          </button>
        </div>
      )}

      {/* File list */}
      {pdfFiles.length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.15rem' }}>등록된 파일 목록:</div>
          {pdfFiles.map((url, idx) => (
            <div key={idx} style={pdfFileItemStyle}>
              <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                {isLocal(url) ? 'PDF' : 'URL'}
              </span>
              <span style={{
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', minWidth: 0, fontSize: '0.82rem',
              }}>
                {isLocal(url) ? url.split('/').pop() : url}
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'none', flexShrink: 0 }}
                title="열기"
              >
                Open
              </a>
              <button
                onClick={() => removeFile(idx)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#ef4444', fontSize: '1.1rem', lineHeight: 1,
                  padding: '0 0.15rem', flexShrink: 0,
                }}
                title="삭제"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
