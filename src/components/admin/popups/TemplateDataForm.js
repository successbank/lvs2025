'use client';

import { useState, useRef } from 'react';
import { getTemplateFields } from '@/lib/popupTemplates';

/**
 * 동적 템플릿 데이터 입력 폼
 * 선택된 템플릿의 fields[] 정의에 따라 자동으로 입력 필드를 생성
 */
export default function TemplateDataForm({ templateId, data, onChange }) {
  const fields = getTemplateFields(templateId);
  if (!fields.length) return null;

  const handleFieldChange = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.75rem', color: '#374151' }}>
        템플릿 데이터 입력
      </label>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {fields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={data[field.key]}
            onChange={(val) => handleFieldChange(field.key, val)}
          />
        ))}
      </div>
    </div>
  );
}

function FieldRenderer({ field, value, onChange }) {
  const { key, label, type, placeholder, required, options } = field;

  const labelEl = (
    <label style={{
      display: 'block', fontSize: '0.82rem', fontWeight: '500',
      marginBottom: '0.2rem', color: '#374151',
    }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
  );

  const inputStyle = {
    width: '100%', padding: '0.45rem 0.6rem',
    border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.88rem',
  };

  switch (type) {
    case 'text':
      return (
        <div>
          {labelEl}
          <input
            style={inputStyle}
            value={value || ''}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'textarea':
      return (
        <div>
          {labelEl}
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={value || ''}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'url':
      return (
        <div>
          {labelEl}
          <input
            style={inputStyle}
            value={value || ''}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          {labelEl}
          <select
            style={inputStyle}
            value={value || (options?.[0]?.value || '')}
            onChange={(e) => onChange(e.target.value)}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case 'image':
      return (
        <ImageField
          label={label}
          required={required}
          value={value || ''}
          onChange={onChange}
        />
      );

    case 'listItems':
      return (
        <ListItemsField
          label={label}
          placeholder={placeholder}
          value={value || []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}

function ImageField({ label, required, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) { alert('허용되지 않는 파일 형식입니다.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('5MB를 초과할 수 없습니다.'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('device', 'pc');
      const res = await fetch('/api/popups/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || '업로드 실패');
      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      alert(err.message);
    }
    setUploading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.82rem', fontWeight: '500',
        marginBottom: '0.2rem', color: '#374151',
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={value} alt="" style={{ width: '80px', height: '60px', objectFit: 'contain', background: '#f3f4f6', borderRadius: '4px' }} />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: '#ef4444', color: 'white', border: 'none',
              padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            삭제
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag} onDragOver={handleDrag}
          onDragLeave={handleDrag} onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
            borderRadius: '6px', padding: '1rem', textAlign: 'center',
            cursor: 'pointer', background: dragActive ? '#eff6ff' : '#f9fafb',
            transition: 'all 0.2s',
          }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files[0]) handleUpload(e.target.files[0]); }} />
          {uploading ? (
            <p style={{ color: '#3b82f6', fontWeight: '500', margin: 0, fontSize: '0.85rem' }}>업로드 중...</p>
          ) : (
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>클릭 또는 드래그하여 이미지 업로드</p>
          )}
        </div>
      )}
    </div>
  );
}

function ListItemsField({ label, placeholder, value, onChange }) {
  const [inputVal, setInputVal] = useState('');

  const addItem = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setInputVal('');
  };

  const removeItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.82rem', fontWeight: '500',
        marginBottom: '0.2rem', color: '#374151',
      }}>
        {label}
      </label>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        <input
          style={{
            flex: 1, padding: '0.4rem 0.6rem',
            border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem',
          }}
          value={inputVal}
          placeholder={placeholder}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
        />
        <button type="button" onClick={addItem} style={{
          background: '#3b82f6', color: 'white', border: 'none',
          padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap',
        }}>
          추가
        </button>
      </div>

      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {value.map((item, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: '#e5e7eb', padding: '2px 8px', borderRadius: '4px',
              fontSize: '0.82rem', color: '#374151',
            }}>
              {item}
              <button type="button" onClick={() => removeItem(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', fontSize: '1rem', lineHeight: 1, padding: 0,
              }}>
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
