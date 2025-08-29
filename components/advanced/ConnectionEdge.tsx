import React, { useState, useEffect, useRef } from 'react';
import { Edge, Node, EdgeType } from '../types';
import { getEdgePath, Rect, EdgeOptions } from '../edgeRouting';
import { EdgeHandles } from './EdgeHandles';

interface ConnectionEdgeProps {
  edge: Edge;
  sourceNode?: Node;
  targetNode?: Node;
  nodes?: Node[];
  edges?: Edge[];
  onClick?: (event: React.MouseEvent, edge: Edge) => void;
  onDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  onLabelChange?: (edgeId: string, newLabel: string) => void;
  onEdgeReconnect?: (edgeId: string, newSource?: string, newTarget?: string) => void;
  viewport?: { x: number; y: number; zoom: number };
}

// Helper function to get the connection point aligned with node handles
const getConnectionPoint = (node: Node, otherNode: Node, isSource: boolean) => {
  // Get proper dimensions based on node type - use actual dimensions or realistic defaults
  const nodeWidth = node.style?.width || (node.type === 'kframe' ? 400 : 200);
  const nodeHeight = node.style?.height || (node.type === 'kframe' ? 300 : 100);
  const nodeX = node.position.x;
  const nodeY = node.position.y;
  const nodeCenterX = nodeX + nodeWidth / 2;
  const nodeCenterY = nodeY + nodeHeight / 2;
  
  const otherNodeWidth = otherNode.type === 'kframe' ? (otherNode.style?.width || 400) : (otherNode.style?.width || 200);
  const otherNodeHeight = otherNode.type === 'kframe' ? (otherNode.style?.height || 300) : (otherNode.style?.height || 100);
  const otherCenterX = otherNode.position.x + otherNodeWidth / 2;
  const otherCenterY = otherNode.position.y + otherNodeHeight / 2;
  
  // Calculate angle between nodes
  const deltaX = otherCenterX - nodeCenterX;
  const deltaY = otherCenterY - nodeCenterY;
  const angle = Math.atan2(deltaY, deltaX);
  
  // Determine which edge to connect to based on angle
  const absAngle = Math.abs(angle);
  const isHorizontal = absAngle < Math.PI / 4 || absAngle > (3 * Math.PI / 4);
  
  // Handle size parameters (matching NodeHandles component)
  const handleSize = 12;
  const handleHalf = handleSize / 2;
  
  let connectionPoint;
  if (isHorizontal) {
    // Connect to left or right handle position
    if (deltaX > 0) {
      // Connect to right handle position
      connectionPoint = { x: nodeX + nodeWidth + handleHalf, y: nodeCenterY };
    } else {
      // Connect to left handle position
      connectionPoint = { x: nodeX - handleHalf, y: nodeCenterY };
    }
  } else {
    // Connect to top or bottom handle position
    if (deltaY > 0) {
      // Connect to bottom handle position
      connectionPoint = { x: nodeCenterX, y: nodeY + nodeHeight + handleHalf };
    } else {
      // Connect to top handle position
      connectionPoint = { x: nodeCenterX, y: nodeY - handleHalf };
    }
  }
  
  return connectionPoint;
};

// Helper function to get midpoint connection for line edges
const getMidpointConnection = (node: Node) => {
  const nodeWidth = node.style?.width || (node.type === 'kframe' ? 400 : 200);
  const nodeHeight = node.style?.height || (node.type === 'kframe' ? 300 : 100);
  const nodeX = node.position.x;
  const nodeY = node.position.y;
  
  return {
    x: nodeX + nodeWidth / 2,
    y: nodeY + nodeHeight / 2
  };
};

