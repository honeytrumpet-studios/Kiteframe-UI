import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CommentMarkerProps {
  x: number;
  y: number;
  count: number;
  userColor?: string;
  userName?: string;
  userPhotoURL?: string | null;
  isSelected?: boolean;
  isResolved?: boolean;
  onClick: () => void;
  className?: string;
  comment?: {
    content: string;
    userName: string;
    timestamp: number;
  };
  onPositionChange?: (newPosition: { x: number; y: number }) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export const CommentMarker: React.FC<CommentMarkerProps> = ({ 
  x, 
  y, 
  count, 
  userColor = '#8B5CF6', // Figma's purple
  userName = 'U',
  userPhotoURL = null,
  isSelected = false,
  isResolved = false,
  onClick,
  className = '',
  comment,
  onPositionChange,
  canvasRef
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseDownPosition, setMouseDownPosition] = useState<{ x: number; y: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);
  
  const DRAG_THRESHOLD = 5; // pixels
  // Drag handlers for comment position
  const handleMouseDown = (e: React.MouseEvent) => {
    // Track initial mouse position for click vs drag detection
    setMouseDownPosition({ x: e.clientX, y: e.clientY });
    setHasMoved(false);
    
    // Set up drag state regardless of preview visibility
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y,
    });
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (mouseDownPosition) {
      const deltaX = e.clientX - mouseDownPosition.x;
      const deltaY = e.clientY - mouseDownPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Start dragging if threshold exceeded
      if (distance > DRAG_THRESHOLD && !isDragging) {
        setIsDragging(true);
        setHasMoved(true);
      }
      
      // Update position if dragging and not selected
      if (isDragging && !isSelected && onPositionChange) {
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };
        onPositionChange(newPosition);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setMouseDownPosition(null);
    
    // Reset hasMoved after a brief delay to ensure onClick doesn't fire immediately
    setTimeout(() => setHasMoved(false), 10);
  };

  // Set up global event listeners for dragging
  React.useEffect(() => {
    if (mouseDownPosition) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [mouseDownPosition, isDragging, dragStart, isSelected]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Calculate proper screen coordinates for the hover preview
  const getPreviewPosition = () => {
    let screenX = x + 20;
    let screenY = y - 10;
    
    if (canvasRef?.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      screenX = canvasRect.left + x + 20;
      screenY = canvasRect.top + y - 10;
    }
    
    return { screenX, screenY };
  };

  return (
    <>
      <div
        ref={markerRef}
        className={cn(
          "absolute cursor-pointer transition-all duration-200 hover:scale-110",
          className
        )}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
          zIndex: 8,
        }}
        data-comment-marker="true"
        onClick={!hasMoved ? onClick : undefined}
        onMouseEnter={() => comment && setShowPreview(true)}
        onMouseLeave={() => !isDragging && setShowPreview(false)}
        onMouseDown={handleMouseDown}
      >
        {/* Simple circular avatar like Figma */}
        {userPhotoURL ? (
          <img
            src={userPhotoURL}
            alt={userName}
            className={cn(
              "w-8 h-8 rounded-full shadow-md transition-all duration-200 object-cover",
              isSelected && "ring-2 ring-blue-400 ring-offset-2",
              isResolved && "opacity-60"
            )}
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md transition-all duration-200",
              isSelected && "ring-2 ring-blue-400 ring-offset-2",
              isResolved && "opacity-60"
            )}
            style={{ 
              backgroundColor: userColor,
              cursor: 'pointer'
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Reply count badge - only show if there are replies */}
        {count > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold shadow-sm">
            {count > 9 ? '9+' : count}
          </div>
        )}
      </div>

      {/* Hover preview like Figma - positioned correctly */}
      {showPreview && comment && (
        <div
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] max-w-[300px]"
          style={{
            left: `${getPreviewPosition().screenX}px`,
            top: `${getPreviewPosition().screenY}px`,
            pointerEvents: isDragging ? 'none' : 'auto',
            zIndex: 9999, // Much higher z-index to appear above everything
          }}
        >
          <div className="flex items-start space-x-2">
            {userPhotoURL ? (
              <img
                src={userPhotoURL}
                alt={userName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: userColor }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {comment.userName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(comment.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};