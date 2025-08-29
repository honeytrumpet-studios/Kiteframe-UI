import React, { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Node, Edge } from '../types';

interface MiniMapProps {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  canvasSize: { width: number; height: number };
  onViewportChange: (viewport: { x: number; y: number; zoom: number }) => void;
  className?: string;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  nodes,
  edges,
  viewport,
  canvasSize,
  onViewportChange,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Calculate content bounds
  const getContentBounds = useCallback(() => {
    const defaultCanvasSize = { width: 800, height: 600 };
    const safeCanvasSize = canvasSize || defaultCanvasSize;
    
    if (nodes.length === 0) {
      return { minX: 0, maxX: safeCanvasSize.width, minY: 0, maxY: safeCanvasSize.height };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      const nodeWidth = node.style?.width || 200;
      const nodeHeight = node.style?.height || 100;
      
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    // Add padding
    const padding = 100;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    return { minX, maxX, minY, maxY };
  }, [nodes, canvasSize]);

  const contentBounds = getContentBounds();
  const contentWidth = contentBounds.maxX - contentBounds.minX;
  const contentHeight = contentBounds.maxY - contentBounds.minY;

  // Minimap dimensions - half size when not hovered, full size when hovered
  const baseWidth = 200;
  const baseHeight = 150;
  const minimapWidth = isHovered ? baseWidth : baseWidth / 2;
  const minimapHeight = isHovered ? baseHeight : baseHeight / 2;

  // Calculate scale to fit content in minimap with fallback for invalid values
  const validContentWidth = contentWidth > 0 ? contentWidth : 800;
  const validContentHeight = contentHeight > 0 ? contentHeight : 600;
  const scale = Math.min(minimapWidth / validContentWidth, minimapHeight / validContentHeight);
  const safeScale = isFinite(scale) && scale > 0 ? scale : 0.1;

  // Transform coordinates from world space to minimap space
  const worldToMinimap = useCallback((x: number, y: number) => {
    const safeX = isFinite(x) ? x : 0;
    const safeY = isFinite(y) ? y : 0;
    return {
      x: (safeX - contentBounds.minX) * safeScale,
      y: (safeY - contentBounds.minY) * safeScale
    };
  }, [contentBounds, safeScale]);

  // Transform coordinates from minimap space to world space
  const minimapToWorld = useCallback((x: number, y: number) => {
    const safeX = isFinite(x) ? x : 0;
    const safeY = isFinite(y) ? y : 0;
    return {
      x: (safeX / safeScale) + contentBounds.minX,
      y: (safeY / safeScale) + contentBounds.minY
    };
  }, [contentBounds, safeScale]);

  // Calculate viewport rectangle in minimap space
  const defaultViewport = { x: 0, y: 0, zoom: 1 };
  const defaultCanvasSize = { width: 800, height: 600 };
  const safeViewport = viewport || defaultViewport;
  const safeCanvasSize = canvasSize || defaultCanvasSize;
  
  // Ensure all viewport values are valid numbers
  const safeViewportX = isFinite(safeViewport.x) ? safeViewport.x : 0;
  const safeViewportY = isFinite(safeViewport.y) ? safeViewport.y : 0;
  const safeViewportZoom = isFinite(safeViewport.zoom) && safeViewport.zoom > 0 ? safeViewport.zoom : 1;
  const safeCanvasWidth = isFinite(safeCanvasSize.width) && safeCanvasSize.width > 0 ? safeCanvasSize.width : 800;
  const safeCanvasHeight = isFinite(safeCanvasSize.height) && safeCanvasSize.height > 0 ? safeCanvasSize.height : 600;
  
  const viewportRect = {
    x: (-safeViewportX / safeViewportZoom - contentBounds.minX) * safeScale,
    y: (-safeViewportY / safeViewportZoom - contentBounds.minY) * safeScale,
    width: (safeCanvasWidth / safeViewportZoom) * safeScale,
    height: (safeCanvasHeight / safeViewportZoom) * safeScale
  };

  // Ensure viewport rect values are valid numbers
  const safeViewportRect = {
    x: isFinite(viewportRect.x) ? viewportRect.x : 0,
    y: isFinite(viewportRect.y) ? viewportRect.y : 0,
    width: isFinite(viewportRect.width) && viewportRect.width > 0 ? viewportRect.width : 10,
    height: isFinite(viewportRect.height) && viewportRect.height > 0 ? viewportRect.height : 10
  };

  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const worldPos = minimapToWorld(x, y);
    
    // Center the viewport on the clicked position
    const newViewport = {
      x: -(worldPos.x - safeCanvasWidth / 2 / safeViewportZoom) * safeViewportZoom,
      y: -(worldPos.y - safeCanvasHeight / 2 / safeViewportZoom) * safeViewportZoom,
      zoom: safeViewportZoom
    };
    
    onViewportChange(newViewport);
  }, [minimapToWorld, safeCanvasWidth, safeCanvasHeight, safeViewportZoom, onViewportChange]);

  const handleViewportDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const worldPos = minimapToWorld(x, y);
    
    // Center the viewport on the dragged position
    const newViewport = {
      x: -(worldPos.x - safeCanvasWidth / 2 / safeViewportZoom) * safeViewportZoom,
      y: -(worldPos.y - safeCanvasHeight / 2 / safeViewportZoom) * safeViewportZoom,
      zoom: safeViewportZoom
    };
    
    onViewportChange(newViewport);
  }, [isDragging, minimapToWorld, safeCanvasWidth, safeCanvasHeight, safeViewportZoom, onViewportChange]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      setTouchStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setIsDragging(true);
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && touchStart) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const worldPos = minimapToWorld(x, y);
      
      // Center the viewport on the touched position
      const newViewport = {
        x: -(worldPos.x - safeCanvasWidth / 2 / safeViewportZoom) * safeViewportZoom,
        y: -(worldPos.y - safeCanvasHeight / 2 / safeViewportZoom) * safeViewportZoom,
        zoom: safeViewportZoom
      };
      
      onViewportChange(newViewport);
      e.preventDefault();
    }
  }, [isDragging, touchStart, minimapToWorld, safeCanvasWidth, safeCanvasHeight, safeViewportZoom, onViewportChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setTouchStart(null);
  }, []);

  if (isCollapsed) {
    return (
      <div className={`absolute bottom-4 left-4 z-50 ${className}`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`absolute bottom-4 left-4 z-50 transition-all duration-200 ease-in-out ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-md overflow-hidden transition-all duration-200 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-600">
          <span className={`font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 ${isHovered ? 'text-sm' : 'text-xs'}`}>
            Minimap
          </span>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronDown className={`transition-all duration-200 ${isHovered ? 'w-4 h-4' : 'w-3 h-3'}`} />
          </button>
        </div>
        
        {/* Minimap Content */}
        <div className={`transition-all duration-200 ${isHovered ? 'p-2' : 'p-1'}`}>
          <svg
            width={minimapWidth}
            height={minimapHeight}
            className="border border-gray-200 dark:border-gray-600 rounded cursor-pointer transition-all duration-200 touch-manipulation"
            onClick={handleMinimapClick}
            onMouseMove={handleViewportDrag}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background */}
            <rect
              width={minimapWidth}
              height={minimapHeight}
              fill="currentColor"
              className="text-gray-100 dark:text-gray-700"
            />
            
            {/* Edges */}
            {edges.filter((edge, index, arr) => 
              arr.findIndex(e => e.id === edge.id) === index // Remove duplicates
            ).map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const sourcePos = worldToMinimap(
                sourceNode.position.x + (sourceNode.style?.width || 200) / 2,
                sourceNode.position.y + (sourceNode.style?.height || 100) / 2
              );
              const targetPos = worldToMinimap(
                targetNode.position.x + (targetNode.style?.width || 200) / 2,
                targetNode.position.y + (targetNode.style?.height || 100) / 2
              );
              
              return (
                <line
                  key={`minimap-edge-${edge.id}-${Date.now()}-${Math.random()}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="currentColor"
                  strokeWidth={1}
                  className="text-gray-400 dark:text-gray-500"
                />
              );
            })}
            
            {/* Nodes */}
            {nodes.filter((node, index, arr) => 
              arr.findIndex(n => n.id === node.id) === index // Remove duplicate nodes
            ).map(node => {
              const pos = worldToMinimap(node.position.x, node.position.y);
              const nodeWidth = (node.style?.width || 200) * safeScale;
              const nodeHeight = (node.style?.height || 100) * safeScale;
              
              // Get node colors from data or style properties
              const nodeBackgroundColor = node.data?.labelBackgroundColor || '#f1f5f9';
              const nodeBorderColor = node.data?.borderColor || '#64748b';
              
              // Create light version of the background color (50% opacity)
              const lightFillColor = nodeBackgroundColor.startsWith('#') 
                ? nodeBackgroundColor + '80'  // Add 50% opacity
                : nodeBackgroundColor.includes('rgb') 
                  ? nodeBackgroundColor.replace('rgb(', 'rgba(').replace(')', ', 0.5)')
                  : nodeBackgroundColor + '80';
              
              // KFrames show with light fill and 1px dashed stroke
              if (node.type === 'kframe') {
                return (
                  <rect
                    key={node.id}
                    x={isFinite(pos.x) ? pos.x : 0}
                    y={isFinite(pos.y) ? pos.y : 0}
                    width={Math.max(isFinite(nodeWidth) ? nodeWidth : 2, 2)}
                    height={Math.max(isFinite(nodeHeight) ? nodeHeight : 2, 2)}
                    fill={lightFillColor}
                    stroke={nodeBorderColor}
                    strokeWidth="1"
                    strokeDasharray="2,1"
                    rx="4"
                  />
                );
              }
              
              return (
                <rect
                  key={node.id}
                  x={isFinite(pos.x) ? pos.x : 0}
                  y={isFinite(pos.y) ? pos.y : 0}
                  width={Math.max(isFinite(nodeWidth) ? nodeWidth : 2, 2)}
                  height={Math.max(isFinite(nodeHeight) ? nodeHeight : 2, 2)}
                  fill={lightFillColor}
                  stroke={nodeBorderColor}
                  strokeWidth="1"
                  rx="2"
                />
              );
            })}
            
            {/* Viewport indicator */}
            <rect
              x={Math.max(0, Math.min(minimapWidth - safeViewportRect.width, safeViewportRect.x))}
              y={Math.max(0, Math.min(minimapHeight - safeViewportRect.height, safeViewportRect.y))}
              width={Math.min(safeViewportRect.width, minimapWidth)}
              height={Math.min(safeViewportRect.height, minimapHeight)}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="4,4"
              className="text-red-500 dark:text-red-400"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};