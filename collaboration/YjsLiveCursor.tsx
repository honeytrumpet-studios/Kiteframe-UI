import React, { useCallback, useEffect, useRef } from 'react';
import { useYjsAwareness } from './useYjsAwareness';
import { MousePointer2 } from 'lucide-react';

interface YjsLiveCursorProps {
  canvasRef: React.RefObject<HTMLElement>;
  viewport?: { x: number; y: number; zoom: number };
  throttleMs?: number;
}

export const YjsLiveCursor: React.FC<YjsLiveCursorProps> = ({
  canvasRef,
  viewport = { x: 0, y: 0, zoom: 1 },
  throttleMs = 50,
}) => {
  const [awarenessState, awarenessActions] = useYjsAwareness();
  const lastUpdateRef = useRef<number>(0);
  const isMouseInsideRef = useRef(false);

  // Transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = screenX - rect.left;
    const relativeY = screenY - rect.top;
    
    // Transform to canvas coordinates accounting for viewport
    const canvasX = (relativeX - viewport.x) / viewport.zoom;
    const canvasY = (relativeY - viewport.y) / viewport.zoom;
    
    return { x: canvasX, y: canvasY };
  }, [viewport, canvasRef]);

  // Transform canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = (canvasX * viewport.zoom + viewport.x) + rect.left;
    const screenY = (canvasY * viewport.zoom + viewport.y) + rect.top;
    
    return { x: screenX, y: screenY };
  }, [viewport, canvasRef]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !isMouseInsideRef.current) return;
      
      const now = Date.now();
      if (now - lastUpdateRef.current < throttleMs) return;
      
      lastUpdateRef.current = now;
      
      const canvasPosition = screenToCanvas(e.clientX, e.clientY);
      awarenessActions.updateCursor(canvasPosition);
    };

    const handleMouseEnter = () => {
      isMouseInsideRef.current = true;
    };

    const handleMouseLeave = () => {
      isMouseInsideRef.current = false;
      awarenessActions.updateCursor(null);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [canvasRef, throttleMs, screenToCanvas, awarenessActions]);

  // Render other users' cursors
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {awarenessState.cursors.map((user) => {
        const screenPosition = canvasToScreen(user.cursor.x, user.cursor.y);
        
        return (
          <div
            key={user.id}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: screenPosition.x,
              top: screenPosition.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor pointer */}
            <div
              className="relative"
              style={{ color: user.color }}
            >
              <MousePointer2 className="w-5 h-5 drop-shadow-sm" />
              
              {/* User label */}
              <div
                className="absolute left-6 top-0 px-2 py-1 text-xs font-medium text-white rounded shadow-lg whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};