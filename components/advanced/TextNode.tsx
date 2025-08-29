import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';

export interface TextNodeData {
  label: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textColor: string;
  textDecoration: 'none' | 'underline' | 'strikethrough';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  [key: string]: any;
}

interface TextNodeProps {
  node: Node & { data: TextNodeData };
  onUpdate?: (updates: Partial<TextNodeData>) => void;
  onResize?: (width: number, height: number) => void;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  onExitEdit?: () => void;
}

export const TextNode: React.FC<TextNodeProps> = ({
  node,
  onUpdate,
  onResize,
  style,
  autoFocus = false,
  onExitEdit
}) => {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const [text, setText] = useState(node.data.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState({ width: 200, height: 40 });
  
  // Mobile touch handling
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Auto-focus when component mounts if autoFocus is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setIsEditing(true);
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Auto-resize based on content - using refs to avoid infinite loops
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    if (measureRef.current) {
      const width = Math.max(200, Math.min(400, measureRef.current.scrollWidth + 20));
      const height = Math.max(40, measureRef.current.scrollHeight + 20);
      
      setTextSize(prevSize => {
        // Only update if dimensions actually changed to prevent unnecessary renders
        if (prevSize.width !== width || prevSize.height !== height) {
          // Use timeout to avoid calling onResize during render
          setTimeout(() => {
            onResizeRef.current?.(width, height);
          }, 0);
          return { width, height };
        }
        return prevSize;
      });
    }
  }, [text, node.data.fontSize, node.data.fontFamily, node.data.lineHeight]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onUpdate?.({ ...node.data, text: newText });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartTime(Date.now());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touchDuration = Date.now() - touchStartTime;
    const now = Date.now();
    
    // If it's a short tap (less than 300ms)
    if (touchDuration < 300) {
      // Check for double-tap (two taps within 500ms)
      if (now - lastTapTime < 500) {
        setIsEditing(true);
        setLastTapTime(0); // Reset to prevent triple-tap issues
      } else {
        setLastTapTime(now);
        // Single tap - also enter edit mode for better mobile UX
        setTimeout(() => {
          if (Date.now() - lastTapTime >= 400) {
            setIsEditing(true);
          }
        }, 400);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // On mobile devices, also allow single click to edit for better accessibility
    if ('ontouchstart' in window) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onExitEdit?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      onExitEdit?.();
      e.stopPropagation();
    }
    // Allow other keys to propagate for text editing
  };

  const textStyles: React.CSSProperties = {
    fontSize: node.data.fontSize || 16,
    fontFamily: node.data.fontFamily || 'Inter, system-ui, sans-serif',
    fontWeight: node.data.fontWeight || 'normal',
    textAlign: node.data.textAlign || 'left',
    lineHeight: node.data.lineHeight || 1.4,
    letterSpacing: node.data.letterSpacing || 0,
    color: node.data.textColor || 'hsl(var(--foreground))',
    textDecoration: node.data.textDecoration || 'none',
    textTransform: node.data.textTransform || 'none',
  };

  return (
    <DefaultNode
      node={{
        ...node,
        style: {
          ...node.style,
          width: textSize.width,
          height: textSize.height
        }
      }}
      onDoubleClick={handleDoubleClick}
      onDrag={() => {}} // Text nodes don't need special drag handling
    >
      <div className="relative w-full h-full">
        {/* Hidden measuring div for auto-sizing */}
        <div
          ref={measureRef}
          className="absolute invisible whitespace-pre-wrap break-words p-2"
          style={{
            ...textStyles,
            width: '400px', // Max width for measuring
            minHeight: '40px'
          }}
        >
          {text || 'Type something...'}
        </div>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Type something..."
            className="w-full h-full p-2 bg-transparent border-2 border-blue-500 rounded resize-none outline-none"
            style={{
              ...textStyles,
              background: 'rgba(59, 130, 246, 0.05)',
            }}
          />
        ) : (
          <div
            className="w-full h-full p-2 cursor-text hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-colors touch-manipulation"
            style={textStyles}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
          >
            {text || (
              <span className="text-gray-400 italic">
                Type something...
              </span>
            )}
          </div>
        )}
      </div>
    </DefaultNode>
  );
};