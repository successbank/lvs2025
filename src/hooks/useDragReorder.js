'use client';

import { useState, useCallback } from 'react';

export default function useDragReorder(onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const getDragProps = useCallback((index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, index),
    onDragOver: (e) => handleDragOver(e, index),
    onDrop: (e) => handleDrop(e, index),
    onDragEnd: handleDragEnd,
  }), [handleDragStart, handleDragOver, handleDrop, handleDragEnd]);

  const getDragStyle = useCallback((index) => {
    const isDragging = dragIndex === index;
    const isOver = dragOverIndex === index && dragIndex !== null && dragIndex !== index;
    const insertAbove = isOver && dragIndex > index;
    const insertBelow = isOver && dragIndex < index;
    return {
      opacity: isDragging ? 0.4 : 1,
      background: isOver ? '#eff6ff' : undefined,
      borderTop: insertAbove ? '2px solid #3b82f6' : undefined,
      borderBottom: insertBelow ? '2px solid #3b82f6' : undefined,
      transition: 'background 0.15s ease',
    };
  }, [dragIndex, dragOverIndex]);

  return { getDragProps, getDragStyle, dragIndex };
}
