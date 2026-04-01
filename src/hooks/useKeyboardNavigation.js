'use client';

import { useCallback, useRef } from 'react';

export default function useKeyboardNavigation(containerRef) {
  const originalValueRef = useRef('');

  const getCells = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll('[data-row][data-col]'));
  }, [containerRef]);

  const findCell = useCallback((row, col) => {
    if (!containerRef.current) return null;
    return containerRef.current.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }, [containerRef]);

  const getMaxRowCol = useCallback(() => {
    const cells = getCells();
    let maxRow = 0, maxCol = 0;
    cells.forEach(cell => {
      maxRow = Math.max(maxRow, parseInt(cell.dataset.row));
      maxCol = Math.max(maxCol, parseInt(cell.dataset.col));
    });
    return { maxRow, maxCol };
  }, [getCells]);

  const handleCellKeyDown = useCallback((e, row, col, onEscapeRevert) => {
    const { maxRow, maxCol } = getMaxRowCol();

    if (e.key === 'Tab') {
      e.preventDefault();
      let nextRow = row, nextCol = col;
      if (e.shiftKey) {
        nextCol--;
        if (nextCol < 0) { nextCol = maxCol; nextRow--; }
        if (nextRow < 0) { nextRow = maxRow; nextCol = maxCol; }
      } else {
        nextCol++;
        if (nextCol > maxCol) { nextCol = 0; nextRow++; }
        if (nextRow > maxRow) { nextRow = 0; nextCol = 0; }
      }
      const target = findCell(nextRow, nextCol);
      if (target) target.focus();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const nextRow = row + 1 <= maxRow ? row + 1 : 0;
      const target = findCell(nextRow, col);
      if (target) target.focus();
    } else if (e.key === 'Escape') {
      if (onEscapeRevert) onEscapeRevert(originalValueRef.current);
      e.target.blur();
    }
  }, [getMaxRowCol, findCell]);

  const handleCellFocus = useCallback((currentValue) => {
    originalValueRef.current = currentValue;
  }, []);

  return { handleCellKeyDown, handleCellFocus };
}
