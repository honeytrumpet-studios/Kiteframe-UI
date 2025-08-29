import React, { useRef, useEffect, useState } from 'react';
import { Node, Edge, FlowCallbacks } from '../types';
import { DefaultNode } from './DefaultNode';
import { ImageNode } from './ImageNode';
import { ConnectionEdge } from './ConnectionEdge';
import { ControlsToolbar } from './ControlsToolbar';
import { ResizableNode } from './ResizableNode';
import { NodeSettingsPopover } from './NodeSettingsPopover';
import { ImageSettingsPopover } from './ImageSettingsPopover';
import { cn } from '@/lib/utils';

interface KiteFrameCanvasProps extends FlowCallbacks {
  nodes: Node[];
  edges: Edge[];
  className?: string;
  style?: React.CSSProperties;
  defaultViewport?: { x: number; y: number; zoom: number };
  disableZoom?: boolean;
  alwaysShowHandles?: boolean;
  onNodeResize?: (id: string, width: number, height: number) => void;
}

export function KiteFrameCanvas({
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDoubleClick,
  onNodeSettingsChange,
  onEdgeClick,
  onConnect,
  className,
  style,
  defaultViewport = { x: 0, y: 0, zoom: 1 },
  disableZoom = false,
  alwaysShowHandles = false,
  onNodeResize
}: KiteFrameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(defaultViewport);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isActiveCanvas, setIsActiveCanvas] = useState(false);
  const [draggingNode, setDraggingNode] = useState<{ id: string; offset: { x: number; y: number } } | null>(null);
  
  // Connection state for dynamic edge creation
  const [draggingConn, setDraggingConn] = useState<{
    sourceNodeId: string;
    sourceHandle: 'top' | 'bottom' | 'left' | 'right';
    startPosition: { x: number; y: number };
  } | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Handle canvas resize and fit-to-bounds calculations
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number): { x: number; y: number } => {
    if (!canvasRef.current) return { x: screenX, y: screenY };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - viewport.x) / viewport.zoom;
    const y = (screenY - rect.top - viewport.y) / viewport.zoom;
    
    return { x, y };
  };

  // Handle connection start
  const handleConnectStart = (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => {
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode) return;

    // Calculate handle position in canvas coordinates
    const handleOffsets = {
      top: { x: (sourceNode.width || 200) / 2, y: 0 },
      bottom: { x: (sourceNode.width || 200) / 2, y: sourceNode.height || 100 },
      left: { x: 0, y: (sourceNode.height || 100) / 2 },
      right: { x: sourceNode.width || 200, y: (sourceNode.height || 100) / 2 }
    };

    const handleOffset = handleOffsets[handlePosition];
    const startPosition = {
      x: sourceNode.position.x + handleOffset.x,
      y: sourceNode.position.y + handleOffset.y
    };

    console.log('Connection started:', { nodeId, handlePosition, startPosition });
    
    setDraggingConn({
      sourceNodeId: nodeId,
      sourceHandle: handlePosition,
      startPosition
    });
  };

  // Handle connection end
  const handleConnectEnd = (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => {
    if (!draggingConn) return;

    // Don't connect to the same node
    if (draggingConn.sourceNodeId === nodeId) {
      console.log('Connection cancelled - same node');
      setDraggingConn(null);
      return;
    }

    // Create new edge
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: draggingConn.sourceNodeId,
      target: nodeId,
      sourceHandle: draggingConn.sourceHandle,
      targetHandle: handlePosition,
      type: 'smoothstep',
      animated: false
    };

    console.log('Connection completed:', newEdge);
    
    // Add edge to collection
    if (onConnect) {
      onConnect(newEdge);
    }

    // Clear connection state
    setDraggingConn(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Mark this canvas as active and prevent event bubbling
    setIsActiveCanvas(true);
    e.stopPropagation();
    
    console.log('Canvas mouse down:', {
      target: e.target,
      currentTarget: e.currentTarget,
      canvasRef: canvasRef.current,
      isCanvas: e.target === canvasRef.current || e.target === e.currentTarget
    });
    
    // Only start panning if clicking on the canvas background (not on nodes)
    if (e.target === canvasRef.current || e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      
      // Clear selection when clicking on canvas background
      console.log('Canvas background clicked - clearing selection');
      if (onNodeClick) {
        // Call with null to signal clear selection
        onNodeClick(e, null as any);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Convert screen coordinates to canvas coordinates for connection preview
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const canvasX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const canvasY = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      setMouse({ x: canvasX, y: canvasY });
    }
    
    // Handle node dragging
    if (draggingNode && isActiveCanvas) {
      e.preventDefault();
      e.stopPropagation();
      
      const canvasCoords = screenToCanvas(e.clientX, e.clientY);
      const newPosition = {
        x: canvasCoords.x - draggingNode.offset.x,
        y: canvasCoords.y - draggingNode.offset.y
      };
      
      // Apply boundary constraints
      const node = nodes.find(n => n.id === draggingNode.id);
      if (node) {
        const nodeWidth = node.style?.width || (node.type === 'image' ? 200 : 200);
        const nodeHeight = node.style?.height || (node.type === 'image' ? 150 : 100);
        
        const constrainedPosition = {
          x: Math.max(0, Math.min(canvasSize.width - nodeWidth, newPosition.x)),
          y: Math.max(0, Math.min(canvasSize.height - nodeHeight, newPosition.y))
        };
        
        // Update node position
        const updatedNodes = nodes.map(n => 
          n.id === draggingNode.id 
            ? { ...n, position: constrainedPosition }
            : n
        );
        
        onNodesChange?.(updatedNodes);
      }
      
      return;
    }
    
    // Handle canvas panning
    if (isDragging && isActiveCanvas) {
      e.preventDefault();
      e.stopPropagation();
      setViewport(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingNode(null);
    setIsActiveCanvas(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDraggingNode(null);
    setIsActiveCanvas(false);
  };

  const handleCanvasMouseUp = () => {
    // Cancel connection if releasing over canvas (not on a handle)
    if (draggingConn) {
      console.log('Connection cancelled - released over canvas');
      setDraggingConn(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (disableZoom) return;
    
    // Fix passive event listener issue by using onWheel instead of addEventListener
    e.preventDefault();
    
    // Get canvas center point
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate zoom point relative to canvas center
    const zoomPointX = (e.clientX - rect.left - centerX) / viewport.zoom;
    const zoomPointY = (e.clientY - rect.top - centerY) / viewport.zoom;
    
    // Slower zoom: reduced sensitivity
    const zoomSensitivity = 0.05;
    const delta = e.deltaY > 0 ? (1 - zoomSensitivity) : (1 + zoomSensitivity);
    
    // Calculate bounds-based zoom limits
    const minZoom = Math.min(
      canvasSize.width / (Math.max(...nodes.map(n => n.position.x)) + 200),
      canvasSize.height / (Math.max(...nodes.map(n => n.position.y)) + 200)
    );
    
    const newZoom = Math.max(Math.max(0.1, minZoom), Math.min(3, viewport.zoom * delta));
    
    // Calculate new viewport position to keep zoom centered
    const newX = viewport.x - (zoomPointX * (newZoom - viewport.zoom));
    const newY = viewport.y - (zoomPointY * (newZoom - viewport.zoom));
    
    setViewport(prev => ({
      ...prev,
      x: newX,
      y: newY,
      zoom: newZoom
    }));
  };

  const handleNodeDrag = (nodeId: string, position: { x: number; y: number }) => {
    console.log('Canvas handleNodeDrag called:', {
      nodeId,
      position,
      isActiveCanvas,
      canvasSize,
      viewport
    });
    
    // Mark canvas as active when a node drag starts
    if (!isActiveCanvas) {
      console.log('Activating canvas for node drag');
      setIsActiveCanvas(true);
    }
    
    // Get the node being dragged to check its dimensions
    const draggedNode = nodes.find(node => node.id === nodeId);
    if (!draggedNode) {
      console.log('Drag blocked - node not found');
      return;
    }
    
    // Position is already in canvas coordinates (from DefaultNode)
    // We just need to apply boundary constraints
    const nodeWidth = draggedNode.style?.width || 200;
    const nodeHeight = draggedNode.style?.height || 100;
    
    // Calculate canvas bounds in canvas coordinates
    const canvasLeft = 0;
    const canvasTop = 0;
    const canvasRight = canvasSize.width / viewport.zoom - nodeWidth;
    const canvasBottom = canvasSize.height / viewport.zoom - nodeHeight;
    
    // Constrain position within canvas bounds
    const constrainedPosition = {
      x: Math.max(canvasLeft, Math.min(canvasRight, position.x)),
      y: Math.max(canvasTop, Math.min(canvasBottom, position.y))
    };
    
    console.log('Position constraints:', {
      original: position,
      constrained: constrainedPosition,
      bounds: { canvasLeft, canvasTop, canvasRight, canvasBottom }
    });
    
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, position: constrainedPosition } : node
    );
    
    console.log('Updated nodes:', updatedNodes);
    
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
  };

  return (
    <div
      ref={canvasRef}
      data-kiteframe-canvas
      className={cn(
        "relative w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={(e) => {
        handleMouseUp();
        handleCanvasMouseUp();
      }}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      tabIndex={0}
    >
      {/* Controls */}
      <ControlsToolbar
        viewport={viewport}
        onViewportChange={setViewport}
        onFitView={() => {
          // Calculate bounds of all nodes
          if (nodes.length === 0) {
            setViewport({ x: 0, y: 0, zoom: 1 });
            return;
          }
          
          const minX = Math.min(...nodes.map(n => n.position.x));
          const maxX = Math.max(...nodes.map(n => n.position.x + (n.style?.width || 200)));
          const minY = Math.min(...nodes.map(n => n.position.y));
          const maxY = Math.max(...nodes.map(n => n.position.y + (n.style?.height || 100)));
          
          const contentWidth = maxX - minX + 100; // Add padding
          const contentHeight = maxY - minY + 100;
          
          // Calculate zoom to fit content with padding
          const zoomX = canvasSize.width / contentWidth;
          const zoomY = canvasSize.height / contentHeight;
          const fitZoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 1:1
          
          // Center the content
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const offsetX = canvasSize.width / 2 - centerX * fitZoom;
          const offsetY = canvasSize.height / 2 - centerY * fitZoom;
          
          setViewport({ 
            x: offsetX, 
            y: offsetY, 
            zoom: fitZoom 
          });
        }}
      />

      {/* Flow Content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e2e8f0 1px, transparent 1px),
              linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        


        {/* Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {Array.isArray(edges) && edges.map(edge => (
            <ConnectionEdge
              key={edge.id}
              edge={edge}
              sourceNode={Array.isArray(nodes) ? nodes.find(n => n.id === edge.source) : undefined}
              targetNode={Array.isArray(nodes) ? nodes.find(n => n.id === edge.target) : undefined}
              onClick={onEdgeClick}
            />
          ))}
          
          {/* Preview connection edge */}
          {draggingConn && (
            <ConnectionEdge
              key="preview-connection"
              edge={{
                id: 'preview',
                source: draggingConn.sourceNodeId,
                target: 'preview-target',
                type: 'smoothstep',
                style: { strokeDasharray: '5,5', stroke: '#3b82f6', strokeWidth: 2 },
                animated: false
              }}
              sourceNode={nodes.find(n => n.id === draggingConn.sourceNodeId)}
              targetNode={{
                id: 'preview-target',
                position: screenToCanvas(mouse.x, mouse.y),
                width: 0,
                height: 0,
                data: { label: '' }
              }}
              onClick={undefined}
            />
          )}
        </svg>

        {/* Nodes */}
        {Array.isArray(nodes) && nodes.map(node => (
          node.type === 'image' ? (
            <div
              key={node.id}
              className={`absolute ${node.selected ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                left: node.position.x,
                top: node.position.y,
                cursor: (node.draggable !== false) ? 'grab' : 'default'
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (node.draggable !== false) {
                  setIsActiveCanvas(true);
                  
                  // Calculate offset from mouse to node position
                  const canvasCoords = screenToCanvas(e.clientX, e.clientY);
                  const offset = {
                    x: canvasCoords.x - node.position.x,
                    y: canvasCoords.y - node.position.y
                  };
                  
                  setDraggingNode({ id: node.id, offset });
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (node.selectable !== false) {
                  onNodeClick?.(e, node);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (node.doubleClickable !== false) {
                  onNodeDoubleClick?.(e, node);
                }
              }}
            >
              <ImageNode 
                node={node} 
                onHandleConnect={(pos, e) => {
                  console.log('Handle connect:', pos, e);
                }}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
                alwaysShowHandles={alwaysShowHandles}
                onNodeResize={onNodeResize}
              />
            </div>
          ) : (
            <DefaultNode
              key={node.id}
              node={node}
              onDrag={handleNodeDrag}
              onClick={onNodeClick}
              onDoubleClick={onNodeDoubleClick}
              onNodeSettingsChange={onNodeSettingsChange}
              viewport={viewport}
              onConnectStart={handleConnectStart}
              onConnectEnd={handleConnectEnd}
              alwaysShowHandles={alwaysShowHandles}
              onNodeResize={onNodeResize}
            />
          )
        ))}
      </div>
    </div>
  );
}
