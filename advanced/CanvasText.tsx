import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TextFormattingToolbar } from './TextFormattingToolbar';
import { ExternalLink, Edit, X } from 'lucide-react';

// Helper function to get CSS font-weight from our weight value
const getFontWeightCSS = (weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'): number => {
  const weightMap = {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  };
  return weightMap[weight];
};

export interface CanvasTextData {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;  // For adaptive text color calculation
  width?: number;
  height?: number;
  parentFrameId?: string;
  selected?: boolean;
  isEditing?: boolean;
  url?: string;
}

interface CanvasTextProps {
  data: CanvasTextData;
  onUpdate: (id: string, updates: Partial<CanvasTextData>) => void;
  onDelete: (id: string) => void;
  viewport: { x: number; y: number; zoom: number };
  onStartDrag?: (id: string, startPos: { x: number; y: number }) => void;
  onDrag?: (id: string, newPos: { x: number; y: number }) => void;
  onEndDrag?: (id: string) => void;
  onClick?: (id: string) => void;
}

export function CanvasText({
  data,
  onUpdate,
  onDelete,
  viewport,
  onStartDrag,
  onDrag,
  onEndDrag,
  onClick
}: CanvasTextProps) {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [editText, setEditText] = useState(data.text);
  const [clickCount, setClickCount] = useState(0);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showUrlPopover, setShowUrlPopover] = useState(false);

  // Track edit mode from props and sync local state
  useEffect(() => {
    if (data.isEditing !== undefined) {
      setIsEditing(data.isEditing);
    }
  }, [data.isEditing]);

  // Auto-focus on creation if text is empty or in edit mode
  useEffect(() => {
    if ((data.text === '' && !isEditing) || data.isEditing) {
      setIsEditing(true);
    }
  }, [data.isEditing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textRef.current) {
      // Use setTimeout to ensure the textarea is rendered before focusing
      setTimeout(() => {
        textRef.current?.focus();
        if (data.text === '') {
          // For new empty text, position cursor at start
          textRef.current?.setSelectionRange(0, 0);
        } else {
          // For existing text, select all
          textRef.current?.select();
        }
      }, 50);
    }
  }, [isEditing, data.text]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Text Click] Text clicked:', data.id, 'current state:', { selected: data.selected, isEditing: data.isEditing });
    
    // Prevent click during drag
    if (isDragging) {
      console.log('[Text Click] Ignoring click during drag');
      return;
    }
    
    // If text has a URL and we're not in editing mode, show popover
    if (data.url && !data.isEditing && !data.selected) {
      console.log('[Text Click] Showing URL popover for:', data.url);
      setShowUrlPopover(true);
      return;
    }
    
    // Two-click system for existing text
    if (!data.isEditing) {
      if (data.selected) {
        // Second click on selected text - enter edit mode
        console.log('[Text Click] Second click - entering edit mode');
        setIsEditing(true);
        setEditText(data.text);
        onUpdate(data.id, { isEditing: true, selected: true });
      } else {
        // First click - select text and show formatting toolbar + resize handles
        console.log('[Text Click] First click - selecting text and showing toolbar');
        onClick?.(data.id);
        onUpdate(data.id, { selected: true, isEditing: false });
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    
    // Don't delete newly created text objects immediately - give user time to type
    const textAge = Date.now() - parseInt(data.id.split('-')[1] || '0');
    const isNewlyCreated = textAge < 500; // Less than 500ms old
    
    // Don't delete text objects that have URLs even if text is empty
    if (editText.trim() === '' && !isNewlyCreated && !data.url) {
      console.log('[Text Delete] Deleting text:', data.id, '(age:', textAge, 'ms)');
      onDelete(data.id);
    } else if (editText.trim() === '' && (isNewlyCreated || data.url)) {
      console.log('[Text Delete] Skipping deletion of newly created text or text with URL:', data.id, '(age:', textAge, 'ms, hasUrl:', !!data.url, ')');
      // Keep the empty text object selected but not editing
      onUpdate(data.id, { isEditing: false, selected: true });
    } else if (editText !== data.text) {
      onUpdate(data.id, { text: editText, isEditing: false, selected: true });
    } else {
      // Update to exit edit mode and stay selected
      onUpdate(data.id, { isEditing: false, selected: true });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      // For newly created empty text, delete on Escape instead of keeping empty
      const textAge = Date.now() - parseInt(data.id.split('-')[1] || '0');
      const isNewlyCreated = textAge < 2000; // Less than 2 seconds old
      
      if (data.text === '' && isNewlyCreated) {
        console.log('[Text Delete] Deleting empty text on Escape:', data.id);
        onDelete(data.id);
      } else {
        setEditText(data.text);
        setIsEditing(false);
        onUpdate(data.id, { isEditing: false, selected: true });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    
    console.log('[Text Drag] Mouse down on text:', data.id, 'at position:', data.position);

    setIsDragging(true);
    
    // Store the initial mouse position in world coordinates
    const initialMouseWorldX = (e.clientX - viewport.x) / viewport.zoom;
    const initialMouseWorldY = (e.clientY - viewport.y) / viewport.zoom;
    
    // Calculate offset in world space (difference between mouse and text position)
    const offsetX = initialMouseWorldX - data.position.x;
    const offsetY = initialMouseWorldY - data.position.y;
    
    console.log('[Text Drag] Drag start:', { 
      mouseClient: { x: e.clientX, y: e.clientY },
      mouseWorld: { x: initialMouseWorldX, y: initialMouseWorldY },
      textPosition: data.position,
      offset: { x: offsetX, y: offsetY }
    });
    
    setDragStart({ x: offsetX, y: offsetY });

    onStartDrag?.(data.id, data.position);

    const handleMouseMove = (e: MouseEvent) => {
      // Convert current mouse position to world coordinates
      const currentMouseWorldX = (e.clientX - viewport.x) / viewport.zoom;
      const currentMouseWorldY = (e.clientY - viewport.y) / viewport.zoom;
      
      // Apply the offset to get new text position
      const newX = currentMouseWorldX - offsetX;
      const newY = currentMouseWorldY - offsetY;
      
      console.log('[Text Drag] Mouse move:', { 
        mouseClient: { x: e.clientX, y: e.clientY },
        mouseWorld: { x: currentMouseWorldX, y: currentMouseWorldY },
        newPosition: { x: newX, y: newY },
        offset: { x: offsetX, y: offsetY }
      });
      
      onDrag?.(data.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onEndDrag?.(data.id);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate actual text dimensions based on content and font
  const actualWidth = data.width || Math.max(100, (data.text.length * (data.fontSize || 16) * 0.6));
  const actualHeight = data.height || Math.max(24, Math.ceil(data.text.split('\n').length * (data.fontSize || 16) * 1.2));

  // Get adaptive text color like nodes do - theme-aware by default but adaptive to background
  const getAdaptiveTextColor = (backgroundColor?: string) => {
    // If no background, use theme-aware default
    if (!backgroundColor) {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? '#ffffff' : '#000000';
    }
    
    // If background is provided, calculate adaptive color for readability
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance using standard formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return dark text for light backgrounds, light text for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Theme detection for default text color
  const getDefaultTextColor = () => {
    // Check if we're in dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const classes = document.documentElement.classList.toString();
    
    console.log('[CanvasText Color] Theme detection:', {
      textId: data.id,
      isDark,
      classes,
      hasCustomColor: !!data.color,
      backgroundColor: data.backgroundColor
    });
    
    // Use theme-aware colors - dark text in light mode, light text in dark mode
    return isDark ? '#ffffff' : '#000000';
  };
  
  // Calculate adaptive color on every render to be reactive to changes
  const textColor = data.color || (data.backgroundColor ? getAdaptiveTextColor(data.backgroundColor) : getDefaultTextColor());
  
  // Force re-render when theme changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const observer = new MutationObserver(() => {
      forceUpdate({});
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Use theme-aware default if no color specified
  const finalTextColor = textColor || getDefaultTextColor();

  const style: React.CSSProperties = {
    position: 'absolute',
    left: data.position.x * viewport.zoom + viewport.x,
    top: data.position.y * viewport.zoom + viewport.y,
    fontSize: (data.fontSize || 16) * viewport.zoom,
    fontFamily: data.fontFamily || 'Inter, system-ui, sans-serif',
    fontWeight: getFontWeightCSS(data.fontWeight || 'normal'),
    textAlign: data.textAlign || 'left',
    color: finalTextColor,
    width: actualWidth * viewport.zoom,
    height: actualHeight * viewport.zoom,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: isEditing ? 'text' : 'none',
    pointerEvents: 'auto'
  };

  if (isEditing) {
    return (
      <>
        <div style={style} className="pointer-events-auto">
          <textarea
            ref={textRef}
            value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "resize-none outline-none border-none rounded px-1 py-0",
            "bg-transparent min-h-[1.2em] leading-tight",
            "focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          )}
          style={{
            fontSize: (data.fontSize || 16) * viewport.zoom,
            fontFamily: data.fontFamily || 'Inter, system-ui, sans-serif',
            fontWeight: getFontWeightCSS(data.fontWeight || 'normal'),
            textAlign: data.textAlign || 'left',
            color: finalTextColor,
            width: actualWidth * viewport.zoom,
            height: actualHeight * viewport.zoom,
            minWidth: actualWidth * viewport.zoom,
            minHeight: actualHeight * viewport.zoom,
            overflow: 'hidden',
            lineHeight: '1.2'
          }}
        />
        </div>
        
        {/* Text Formatting Toolbar - show when selected or editing */}
        {(data.selected || isEditing) && (() => {
          console.log('[Text Toolbar] Rendering formatting toolbar for:', data.id, 'selected:', data.selected, 'isEditing:', isEditing);
          return (
            <TextFormattingToolbar
              position={{
                x: (data.position.x * viewport.zoom) + viewport.x + actualWidth * viewport.zoom / 2,
                y: (data.position.y * viewport.zoom) + viewport.y - 10
              }}
              fontSize={data.fontSize || 16}
              fontFamily={data.fontFamily || 'Inter, system-ui, sans-serif'}
              fontWeight={data.fontWeight || 'normal'}
              textAlign={data.textAlign || 'left'}
              color={data.color || finalTextColor}
              text={data.text || ''}
              url={data.url}
              onFontSizeChange={(size) => onUpdate(data.id, { fontSize: size })}
              onFontFamilyChange={(family) => onUpdate(data.id, { fontFamily: family })}
              onFontWeightChange={(weight) => onUpdate(data.id, { fontWeight: weight })}
              onTextAlignChange={(align) => onUpdate(data.id, { textAlign: align })}
              onColorChange={(color) => onUpdate(data.id, { color })}
              onTextChange={(text) => onUpdate(data.id, { text })}
              onUrlChange={(url) => onUpdate(data.id, { url })}
            />
          );
        })()}
      </>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        style={style}
        className={cn(
          "select-none pointer-events-auto",
          data.selected && "ring-2 ring-blue-500 rounded",
          data.url && !data.selected && "cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
        )}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        <div className="whitespace-pre-wrap p-1" style={{ color: finalTextColor }}>
          {data.text || 'Click to edit'}
        </div>
      </div>

      {/* Resize Handles - show when selected (even during editing) */}
      {data.selected && (
        <>
          {/* Resize handles for text width/height control */}
          <div
            style={{
              position: 'absolute',
              left: (data.position.x * viewport.zoom) + viewport.x + actualWidth * viewport.zoom - 4,
              top: (data.position.y * viewport.zoom) + viewport.y + actualHeight * viewport.zoom - 4,
              width: 8,
              height: 8,
              backgroundColor: '#2563eb',
              border: '1px solid white',
              borderRadius: '2px',
              cursor: 'se-resize',
              zIndex: 1000
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              console.log('[Text Drag] Resize handle clicked - starting resize');
              
              const startMouseX = e.clientX;
              const startMouseY = e.clientY;
              const startWidth = actualWidth;
              const startHeight = actualHeight;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startMouseX;
                const deltaY = moveEvent.clientY - startMouseY;
                const newWidth = Math.max(50, startWidth + deltaX / viewport.zoom);
                const newHeight = Math.max(20, startHeight + deltaY / viewport.zoom);
                
                console.log('[Text Drag] Resizing:', { newWidth, newHeight });
                onUpdate(data.id, { width: newWidth, height: newHeight });
              };
              
              const handleMouseUp = () => {
                console.log('[Text Drag] Resize complete');
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          {/* Right edge resize handle */}
          <div
            style={{
              position: 'absolute',
              left: (data.position.x * viewport.zoom) + viewport.x + actualWidth * viewport.zoom - 4,
              top: (data.position.y * viewport.zoom) + viewport.y + actualHeight * viewport.zoom / 2 - 4,
              width: 8,
              height: 8,
              backgroundColor: '#2563eb',
              border: '1px solid white',
              borderRadius: '2px',
              cursor: 'e-resize',
              zIndex: 1000
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              console.log('[Text Drag] Width resize handle clicked');
              
              const startMouseX = e.clientX;
              const startWidth = data.width || 100;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startMouseX;
                const newWidth = Math.max(50, startWidth + deltaX / viewport.zoom);
                
                console.log('[Text Drag] Resizing width:', newWidth);
                onUpdate(data.id, { width: newWidth });
              };
              
              const handleMouseUp = () => {
                console.log('[Text Drag] Width resize complete');
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </>
      )}

      {/* URL Popover - Google Docs style */}
      {showUrlPopover && data.url && (
        <div 
          className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-[300px]"
          style={{
            left: (data.position.x * viewport.zoom) + viewport.x,
            top: (data.position.y * viewport.zoom) + viewport.y + (actualHeight * viewport.zoom) + 10
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1 mr-3">
              {data.url}
            </span>
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setShowUrlPopover(false)}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              onClick={() => {
                window.open(data.url, '_blank', 'noopener,noreferrer');
                setShowUrlPopover(false);
              }}
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </button>
            
            <button
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-sm"
              onClick={() => {
                setIsEditing(true);
                setEditText(data.text);
                onUpdate(data.id, { isEditing: true, selected: true });
                setShowUrlPopover(false);
              }}
            >
              <Edit className="w-3 h-3" />
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Text Formatting Toolbar - show when selected or editing */}
      {(data.selected || isEditing) && (() => {
        console.log('[Text Toolbar] Rendering formatting toolbar for:', data.id, 'selected:', data.selected, 'isEditing:', isEditing);
        return (
          <TextFormattingToolbar
            position={{
              x: (data.position.x * viewport.zoom) + viewport.x + actualWidth * viewport.zoom / 2,
              y: (data.position.y * viewport.zoom) + viewport.y - 10
            }}
            fontSize={data.fontSize || 16}
            fontFamily={data.fontFamily || 'Inter, system-ui, sans-serif'}
            fontWeight={data.fontWeight || 'normal'}
            textAlign={data.textAlign || 'left'}
            color={data.color || '#000000'}
            text={data.text || ''}
            url={data.url}
            onFontSizeChange={(size) => onUpdate(data.id, { fontSize: size })}
            onFontFamilyChange={(family) => onUpdate(data.id, { fontFamily: family })}
            onFontWeightChange={(weight) => onUpdate(data.id, { fontWeight: weight })}
            onTextAlignChange={(align) => onUpdate(data.id, { textAlign: align })}
            onColorChange={(color) => onUpdate(data.id, { color })}
            onTextChange={(text) => onUpdate(data.id, { text })}
            onUrlChange={(url) => onUpdate(data.id, { url })}
          />
        );
      })()}
    </>
  );
}