// Helper function to get perpendicular connection point on node boundary
const getPerpendicularConnection = (node: Node, otherNode: Node) => {
  const nodeWidth = node.style?.width || (node.type === 'kframe' ? 400 : 200);
  const nodeHeight = node.style?.height || (node.type === 'kframe' ? 300 : 100);
  const nodeX = node.position.x;
  const nodeY = node.position.y;
  const nodeCenterX = nodeX + nodeWidth / 2;
  const nodeCenterY = nodeY + nodeHeight / 2;
  
  const otherNodeWidth = otherNode.style?.width || (otherNode.type === 'kframe' ? 400 : 200);
  const otherNodeHeight = otherNode.style?.height || (otherNode.type === 'kframe' ? 300 : 100);
  const otherCenterX = otherNode.position.x + otherNodeWidth / 2;
  const otherCenterY = otherNode.position.y + otherNodeHeight / 2;
  
  // Calculate direction vector from node center to other node center
  const dx = otherCenterX - nodeCenterX;
  const dy = otherCenterY - nodeCenterY;
  
  // Calculate intersection with node boundary
  const halfWidth = nodeWidth / 2;
  const halfHeight = nodeHeight / 2;
  
  // Find intersection point with rectangle boundary
  let intersectionX, intersectionY;
  let edgeHit = '';
  
  if (dx === 0) {
    // Vertical line - align with top/bottom handles
    const handleSize = 12;
    const handleHalf = handleSize / 2;
    intersectionX = nodeCenterX;
    intersectionY = dy > 0 ? nodeY + nodeHeight + handleHalf : nodeY - handleHalf;
    edgeHit = dy > 0 ? 'bottom' : 'top';
  } else if (dy === 0) {
    // Horizontal line - align with left/right handles
    const handleSize = 12;
    const handleHalf = handleSize / 2;
    intersectionX = dx > 0 ? nodeX + nodeWidth + handleHalf : nodeX - handleHalf;
    intersectionY = nodeCenterY;
    edgeHit = dx > 0 ? 'right' : 'left';
  } else {
    // Calculate intersection with all four sides and pick the closest
    const slope = dy / dx;
    
    // Check intersection with left/right edges
    const rightX = nodeX + nodeWidth;
    const leftX = nodeX;
    const rightY = nodeCenterY + slope * (rightX - nodeCenterX);
    const leftY = nodeCenterY + slope * (leftX - nodeCenterX);
    
    // Check intersection with top/bottom edges
    const topY = nodeY;
    const bottomY = nodeY + nodeHeight;
    const topX = nodeCenterX + (topY - nodeCenterY) / slope;
    const bottomX = nodeCenterX + (bottomY - nodeCenterY) / slope;
    

    
    // Handle size parameters (matching NodeHandles component)
    const handleSize = 12;
    const handleHalf = handleSize / 2;
    
    // Determine which intersection is valid (within node bounds) and align with handle positions
    if (dx > 0 && rightY >= nodeY && rightY <= nodeY + nodeHeight) {
      // Right edge intersection - align with right handle
      intersectionX = rightX + handleHalf;
      intersectionY = rightY;
      edgeHit = 'right';
    } else if (dx < 0 && leftY >= nodeY && leftY <= nodeY + nodeHeight) {
      // Left edge intersection - align with left handle
      intersectionX = leftX - handleHalf;
      intersectionY = leftY;
      edgeHit = 'left';
    } else if (dy > 0 && bottomX >= nodeX && bottomX <= nodeX + nodeWidth) {
      // Bottom edge intersection - align with bottom handle
      intersectionX = bottomX;
      intersectionY = bottomY + handleHalf;
      edgeHit = 'bottom';
    } else {
      // Top edge intersection - align with top handle
      intersectionX = topX;
      intersectionY = topY - handleHalf;
      edgeHit = 'top';
    }
  }
  
  const result = { x: intersectionX, y: intersectionY };
  
  return result;
};












