'use client';

import { useState, useCallback } from 'react';
import TagInput from './TagInput';
import {
  primaryBtnStyle, secondaryBtnStyle, iconBtnStyle, dragHandleStyle,
  attrCardStyle, attrHeaderStyle, attrTypeSelectStyle, attrUnitInputStyle,
  inputStyle, sectionTitleStyle,
} from './styles';
import InputModal from '@/components/ui/InputModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/ToastProvider';
import useDragReorder from '@/hooks/useDragReorder';

const ATTR_TYPES = [
  { value: 'multi', label: '다중 선택' },
  { value: 'single', label: '단일 선택' },
  { value: 'range', label: '범위' },
  { value: 'text', label: '텍스트' },
];

const TYPE_COLORS = {
  multi: '#8b5cf6',
  single: '#3b82f6',
  range: '#f59e0b',
  text: '#6b7280',
};

function generateId() {
  return 'attr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function ProductOptionsEditor({ productOptions, onChange }) {
  const toast = useToast();
  const attributes = productOptions?.attributes || [];

  const [inputModal, setInputModal] = useState({ open: false, title: '', label: '', defaultValue: '', onConfirm: () => {} });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', dangerLevel: 'normal', onConfirm: () => {} });
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const updateAttributes = (newAttrs) => {
    onChange({ ...productOptions, attributes: newAttrs });
  };

  // --- Add attribute ---
  const handleAddAttribute = () => {
    setInputModal({
      open: true,
      title: '속성 추가',
      label: '속성 이름',
      placeholder: '예: 색상 온도, 전압, IP 등급',
      defaultValue: '',
      onConfirm: (name) => {
        if (!name) return;
        const key = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_가-힣]/g, '').toLowerCase();
        const newAttr = {
          id: generateId(),
          name,
          key: key || generateId(),
          type: 'multi',
          unit: '',
          values: [],
          order: attributes.length,
        };
        updateAttributes([...attributes, newAttr]);
        setInputModal(prev => ({ ...prev, open: false }));
        toast.success(`"${name}" 속성이 추가되었습니다.`);
      },
    });
  };

  // --- Update attribute field ---
  const updateAttr = (idx, field, value) => {
    const newAttrs = [...attributes];
    newAttrs[idx] = { ...newAttrs[idx], [field]: value };
    updateAttributes(newAttrs);
  };

  // --- Rename attribute ---
  const handleRenameAttr = (idx) => {
    const attr = attributes[idx];
    setInputModal({
      open: true,
      title: '속성 이름 변경',
      label: '속성 이름',
      defaultValue: attr.name,
      onConfirm: (name) => {
        if (!name) return;
        updateAttr(idx, 'name', name);
        setInputModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  // --- Delete attribute ---
  const handleDeleteAttr = (idx) => {
    const attr = attributes[idx];
    setConfirmModal({
      open: true,
      title: '속성 삭제',
      message: `"${attr.name}" 속성을 삭제하시겠습니까? 이 작업은 실행취소(Ctrl+Z)로 복원할 수 있습니다.`,
      dangerLevel: 'danger',
      onConfirm: () => {
        const newAttrs = attributes.filter((_, i) => i !== idx);
        updateAttributes(newAttrs);
        setConfirmModal(prev => ({ ...prev, open: false }));
        toast.info(`"${attr.name}" 속성이 삭제되었습니다.`);
      },
    });
  };

  // --- Duplicate attribute ---
  const handleDuplicateAttr = (idx) => {
    const original = attributes[idx];
    const clone = JSON.parse(JSON.stringify(original));
    clone.id = generateId();
    clone.name = (clone.name || '') + ' (복사)';
    clone.key = clone.key + '_copy';
    clone.order = attributes.length;
    const newAttrs = [...attributes];
    newAttrs.splice(idx + 1, 0, clone);
    updateAttributes(newAttrs);
    toast.info(`"${original.name}" 속성이 복제되었습니다.`);
  };

  // --- Drag reorder ---
  const handleReorder = useCallback((fromIdx, toIdx) => {
    const newAttrs = [...attributes];
    const [dragged] = newAttrs.splice(fromIdx, 1);
    newAttrs.splice(toIdx, 0, dragged);
    newAttrs.forEach((a, i) => { a.order = i; });
    updateAttributes(newAttrs);
  }, [attributes, onChange, productOptions]);

  const { getDragProps, getDragStyle } = useDragReorder(handleReorder);

  // --- Render type badge ---
  const typeBadge = (type) => {
    const color = TYPE_COLORS[type] || '#6b7280';
    const label = ATTR_TYPES.find(t => t.value === type)?.label || type;
    return (
      <span style={{
        display: 'inline-block', padding: '0.1rem 0.4rem', borderRadius: '4px',
        fontSize: '0.72rem', fontWeight: '600', color: 'white', background: color,
      }}>
        {label}
      </span>
    );
  };

  return (
    <div>
      <div style={sectionTitleStyle}>
        <span>제품 옵션 속성 ({attributes.length}개)</span>
        <button
          onClick={handleAddAttribute}
          style={{ ...primaryBtnStyle, padding: '0.3rem 0.75rem', fontSize: '0.82rem' }}
        >
          + 속성 추가
        </button>
      </div>

      {attributes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '2rem', color: '#9ca3af',
          background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db',
        }}>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>속성이 없습니다.</p>
          <p style={{ fontSize: '0.82rem' }}>"속성 추가" 버튼을 클릭하여 색상 온도, 전압 등 제품 옵션을 추가하세요.</p>
        </div>
      ) : (
        attributes.map((attr, idx) => {
          const dragStyle = getDragStyle(idx);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={attr.id}
              style={{
                ...attrCardStyle,
                opacity: dragStyle.opacity,
                borderTop: dragStyle.borderTop || attrCardStyle.border,
                borderBottom: dragStyle.borderBottom || attrCardStyle.border,
                background: dragStyle.background || attrCardStyle.background,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Attribute header */}
              <div style={attrHeaderStyle}>
                <span
                  {...getDragProps(idx)}
                  style={{ ...dragHandleStyle, fontSize: '0.95rem' }}
                  title="드래그하여 순서 변경"
                >
                  ⠿
                </span>

                <span
                  onClick={() => handleRenameAttr(idx)}
                  style={{
                    fontWeight: '600', fontSize: '0.9rem', color: '#111827',
                    cursor: 'pointer', borderBottom: '1px dashed #d1d5db',
                  }}
                  title="클릭하여 이름 변경"
                >
                  {attr.name || '(이름 없음)'}
                </span>

                {typeBadge(attr.type)}

                {attr.unit && (
                  <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    ({attr.unit})
                  </span>
                )}

                <div style={{ flex: 1 }} />

                {/* Type selector */}
                <select
                  value={attr.type}
                  onChange={e => updateAttr(idx, 'type', e.target.value)}
                  style={attrTypeSelectStyle}
                >
                  {ATTR_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* Unit input */}
                <input
                  type="text"
                  value={attr.unit || ''}
                  onChange={e => updateAttr(idx, 'unit', e.target.value)}
                  placeholder="단위"
                  style={attrUnitInputStyle}
                  title="단위 (예: K, V, °)"
                />

                {/* Hover action buttons */}
                {isHovered && (
                  <div style={{ display: 'flex', gap: '0.15rem', marginLeft: '0.25rem' }}>
                    <button
                      onClick={() => handleDuplicateAttr(idx)}
                      style={iconBtnStyle('#6b7280')}
                      title="속성 복제"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => handleDeleteAttr(idx)}
                      style={iconBtnStyle('#ef4444')}
                      title="속성 삭제"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Values area */}
              {attr.type === 'text' ? (
                <input
                  type="text"
                  value={(attr.values && attr.values[0]) || ''}
                  onChange={e => updateAttr(idx, 'values', [e.target.value])}
                  placeholder="자유 텍스트 입력 (예: 0-10V / DALI / PWM)"
                  style={{ ...inputStyle, fontSize: '0.85rem' }}
                />
              ) : (
                <TagInput
                  values={attr.values || []}
                  onChange={vals => updateAttr(idx, 'values', vals)}
                  placeholder={
                    attr.type === 'range'
                      ? '범위 값 입력 (예: 15, 30, 60, 90)'
                      : '값 입력 후 Enter (예: 3000, 4500, 6500)'
                  }
                  unit={attr.unit || ''}
                />
              )}

              {/* Range min/max display */}
              {attr.type === 'range' && attr.values && attr.values.length >= 2 && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  범위: {attr.values[0]}{attr.unit} ~ {attr.values[attr.values.length - 1]}{attr.unit}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modals */}
      <InputModal
        isOpen={inputModal.open}
        title={inputModal.title}
        label={inputModal.label}
        placeholder={inputModal.placeholder}
        defaultValue={inputModal.defaultValue}
        onConfirm={inputModal.onConfirm}
        onCancel={() => setInputModal(prev => ({ ...prev, open: false }))}
      />
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        dangerLevel={confirmModal.dangerLevel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
