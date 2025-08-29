import React, { useRef, useState, useEffect, useCallback } from 'react';

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
  /** minimum width (default: 150px) */
  minWidth?: number;
  /** maximum width (default: no limit) */
  maxWidth?: number;
  /** minimum height (default: 60px) */
  minHeight?: number;
  /** hide when edges are selected */
  hideHandlesWhenEdgeSelected?: boolean;
  /** viewport for coordinate transformation */
  viewport?: { x: number; y: number; zoom: number };
  /** canvas ref for coordinate transformation */
  canvasRef?: React.RefObject<HTMLElement>;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  visibility = 'hover',
  nodeRef,
  resizable = true,
  onResize,
  onResizeEnd,
  onAutoResize,
  minWidth,
  maxWidth,
  minHeight,
  hideHandlesWhenEdgeSelected = false,
  viewport,
  canvasRef,
}) => {
  const handle = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [startW, setStartW] = useState(0);
  const [startH, setStartH] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const aspectRef = useRef(1);
  const [isDragging, setIsDragging] = useState(false); // For visual feedback

  // Helper function to transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!viewport || !canvasRef?.current) {
      console.log('[ResizeHandle] No viewport or canvasRef, using screen coordinates directly');
      return { x: screenX, y: screenY };
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const transformed = {
      x: (screenX - rect.left - viewport.x) / viewport.zoom,
      y: (screenY - rect.top - viewport.y) / viewport.zoom
    };
    console.log(`[ResizeHandle] Transform: screen(${screenX}, ${screenY}) -> canvas(${transformed.x.toFixed(1)}, ${transformed.y.toFixed(1)}) [zoom: ${viewport.zoom.toFixed(3)}]`);
    return transformed;
  }, [viewport, canvasRef]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging || !nodeRef.current) return;
      e.preventDefault();
      
      // Throttle resize events for better performance
      requestAnimationFrame(() => {
        if (!dragging || !nodeRef.current) return;
        
        // Apply viewport transformation to mouse coordinates if viewport is available
        let dx, dy;
        if (viewport && canvasRef?.current) {
          const startCanvas = screenToCanvas(startX, startY);
          const currentCanvas = screenToCanvas(e.clientX, e.clientY);
          dx = currentCanvas.x - startCanvas.x;
          dy = currentCanvas.y - startCanvas.y;
        } else {
          // Fallback to screen coordinates if no viewport transformation
          dx = e.clientX - startX;
          dy = e.clientY - startY;
        }

        let newW = startW;
        let newH = startH;

        // Fixed resize logic: calculate size changes based on corner position
        switch (position) {
          case 'top-left':
            // Dragging top-left: moving left/up decreases size, right/down increases size
            newW = startW - dx;
            newH = startH - dy;
            break;
          case 'top-right':
            // Dragging top-right: moving right increases width, up decreases height
            newW = startW + dx;
            newH = startH - dy;
            break;
          case 'bottom-left':
            // Dragging bottom-left: moving left decreases width, down increases height
            newW = startW - dx;
            newH = startH + dy;
            break;
          case 'bottom-right':
            // Dragging bottom-right: moving right/down increases size
            newW = startW + dx;
            newH = startH + dy;
            break;
        }

        console.log(`[ResizeHandle] Resizing ${position} - cursor: {${e.clientX}, ${e.clientY}}, delta: {${dx.toFixed(1)}, ${dy.toFixed(1)}}, new size: ${newW.toFixed(1)}x${newH.toFixed(1)}`);

      const preserveAspect = e.shiftKey;
      if (preserveAspect) {
        const ratio = aspectRef.current;
        if (Math.abs(dx) > Math.abs(dy)) {
          newH = newW / ratio;
        } else {
          newW = newH * ratio;
        }
      }

      // Apply constraints with reasonable defaults
      const finalMinWidth = minWidth || 80;
      const finalMinHeight = minHeight || 60;
      const finalMaxWidth = maxWidth || 2000;
      const finalMaxHeight = 1500;
      
      // Enforce constraints
      newW = Math.max(finalMinWidth, Math.min(finalMaxWidth, newW));
      newH = Math.max(finalMinHeight, Math.min(finalMaxHeight, newH));

        onResize?.(newW, newH, preserveAspect);
      });
    };

    const onMouseUp = () => {
      if (dragging) {
        setDragging(false);
        setIsDragging(false);
        onResizeEnd?.();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, position, startX, startY, startW, startH, nodeRef, onResize, onResizeEnd, screenToCanvas, viewport, canvasRef]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !nodeRef.current || hideHandlesWhenEdgeSelected) return;
    e.stopPropagation();
    e.preventDefault();

    // Get logical dimensions from computed style instead of visual bounding rect
    const computedStyle = window.getComputedStyle(nodeRef.current);
    const logicalWidth = parseFloat(computedStyle.width) || 200;
    const logicalHeight = parseFloat(computedStyle.height) || 100;
    
    setStartW(logicalWidth);
    setStartH(logicalHeight);
    setStartX(e.clientX);
    setStartY(e.clientY);
    aspectRef.current = logicalWidth / logicalHeight;
    setDragging(true);
    setIsDragging(true);
    
    console.log(`[ResizeHandle] Starting resize ${position} - Logical dimensions: ${logicalWidth.toFixed(1)}x${logicalHeight.toFixed(1)}, cursor: {${e.clientX}, ${e.clientY}}, viewport: {x: ${viewport?.x || 0}, y: ${viewport?.y || 0}, zoom: ${viewport?.zoom || 1}}`);
  };

  const styles: React.CSSProperties = {
    position: 'absolute',
    width: isDragging ? 16 : 12, // Larger when dragging for better visual feedback
    height: isDragging ? 16 : 12,
    background: isDragging ? '#1d4ed8' : '#fff', // Blue when dragging
    border: `2px solid ${isDragging ? '#1e40af' : '#3b82f6'}`,
    borderRadius: 3,
    zIndex: 30,
    cursor:
      position === 'top-left'
        ? 'nwse-resize'
        : position === 'top-right'
        ? 'nesw-resize'
        : position === 'bottom-left'
        ? 'nesw-resize'
        : 'nwse-resize',
    opacity: hideHandlesWhenEdgeSelected ? 0 : (visibility === 'always' ? 1 : 0),
    transition: isDragging ? 'none' : 'all 0.2s ease-out', // Smooth transitions except when dragging
    transform: isDragging ? 'scale(1.1)' : 'scale(1)', // Slightly larger when dragging
    boxShadow: isDragging ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    top: position?.includes('top') ? (isDragging ? -8 : -6) : undefined,
    bottom: position?.includes('bottom') ? (isDragging ? -8 : -6) : undefined,
    left: position?.includes('left') ? (isDragging ? -8 : -6) : undefined,
    right: position?.includes('right') ? (isDragging ? -8 : -6) : undefined,
    pointerEvents: (resizable && !hideHandlesWhenEdgeSelected) ? 'all' : 'none',
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