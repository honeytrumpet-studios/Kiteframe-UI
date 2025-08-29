import React, { useState, useRef, useEffect } from 'react';
import { Node } from '../types';
import { Plus, ArrowRight, ArrowDown, ArrowLeft, ArrowUp } from 'lucide-react';

export interface NodeHandlesProps {
  node: Node;
  onHandleConnect?: (pos: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  onConnectStart?: (nodeId: string, handlePosition: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  onQuickAddNode?: (nodeId: string, handlePosition: 'top'|'bottom'|'left'|'right') => void;
  alwaysShowHandles?: boolean; // Default false for hover behavior
  nodeWidth?: number; // Override node width for positioning
  nodeHeight?: number; // Override node height for positioning
  enableGhostPreview?: boolean; // Enable ghost preview for quick node creation
  hideHandlesWhenEdgeSelected?: boolean; // Hide when edges are selected
}

export const NodeHandles: React.FC<NodeHandlesProps> = ({ 
  node, 
  onHandleConnect, 
  onConnectStart, 
  onConnectEnd, 
  onQuickAddNode,
  alwaysShowHandles = false, 
  nodeWidth, 
  nodeHeight,
  enableGhostPreview = false,
  hideHandlesWhenEdgeSelected = false
}) => {
  const [hoveredHandle, setHoveredHandle] = useState<'top'|'bottom'|'left'|'right' | null>(null);
  const [deepHoveredHandle, setDeepHoveredHandle] = useState<'top'|'bottom'|'left'|'right' | null>(null);
  const deepHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const size = 12;
  const half = size / 2;
  const w = nodeWidth ?? node.width ?? node.style?.width ?? 200;
  const h = nodeHeight ?? node.height ?? node.style?.height ?? 100;

  // Check if node-level showHandles is explicitly set to false
  const shouldShowHandles = (node as any).showHandles !== false;
  
  // Check for enableGhostPreview in node data or props
  const ghostPreviewEnabled = enableGhostPreview || node.data?.enableGhostPreview;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (deepHoverTimeoutRef.current) {
        clearTimeout(deepHoverTimeoutRef.current);
      }
    };
  }, []);

  // Clear all hover states and timeouts
  const clearAllHoverStates = () => {
    if (deepHoverTimeoutRef.current) {
      clearTimeout(deepHoverTimeoutRef.current);
      deepHoverTimeoutRef.current = null;
    }
    setHoveredHandle(null);
    setDeepHoveredHandle(null);
  };

  // Clear only deep hover state but keep + button visible
  const clearDeepHover = () => {
    if (deepHoverTimeoutRef.current) {
      clearTimeout(deepHoverTimeoutRef.current);
      deepHoverTimeoutRef.current = null;
    }
    setDeepHoveredHandle(null);
  };

  // Add 6px gap between handle EDGE and node boundary for all nodes and kframes
  // Need to account for handle radius (6px) when positioning center point
  const desiredGap = 6;
  const totalOffset = desiredGap + half; // 6px gap + 6px radius = 12px from center
  const positions: Record<'top'|'bottom'|'left'|'right', { cx: number; cy: number }> = {
    top: { cx: w / 2, cy: -totalOffset },
    bottom: { cx: w / 2, cy: h + totalOffset },
    left: { cx: -totalOffset, cy: h / 2 },
    right: { cx: w + totalOffset, cy: h / 2 },
  };



  // Debug logging for handle visibility
  // console.log('[NodeHandles] Render check:', {
  //   nodeId: node.id,
  //   nodeType: node.type,
  //   shouldShowHandles,
  //   hideHandlesWhenEdgeSelected,
  //   alwaysShowHandles,
  //   nodeHandlesConfig: node.data?.handles,
  //   onConnectStart: !!onConnectStart,
  //   onConnectEnd: !!onConnectEnd,
  //   willRender: shouldShowHandles && !hideHandlesWhenEdgeSelected
  // });

  // If node-level showHandles is set to false or edges are selected, don't render handles at all
  if (!shouldShowHandles || hideHandlesWhenEdgeSelected) {
    console.log('[NodeHandles] Not rendering handles:', { shouldShowHandles, hideHandlesWhenEdgeSelected });
    return null;
  }

  // Get arrow icon for each direction
  const getArrowIcon = (pos: 'top'|'bottom'|'left'|'right') => {
    switch(pos) {
      case 'top': return ArrowUp;
      case 'bottom': return ArrowDown;
      case 'left': return ArrowLeft; 
      case 'right': return ArrowRight;
      default: return ArrowRight;
    }
  };

  // Calculate ghost node position based on handle position
  const getGhostNodePosition = (pos: 'top'|'bottom'|'left'|'right') => {
    const lineDistance = 160; // Length of preview line from handle
    const ghostWidth = 200; // Match toolbar default node size
    const ghostHeight = 100; // Match toolbar default node size
    
    switch(pos) {
      case 'top': 
        return { 
          left: (w - ghostWidth) / 2, // Center horizontally on node
          top: -lineDistance - ghostHeight // Position at end of upward line
        };
      case 'bottom': 
        return { 
          left: (w - ghostWidth) / 2, // Center horizontally on node  
          top: h + lineDistance // Position at end of downward line
        };
      case 'left': 
        return { 
          left: -lineDistance - ghostWidth, // Position at end of leftward line
          top: (h - ghostHeight) / 2 // Center vertically on node
        };
      case 'right': 
        return { 
          left: w + lineDistance, // Position at end of rightward line
          top: (h - ghostHeight) / 2 // Center vertically on node
        };
      default: 
        return { left: w + lineDistance, top: (h - ghostHeight) / 2 };
    }
  };

  return (
    <>
      <svg 
        width={w} 
        height={h} 
        className={`kiteline-node-handles absolute top-0 left-0 pointer-events-none overflow-visible ${
          alwaysShowHandles ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } transition-opacity duration-200`}
        style={{ zIndex: 10 }}
      >
        {/* Handles for each position */}
        {Object.entries(positions).map(([pos, coords]) => {
          const position = pos as 'top'|'bottom'|'left'|'right';
          const isVisible = alwaysShowHandles || hoveredHandle === position || deepHoveredHandle === position;
          const isHovered = hoveredHandle === position;
          const isDeepHovered = deepHoveredHandle === position;

          // Calculate offset position for + button (28px away from handle)
          const getOffsetPosition = (pos: 'top'|'bottom'|'left'|'right') => {
            const offset = 28;
            switch(pos) {
              case 'top': return { x: coords.cx, y: coords.cy - offset };
              case 'bottom': return { x: coords.cx, y: coords.cy + offset };
              case 'left': return { x: coords.cx - offset, y: coords.cy };
              case 'right': return { x: coords.cx + offset, y: coords.cy };
            }
          };

          const offsetPos = getOffsetPosition(position);

          return (
            <g key={position}>
              {!ghostPreviewEnabled ? (
                /* Regular connection handle (blue dot) */
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r={half}
                  className="kiteline-handle pointer-events-auto cursor-crosshair hover:fill-blue-100 transition-all duration-200"
                  fill="white"
                  stroke={node.data?.borderColor || "#3b82f6"}
                  strokeWidth={2}
                  onMouseDown={(e) => {
                    console.log('[NodeHandles] Handle mousedown:', { nodeId: node.id, position: pos, button: e.button });
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    if (e.button === 0) {
                      onHandleConnect?.(position, e);
                      onConnectStart?.(node.id, position, e);
                    }
                  }}
                  onMouseUp={(e) => {
                    console.log('[NodeHandles] Handle mouseup:', { nodeId: node.id, position: pos, button: e.button });
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    if (e.button === 0) {
                      onConnectEnd?.(node.id, position, e);
                    }
                  }}
                />
              ) : (
                /* FigJam-style handles: Always show original handle + offset + button */
                <>
                  {/* Original blue dot handle (always visible) */}
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r={half}
                    className="kiteline-handle pointer-events-auto cursor-crosshair transition-all duration-200"
                    fill="white"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    onMouseDown={(e) => {
                      console.log('[NodeHandles] Handle mousedown:', { nodeId: node.id, position: position, button: e.button });
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      if (e.button === 0) {
                        onHandleConnect?.(position, e);
                        onConnectStart?.(node.id, position, e);
                      }
                    }}
                    onMouseUp={(e) => {
                      console.log('[NodeHandles] Handle mouseup:', { nodeId: node.id, position: position, button: e.button });
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      if (e.button === 0) {
                        onConnectEnd?.(node.id, position, e);
                      }
                    }}
                    onMouseEnter={() => setHoveredHandle(position)}
                  />

                  {/* + Button (offset 6px from original handle) */}
                  {isHovered && (
                    <g
                      onMouseLeave={() => {
                        // Use shorter delay before clearing to allow user to move between elements
                        setTimeout(() => {
                          clearAllHoverStates();
                        }, 100);
                      }}
                      onMouseEnter={() => {
                        // Clear any existing timeout
                        if (deepHoverTimeoutRef.current) {
                          clearTimeout(deepHoverTimeoutRef.current);
                        }
                        // Start timer for deep hover state
                        deepHoverTimeoutRef.current = setTimeout(() => {
                          setDeepHoveredHandle(position);
                        }, 300);
                      }}
                    >
                      {/* Larger + button circle (75% bigger) */}
                      <circle
                        cx={offsetPos.x}
                        cy={offsetPos.y}
                        r={14}
                        className="kiteline-handle pointer-events-auto cursor-pointer transition-all duration-200"
                        fill={isDeepHovered ? "#3b82f6" : "white"}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        onClick={(e) => {
                          console.log('[NodeHandles] + Button click:', { nodeId: node.id, position: position, button: e.button });
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          if (e.button === 0) {
                            onQuickAddNode?.(node.id, position);
                          }
                        }}
                      />
                      {/* + Icon (75% bigger) */}
                      <foreignObject
                        x={offsetPos.x - 10.5}
                        y={offsetPos.y - 10.5}
                        width={21}
                        height={21}
                        className="pointer-events-none"
                      >
                        <Plus 
                          size={21} 
                          className={isDeepHovered ? "text-white" : "text-blue-600"}
                          style={{ 
                            transition: 'all 0.2s ease-in-out'
                          }} 
                        />
                      </foreignObject>
                    </g>
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Ghost node preview (State 3) */}
      {ghostPreviewEnabled && deepHoveredHandle && (
        <>
          {/* Ghost connecting line */}
          <svg 
            width={w + 320} 
            height={h + 320} 
            style={{ 
              position: 'absolute', 
              top: -160, 
              left: -160,
              pointerEvents: 'none',
              zIndex: 9
            }}
          >
            {(() => {
              const handlePos = positions[deepHoveredHandle];
              const ghostPos = getGhostNodePosition(deepHoveredHandle);
              const startX = handlePos.cx + 160;
              const startY = handlePos.cy + 160;
              
              // Calculate end position (center of ghost node)
              const endX = ghostPos.left + 100 + 160; // Ghost node center (100 = 200/2)
              const endY = ghostPos.top + 50 + 160; // Ghost node center (50 = 100/2)
              
              return (
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  opacity={0.6}
                />
              );
            })()}
          </svg>

          {/* Ghost node positioned at end of preview line */}
          <div
            style={{
              position: 'absolute',
              ...getGhostNodePosition(deepHoveredHandle),
              width: 200, // Match toolbar default node size
              height: 100, // Match toolbar default node size
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '2px dashed #9ca3af',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#9ca3af',
              fontWeight: '500',
              pointerEvents: 'none',
              zIndex: 8,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            New Node
          </div>
        </>
      )}
    </>
  );
};