import React, { useRef, useState, useEffect } from 'react';
import { Node } from '../types';
import { ResizeHandle } from './ResizeHandle';
import { NodeHandles } from './NodeHandles';
import { GripVertical, Minus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export interface KFrameData {
  label?: string;
  description?: string;
  icon?: string;
  iconType?: 'lucide' | 'emoji';
  labelPosition?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top'
    | 'bottom'
    | 'center'
    | 'inside-top-left'
    | 'inside-top-right'
    | 'inside-bottom-left'
    | 'inside-bottom-right'
    | 'outside-top'
    | 'outside-bottom'
    | 'centered';
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
  };
  labelStyle?: {
    fontSize?: number;
    fontWeight?: React.CSSProperties['fontWeight'];
    fontStyle?: React.CSSProperties['fontStyle'];
    color?: string;
  };
  resizable?: boolean;
}

const DEFAULT_SIZE = { width: 400, height: 300 };

export interface KFrameProps {
  id: string;
  position: { x: number; y: number };
  style?: { width?: number; height?: number };
  data: KFrameData;
  selected?: boolean;
  onNodesChange?: (nodes: Node[]) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onLabelChange?: (nodeId: string, label: string) => void;
  onDescriptionChange?: (nodeId: string, description: string) => void;
  onIconChange?: (nodeId: string, icon: string, iconType: 'lucide' | 'emoji') => void;
  // Handle connection callbacks
  onHandleConnect?: (pos: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectStart?: (nodeId: string, handle: string) => void;
  onConnectEnd?: (nodeId: string, handle: string) => void;
  alwaysShowHandles?: boolean;
  // Drag event hooks for adoption behavior
  onNodeDrag?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDragStart?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDragEnd?: (nodeId: string, position: { x: number; y: number }) => void;
  viewport?: { x: number; y: number; zoom: number };
  canvasRef?: React.RefObject<HTMLElement>;
  isDropZone?: boolean;
  childFrameNodes?: Node[];
  onUnadoptNode?: (nodeId: string) => void;
}

export function KFrame({
  id,
  position,
  style = {},
  data = {},
  selected = false,
  onNodesChange,
  onResize,
  onLabelChange,
  onDescriptionChange,
  onIconChange,
  onHandleConnect,
  onConnectStart,
  onConnectEnd,
  alwaysShowHandles = false,
  onNodeDrag,
  onNodeDragStart,
  onNodeDragEnd,
  viewport = { x: 0, y: 0, zoom: 1 },
  canvasRef,
  isDropZone = false,
  childFrameNodes = [],
  onUnadoptNode,
}: KFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{
    width: number;
    height: number;
  }>({
    width: style.width ?? DEFAULT_SIZE.width,
    height: style.height ?? DEFAULT_SIZE.height,
  });
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label || '');
  const [tempDescription, setTempDescription] = useState(data.description || '');

  // Initialize tempLabel and tempDescription from data
  // Update temp values when data changes
  React.useEffect(() => {
    setTempLabel(data.label || '');
    setTempDescription(data.description || '');
  }, [data.label, data.description]);
  
  // Theme reactivity - force re-render when theme changes
  const [, forceUpdate] = useState({});
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      forceUpdate({});
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Calculate label positioning based on textAlign and verticalAlign
  const getAlignmentClasses = () => {
    const textAlign = data.textAlign ?? 'left';
    const verticalAlign = data.verticalAlign ?? 'top';

    let horizontalClass = '';
    let verticalClass = '';
    let textAlignClass = '';

    // Horizontal positioning
    switch (textAlign) {
      case 'left':
        horizontalClass = 'left-4';
        textAlignClass = 'text-left';
        break;
      case 'center':
        horizontalClass = 'left-1/2 transform -translate-x-1/2';
        textAlignClass = 'text-center';
        break;
      case 'right':
        horizontalClass = 'right-4';
        textAlignClass = 'text-right';
        break;
    }

    // Vertical positioning
    switch (verticalAlign) {
      case 'top':
        verticalClass = 'top-4';
        break;
      case 'center':
        verticalClass = 'top-1/2 transform -translate-y-1/2';
        break;
      case 'bottom':
        verticalClass = 'bottom-4';
        break;
    }

    return {
      containerClass: `absolute ${horizontalClass} ${verticalClass}`,
      textClass: textAlignClass
    };
  };

  const { containerClass, textClass } = getAlignmentClasses();

  const handleResize = (width: number, height: number) => {
    setSize({ width, height });
    // Call the resize callback to update the nodes array
    if (onResize) {
      onResize(id, width, height);
    }
  };

  // Handle unadopt functionality
  const handleUnadopt = (nodeId: string) => {
    if (!onUnadoptNode) return;
    
    console.log('KFrame: Unadopting node:', nodeId);
    onUnadoptNode(nodeId);
  };

  // Handle label editing
  const handleLabelSubmit = () => {
    if (onLabelChange) {
      onLabelChange(id, tempLabel);
    }
    setIsEditingLabel(false);
  };

