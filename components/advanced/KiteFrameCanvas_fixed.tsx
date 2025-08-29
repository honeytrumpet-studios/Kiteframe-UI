import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { DefaultNode } from './DefaultNode';
import { ImageNode } from './ImageNode';
import { KFrame } from './KFrame';
import { ConnectionEdge } from './ConnectionEdge';
import { SmartConnectOverlay } from './SmartConnectOverlay';
import { MiniMap } from './MiniMap';
import { useSmartConnect } from '../hooks/useSmartConnect';
import { MapNode } from './MapNode';
import { LiveDataNode } from './LiveDataNode';
import { D3ChartNode } from './D3ChartNode';
import { AnnotationNode } from './AnnotationNode';
import type { Node, Edge, FlowCallbacks, SnapSettings } from '../types';

interface KiteFrameCanvasProps extends FlowCallbacks {
  nodes: Node[];
  edges: Edge[];
  className?: string;
  style?: React.CSSProperties;
  defaultViewport?: { x: number; y: number; zoom: number };
  disableZoom?: boolean;
  alwaysShowHandles?: boolean;
  onNodeResize?: (id: string, width: number, height: number) => void;
  snapSettings?: SnapSettings;
}

export function KiteFrameCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onNodeSettingsChange,
  className,
  style,
  defaultViewport = { x: 0, y: 0, zoom: 1 },
  disableZoom = false,
  alwaysShowHandles = false,
  onNodeResize,
  snapSettings,
}: KiteFrameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(defaultViewport);
  const [draggingNode, setDraggingNode] = useState<{ id: string; offset: { x: number; y: number } } | null>(null);
  const [draggingConn, setDraggingConn] = useState<{ sourceNodeId: string; sourceHandle: string } | null>(null);
  const [isActiveCanvas, setIsActiveCanvas] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const { 
    smartConnectPreview, 
    clearSmartConnectPreview, 
    updateSmartConnectPreview 
  } = useSmartConnect({
    nodes,
    onConnect,
    threshold: 50
  });

  // Helper functions
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: screenX, y: screenY };
    return {
      x: (screenX - rect.left - viewport.x) / viewport.zoom,
      y: (screenY - rect.top - viewport.y) / viewport.zoom
    };
  }, [viewport]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
    
    if (draggingNode) {
      const canvasCoords = screenToCanvas(e.clientX, e.clientY);
      const newPosition = {
        x: canvasCoords.x - draggingNode.offset.x,
        y: canvasCoords.y - draggingNode.offset.y
      };
      
      // Apply boundary constraints
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasWidth = rect.width;
        const canvasHeight = rect.height;
        const nodeWidth = nodes.find(n => n.id === draggingNode.id)?.style?.width || 200;
        const nodeHeight = nodes.find(n => n.id === draggingNode.id)?.style?.height || 100;
        
        newPosition.x = Math.max(0, Math.min(newPosition.x, canvasWidth - nodeWidth));
        newPosition.y = Math.max(0, Math.min(newPosition.y, canvasHeight - nodeHeight));
      }
      
      console.log('DEBUG: Dragging node:', draggingNode.id, 'to position:', newPosition);
      
      const updatedNodes = nodes.map(node => 
        node.id === draggingNode.id 
          ? { ...node, position: newPosition }
          : node
      );
      
      onNodesChange?.(updatedNodes);
    }
  }, [draggingNode, nodes, onNodesChange, screenToCanvas]);

  const handleMouseUp = useCallback(() => {
    if (draggingNode) {
      console.log('DEBUG: Stopped dragging node:', draggingNode.id);
      setDraggingNode(null);
    }
    setIsActiveCanvas(false);
  }, [draggingNode]);

  const handleNodeDrag = useCallback((nodeId: string, position: { x: number; y: number }) => {
    console.log('DEBUG: handleNodeDrag called for node:', nodeId, 'position:', position);
    const updatedNodes = nodes.map(node => 
      node.id === nodeId 
        ? { ...node, position }
        : node
    );
    onNodesChange?.(updatedNodes);
  }, [nodes, onNodesChange]);

  const handleConnectStart = useCallback((nodeId: string, handlePosition: string) => {
    console.log('DEBUG: Connect start from node:', nodeId, 'handle:', handlePosition);
    setDraggingConn({ sourceNodeId: nodeId, sourceHandle: handlePosition });
  }, []);

  const handleConnectEnd = useCallback((nodeId: string, handlePosition: string) => {
    console.log('DEBUG: Connect end to node:', nodeId, 'handle:', handlePosition);
    if (draggingConn) {
      const newEdge: Edge = {
        id: `${draggingConn.sourceNodeId}-${nodeId}`,
        source: draggingConn.sourceNodeId,
        target: nodeId,
        type: 'smoothstep',
        animated: true
      };
      
      onEdgesChange?.([...edges, newEdge]);
      onConnect?.(newEdge);
    }
    setDraggingConn(null);
  }, [draggingConn, edges, onEdgesChange, onConnect]);

  // Event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Canvas size tracking
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

  const renderNode = (node: Node) => {
    const nodeProps = {
      node,
      onDrag: handleNodeDrag,
      onClick: onNodeClick,
      onDoubleClick: onNodeDoubleClick,
      onNodeSettingsChange,
      viewport,
      onConnectStart: handleConnectStart,
      onConnectEnd: handleConnectEnd,
      alwaysShowHandles,
      onNodeResize,
    };

    console.log('DEBUG: Rendering node:', node.id, 'type:', node.type, 'z-index:', node.type === 'kframe' ? 1 : 15);

    const nodeContainer = (content: React.ReactNode, zIndex: number) => (
      <div
        key={node.id}
        className={`absolute ${node.selected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          cursor: node.draggable !== false ? 'grab' : 'default',
          zIndex
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (node.draggable !== false) {
            setIsActiveCanvas(true);
            const canvasCoords = screenToCanvas(e.clientX, e.clientY);
            const offset = {
              x: canvasCoords.x - node.position.x,
              y: canvasCoords.y - node.position.y
            };
            setDraggingNode({ id: node.id, offset });
            console.log('DEBUG: Started dragging node:', node.id, 'type:', node.type);
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
        data-node-id={node.id}
      >
        {content}
      </div>
    );

    switch (node.type) {
      case 'kframe':
        return nodeContainer(
          <KFrame
            id={node.id}
            position={node.position}
            style={node.style}
            data={node.data}
            onNodesChange={onNodesChange}
          />,
          1  // KFrames render behind other nodes
        );
      case 'image':
        return nodeContainer(
          <ImageNode {...nodeProps} />,
          15
        );
      case 'annotation':
        return nodeContainer(
          <AnnotationNode {...nodeProps} />,
          10
        );
      case 'live-data':
        return nodeContainer(
          <LiveDataNode {...nodeProps} />,
          10
        );
      case 'map':
        return nodeContainer(
          <MapNode {...nodeProps} />,
          10
        );
      case 'd3-chart':
        return nodeContainer(
          <D3ChartNode {...nodeProps} />,
          10
        );
      default:
        return nodeContainer(
          <DefaultNode {...nodeProps} />,
          15
        );
    }
  };

  return (
    <div
      ref={canvasRef}
      className={cn('relative w-full h-full bg-gray-50 dark:bg-gray-900 overflow-hidden', className)}
      style={style}
      data-kiteframe-canvas
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="pointer-events-none">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Edges */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {edges.map(edge => (
          <ConnectionEdge
            key={edge.id}
            edge={edge}
            sourceNode={nodes.find(n => n.id === edge.source)}
            targetNode={nodes.find(n => n.id === edge.target)}
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
              style: { width: 0, height: 0 },
              data: { label: '' }
            }}
            onClick={undefined}
          />
        )}
        
        {/* Smart Connect Preview */}
        {smartConnectPreview && (
          <SmartConnectOverlay preview={smartConnectPreview} />
        )}
      </svg>

      {/* Nodes */}
      {Array.isArray(nodes) && nodes.map(node => renderNode(node))}
    </div>
  );
}