import React, { useRef, useState, useEffect } from 'react';

export type HandlePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ResizeHandleProps {
  /** which corner */
  position: HandlePosition;
  /** when to show: on hover or always */
  visibility?: 'hover' | 'always';
  /** ref to the element being resized */
  nodeRef: React.RefObject<HTMLElement>;
  /** enabled or not */
  resizable?: boolean;
  /** callback while dragging */
  onResize?: (width: number, height: number, preserveAspect: boolean) => void;
  /** callback when drag ends */
  onResizeEnd?: () => void;
  /** callback when double-clicked for auto-resize */
  onAutoResize?: () => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  visibility = 'hover',
  nodeRef,
  resizable = true,
  onResize,
  onResizeEnd,
  onAutoResize,
}) => {
  const handle = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [startW, setStartW] = useState(0);
  const [startH, setStartH] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const aspectRef = useRef(1);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging || !nodeRef.current) return;
      e.preventDefault();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = startW;
      let newH = startH;

      if (position.includes('right')) newW = startW + dx;
      else newW = startW - dx;

      if (position.includes('bottom')) newH = startH + dy;
      else newH = startH - dy;

      const preserveAspect = e.shiftKey;
      if (preserveAspect) {
        const ratio = aspectRef.current;
        if (Math.abs(dx) > Math.abs(dy)) {
          newH = newW / ratio;
        } else {
          newW = newH * ratio;
        }
      }

      newW = Math.max(20, newW);
      newH = Math.max(20, newH);

      onResize?.(newW, newH, preserveAspect);
    };

    const onMouseUp = () => {
      if (dragging) {
        setDragging(false);
        onResizeEnd?.();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, position, startX, startY, startW, startH, nodeRef, onResize, onResizeEnd]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !nodeRef.current) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = nodeRef.current.getBoundingClientRect();
    setStartW(rect.width);
    setStartH(rect.height);
    setStartX(e.clientX);
    setStartY(e.clientY);
    aspectRef.current = rect.width / rect.height;
    setDragging(true);
  };

  const styles: React.CSSProperties = {
    position: 'absolute',
    width: 12,
    height: 12,
    background: '#fff',
    border: '2px solid #3b82f6',
    borderRadius: 2,
    zIndex: 30,
    cursor:
      position === 'top-left'
        ? 'nwse-resize'
        : position === 'top-right'
        ? 'nesw-resize'
        : position === 'bottom-left'
        ? 'nesw-resize'
        : 'nwse-resize',
    opacity: visibility === 'always' ? 1 : 0,
    transition: 'opacity 0.2s',
    top: position.includes('top') ? -6 : undefined,
    bottom: position.includes('bottom') ? -6 : undefined,
    left: position.includes('left') ? -6 : undefined,
    right: position.includes('right') ? -6 : undefined,
    pointerEvents: resizable ? 'all' : 'none',
  };

  return (
    <div
      ref={handle}
      style={styles}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAutoResize?.();
      }}
      onMouseEnter={(e) => {
        if (visibility === 'hover') (e.currentTarget.style.opacity = '1');
      }}
      onMouseLeave={(e) => {
        if (visibility === 'hover' && !dragging) (e.currentTarget.style.opacity = '0');
      }}
    />
  );
};