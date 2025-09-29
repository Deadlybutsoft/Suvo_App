import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizablePanelProps {
  children: [ReactNode, ReactNode];
  isLeftPanelHidden?: boolean;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({ children, isLeftPanelHidden = false }) => {
  const [panelWidth, setPanelWidth] = useState(450);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + moveEvent.clientX - startX;
      if (containerRef.current) {
         const maxWidth = containerRef.current.offsetWidth - 300; // a min width for the right panel
         setPanelWidth(Math.max(350, Math.min(newWidth, maxWidth)));
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [panelWidth]);

  return (
    <div ref={containerRef} className="flex flex-1 h-full">
      <div 
        style={{ width: `${panelWidth}px` }} 
        className={`h-full flex-shrink-0 ${isLeftPanelHidden ? 'hidden' : ''}`}
      >
        {children[0]}
      </div>
      <div 
        onMouseDown={handleMouseDown} 
        className={`w-px h-full cursor-col-resize flex-shrink-0 bg-slate-100 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors duration-200 ${isLeftPanelHidden ? 'hidden' : ''}`}
      />
      <div className="flex-1 h-full min-w-0">
        {children[1]}
      </div>
    </div>
  );
};