export function ConnectionEdge({ 
  edge, 
  sourceNode, 
  targetNode, 
  nodes = [], 
  edges = [],
  onClick, 
  onDoubleClick, 
  onLabelChange, 
  onEdgeReconnect,
  viewport = { x: 0, y: 0, zoom: 1 }
}: ConnectionEdgeProps) {
  if (!sourceNode || !targetNode) return null;

  // State for inline label editing
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editingText, setEditingText] = useState(edge.data?.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  // Create Rect objects for source and target nodes
  const sourceRect: Rect = {
    x: sourceNode.position.x,
    y: sourceNode.position.y,
    width: sourceNode.type === 'kframe' ? (sourceNode.style?.width || 400) : (sourceNode.style?.width || 200),
    height: sourceNode.type === 'kframe' ? (sourceNode.style?.height || 300) : (sourceNode.style?.height || 100)
  };

  const targetRect: Rect = {
    x: targetNode.position.x,
    y: targetNode.position.y,
    width: targetNode.type === 'kframe' ? (targetNode.style?.width || 400) : (targetNode.style?.width || 200),
    height: targetNode.type === 'kframe' ? (targetNode.style?.height || 300) : (targetNode.style?.height || 100)
  };



  // Check if this is a preview edge (during dragging)
  const isPreview = edge.id.startsWith('preview-') || edge.target === 'preview-target';
  
  // Edge options for the new routing system
  const edgeOptions: EdgeOptions = {
    type: (edge.type as EdgeType) || 'smoothstep',
    color: edge.data?.color || 
      edge.style?.stroke || 
      sourceNode?.data?.borderColor || 
      targetNode?.data?.borderColor || 
      "hsl(var(--foreground))",
    strokeWidth: edge.selected ? (edge.data?.strokeWidth || 2) + 2 : (edge.data?.strokeWidth || 2), // Thicker border when selected
    animated: edge.animated || edge.data?.style === 'animated' || false,
    animationSpeed: edge.data?.animationSpeed || 2,
    animationDirection: edge.data?.animationDirection || 'forward',
    dashArray: isPreview ? "3,3" : (edge.data?.style === 'dashed' ? "5,5" : undefined)
  };

  // For preview edges, modify both source and target rects to use direct points
  let modifiedSourceRect = sourceRect;
  let modifiedTargetRect = targetRect;
  
  if (isPreview) {
    // Use centerpoint as both the position and a zero-size rect
    const sourceCenterX = sourceRect.x + sourceRect.width / 2;
    const sourceCenterY = sourceRect.y + sourceRect.height / 2;
    modifiedSourceRect = {
      x: sourceCenterX,
      y: sourceCenterY,
      width: 0,
      height: 0
    };
    
    // For target, use the exact cursor position without boundary calculation
    modifiedTargetRect = {
      x: targetRect.x,
      y: targetRect.y,
      width: 0,
      height: 0
    };
  }
  
  // Generate path using the new clean API
  const { path, stroke, strokeWidth, markerEnd, dashArray } = getEdgePath(modifiedSourceRect, modifiedTargetRect, edgeOptions);
  
  // Handle CSS variables for edge colors - resolve to actual value
  const actualStroke = stroke === 'hsl(var(--foreground))' ? '#64748b' : stroke;
  
  // Selected state styling - keep original stroke width but add drop shadow
  const finalStrokeWidth = strokeWidth; // Keep same thickness when selected
  const selectedFilter = edge.selected ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))' : 'none'; // Drop shadow when selected
  


  // Edge event handlers
  const handleMouseEnter = (event: React.MouseEvent) => {
    console.log('[Edge] Mouse enter:', {
      edgeId: edge.id,
      edgeType: edge.type,
      sourceNode: sourceNode.id,
      targetNode: targetNode.id,
      mousePosition: { x: event.clientX, y: event.clientY }
    });
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    console.log('[Edge] Mouse leave:', {
      edgeId: edge.id,
      edgeType: edge.type,
      mousePosition: { x: event.clientX, y: event.clientY }
    });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    // Stop propagation to prevent canvas panning when clicking edge line
    event.stopPropagation();
    
    console.log('[Edge] Mouse down:', {
      edgeId: edge.id,
      edgeType: edge.type,
      button: event.button,
      mousePosition: { x: event.clientX, y: event.clientY },
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey
    });
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    console.log('[Edge] Mouse up:', {
      edgeId: edge.id,
      edgeType: edge.type,
      button: event.button,
      mousePosition: { x: event.clientX, y: event.clientY }
    });
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    console.log('[Edge] Double click:', {
      edgeId: edge.id,
      edgeType: edge.type,
      sourceNode: sourceNode.id,
      targetNode: targetNode.id,
      mousePosition: { x: event.clientX, y: event.clientY }
    });
    
    // Enable inline editing on double-click
    handleEdgeDoubleClick(event);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('[Edge] Line click:', {
      edgeId: edge.id,
      edgeType: edge.type,
      sourceNode: sourceNode.id,
      targetNode: targetNode.id,
      mousePosition: { x: e.clientX, y: e.clientY },
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey
    });
    
    if (onClick) {
      onClick(e, edge);
    }
  };

  // Handle label click (start editing)
  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Edge] Label click - starting edit mode');
    setIsEditingLabel(true);
    setEditingText(edge.data?.label || '');
  };

  // Handle double-click on edge line (enable label editing)
  const handleEdgeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[Edge] Double-click on edge line - enabling label editing');
    setIsEditingLabel(true);
    setEditingText(edge.data?.label || '');
  };

  // Handle saving label
  const handleSaveLabel = () => {
    if (onLabelChange) {
      // Only save if there's actual text content (not empty or just whitespace)
      const trimmedText = editingText.trim();
      onLabelChange(edge.id, trimmedText);
    }
    setIsEditingLabel(false);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditingLabel(false);
    setEditingText(edge.data?.label || '');
  };

  // Handle input events
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveLabel();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleInputBlur = () => {
    handleSaveLabel();
  };

  // Generate animation style based on direction
  const getAnimationStyle = () => {
    if (!edgeOptions.animated) return {};
    
    const baseAnimation = `edgeAnimation ${edgeOptions.animationSpeed}s infinite linear`;
    return {
      animation: edgeOptions.animationDirection === 'reverse' ? 
        `${baseAnimation} reverse` : 
        baseAnimation
    };
  };

  return (
    <g>
      {/* Invisible thick line for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth, 10)}
        className="cursor-pointer"
        style={{ pointerEvents: 'auto' }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Visible edge */}
      <path
        d={path}
        fill="none"
        stroke={actualStroke}
        strokeWidth={finalStrokeWidth}
        className="transition-all duration-200"
        markerEnd="url(#arrowhead)"
        strokeDasharray={dashArray}
        style={{
          ...getAnimationStyle(),
          filter: selectedFilter
        }}
      />

      {/* Edge label with inline editing */}
      {(edge.data?.label || isEditingLabel) && (() => {
        const labelX = (sourceRect.x + sourceRect.width/2 + targetRect.x + targetRect.width/2) / 2;
        const labelY = (sourceRect.y + sourceRect.height/2 + targetRect.y + targetRect.height/2) / 2;
        
        if (isEditingLabel) {
          // Inline editing with blue border and input field
          return (
            <g>
              {/* Blue background highlight */}
              <rect
                x={labelX - 60}
                y={labelY - 15}
                width="120"
                height="30"
                className="fill-blue-50 dark:fill-blue-900/20 stroke-blue-400 dark:stroke-blue-500"
                strokeWidth="2"
                rx="6"
                style={{ pointerEvents: 'auto' }}
              />
              
              {/* Input field */}
              <foreignObject
                x={labelX - 55}
                y={labelY - 10}
                width="110"
                height="20"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onBlur={handleInputBlur}
                  placeholder="Add text"
                  className="w-full h-full text-xs text-center bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
                  style={{ font: 'inherit' }}
                />
              </foreignObject>
            </g>
          );
        } else if (edge.data?.label) {
          // Static label with subtle background
          const textWidth = Math.max(40, (edge.data.label.length || 5) * 7);
          return (
            <g>
              {/* Subtle background for existing labels */}
              <rect
                x={labelX - textWidth/2 - 4}
                y={labelY - 10}
                width={textWidth + 8}
                height="20"
                className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-600"
                strokeWidth="1"
                rx="4"
                style={{ pointerEvents: 'auto' }}
              />
              
              {/* Label text */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-slate-700 dark:fill-slate-300 cursor-pointer hover:fill-slate-900 dark:hover:fill-slate-100"
                style={{ pointerEvents: 'auto' }}
                onClick={handleLabelClick}
              >
                {edge.data.label}
              </text>
            </g>
          );
        }
        
        return null;
      })()}

      {/* Edge handles for reconnection when edge is selected */}
      {edge.selected && onEdgeReconnect && (
        <EdgeHandles
          edge={edge}
          sourceNode={sourceNode}
          targetNode={targetNode}
          nodes={nodes}
          edges={edges}
          onEdgeReconnect={onEdgeReconnect}
          viewport={viewport}
        />
      )}
    </g>
  );
}