  const handleDescriptionSubmit = () => {
    if (onDescriptionChange) {
      onDescriptionChange(id, tempDescription);
    }
    setIsEditingDescription(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setTempLabel(data.label || '');
      setIsEditingLabel(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDescriptionSubmit();
    } else if (e.key === 'Escape') {
      setTempDescription(data.description || '');
      setIsEditingDescription(false);
    }
  };
  
  // Get theme-aware colors - reactive to theme changes
  const getThemeAwareColors = () => {
    const isDark = document.documentElement.classList.contains('dark');
    
    // If KFrame has custom colors set, use those
    if (data.style?.backgroundColor && data.style?.borderColor) {
      return {
        backgroundColor: data.style.backgroundColor,
        borderColor: data.style.borderColor
      };
    }
    
    // Otherwise use theme-aware accent component colors
    return {
      backgroundColor: isDark ? 'rgba(30, 58, 138, 0.2)' : '#eff6ff', // bg-blue-900/20 / bg-blue-50
      borderColor: isDark ? '#1e3a8a' : '#bfdbfe' // border-blue-800 / border-blue-200
    };
  };
  
  const themeColors = getThemeAwareColors();

  return (
    <div
      ref={containerRef}
      className={`kframe-container absolute border-2 border-dashed cursor-move group transition-all duration-150 ease-out hover:shadow-lg ${
        isDropZone ? 'ring-4 ring-blue-600 ring-opacity-80 shadow-2xl' : ''
      }`}
      style={{
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        backgroundColor: isDropZone 
          ? 'rgba(59, 130, 246, 0.25)' 
          : themeColors.backgroundColor.includes('rgba') ? themeColors.backgroundColor : `${themeColors.backgroundColor}1a`,
        borderColor: isDropZone 
          ? '#1d4ed8' 
          : themeColors.borderColor,
        borderWidth: isDropZone ? 4 : (data.style?.borderWidth ?? 2),
        borderStyle: data.style?.borderStyle ?? 'dashed',
        borderRadius: '12px',
        zIndex: 0,
      }}
      onMouseUp={() => {
        console.log('DEBUG: KFrame mouse up event triggered');
      }}
      onMouseDown={(e) => {
        console.log('DEBUG: KFrame mouse down event triggered:', {
          frameId: id,
          position: position,
          size: size,
          target: e.target
        });
      }}
      onClick={(e) => {
        console.log('DEBUG: KFrame click event triggered:', {
          frameId: id,
          position: position,
          size: size
        });
      }}
    >
      {/* Connection Handles */}
      <NodeHandles
        node={{
          id,
          position: { x: 0, y: 0 }, // Relative to container
          style: { width: size.width, height: size.height },
          data: { 
            label: data.label || 'Frame',
            borderColor: data.style?.borderColor ?? '#3b82f6'
          },
          type: 'kframe'
        }}
        onHandleConnect={onHandleConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        alwaysShowHandles={alwaysShowHandles}
        nodeWidth={size.width}
        nodeHeight={size.height}
      />

      {/* Label and Description Container */}
      <div className={`${containerClass} ${textClass} max-w-[calc(100%-32px)]`}>
        {/* Label */}
        {isEditingLabel ? (
          <input
            type="text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={handleLabelKeyDown}
            className="bg-white border-2 border-blue-500 rounded px-2 py-1 text-sm font-medium text-gray-900 outline-none"
            style={{
              fontSize: data.labelStyle?.fontSize ?? 14,
              fontWeight: data.labelStyle?.fontWeight ?? 500,
            }}
            autoFocus
          />
        ) : (
          <div
            className={`px-2 py-1 text-gray-700 cursor-pointer hover:text-gray-900 flex items-center gap-2 ${data.label ? '' : 'text-gray-400 hover:text-gray-600'}`}
            style={{
              fontSize: data.labelStyle?.fontSize ?? 14,
              fontWeight: data.labelStyle?.fontWeight ?? 500,
              fontStyle: data.labelStyle?.fontStyle,
              color: data.label ? (data.labelStyle?.color ?? 'var(--foreground)') : '#9ca3af',
            }}
            onDoubleClick={() => {
              setTempLabel(data.label || '');
              setIsEditingLabel(true);
            }}
          >
            {/* Icon Display */}
            {data.icon && (
              <span className="inline-flex items-center">
                {data.iconType === 'emoji' ? (
                  <span className="text-base">{data.icon}</span>
                ) : data.iconType === 'lucide' ? (
                  (() => {
                    const IconComponent = (LucideIcons as any)[data.icon];
                    return IconComponent ? <IconComponent size={16} /> : null;
                  })()
                ) : null}
              </span>
            )}
            {data.label || (selected ? 'Add label' : 'Frame')}
          </div>
        )}

        {/* Description */}
        {isEditingDescription ? (
          <textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            onBlur={handleDescriptionSubmit}
            onKeyDown={handleDescriptionKeyDown}
            className="mt-1 bg-white border-2 border-blue-500 rounded px-2 py-1 text-xs text-gray-600 outline-none resize-none w-full"
            rows={2}
            autoFocus
          />
        ) : (
          data.description || selected ? (
            <div
              className={`mt-1 px-2 py-1 text-xs cursor-pointer ${data.description ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
              style={{
                color: data.description ? (data.labelStyle?.color ?? 'var(--foreground)') : '#9ca3af',
              }}
              onDoubleClick={() => {
                setTempDescription(data.description || '');
                setIsEditingDescription(true);
              }}
            >
              {data.description || (selected ? 'Add description' : '')}
            </div>
          ) : null
        )}
      </div>



      {/* Unadopt buttons are rendered separately in the canvas */}

      {/* Resize handles */}
      {data.resizable !== false &&
        (['top-left','top-right','bottom-left','bottom-right'] as const).map(corner => (
          <ResizeHandle
            key={corner}
            position={corner}
            nodeRef={containerRef}
            onResize={handleResize}
            resizable={true}
            minWidth={80}  // Reduced minimum width
            minHeight={60} // Reduced minimum height
            maxWidth={2000} // Allow much larger sizes
            viewport={viewport}
            canvasRef={canvasRef}
          />
        ))}
    </div>
  );
}