'use client';

import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export default function useUndoRedo(initialState) {
  const [state, _setState] = useState(initialState);
  const pastRef = useRef([]);
  const futureRef = useRef([]);

  const setState = useCallback((newState) => {
    _setState(prev => {
      const snapshot = JSON.stringify(prev);
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), snapshot];
      futureRef.current = [];
      return typeof newState === 'function' ? newState(prev) : newState;
    });
  }, []);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    _setState(prev => {
      futureRef.current = [JSON.stringify(prev), ...futureRef.current];
      const previous = pastRef.current.pop();
      return JSON.parse(previous);
    });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    _setState(prev => {
      pastRef.current = [...pastRef.current, JSON.stringify(prev)];
      const [next, ...rest] = futureRef.current;
      futureRef.current = rest;
      return JSON.parse(next);
    });
  }, []);

  const reset = useCallback((newState) => {
    pastRef.current = [];
    futureRef.current = [];
    _setState(newState);
  }, []);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  return { state, setState, undo, redo, canUndo, canRedo, reset };
}
