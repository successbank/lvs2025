'use client';

import { useState, useRef } from 'react';
import {
  tagInputContainerStyle, tagStyle, tagRemoveStyle, tagInputFieldStyle,
} from './styles';

export default function TagInput({ values = [], onChange, placeholder = '값 입력 후 Enter', unit = '' }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addValue = (raw) => {
    const val = raw.trim();
    if (!val) return false;
    if (values.some(v => v.toLowerCase() === val.toLowerCase())) return 'duplicate';
    onChange([...values, val]);
    return true;
  };

  const removeValue = (idx) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const result = addValue(input);
      if (result === true) setInput('');
      // duplicate: keep input so user sees what they typed
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      removeValue(values.length - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const items = text.split(/[,;\n\t]+/).map(s => s.trim()).filter(Boolean);
    const newValues = [...values];
    items.forEach(item => {
      if (!newValues.some(v => v.toLowerCase() === item.toLowerCase())) {
        newValues.push(item);
      }
    });
    onChange(newValues);
    setInput('');
  };

  const displayValue = (val) => unit ? `${val}${unit}` : val;

  return (
    <div
      style={tagInputContainerStyle}
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((val, idx) => (
        <span key={idx} style={tagStyle}>
          {displayValue(val)}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeValue(idx); }}
            style={tagRemoveStyle}
            title="삭제"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={values.length === 0 ? placeholder : ''}
        style={tagInputFieldStyle}
      />
    </div>
  );
}
