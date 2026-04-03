import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  storageKey?: string;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth = 500,
  minWidth = 320,
  maxWidth = 900,
  onWidthChange,
  storageKey = 'app-preview-panel-width',
  className,
}) => {
  const { theme } = useTheme();
  const [width, setWidth] = useState(() => {
    // Try to load from localStorage
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    }
    return defaultWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Save to localStorage when width changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, width.toString());
    }
    onWidthChange?.(width);
  }, [width, storageKey, onWidthChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // Calculate new width (dragging left increases width since panel is on right)
    const deltaX = startXRef.current - e.clientX;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + deltaX));

    setWidth(newWidth);
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startWidthRef.current = width;
  }, [width]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;

    const deltaX = startXRef.current - e.touches[0].clientX;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + deltaX));

    setWidth(newWidth);
  }, [isDragging, minWidth, maxWidth]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "relative flex h-full",
        isDragging && "select-none",
        className
      )}
      style={{ width: `${width}px`, flexShrink: 0 }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10",
          "hover:bg-[#0D9488]/50 active:bg-[#0D9488]/70 transition-colors",
          isDragging && "bg-[#0D9488]/70",
          theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-slate-200'
        )}
      >
        {/* Drag indicator dots */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 hover:opacity-100 transition-opacity">
          <div className={cn(
            "w-1 h-1 rounded-full",
            theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'
          )} />
          <div className={cn(
            "w-1 h-1 rounded-full",
            theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'
          )} />
          <div className={cn(
            "w-1 h-1 rounded-full",
            theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'
          )} />
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 ml-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ResizablePanel;
