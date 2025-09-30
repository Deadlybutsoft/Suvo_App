import React, { useRef, useEffect, useCallback } from 'react';

interface DragOptions {
  onDrag: (pos: { x: number; y: number }) => void;
  onDragEnd?: () => void;
}

export const useDrag = ({ onDrag, onDragEnd }: DragOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
    const y = Math.max(0, Math.min((clientY - rect.top) / rect.height, 1));
    return { x, y };
  }, []);

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const pos = 'touches' in e ? e.touches[0] : e;
    onDrag(getRelativePosition(pos.clientX, pos.clientY));
  }, [getRelativePosition, onDrag]);

  const handleDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    isDraggingRef.current = false;
    onDragEnd?.();

    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('touchmove', handleDrag);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchend', handleDragEnd);
  }, [handleDrag, onDragEnd]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const pos = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0] : e.nativeEvent;
    onDrag(getRelativePosition(pos.clientX, pos.clientY));

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
  }, [getRelativePosition, handleDrag, handleDragEnd, onDrag]);

  return { containerRef, onDragStart: handleDragStart };
};