import React, { useState, useCallback, useRef } from 'react';

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectionBoxProps {
  onSelectArea?: (rect: SelectionRect) => void;
  className?: string;
  disabled?: boolean;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  onSelectArea,
  className = '',
  disabled = false
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getSelectionRect = useCallback((): SelectionRect => {
    const minX = Math.min(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const maxX = Math.max(startPoint.x, currentPoint.x);
    const maxY = Math.max(startPoint.y, currentPoint.y);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }, [startPoint, currentPoint]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    // Only start selection on left click and not on interactive elements
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('[data-kiteframe-node]') || target.closest('[data-kiteframe-edge]')) {
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
    setIsSelecting(true);
    
    e.preventDefault();
  }, [disabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || disabled) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPoint({ x, y });
  }, [isSelecting, disabled]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || disabled) return;
    
    const rect = getSelectionRect();
    
    // Only trigger selection if the area is large enough
    if (rect.width > 5 && rect.height > 5) {
      onSelectArea?.(rect);
    }
    
    setIsSelecting(false);
  }, [isSelecting, disabled, getSelectionRect, onSelectArea]);

  const selectionRect = getSelectionRect();

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
    >
      {isSelecting && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/10 backdrop-blur-sm rounded-sm"
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};