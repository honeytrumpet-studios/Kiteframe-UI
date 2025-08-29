import React, { useState, useRef } from 'react';
import { Edge, Node } from '../types';

interface EdgeHandlesProps {
  edge: Edge;
  sourceNode?: Node;
  targetNode?: Node;
  nodes: Node[];
  edges: Edge[];
  onEdgeReconnect?: (edgeId: string, newSource?: string, newTarget?: string) => void;
  viewport?: { x: number; y: number; zoom: number };
}

interface DragState {
  isDragging: boolean;
  isSource: boolean; // true for source handle, false for target handle
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  originalSource: string;
  originalTarget: string;
}

export function EdgeHandles({
  edge,
  sourceNode,
  targetNode,
  nodes,
  edges,
  onEdgeReconnect,
  viewport = { x: 0, y: 0, zoom: 1 }
}: EdgeHandlesProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const dragHandleRef = useRef<SVGCircleElement>(null);

  // Get connection point for a node
  const getConnectionPoint = (node: Node, otherNode: Node, isSource: boolean) => {
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
    
    const handleHalf = 6; // Handle size / 2
    
    let connectionPoint;
    if (isHorizontal) {
      if (deltaX > 0) {
        connectionPoint = { x: nodeX + nodeWidth + handleHalf, y: nodeCenterY };
      } else {
        connectionPoint = { x: nodeX - handleHalf, y: nodeCenterY };
      }
    } else {
      if (deltaY > 0) {
        connectionPoint = { x: nodeCenterX, y: nodeY + nodeHeight + handleHalf };
      } else {
        connectionPoint = { x: nodeCenterX, y: nodeY - handleHalf };
      }
    }
    
    return connectionPoint;
  };

  // Check if cursor is over a node
  const getNodeUnderCursor = (x: number, y: number): Node | null => {
    for (const node of nodes) {
      const nodeWidth = node.style?.width || (node.type === 'kframe' ? 400 : 200);
      const nodeHeight = node.style?.height || (node.type === 'kframe' ? 300 : 100);
      
      if (
        x >= node.position.x &&
        x <= node.position.x + nodeWidth &&
        y >= node.position.y &&
        y <= node.position.y + nodeHeight
      ) {
        return node;
      }
    }
    return null;
  };

  // Handle mouse down on edge handles
  const handleMouseDown = (event: React.MouseEvent, isSource: boolean) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('[EdgeHandles] Mouse down on edge handle, dispatching edgeHandleDragStart event');
    
    // Signal that edge handle drag is active to prevent canvas panning
    const customEvent = new CustomEvent('edgeHandleDragStart');
    window.dispatchEvent(customEvent);

    const rect = (event.currentTarget as Element).getBoundingClientRect();
    const svg = (event.currentTarget as Element).closest('svg');
    if (!svg) return;

    // Find canvas container (same reference as KiteFrameCanvas uses)
    const canvasContainer = svg.closest('[data-canvas-container]') as HTMLElement;
    if (!canvasContainer) return;
    
    const canvasRect = canvasContainer.getBoundingClientRect();
    // Transform screen coordinates to canvas coordinates (same as working hover-based system)
    const rawMouseX = event.clientX - canvasRect.left;
    const rawMouseY = event.clientY - canvasRect.top;
    const x = (rawMouseX - viewport.x) / viewport.zoom;
    const y = (rawMouseY - viewport.y) / viewport.zoom;

    setDragState({
      isDragging: true,
      isSource,
      startPosition: { x, y },
      currentPosition: { x, y },
      originalSource: edge.source,
      originalTarget: edge.target
    });

    // DIAGNOSTIC LOGGING - Track drag start
    console.log('[EdgeHandles] DRAG START DIAGNOSTIC:', {
      step: 'drag_start',
      edgeId: edge.id,
      handle_type: isSource ? 'source' : 'target',
      raw_screen: { x: event.clientX, y: event.clientY },
      canvas_rect: { left: canvasRect.left, top: canvasRect.top },
      raw_canvas: { x: rawMouseX, y: rawMouseY },
      viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
      start_coords: { x, y },
      edge_endpoints: {
        source: edge.source,
        target: edge.target,
        source_point: sourceNode && targetNode ? getConnectionPoint(sourceNode, targetNode, true) : null,
        target_point: targetNode && sourceNode ? getConnectionPoint(targetNode, sourceNode, false) : null
      },
      canvas_container_found: !!canvasContainer,
      svg_found: !!svg
    });
  };

  // Handle mouse move during drag
  const handleMouseMove = (event: MouseEvent) => {
    if (!dragState) return;

    const svg = document.querySelector(`[data-edge-id="${edge.id}"]`)?.closest('svg');
    if (!svg) return;

    // Find canvas container (same reference as KiteFrameCanvas uses)
    const canvasContainer = svg.closest('[data-canvas-container]') as HTMLElement;
    if (!canvasContainer) return;
    
    const canvasRect = canvasContainer.getBoundingClientRect();
    // Transform screen coordinates to canvas coordinates (same as working hover-based system)
    const rawMouseX = event.clientX - canvasRect.left;
    const rawMouseY = event.clientY - canvasRect.top;
    const x = (rawMouseX - viewport.x) / viewport.zoom;
    const y = (rawMouseY - viewport.y) / viewport.zoom;

    // DIAGNOSTIC LOGGING - Track all coordinate transformations
    console.log('[EdgeHandles] DRAG DIAGNOSTIC:', {
      step: 'mouse_move',
      edgeId: edge.id,
      raw_screen: { x: event.clientX, y: event.clientY },
      canvas_rect: { 
        left: canvasRect.left, 
        top: canvasRect.top, 
        width: canvasRect.width, 
        height: canvasRect.height 
      },
      raw_canvas: { x: rawMouseX, y: rawMouseY },
      viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
      final_coords: { x, y },
      source_point: sourceNode && targetNode ? getConnectionPoint(sourceNode, targetNode, true) : null,
      target_point: targetNode && sourceNode ? getConnectionPoint(targetNode, sourceNode, false) : null,
      drag_state: {
        isSource: dragState.isSource,
        current: dragState.currentPosition,
        start: dragState.startPosition
      }
    });

    // Update drag state with current cursor position
    setDragState(prev => prev ? {
      ...prev,
      currentPosition: { x, y }
    } : null);

    // Check if we're over a node for visual feedback
    const nodeUnder = getNodeUnderCursor(x, y);
    setHoveredNode(nodeUnder && nodeUnder.id !== edge.source && nodeUnder.id !== edge.target ? nodeUnder.id : null);
  };

  // Handle mouse up to complete reconnection
  const handleMouseUp = (event: MouseEvent) => {
    if (!dragState) return;

    const svg = document.querySelector(`[data-edge-id="${edge.id}"]`)?.closest('svg');
    if (!svg) return;

    // Find canvas container (same reference as KiteFrameCanvas uses)
    const canvasContainer = svg.closest('[data-canvas-container]') as HTMLElement;
    if (!canvasContainer) return;
    
    const canvasRect = canvasContainer.getBoundingClientRect();
    // Transform screen coordinates to canvas coordinates (same as working hover-based system)
    const rawMouseX = event.clientX - canvasRect.left;
    const rawMouseY = event.clientY - canvasRect.top;
    const x = (rawMouseX - viewport.x) / viewport.zoom;
    const y = (rawMouseY - viewport.y) / viewport.zoom;

    // Check if we're over a valid target node
    const targetNode = getNodeUnderCursor(x, y);
    
    if (targetNode && targetNode.id !== edge.source && targetNode.id !== edge.target) {
      // Connect to new node
      const newSource = dragState.isSource ? targetNode.id : edge.source;
      const newTarget = dragState.isSource ? edge.target : targetNode.id;
      
      // Check if this connection would be invalid (edge already exists)
      const edgeExists = edges?.some(e => 
        (e.source === newSource && e.target === newTarget) || 
        (e.source === newTarget && e.target === newSource)
      ) || false;
      
      if (!edgeExists) {
        console.log(`[EdgeHandles] Reconnecting edge to ${targetNode.id}`, { newSource, newTarget });
        onEdgeReconnect?.(edge.id, newSource, newTarget);
      } else {
        console.log('[EdgeHandles] Reconnection cancelled - edge already exists');
      }
    } else {
      console.log(`[EdgeHandles] Drag cancelled, reverting to original connection`);
    }

    // Clean up drag state
    setDragState(null);
    setHoveredNode(null);
    
    console.log('[EdgeHandles] Mouse up, dispatching edgeHandleDragEnd event');
    
    // Signal that edge handle drag is complete
    const customEvent = new CustomEvent('edgeHandleDragEnd');
    window.dispatchEvent(customEvent);
  };

  // Set up global mouse events when dragging starts
  React.useEffect(() => {
    if (dragState?.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState?.isDragging]);

  if (!sourceNode || !targetNode) return null;

  // Calculate handle positions
  const sourcePoint = getConnectionPoint(sourceNode, targetNode, true);
  const targetPoint = getConnectionPoint(targetNode, sourceNode, false);

  return (
    <g data-edge-id={edge.id} data-testid="edge-handles">
      
      {/* Ghost connection preview during drag */}
      {dragState && (() => {
        const previewX1 = dragState.isSource ? dragState.currentPosition.x : sourcePoint.x;
        const previewY1 = dragState.isSource ? dragState.currentPosition.y : sourcePoint.y;
        const previewX2 = dragState.isSource ? targetPoint.x : dragState.currentPosition.x;
        const previewY2 = dragState.isSource ? targetPoint.y : dragState.currentPosition.y;
        
        // Check if connection would be invalid (edge already exists)
        const newSource = dragState.isSource ? (hoveredNode || dragState.originalSource) : dragState.originalSource;
        const newTarget = dragState.isSource ? dragState.originalTarget : (hoveredNode || dragState.originalTarget);
        const edgeExists = edges?.some(e => 
          (e.source === newSource && e.target === newTarget) || 
          (e.source === newTarget && e.target === newSource)
        ) || false;
        
        // Determine color: red for invalid, green for valid target, blue for default
        const strokeColor = edgeExists ? "#ef4444" : (hoveredNode ? "#22c55e" : "#3b82f6");
        
        // DIAGNOSTIC LOGGING - Track preview line rendering
        console.log('[EdgeHandles] PREVIEW LINE DIAGNOSTIC:', {
          step: 'render_preview',
          edgeId: edge.id,
          drag_state: {
            isSource: dragState.isSource,
            cursor_position: dragState.currentPosition
          },
          endpoints: {
            source: sourcePoint,
            target: targetPoint
          },
          preview_line: {
            x1: previewX1, y1: previewY1,
            x2: previewX2, y2: previewY2
          },
          expected_behavior: dragState.isSource 
            ? `Line should go FROM cursor (${dragState.currentPosition.x}, ${dragState.currentPosition.y}) TO target (${targetPoint.x}, ${targetPoint.y})`
            : `Line should go FROM source (${sourcePoint.x}, ${sourcePoint.y}) TO cursor (${dragState.currentPosition.x}, ${dragState.currentPosition.y})`,
          visual_state: {
            strokeColor,
            hoveredNode,
            edgeExists
          }
        });
        
        return (
          <line
            x1={previewX1}
            y1={previewY1}
            x2={previewX2}
            y2={previewY2}
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity="0.8"
            pointerEvents="none"
          />
        );
      })()}

      {/* Original connection ghost during drag */}
      {dragState && (
        <line
          x1={sourcePoint.x}
          y1={sourcePoint.y}
          x2={targetPoint.x}
          y2={targetPoint.y}
          stroke="#64748b"
          strokeWidth="2"
          opacity="0.3"
          pointerEvents="none"
        />
      )}

      {/* Source handle */}
      <circle
        cx={sourcePoint.x}
        cy={sourcePoint.y}
        r="8"
        fill="#3b82f6"
        stroke="white"
        strokeWidth="3"
        cursor="pointer"
        opacity={dragState?.isSource ? 0.7 : 1}
        onMouseDown={(e) => {
          console.log('[EdgeHandles] SOURCE HANDLE MOUSE DOWN - TRIGGERED!', { edgeId: edge.id });
          handleMouseDown(e, true);
        }}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          pointerEvents: 'auto'
        }}
      />

      {/* Target handle */}
      <circle
        cx={targetPoint.x}
        cy={targetPoint.y}
        r="8"
        fill="#3b82f6"
        stroke="white"
        strokeWidth="3"
        cursor="pointer"
        opacity={dragState?.isSource === false ? 0.7 : 1}
        onMouseDown={(e) => {
          console.log('[EdgeHandles] TARGET HANDLE MOUSE DOWN - TRIGGERED!', { edgeId: edge.id });
          handleMouseDown(e, false);
        }}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          pointerEvents: 'auto'
        }}
      />

      {/* Hover indicators for nodes during drag */}
      {dragState && hoveredNode && (
        <>
          {nodes
            .filter(node => node.id === hoveredNode)
            .map(node => {
              const nodeWidth = node.style?.width || (node.type === 'kframe' ? 400 : 200);
              const nodeHeight = node.style?.height || (node.type === 'kframe' ? 300 : 100);
              
              return (
                <rect
                  key={node.id}
                  x={node.position.x - 2}
                  y={node.position.y - 2}
                  width={nodeWidth + 4}
                  height={nodeHeight + 4}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  rx="8"
                  opacity="0.7"
                  pointerEvents="none"
                />
              );
            })
          }
        </>
      )}
    </g>
  );
}