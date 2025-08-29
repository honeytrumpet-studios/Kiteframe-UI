import React, { useState, useEffect, useRef } from 'react';
import { Node } from '../types';
import { NodeHandles } from './NodeHandles';
import { NodeSettingsPopover } from './NodeSettingsPopover';
import { ResizeHandle } from './ResizeHandle';
import { cn } from '@/lib/utils';

interface DefaultNodeProps {
  node: Node;
  onDrag: (nodeId: string, position: { x: number; y: number }) => void;
  onClick?: (event: React.MouseEvent, node: Node) => void;
  onDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeSettingsChange?: (nodeId: string, updates: Partial<Node['data']>) => void;
  viewport?: { x: number; y: number; zoom: number };
  onConnectStart?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
}

export function DefaultNode({ node, onDrag, onClick, onDoubleClick, onNodeSettingsChange, viewport = { x: 0, y: 0, zoom: 1 }, onConnectStart, onConnectEnd, alwaysShowHandles = false, onNodeResize }: DefaultNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragDelayTimer, setDragDelayTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPendingDrag, setIsPendingDrag] = useState(false);
  const [nodeSize, setNodeSize] = useState({ 
    width: node.style?.width ?? 200, 
    height: node.style?.height ?? 100 
  });
  
  // Constants for drag behavior
  const DRAG_DELAY_MS = 150; // Wait 150ms before starting drag
  const DRAG_THRESHOLD_PX = 5; // Move 5px before starting drag

  // Add window-level event listeners for dragging
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isPendingDrag && !isDragging) {
        // Check if mouse moved beyond threshold during pending drag
        const deltaX = Math.abs(e.clientX - dragStart.x);
        const deltaY = Math.abs(e.clientY - dragStart.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > DRAG_THRESHOLD_PX) {
          // Start drag immediately when threshold is exceeded
          startDrag();
        }
      }
      
      if (isDragging) {
        // Calculate the delta from where the drag started
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        // Convert screen delta to canvas delta (accounting for zoom)
        const canvasDeltaX = deltaX / viewport.zoom;
        const canvasDeltaY = deltaY / viewport.zoom;
        
        const newPosition = {
          x: dragStartPosition.x + canvasDeltaX,
          y: dragStartPosition.y + canvasDeltaY
        };
        
        // Update node position
        onDrag(node.id, newPosition);
      }
    };

    const handleWindowMouseUp = () => {
      if (isPendingDrag) {
        // Cancel pending drag
        cancelPendingDrag();
      }
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isPendingDrag || isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, isPendingDrag, dragStart, dragStartPosition, node.id, onDrag, viewport, DRAG_THRESHOLD_PX]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dragDelayTimer) {
        clearTimeout(dragDelayTimer);
      }
    };
  }, [dragDelayTimer]);

  // Helper function to start the actual drag
  const startDrag = () => {
    setIsDragging(true);
    setIsPendingDrag(false);
    if (dragDelayTimer) {
      clearTimeout(dragDelayTimer);
      setDragDelayTimer(null);
    }
  };

  // Helper function to cancel pending drag
  const cancelPendingDrag = () => {
    setIsPendingDrag(false);
    if (dragDelayTimer) {
      clearTimeout(dragDelayTimer);
      setDragDelayTimer(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if the click is on a handle (prevent dragging node when clicking handles)
    const target = e.target as HTMLElement;
    if (target.classList.contains('kiteline-handle') || target.closest('.kiteline-node-handles')) {
      return;
    }
    
    // Check if node is draggable (default to true if not specified)
    const isDraggableNode = node.draggable !== false;
    
    // Prevent canvas panning when starting to drag a node
    e.stopPropagation();
    e.preventDefault();
    
    // Only start drag if node is draggable
    if (isDraggableNode) {
      // Store the initial mouse position and node position
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
      setDragStartPosition({
        x: node.position.x,
        y: node.position.y
      });
      
      // Start pending drag state
      setIsPendingDrag(true);
      
      // Set a timer to start drag after delay
      const timer = setTimeout(() => {
        startDrag();
      }, DRAG_DELAY_MS);
      
      setDragDelayTimer(timer);
    }
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
      console.log('Handle clicked, preventing node selection');
      return;
    }
    
    // Check if node is selectable (default to true if not specified)
    const isSelectableNode = node.selectable !== false;
    
    e.stopPropagation();
    console.log('Demo node clicked:', node);
    if (onClick && isSelectableNode) {
      onClick(e, node);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Check if the click is on a handle (prevent node popover when clicking handles)
    const target = e.target as HTMLElement;
    if (target.classList.contains('kiteline-handle') || target.closest('.kiteline-node-handles')) {
      console.log('Handle double-clicked, preventing node popover');
      return;
    }
    
    // Check if node is double-clickable (default to true if not specified)
    const isDoubleClickableNode = node.doubleClickable !== false;
    
    e.stopPropagation();
    e.preventDefault();
    
    if (isDoubleClickableNode) {
      setSettingsOpen(true);
      if (onDoubleClick) {
        onDoubleClick(e, node);
      }
    }
  };

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
  };

  const handleResizeEnd = () => {
    if (onNodeResize) {
      onNodeResize(node.id, nodeSize.width, nodeSize.height);
    }
  };

  const handleAutoResize = () => {
    if (!nodeRef.current) return;
    
    // Create a temporary element to measure content without constraints
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: auto;
      height: auto;
      padding: 16px;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      white-space: nowrap;
      pointer-events: none;
      z-index: -1000;
      display: flex;
      flex-direction: column;
      align-items: ${node.data.contentHorizontalAlign === 'left' ? 'flex-start' : 
                     node.data.contentHorizontalAlign === 'right' ? 'flex-end' : 'center'};
      justify-content: ${node.data.contentVerticalAlign === 'top' ? 'flex-start' : 
                        node.data.contentVerticalAlign === 'bottom' ? 'flex-end' : 'center'};
    `;
    
    // Create header content
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;';
    
    if (node.data.icon) {
      const iconDiv = document.createElement('div');
      iconDiv.style.cssText = 'width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;';
      iconDiv.textContent = node.data.icon;
      headerDiv.appendChild(iconDiv);
    }
    
    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = 'font-weight: 500; white-space: nowrap;';
    labelDiv.textContent = node.data.label || 'Node';
    headerDiv.appendChild(labelDiv);
    
    tempDiv.appendChild(headerDiv);
    
    // Add description if present
    if (node.data.description) {
      const descDiv = document.createElement('div');
      descDiv.style.cssText = 'font-size: 14px; white-space: pre-wrap; word-wrap: break-word; max-width: 300px;';
      descDiv.textContent = node.data.description;
      tempDiv.appendChild(descDiv);
    }
    
    // Add to document to measure
    document.body.appendChild(tempDiv);
    
    // Get measurements
    const rect = tempDiv.getBoundingClientRect();
    const optimalWidth = Math.max(Math.ceil(rect.width), 120); // minimum 120px width
    const optimalHeight = Math.max(Math.ceil(rect.height), 60); // minimum 60px height
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    // Update the size
    setNodeSize({ width: optimalWidth, height: optimalHeight });
    
    // Call the resize callback
    if (onNodeResize) {
      onNodeResize(node.id, optimalWidth, optimalHeight);
    }
  };

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute shadow-sm hover:shadow-md transition-shadow cursor-grab kiteframe-node group",
        isDragging && "cursor-grabbing shadow-lg kiteframe-node-dragging",
        node.selected && "ring-2 ring-blue-500 kiteframe-node-selected"
      )}
      data-node-id={node.id}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: nodeSize.width,
        height: nodeSize.height,
        backgroundColor: node.data.color || 'var(--card)',
        color: node.data.color ? 'white' : 'var(--foreground)',
        borderColor: node.data.borderColor || 'var(--border)',
        borderWidth: `${node.data.borderWidth || 1}px`,
        borderStyle: node.data.borderStyle || 'solid',
        borderRadius: `${node.data.borderRadius || 8}px`
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Node Content */}
      <div 
        className="node-content p-4 h-full flex flex-col"
        style={{
          justifyContent: node.data.contentVerticalAlign === 'top' ? 'flex-start' : 
                         node.data.contentVerticalAlign === 'bottom' ? 'flex-end' : 'center',
          alignItems: node.data.contentHorizontalAlign === 'left' ? 'flex-start' : 
                     node.data.contentHorizontalAlign === 'right' ? 'flex-end' : 'center',
          textAlign: node.data.contentHorizontalAlign === 'left' ? 'left' : 
                    node.data.contentHorizontalAlign === 'right' ? 'right' : 'center'
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            {node.data.icon && (
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  {node.data.icon}
                </span>
              </div>
            )}
            <h3 className="font-medium truncate" style={{ 
              color: node.data.textColor || (node.data.color ? 'white' : 'var(--foreground)') 
            }}>
              {node.data.label}
            </h3>
          </div>
          
          {node.data.description && (
            <p className="text-sm text-center" style={{ 
              color: node.data.textColor || (node.data.color ? 'rgba(255,255,255,0.8)' : 'var(--muted-foreground)') 
            }}>
              {node.data.description}
            </p>
          )}
        </div>
      </div>

      {/* Connection Handles */}
      <NodeHandles 
        node={node} 
        nodeWidth={nodeSize.width}
        nodeHeight={nodeSize.height}
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
      />

      {/* Settings Popover - Only render if onNodeSettingsChange is not provided (to avoid duplicates) */}
      {!onNodeSettingsChange && (
        <NodeSettingsPopover
          node={node}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onSave={() => {}}
        />
      )}

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
          />
          <ResizeHandle 
            position="top-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onAutoResize={handleAutoResize}
          />
          <ResizeHandle 
            position="bottom-left" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onAutoResize={handleAutoResize}
          />
          <ResizeHandle 
            position="bottom-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onAutoResize={handleAutoResize}
          />
        </>
      )}
    </div>
  );
}
