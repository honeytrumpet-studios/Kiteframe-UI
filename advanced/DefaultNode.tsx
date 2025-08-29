import React, { useState, useEffect, useRef } from 'react';
import { Node } from '../types';
import { NodeHandles } from './NodeHandles';
import { ResizeHandle } from './ResizeHandle';
import { cn } from '@/lib/utils';
import { Blocks } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Function to determine if a color is light or dark
function getContrastTextColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

interface DefaultNodeProps {
  node: Node;
  onDrag: (nodeId: string, position: { x: number; y: number }) => void;
  onClick?: (event: React.MouseEvent, node: Node) => void;
  onDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeSettingsChange?: (nodeId: string, updates: Partial<Node['data']>) => void;
  viewport?: { x: number; y: number; zoom: number };
  canvasRef?: React.RefObject<HTMLElement>;
  onConnectStart?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  children?: React.ReactNode;
  hideHandlesWhenEdgeSelected?: boolean;
}

export function DefaultNode({ node, onDrag, onClick, onDoubleClick, onNodeSettingsChange, viewport = { x: 0, y: 0, zoom: 1 }, canvasRef, onConnectStart, onConnectEnd, alwaysShowHandles = false, onNodeResize, children, hideHandlesWhenEdgeSelected = false }: DefaultNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [nodeSize, setNodeSize] = useState(() => {
    // Initialize with proper constraints from the start
    const initialWidth = Math.max(node.style?.width ?? 200, 120);
    const initialHeight = Math.max(node.style?.height ?? 100, 100);
    return { width: initialWidth, height: initialHeight };
  });
  const [manuallyResized, setManuallyResized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State for inline editing
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingLabelText, setEditingLabelText] = useState(node.data?.label || '');
  const [editingDescriptionText, setEditingDescriptionText] = useState(node.data?.description || '');
  
  // Mobile touch handling
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [tapTarget, setTapTarget] = useState<'label' | 'description' | null>(null);
  
  // Theme reactivity - force re-render when theme changes
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

  // Update size when node style changes
  useEffect(() => {
    const initialWidth = Math.max(node.style?.width ?? 200, 120);
    const initialHeight = Math.max(node.style?.height ?? 100, 100);
    
    if (initialWidth !== nodeSize.width || initialHeight !== nodeSize.height) {
      setNodeSize({ width: initialWidth, height: initialHeight });
    }
  }, [node.style?.width, node.style?.height]);

  // Focus inputs when editing starts
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

  // Update editing text when node data changes
  useEffect(() => {
    setEditingLabelText(node.data?.label || '');
    setEditingDescriptionText(node.data?.description || '');
  }, [node.data?.label, node.data?.description]);

  // Auto-resize height based on content
  const calculateContentHeight = () => {
    if (!contentRef.current || manuallyResized) return;
    
    const contentElement = contentRef.current;
    const padding = 32; // 16px padding top + 16px padding bottom (p-4)
    const iconHeight = node.data?.icon ? 32 : 0; // Icon container height
    const labelHeight = 24; // Approximate height for label text
    const spacingBetweenElements = 8; // space-y-2 = 8px between elements
    
    // Calculate description height by temporarily measuring it
    let descriptionHeight = 0;
    if (node.data?.description || isEditingDescription) {
      // Create a temporary element to measure text height
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = `${nodeSize.width - padding}px`; // Account for padding
      tempDiv.style.fontSize = '14px'; // text-sm
      tempDiv.style.lineHeight = '1.25'; // Default line height
      tempDiv.style.wordWrap = 'break-word';
      tempDiv.style.overflowWrap = 'break-word';
      tempDiv.textContent = node.data?.description || 'Add description placeholder';
      
      document.body.appendChild(tempDiv);
      descriptionHeight = Math.max(tempDiv.offsetHeight, isEditingDescription ? 60 : 0); // min 60px for editing
      document.body.removeChild(tempDiv);
    }

    // Calculate label height by temporarily measuring wrapped text
    let actualLabelHeight = labelHeight; // Default fallback
    if (node.data?.label) {
      const tempLabelDiv = document.createElement('div');
      tempLabelDiv.style.position = 'absolute';
      tempLabelDiv.style.visibility = 'hidden';
      tempLabelDiv.style.width = `${nodeSize.width - padding - (iconHeight > 0 ? iconHeight + 8 : 0)}px`; // Account for padding and icon
      tempLabelDiv.style.fontSize = '16px'; // font-medium
      tempLabelDiv.style.fontWeight = '500'; // font-medium
      tempLabelDiv.style.lineHeight = '1.5'; // Default line height for h3
      tempLabelDiv.style.wordWrap = 'break-word';
      tempLabelDiv.style.overflowWrap = 'break-word';
      tempLabelDiv.textContent = node.data.label;
      
      document.body.appendChild(tempLabelDiv);
      actualLabelHeight = Math.max(tempLabelDiv.offsetHeight, 24); // Minimum 24px
      document.body.removeChild(tempLabelDiv);
    }
    
    // Calculate total required height
    const requiredHeight = padding + 
                          iconHeight + 
                          (iconHeight > 0 ? spacingBetweenElements : 0) +
                          actualLabelHeight + 
                          (descriptionHeight > 0 ? spacingBetweenElements : 0) +
                          descriptionHeight +
                          (node.selected && !node.data?.description && !isEditingDescription ? 24 : 0); // "Add description" button
    
    const minHeight = 100; // Keep current minimum
    const newHeight = Math.max(requiredHeight, minHeight);
    
    // Only update if height has actually changed
    if (Math.abs(newHeight - nodeSize.height) > 2) { // 2px tolerance to avoid unnecessary updates
      setNodeSize(prev => ({ ...prev, height: newHeight }));
      
      // Notify parent of resize if callback provided
      if (onNodeResize) {
        onNodeResize(node.id, nodeSize.width, newHeight);
      }
    }
  };

  // Auto-resize when content changes
  useEffect(() => {
    calculateContentHeight();
  }, [node.data?.label, node.data?.description, node.data?.icon, isEditingDescription, node.selected, nodeSize.width, manuallyResized]);

  // Debounced resize calculation for performance
  useEffect(() => {
    const timeoutId = setTimeout(calculateContentHeight, 100);
    return () => clearTimeout(timeoutId);
  }, [editingDescriptionText, editingLabelText]);



  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if the click is on a handle (prevent dragging node when clicking handles)
    const target = e.target as HTMLElement;
    if (target.classList.contains('kiteline-handle') || target.closest('.kiteline-node-handles')) {
      return;
    }
    
    // Don't handle dragging here - let the canvas handle it
    // Just prevent event propagation for handles
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Mouse move events are now handled by window listeners
    // This prevents event capture issues during dragging
  };

  const handleMouseUp = () => {
    // Mouse up events are now handled by window listeners
    // This prevents event capture issues during dragging
  };

  const handleClick = (e: React.MouseEvent) => {
    // Check if the click is on a handle (prevent node selection when clicking handles)
    const target = e.target as HTMLElement;
    if (target.classList.contains('kiteline-handle') || target.closest('.kiteline-node-handles')) {
      return;
    }
    
    // Check if node is selectable (default to true if not specified)
    const isSelectableNode = node.selectable !== false;
    
    e.stopPropagation();
    if (onClick && isSelectableNode) {
      onClick(e, node);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Check if the click is on a handle (prevent node editing when clicking handles)
    const target = e.target as HTMLElement;
    if (target.classList.contains('kiteline-handle') || target.closest('.kiteline-node-handles')) {
      return;
    }
    
    // Check if node is double-clickable (default to true if not specified)
    const isDoubleClickableNode = node.doubleClickable !== false;
    
    e.stopPropagation();
    e.preventDefault();
    
    if (isDoubleClickableNode) {
      // Enable inline editing instead of opening popover
      if (!isEditingLabel && !isEditingDescription) {
        setIsEditingLabel(true);
        setEditingLabelText(node.data?.label || '');
      }
    }
  };

  const handleLabelSave = () => {
    if (onNodeSettingsChange) {
      onNodeSettingsChange(node.id, { label: editingLabelText.trim() || 'New Node' });
    }
    setIsEditingLabel(false);
  };

  const handleLabelCancel = () => {
    setEditingLabelText(node.data?.label || '');
    setIsEditingLabel(false);
  };

  const handleDescriptionSave = () => {
    if (onNodeSettingsChange) {
      onNodeSettingsChange(node.id, { description: editingDescriptionText.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setEditingDescriptionText(node.data?.description || '');
    setIsEditingDescription(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLabelSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleLabelCancel();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleDescriptionCancel();
    }
  };

  const handleTouchStart = (e: React.TouchEvent, target: 'label' | 'description') => {
    setTouchStartTime(Date.now());
    setTapTarget(target);
  };

  const handleTouchEnd = (e: React.TouchEvent, target: 'label' | 'description') => {
    e.stopPropagation();
    const touchDuration = Date.now() - touchStartTime;
    const now = Date.now();
    
    // Only handle touch if it matches the target
    if (tapTarget === target && touchDuration < 300) {
      // Check for double-tap (two taps within 500ms)
      if (now - lastTapTime < 500) {
        if (target === 'label') {
          setIsEditingLabel(true);
        } else if (target === 'description') {
          setIsEditingDescription(true);
        }
        setLastTapTime(0); // Reset to prevent triple-tap issues
      } else {
        setLastTapTime(now);
        // Single tap - also enter edit mode for better mobile UX
        setTimeout(() => {
          if (Date.now() - lastTapTime >= 400) {
            if (target === 'label') {
              setIsEditingLabel(true);
            } else if (target === 'description') {
              setIsEditingDescription(true);
            }
          }
        }, 400);
      }
    }
  };

  const handleResize = (width: number, height: number) => {
    const constrainedWidth = Math.max(width, 120); // Enforce minimum width
    const constrainedHeight = Math.max(height, 100); // Enforce minimum height
    setNodeSize({ width: constrainedWidth, height: constrainedHeight });
    setManuallyResized(true); // Mark as manually resized to prevent auto-sizing
    // Update nodes array immediately during resize (like KFrame does)
    onNodeResize?.(node.id, constrainedWidth, constrainedHeight);
  };

  const handleResizeEnd = () => {
    // No need to call onNodeResize again since we're doing it in handleResize
    // onNodeResize?.(node.id, nodeSize.width, nodeSize.height);
  };

  const handleAutoResize = () => {
    // Reset manual resize flag and trigger auto-sizing calculation
    setManuallyResized(false);
    
    // Use a small timeout to allow the effect to trigger after manuallyResized changes
    setTimeout(() => {
      calculateContentHeight();
    }, 10);
  };
  
  // Helper function to calculate adaptive text color based on background brightness
  const getAdaptiveTextColor = (backgroundColor?: string): string => {
    // If no background, return theme default
    if (!backgroundColor) {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? '#ffffff' : '#000000';
    }
    
    // Remove # if present and handle transparency
    let hex = backgroundColor.replace('#', '');
    
    // Handle hex with alpha (8 characters) - remove alpha for luminance calculation
    if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    
    // If not a valid hex, return theme default
    if (hex.length !== 6) {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? '#ffffff' : '#000000';
    }
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance using the W3C formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white text for dark backgrounds, black text for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Get theme-aware colors - reactive to theme changes
  const getThemeAwareColors = () => {
    const isDark = document.documentElement.classList.contains('dark');
    
    // If node has custom colors set, use those
    const nodeData = node.data as any || {};
    if (nodeData.backgroundColor || nodeData.borderColor) {
      // Calculate adaptive text color if not provided
      const textColor = nodeData.color || getAdaptiveTextColor(nodeData.backgroundColor);
      
      return {
        backgroundColor: nodeData.backgroundColor || (isDark ? '#374151' : '#ffffff'),
        borderColor: nodeData.borderColor || (isDark ? '#4b5563' : '#e5e7eb'),
        color: textColor
      };
    }
    
    // Otherwise use theme-aware card component colors
    return {
      backgroundColor: isDark ? '#374151' : '#ffffff', // bg-gray-700 / bg-white
      borderColor: isDark ? '#4b5563' : '#e5e7eb', // border-gray-600 / border-gray-200
      color: isDark ? '#ffffff' : '#111827' // text-white / text-gray-900
    };
  };
  
  const themeColors = getThemeAwareColors();

  return (
    <div
      ref={nodeRef}
      className={cn(
        "transition-shadow kiteframe-node group select-none cursor-grab active:cursor-grabbing",
        "touch-manipulation active:scale-95 transition-transform duration-150",
        node.selected && "kiteframe-node-selected"
      )}
      data-node-id={node.id}
      style={{
        width: `${nodeSize.width}px`,
        height: `${nodeSize.height}px`,
        minWidth: '120px',
        minHeight: '80px',
        backgroundColor: themeColors.backgroundColor,
        color: themeColors.color,
        borderColor: themeColors.borderColor,
        borderWidth: `${node.data?.borderWidth || 1}px`,
        borderStyle: node.data?.borderStyle || 'solid',
        borderRadius: `${node.data?.borderRadius || 8}px`,
        userSelect: 'none',
        boxSizing: 'border-box',
        boxShadow: node.selected
          ? "0 4px 12px rgba(59, 130, 246, 0.3)"
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.2s ease-in-out"
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Node Content */}
      <div 
        ref={contentRef}
        className="node-content p-4 flex flex-col min-h-0"
        style={{
          height: '100%',
          justifyContent: node.data?.contentVerticalAlign === 'top' ? 'flex-start' : 
                         node.data?.contentVerticalAlign === 'bottom' ? 'flex-end' : 'center',
          alignItems: node.data?.contentHorizontalAlign === 'left' ? 'flex-start' : 
                     node.data?.contentHorizontalAlign === 'right' ? 'flex-end' : 'center',
          textAlign: node.data?.contentHorizontalAlign === 'left' ? 'left' : 
                    node.data?.contentHorizontalAlign === 'right' ? 'right' : 'center'
        }}
      >
        {children ? (
          <div className="flex flex-col space-y-2 min-h-0">
            {children}
          </div>
        ) : (
          <div className="flex flex-col space-y-2 min-h-0">
            <div 
              className="flex items-start min-w-0 w-full"
              style={{
                justifyContent: node.data?.contentHorizontalAlign === 'left' ? 'flex-start' : 
                              node.data?.contentHorizontalAlign === 'right' ? 'flex-end' : 'center',
                gap: node.data?.icon ? '8px' : '0'
              }}
            >
              {node.data?.icon && (
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: node.data?.borderColor 
                      ? `${node.data.borderColor}1a` // Add 10% opacity (1a in hex)
                      : '#3b82f61a'
                  }}
                >
                  {node.data?.iconType === 'emoji' ? (
                    <span className="text-lg leading-none">
                      {node.data?.icon}
                    </span>
                  ) : (
                    (() => {
                      const IconComponent = (LucideIcons as any)[node.data?.icon];
                      return IconComponent ? (
                        <IconComponent 
                          size={21} 
                          style={{ 
                            color: node.data?.borderColor || '#3b82f6'
                          }} 
                        />
                      ) : (
                        <span 
                          className="text-sm"
                          style={{ 
                            color: node.data?.borderColor || '#3b82f6'
                          }}
                        >
                          {node.data?.icon}
                        </span>
                      );
                    })()
                  )}
                </div>
              )}
              {isEditingLabel ? (
                <input
                  ref={labelInputRef}
                  type="text"
                  value={editingLabelText}
                  onChange={(e) => setEditingLabelText(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyDown={handleLabelKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="font-medium bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-500 rounded px-2 py-1 text-sm outline-none"
                  style={{
                    color: (node.data as any)?.backgroundColor ? getContrastTextColor((node.data as any).backgroundColor) : 'var(--foreground)',
                    minWidth: '100px',
                    width: '100%'
                  }}
                  placeholder="Node label"
                />
              ) : (
                <h3 
                  className="font-medium cursor-text touch-manipulation"
                  style={{ 
                    color: (node.data as any)?.backgroundColor ? getContrastTextColor((node.data as any).backgroundColor) : 'var(--foreground)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    width: '100%',
                    minWidth: 0
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditingLabel(true);
                    setEditingLabelText(node.data?.label || '');
                  }}
                  onTouchStart={(e) => handleTouchStart(e, 'label')}
                  onTouchEnd={(e) => handleTouchEnd(e, 'label')}
                >
                  {node.data?.label}
                </h3>
              )}
            </div>
            
            {(node.data?.description || isEditingDescription) && !(node.data as any)?.uiMockDataUri && (
              isEditingDescription ? (
                <textarea
                  ref={descriptionInputRef}
                  value={editingDescriptionText}
                  onChange={(e) => setEditingDescriptionText(e.target.value)}
                  onBlur={handleDescriptionSave}
                  onKeyDown={handleDescriptionKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-sm w-full min-w-0 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-500 rounded px-2 py-1 outline-none resize-none"
                  style={{
                    color: (node.data as any)?.backgroundColor ? getContrastTextColor((node.data as any).backgroundColor) : 'var(--foreground)',
                    textAlign: node.data?.contentHorizontalAlign === 'left' ? 'left' : 
                              node.data?.contentHorizontalAlign === 'right' ? 'right' : 'center',
                    minHeight: '60px'
                  }}
                  placeholder="Add description (Ctrl+Enter to save, Esc to cancel)"
                />
              ) : (
                <p 
                  className="text-sm w-full min-w-0 text-gray-900 dark:text-gray-100 cursor-text touch-manipulation"
                  style={{ 
                    color: (node.data as any)?.backgroundColor ? getContrastTextColor((node.data as any).backgroundColor) : 'var(--foreground)',
                    textAlign: node.data?.contentHorizontalAlign === 'left' ? 'left' : 
                              node.data?.contentHorizontalAlign === 'right' ? 'right' : 'center',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditingDescription(true);
                    setEditingDescriptionText(node.data?.description || '');
                  }}
                  onTouchStart={(e) => handleTouchStart(e, 'description')}
                  onTouchEnd={(e) => handleTouchEnd(e, 'description')}
                >
                  {node.data?.description}
                </p>
              )
            )}
            
            {/* Add description button when no description exists, not editing, and node is selected */}
            {!node.data?.description && !isEditingDescription && node.selected && !(node.data as any)?.uiMockDataUri && (
              <button
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingDescription(true);
                  setEditingDescriptionText('');
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                + Add description
              </button>
            )}
          </div>
        )}
      </div>

      {/* Child node adoption indicator */}
      {node.data?.parentFrameId && (
        <div className="absolute top-1 right-1 z-10 opacity-70 bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-sm">
          <Blocks size={12} className="text-gray-600 dark:text-gray-400" />
        </div>
      )}

      {/* Connection Handles */}
      <NodeHandles 
        node={node} 
        nodeWidth={typeof nodeSize.width === 'number' ? nodeSize.width : 150}
        nodeHeight={typeof nodeSize.height === 'number' ? nodeSize.height : 80}
        onHandleConnect={(position, event) => {
          // Pass the handle connect event up to the canvas
          const customEvent = new CustomEvent('nodeHandleConnect', {
            detail: { nodeId: node.id, position, event }
          });
          window.dispatchEvent(customEvent);
        }}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        alwaysShowHandles={alwaysShowHandles}
        enableGhostPreview={(node.data as any)?.enableGhostPreview || false}
        hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
        onQuickAddNode={(nodeId, handlePosition) => {
          // Pass the quick add node event up to the canvas
          const customEvent = new CustomEvent('quickAddNode', {
            detail: { sourceNodeId: nodeId, handlePosition }
          });
          window.dispatchEvent(customEvent);
        }}
      />



      {/* Resize Handles */}
      {node.resizable !== false && (
        <>
          <ResizeHandle 
            position="top-left" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onAutoResize={handleAutoResize}
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
            viewport={viewport}
            canvasRef={canvasRef}
          />
          <ResizeHandle 
            position="top-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onAutoResize={handleAutoResize}
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
            viewport={viewport}
            canvasRef={canvasRef}
          />
          <ResizeHandle 
            position="bottom-left" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onAutoResize={handleAutoResize}
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
            viewport={viewport}
            canvasRef={canvasRef}
          />
          <ResizeHandle 
            position="bottom-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onAutoResize={handleAutoResize}
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
            viewport={viewport}
            canvasRef={canvasRef}
          />
        </>
      )}
    </div>
  );
}
