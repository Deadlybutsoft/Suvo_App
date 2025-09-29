import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizableVerticalPanelProps {
  topContent: ReactNode;
  bottomContent: ReactNode;
  initialTopHeight?: number;
}

export const ResizableVerticalPanel: React.FC<ResizableVerticalPanelProps> = ({
  topContent,
  bottomContent,
  initialTopHeight = 70, // Default to 70% height for the top panel
}) => {
  const [topHeight, setTopHeight] = useState(initialTopHeight);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const containerHeight = containerRef.current?.offsetHeight ?? 0;
    const startPixelHeight = (topHeight / 100) * containerHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newPixelHeight = startPixelHeight + deltaY;
      
      if (containerHeight > 0) {
        const newTopHeightPercent = (newPixelHeight / containerHeight) * 100;
        // Clamp values between 20% and 80% to prevent collapsing
        setTopHeight(Math.max(20, Math.min(newTopHeightPercent, 80)));
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [topHeight]);

  if (!bottomContent) {
    return <div className="h-full w-full">{topContent}</div>;
  }

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col">
      <div style={{ height: `${topHeight}%`, minHeight: 0 }}>
        {topContent}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-full h-1.5 cursor-row-resize flex-shrink-0 bg-zinc-900 hover:bg-zinc-700 transition-colors duration-200"
        title="Resize panels"
      />
      <div className="flex-1 min-h-0">
        {bottomContent}
      </div>
    </div>
  );
};
