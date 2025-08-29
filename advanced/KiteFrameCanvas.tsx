import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { DefaultNode } from './DefaultNode';
import { ImageNode } from './ImageNode';
import { KFrame } from './KFrame';
import { ConnectionEdge } from './ConnectionEdge';
import { SmartConnectOverlay } from './SmartConnectOverlay';
import { MiniMap } from './MiniMap';
import { SnapGuides } from './SnapGuides';
import { GridBackground } from './GridBackground';
import { ReactionBubble, CombinedReactionBubble } from './ReactionBubble';
import { FloatingToolbar } from './FloatingToolbar';
import { GhostNodePreview } from './GhostNodePreview';
import { CanvasCommentSystem } from '../collaboration/CanvasCommentSystem';
import { useSmartConnect } from '../hooks/useSmartConnect';
import { MapNode } from './MapNode';
import { LiveDataNode } from './LiveDataNode';
import { D3MetricNode } from './D3MetricNode';
import { AnnotationNode } from './AnnotationNode';
import { WeatherNode } from './WeatherNode';
import { DuckApiNode } from './DuckApiNode';
import { SparkleNodeWrapper } from './SparkleNodeWrapper';
import { NestedLayersPanel, buildLayerStructure } from './layers';

import { NasaApodNode } from './NasaApodNode';
import { ChartNode } from './ChartNode';
import { DataTransformerNode } from './DataTransformerNode';
import { InputJsonNode } from './InputJsonNode';
import { OutputJsonNode } from './OutputJsonNode';
import { TextExtractorNode } from './TextExtractorNode';
import { TextOutputNode } from './TextOutputNode';
import { ConcatNode } from './ConcatNode';
import { InputSoundNode } from './InputSoundNode';
import { SoundTransformerNode } from './SoundTransformerNode';
import { OutputSoundNode } from './OutputSoundNode';
import { BaseApiNode } from './BaseApiNode';
import { GraphicNode } from './GraphicNode';
import { TextInputNode } from './TextInputNode';
import { TextNode } from './TextNode';
import { calculateSnapPosition, findAlignmentGuides, defaultSnapSettings, type SnapSettings } from '../utils/snapUtils';

import type { Node, Edge, FlowCallbacks } from '../types';

interface KiteFrameCanvasProps extends FlowCallbacks {
  nodes: Node[];
  edges: Edge[];
  className?: string;
  style?: React.CSSProperties;
  defaultViewport?: { x: number; y: number; zoom: number };
  disableZoom?: boolean;
  disablePan?: boolean;
  alwaysShowHandles?: boolean;
  onNodeResize?: (id: string, width: number, height: number) => void;
  snapSettings?: SnapSettings;
  enableAISuggestions?: boolean;
  selectedNodes?: string[];
  selectedEdges?: string[];
  selectedTexts?: string[];
  canvasTexts?: any[];
  onTextStyleChange?: (textId: string, style: any) => void;
  // New drag event hooks
  onNodeDragStart?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDrag?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDragEnd?: (nodeId: string, position: { x: number; y: number }) => void;
  // Edge type for new connections
  defaultEdgeType?: 'line' | 'step' | 'smoothstep' | 'bezier';
  // Grid type for background
  gridType?: 'lines' | 'dots' | 'crosshairs' | 'none';
  // Viewport control
  viewportState?: { x: number; y: number; zoom: number };
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
  // Zoom limits
  minZoom?: number;
  maxZoom?: number;
  // MiniMap control
  showMiniMap?: boolean;
  // Comment system props
  isCommentMode?: boolean;
  onCommentModeToggle?: () => void;
  onCommentAdd?: (comment: any) => void;
  onCommentUpdate?: (comment: any) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentFocus?: (comment: any) => void;
  // Canvas click handler with optional position for text tool
  onCanvasClick?: (event?: React.MouseEvent, position?: { x: number; y: number }) => void;
  // Text tool support
  activeTextTool?: boolean;
  onActiveTextToolChange?: (active: boolean) => void;
  // Edge visibility
  showEdges?: boolean;
  // Reactions
  reactions?: Array<{
    id: string;
    nodeId: string;
    emoji: string;
    count: number;
  }>;
  onReactionRemove?: (reactionId: string) => void;
  // Node duplication and deletion
  onNodeDuplicate?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  // Selection change callback
  onSelectionChange?: (selectedNodeIds: string[]) => void;
  // Speed controls
  zoomSpeed?: number;
  panSpeed?: number;
  // FigJam-inspired features
  enableFloatingToolbar?: boolean;
  enableGhostPreview?: boolean;
  onQuickAddNode?: (sourceNodeId: string, handlePosition: 'top'|'bottom'|'left'|'right', nodeType?: string) => void;
  // Edge label editing
  onEdgeLabelChange?: (edgeId: string, newLabel: string) => void;
  // Edge reconnection
  onEdgeReconnect?: (edgeId: string, newSource?: string, newTarget?: string) => void;
  // KFrame label and description changes
  onKFrameLabelChange?: (nodeId: string, label: string) => void;
  onKFrameDescriptionChange?: (nodeId: string, description: string) => void;
  // Node label and description changes
  onNodeLabelChange?: (nodeId: string, label: string) => void;
  onNodeDescriptionChange?: (nodeId: string, description: string) => void;
  // Icon changes for nodes and KFrames
  onIconChange?: (nodeId: string, icon: string, iconType: 'lucide' | 'emoji') => void;
  // Workflow optimization
  onWorkflowOptimize?: (workflowId: string) => void;
  workflowOptimizationState?: {
    nodeId: string;
    workflowId: string;
    canOptimize: boolean;
    isOptimized: boolean;
  } | null;
  // UI Mock generation
  onGenerateUIMock?: (nodeId: string) => void;
  // Layers panel control
  showLayersPanel?: boolean;
  onLayerSelect?: (id: string, type: string) => void;
  // Ghost preview data for snapshot previews
  ghostPreviewData?: {
    nodes: Node[];
    edges: Edge[];
    label: string;
  };
}

export function KiteFrameCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeDoubleClick,
  onNodeRightClick,
  onEdgeClick,
  onEdgeDoubleClick,
  onNodeSettingsChange,
  onKFrameLabelChange = () => {},
  onKFrameDescriptionChange = () => {},
  onNodeLabelChange = () => {},
  onNodeDescriptionChange = () => {},
  onCanvasClick,
  onHandleConnect,
  className,
  style,
  defaultViewport = { x: 0, y: 0, zoom: 1 },
  disableZoom = false,
  disablePan = false,
  alwaysShowHandles = false,
  onNodeResize,
  minZoom = 0.1,
  maxZoom = 4,
  snapSettings,
  selectedNodes = [],
  selectedEdges = [],
  selectedTexts = [],
  canvasTexts = [],
  onTextStyleChange,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  defaultEdgeType = 'smoothstep',
  gridType = 'lines',
  viewportState,
  onViewportChange,
  showMiniMap = true,
  showEdges = true,
  reactions = [],
  onReactionRemove,
  onNodeDuplicate,
  onDeleteNode,
  onSelectionChange,
  zoomSpeed = 0.1,
  panSpeed = 1.0,
  enableFloatingToolbar = false,
  enableGhostPreview = false,
  ghostPreviewData,
  onQuickAddNode,
  onEdgeLabelChange,
  onEdgeReconnect,
  onIconChange,
  enableAISuggestions = false,
  activeTextTool = false,
  onActiveTextToolChange,
  onWorkflowOptimize,
  workflowOptimizationState,
  onGenerateUIMock,
  isCommentMode = false,
  onCommentModeToggle,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
  onCommentFocus,
  showLayersPanel = false,
  onLayerSelect,
}: KiteFrameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [internalViewport, setInternalViewport] = useState(defaultViewport);
  const currentViewport = viewportState || internalViewport;
  
  // Build layer structure for the layers panel
  const layerStructure = React.useMemo(() => {
    return buildLayerStructure(nodes, edges, canvasTexts);
  }, [nodes, edges, canvasTexts]);
  
  // Function to update viewport
  const updateViewport = useCallback((newViewport: { x: number; y: number; zoom: number }) => {
    if (onViewportChange) {
      onViewportChange(newViewport);
    } else {
      setInternalViewport(newViewport);
    }
  }, [onViewportChange]);
  const [draggingNode, setDraggingNode] = useState<{ id: string; offset: { x: number; y: number } } | null>(null);
  const [draggingConn, setDraggingConn] = useState<{ sourceNodeId: string; sourceHandle: string } | null>(null);
  const [isActiveCanvas, setIsActiveCanvas] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  // FigJam-inspired features state
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ghostPreview, setGhostPreview] = useState<{
    visible: boolean;
    nodeId: string;
    handlePosition: 'top'|'bottom'|'left'|'right';
    position: { x: number; y: number };
  } | null>(null);
  const [snapGuides, setSnapGuides] = useState<any[]>([]);
  const [dropZoneFrame, setDropZoneFrame] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [edgeHandleDragActive, setEdgeHandleDragActive] = useState(false);
  
  // Hover state for unadopt buttons
  const [hoveredChildNode, setHoveredChildNode] = useState<string | null>(null);
  
  // Adoption feedback state
  const [adoptionFeedback, setAdoptionFeedback] = useState<{
    frameId: string;
    position: { x: number; y: number };
  } | null>(null);
  
  // Drag delay state
  const [pendingDrag, setPendingDrag] = useState<{ nodeId: string; offset: { x: number; y: number }; startPos: { x: number; y: number } } | null>(null);
  const dragDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const DRAG_DELAY_MS = 50; // Wait 50ms before starting drag
  const DRAG_THRESHOLD_PX = 5; // Move 5px before starting drag
  
  // Touch support state
  const [lastTouches, setLastTouches] = useState<React.TouchList | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number>(0);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchMode, setTouchMode] = useState<'none' | 'pan' | 'pinch' | 'drag'>('none');
  
  // Comment system click handler - use ref to avoid state updates
  const commentClickHandlerRef = useRef<((e: any, screenPos?: { x: number; y: number }) => boolean) | null>(null);
  
  // Callback to receive comment click handler from CanvasCommentSystem
  const handleCommentClickHandlerCallback = useCallback((handler: (e: any, screenPos?: { x: number; y: number }) => boolean) => {

    commentClickHandlerRef.current = handler;
  }, []);
  
  // Touch utility functions
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length === 0) return { x: 0, y: 0 };
    if (touches.length === 1) return { x: touches[0].clientX, y: touches[0].clientY };
    
    let x = 0, y = 0;
    for (let i = 0; i < touches.length; i++) {
      x += touches[i].clientX;
      y += touches[i].clientY;
    }
    return { x: x / touches.length, y: y / touches.length };
  };

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    setLastTouches(touches);
    setTouchStartTime(Date.now());
    
    if (touches.length === 1) {
      // Single touch - potential tap, long press, or drag
      const touch = touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const touchPosition = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      setTouchStartPosition(touchPosition);
      setTouchMode('none');
      
      // Set up long press timer for context menu (750ms)
      const timer = setTimeout(() => {
        // Simulate right-click for context menu
        const syntheticEvent = new MouseEvent('contextmenu', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true
        });
        canvasRef.current?.dispatchEvent(syntheticEvent);
        setLongPressTimer(null);
      }, 750);
      setLongPressTimer(timer);
      
    } else if (touches.length === 2) {
      // Two finger touch - pinch to zoom
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      
      const distance = getTouchDistance(touches);
      setInitialPinchDistance(distance);
      setInitialPinchZoom(currentViewport.zoom);
      setIsPinching(true);
      setTouchMode('pinch');
      e.preventDefault();
    }
  }, [currentViewport.zoom, longPressTimer]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    
    if (touches.length === 1 && touchStartPosition && !isPinching) {
      // Single finger - pan or drag
      const touch = touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const currentPosition = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      
      const deltaX = currentPosition.x - touchStartPosition.x;
      const deltaY = currentPosition.y - touchStartPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Clear long press timer if moving
      if (longPressTimer && distance > 10) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      
      if (touchMode === 'none' && distance > 10) {
        setTouchMode('pan');
      }
      
      if (touchMode === 'pan' && !disablePan) {
        // Pan the viewport
        updateViewport({
          ...currentViewport,
          x: currentViewport.x + deltaX * panSpeed,
          y: currentViewport.y + deltaY * panSpeed
        });
        setTouchStartPosition(currentPosition);
        e.preventDefault();
      }
      
    } else if (touches.length === 2 && isPinching) {
      // Two finger pinch-to-zoom
      const distance = getTouchDistance(touches);
      const center = getTouchCenter(touches);
      const rect = canvasRef.current?.getBoundingClientRect();
      
      if (rect && initialPinchDistance > 0) {
        const scale = distance / initialPinchDistance;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, initialPinchZoom * scale));
        
        // Zoom toward the center of the pinch
        const centerX = center.x - rect.left;
        const centerY = center.y - rect.top;
        
        const zoomFactor = newZoom / currentViewport.zoom;
        const newX = centerX - (centerX - currentViewport.x) * zoomFactor;
        const newY = centerY - (centerY - currentViewport.y) * zoomFactor;
        
        if (!disableZoom) {
          updateViewport({
            x: newX,
            y: newY,
            zoom: newZoom
          });
        }
        e.preventDefault();
      }
    }
    
    setLastTouches(touches);
  }, [touchStartPosition, touchMode, isPinching, longPressTimer, currentViewport, 
      initialPinchDistance, initialPinchZoom, minZoom, maxZoom, disablePan, 
      disableZoom, panSpeed, updateViewport]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (touches.length === 0) {
      // All fingers lifted
      const touchDuration = Date.now() - touchStartTime;
      
      if (touchMode === 'none' && touchDuration < 300) {
        // Quick tap - check if in comment mode first
        if (touchStartPosition) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            // Check if in comment mode and delegate to comment system
            if (isCommentMode && commentClickHandlerRef.current) {
              console.log('[Canvas] Touch tap in comment mode, delegating to comment system');
              const syntheticTouchEvent = {
                changedTouches: [{
                  clientX: touchStartPosition.x + rect.left,
                  clientY: touchStartPosition.y + rect.top,
                }],
                preventDefault: () => {},
                stopPropagation: () => {}
              };
              commentClickHandlerRef.current(syntheticTouchEvent, touchStartPosition);
            } else {
              // Normal tap handling
              const syntheticEvent = {
                clientX: touchStartPosition.x + rect.left,
                clientY: touchStartPosition.y + rect.top,
                preventDefault: () => {},
                stopPropagation: () => {}
              } as React.MouseEvent;
              
              // Transform to canvas coordinates for onCanvasClick
              const canvasPosition = {
                x: (touchStartPosition.x - currentViewport.x) / currentViewport.zoom,
                y: (touchStartPosition.y - currentViewport.y) / currentViewport.zoom
              };
              
              onCanvasClick?.(syntheticEvent, canvasPosition);
            }
          }
        }
      }
      
      setTouchMode('none');
      setIsPinching(false);
      setTouchStartPosition(null);
      setInitialPinchDistance(0);
      setInitialPinchZoom(1);
    } else if (touches.length === 1 && isPinching) {
      // Went from 2 fingers to 1 finger
      setIsPinching(false);
      setTouchMode('none');
      
      // Reset for potential single finger interaction
      const touch = touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setTouchStartPosition({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    }
    
    setLastTouches(touches);
  }, [longPressTimer, touchStartTime, touchMode, touchStartPosition, 
      currentViewport, onCanvasClick, isPinching]);
  
  // FigJam-inspired handlers
  const handleQuickAddNode = useCallback((sourceNodeId: string, handlePosition: 'top'|'bottom'|'left'|'right') => {
    onQuickAddNode?.(sourceNodeId, handlePosition, 'default');
  }, [onQuickAddNode]);

  const handleNodeStyleChange = useCallback((nodeId: string, style: any) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...style } } : node
    );
    onNodesChange?.(updatedNodes);
  }, [nodes, onNodesChange]);

  const handleEdgeStyleChange = useCallback((edgeId: string, style: any) => {
    const updatedEdges = edges.map(edge =>
      edge.id === edgeId ? { ...edge, ...style } : edge
    );
    onEdgesChange?.(updatedEdges);
  }, [edges, onEdgesChange]);

  // Update floating toolbar position when selections change
  useEffect(() => {
    if (enableFloatingToolbar && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        if (selectedNodes.length === 1) {
          const selectedNode = nodes.find(n => n.id === selectedNodes[0]);
          if (selectedNode) {
            setFloatingToolbarPosition({
              x: rect.left + selectedNode.position.x * currentViewport.zoom + currentViewport.x + 100,
              y: rect.top + selectedNode.position.y * currentViewport.zoom + currentViewport.y
            });
          }
        } else if (selectedEdges.length === 1) {
          const selectedEdge = edges.find(e => e.id === selectedEdges[0]);
          const sourceNode = selectedEdge ? nodes.find(n => n.id === selectedEdge.source) : null;
          const targetNode = selectedEdge ? nodes.find(n => n.id === selectedEdge.target) : null;
          if (sourceNode && targetNode) {
            const midX = (sourceNode.position.x + targetNode.position.x) / 2;
            const midY = (sourceNode.position.y + targetNode.position.y) / 2;
            // Simple offset to avoid covering edge - adjust based on viewport position
            const screenMidX = rect.left + midX * currentViewport.zoom + currentViewport.x;
            const screenMidY = rect.top + midY * currentViewport.zoom + currentViewport.y;
            const offsetX = screenMidX > rect.width / 2 ? -120 : 60; // Left if in right half, right if in left half
            setFloatingToolbarPosition({
              x: screenMidX + offsetX,
              y: screenMidY - 60
            });
          }
        }
        // Removed text positioning logic - text objects use TextFormattingToolbar instead
      }
    }
  }, [selectedNodes, selectedEdges, nodes, edges, currentViewport, enableFloatingToolbar]);


  // Disable smart connect for KFrames, text nodes, and when node is child of KFrame
  const draggedNode = draggingNode ? nodes.find(n => n.id === draggingNode.id) || null : null;
  
  // Always call useSmartConnect hook with draggedNode - let the hook handle conditional logic
  const smartConnectPreview = useSmartConnect(nodes, draggedNode);
  
  // Apply smart connect filtering after the hook call
  const shouldDisableSmartConnect = draggedNode?.type === 'kframe' || 
                                    draggedNode?.type === 'text' || // Text nodes can't create connections
                                    draggedNode?.data?.parentFrameId ||
                                    !draggedNode?.smartConnect?.enabled;
  
  // Nullify smart connect preview if it should be disabled
  const filteredSmartConnectPreview = shouldDisableSmartConnect ? null : smartConnectPreview;
  
  // Debug smart connect integration
  if (draggedNode) {
    console.log('SmartConnect:', {
      nodeId: draggedNode.id,
      smartConnectEnabled: draggedNode?.smartConnect?.enabled,
      shouldDisableSmartConnect
    });
  }
  const currentSnapSettings = snapSettings || defaultSnapSettings;
  
  // Global drag blocking: When a KFrame is being dragged, all other elements must not respond to mouse events
  const isDraggingKFrame = draggedNode?.type === 'kframe';
  const isGlobalDragBlocked = isDraggingKFrame;

  // Helper functions
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: screenX, y: screenY };
    return {
      x: (screenX - rect.left - currentViewport.x) / currentViewport.zoom,
      y: (screenY - rect.top - currentViewport.y) / currentViewport.zoom
    };
  }, [currentViewport]);

  // Handle wheel events for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    console.log('[KiteFrameCanvas] Wheel event:', {
      deltaY: e.deltaY,
      deltaX: e.deltaX,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      disableZoom,
      currentViewport
    });
    
    if (disableZoom) {
      console.log('[KiteFrameCanvas] Zoom disabled, ignoring wheel event');
      return;
    }
    
    // Only prevent default if we're actually going to handle the event
    if (e.deltaY !== 0 || e.deltaX !== 0) {
      e.preventDefault();
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      console.log('[KiteFrameCanvas] No canvas rect found');
      return;
    }
    
    console.log('[KiteFrameCanvas] Canvas rect:', {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left
    });
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Check if this is horizontal scrolling (trackpad pan)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !disablePan) {
      // Trackpad pan functionality - flipped direction
      const panSensitivity = panSpeed;
      const deltaX = -e.deltaX * panSensitivity; // Flipped
      const deltaY = -e.deltaY * panSensitivity; // Flipped
      
      updateViewport({
        x: currentViewport.x + deltaX,
        y: currentViewport.y + deltaY,
        zoom: currentViewport.zoom
      });
    } else {
      // Zoom functionality - works with normal mouse wheel
      const zoomSensitivity = zoomSpeed; // User-controlled zoom speed
      const zoomDelta = -e.deltaY * zoomSensitivity; // Negative because scrolling down should zoom out
      
      const newZoom = Math.max(minZoom, Math.min(maxZoom, currentViewport.zoom * (1 + zoomDelta * 0.01)));
      
      console.log('[KiteFrameCanvas] Zoom calculation:', {
        oldZoom: currentViewport.zoom,
        zoomDelta,
        newZoom,
        zoomSensitivity
      });
      
      // Calculate new viewport position to keep zoom centered
      const zoomPointX = (centerX - currentViewport.x) / currentViewport.zoom;
      const zoomPointY = (centerY - currentViewport.y) / currentViewport.zoom;
      
      const newX = centerX - zoomPointX * newZoom;
      const newY = centerY - zoomPointY * newZoom;
      
      console.log('[KiteFrameCanvas] Updating viewport:', {
        x: newX,
        y: newY,
        zoom: newZoom
      });
      
      updateViewport({
        x: newX,
        y: newY,
        zoom: newZoom
      });
    }
  }, [disableZoom, disablePan, currentViewport, updateViewport, minZoom, maxZoom, zoomSpeed, panSpeed]);

  // Combined mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Block all mouse movement processing when text tool is active
    if (activeTextTool) {
      return;
    }
    setMouse({ x: e.clientX, y: e.clientY });

    // Handle pending drag with threshold check
    if (pendingDrag && !draggingNode) {
      const deltaX = Math.abs(e.clientX - pendingDrag.startPos.x);
      const deltaY = Math.abs(e.clientY - pendingDrag.startPos.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > DRAG_THRESHOLD_PX) {
        // Start drag immediately when threshold is exceeded
        console.log('[Node] Movement threshold exceeded, starting drag');
        if (dragDelayTimerRef.current) {
          clearTimeout(dragDelayTimerRef.current);
          dragDelayTimerRef.current = null;
        }
        
        const node = nodes.find(n => n.id === pendingDrag.nodeId);
        if (node && node.draggable !== false) {
          setDraggingNode({ id: pendingDrag.nodeId, offset: pendingDrag.offset });
          setPendingDrag(null);
          onNodeDragStart?.(pendingDrag.nodeId, node.position);
        } else {
          // Node not found or not draggable, clear pending drag
          setPendingDrag(null);
        }
      }
    }

    // Handle shift-drag selection
    if (selectionStart) {
      const currentPos = screenToCanvas(e.clientX, e.clientY);
      setSelectionBox({
        start: selectionStart,
        end: currentPos
      });
      return;
    }

    // Handle panning (but not when text tool is active)
    if (isPanning && !disablePan && !activeTextTool) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      // Add logging for comment mode panning
      if (isCommentMode) {
        console.log('[Canvas] Comment mode - panning detected:', {
          deltaX,
          deltaY,
          panStart,
          currentMouse: { x: e.clientX, y: e.clientY }
        });
      }
      
      updateViewport({
        x: currentViewport.x + deltaX,
        y: currentViewport.y + deltaY,
        zoom: currentViewport.zoom
      });
      
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    if (draggingNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      

      
      const draggedNode = nodes.find(n => n.id === draggingNode.id);
      if (!draggedNode) return;
      
      // Apply viewport transformation to get actual canvas coordinates
      const rawMouseX = e.clientX - rect.left;
      const rawMouseY = e.clientY - rect.top;
      const mouseX = (rawMouseX - currentViewport.x) / currentViewport.zoom;
      const mouseY = (rawMouseY - currentViewport.y) / currentViewport.zoom;
      
      // Calculate target position using the stored offset
      const targetPosition = {
        x: mouseX - draggingNode.offset.x,
        y: mouseY - draggingNode.offset.y
      };
      
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;
      const nodeWidth = draggedNode.style?.width || 200;
      const nodeHeight = draggedNode.style?.height || 100;
      
      // Calculate effective canvas size accounting for viewport transformation
      const effectiveCanvasWidth = canvasWidth / currentViewport.zoom;
      const effectiveCanvasHeight = canvasHeight / currentViewport.zoom;
      
      // Calculate viewport-adjusted boundaries
      const minX = -currentViewport.x / currentViewport.zoom;
      const minY = -currentViewport.y / currentViewport.zoom;
      const maxX = minX + effectiveCanvasWidth;
      const maxY = minY + effectiveCanvasHeight;
      
      // Disable snapping for KFrames
      const snapResult = draggedNode.type === 'kframe' ? {
        position: targetPosition,
        guides: [],
        snapped: false
      } : calculateSnapPosition(
        draggedNode,
        targetPosition,
        nodes.filter(n => n.id !== draggingNode.id),
        { width: effectiveCanvasWidth, height: effectiveCanvasHeight },
        currentSnapSettings
      );
      
      // Debug snap guides for Smart Guides demo
      if (snapResult.guides.length > 0) {
        console.log('[Snap] Generated guides:', snapResult.guides.length, 'guides');
      }
      
      // Allow KFrames to move more freely, with generous boundary constraints
      const newPosition = draggedNode.type === 'kframe' ? {
        x: Math.max(minX - 200, Math.min(snapResult.position.x, maxX + 200)),
        y: Math.max(minY - 200, Math.min(snapResult.position.y, maxY + 200))
      } : {
        x: Math.max(minX, Math.min(snapResult.position.x, maxX - nodeWidth)),
        y: Math.max(minY, Math.min(snapResult.position.y, maxY - nodeHeight))
      };
      
      setSnapGuides(snapResult.guides);
      
      // KFrame drag logging in the requested format
      if (draggedNode.type === 'kframe') {
        const cursorPos = { x: e.clientX, y: e.clientY };
        // The offset should be the distance from mouse to node corner at drag start
        // We need to calculate the initial click point
        const kframeFirstClickPoint = { 
          x: e.clientX - (mouseX - draggedNode.position.x),
          y: e.clientY - (mouseY - draggedNode.position.y)
        };
        const delta = { 
          x: cursorPos.x - kframeFirstClickPoint.x, 
          y: cursorPos.y - kframeFirstClickPoint.y 
        };
        
        console.log(`cursor: {${cursorPos.x}, ${cursorPos.y}} - kframe: {${kframeFirstClickPoint.x.toFixed(0)}, ${kframeFirstClickPoint.y.toFixed(0)}} - delta: {${delta.x.toFixed(0)}, ${delta.y.toFixed(0)}}`);
      }
      
      const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
      const isDraggingSelected = selectedNodeIds.includes(draggingNode.id);
      
      // Calculate the actual constrained position for the dragged node first
      let constrainedDraggedPosition = newPosition;
      if (draggedNode.type === 'kframe') {
        // Apply boundary constraints to KFrame position
        const kframeWidth = draggedNode.style?.width || 400;
        const kframeHeight = draggedNode.style?.height || 300;
        constrainedDraggedPosition = {
          x: Math.max(minX, Math.min(newPosition.x, maxX - kframeWidth)),
          y: Math.max(minY, Math.min(newPosition.y, maxY - kframeHeight))
        };
      }
      
      const updatedNodes = nodes.map(node => {
        if (isDraggingSelected && node.selected) {
          const deltaX = constrainedDraggedPosition.x - nodes.find(n => n.id === draggingNode.id)!.position.x;
          const deltaY = constrainedDraggedPosition.y - nodes.find(n => n.id === draggingNode.id)!.position.y;
          
          // Apply viewport-adjusted boundaries for multi-selection
          const nodeWidth = node.style?.width || 200;
          const nodeHeight = node.style?.height || 100;
          
          return {
            ...node,
            position: {
              x: Math.max(minX, Math.min(node.position.x + deltaX, maxX - nodeWidth)),
              y: Math.max(minY, Math.min(node.position.y + deltaY, maxY - nodeHeight))
            }
          };
        } else if (node.id === draggingNode.id) {
          let updatedNode = { ...node, position: constrainedDraggedPosition };
          
          // Check for KFrame adoption if this is a regular node (not a KFrame)
          if (draggedNode.type !== 'kframe') {
            const nodeWidth = draggedNode.style?.width || 200;
            const nodeHeight = draggedNode.style?.height || 100;
            
            // Check if node is fully inside any KFrame
            let adoptingFrame = null;
            for (const frame of nodes) {
              if (frame.type === 'kframe' && frame.id !== draggingNode.id) {
                const frameLeft = frame.position.x;
                const frameTop = frame.position.y;
                const frameRight = frame.position.x + (frame.style?.width || 400);
                const frameBottom = frame.position.y + (frame.style?.height || 300);
                
                const nodeLeft = newPosition.x;
                const nodeTop = newPosition.y;
                const nodeRight = newPosition.x + nodeWidth;
                const nodeBottom = newPosition.y + nodeHeight;
                
                // Check if node is fully inside frame with debug
                const isInside = nodeLeft >= frameLeft && nodeTop >= frameTop && 
                                nodeRight <= frameRight && nodeBottom <= frameBottom;
                
                if (isInside) {
                  adoptingFrame = frame;
                  break;
                }
              }
            }
            
            // Update drop zone visualization and adoption
            if (adoptingFrame) {
              // Show drop zone feedback
              if (dropZoneFrame !== adoptingFrame.id) {
                setDropZoneFrame(adoptingFrame.id);
              }
              
              // Update parentFrameId based on adoption
              if (updatedNode.data?.parentFrameId !== adoptingFrame.id) {

                updatedNode = { 
                  ...updatedNode, 
                  data: { ...updatedNode.data, parentFrameId: adoptingFrame.id } 
                };
                
                // Remove any edges between the node and the KFrame when adopted
                const edgesToRemove = edges.filter(edge => 
                  (edge.source === updatedNode.id && edge.target === adoptingFrame.id) ||
                  (edge.target === updatedNode.id && edge.source === adoptingFrame.id)
                );
                
                if (edgesToRemove.length > 0) {
                  const remainingEdges = edges.filter(edge => 
                    !edgesToRemove.some(e => e.id === edge.id)
                  );
                  onEdgesChange?.(remainingEdges);
                }
              }
            } else {
              // Clear drop zone feedback
              if (dropZoneFrame) {
                setDropZoneFrame(null);
              }
              
              // Node is not in any frame, remove parentFrameId if it exists
              if (updatedNode.data?.parentFrameId) {

                const { parentFrameId, ...dataWithoutParent } = updatedNode.data;
                updatedNode = { ...updatedNode, data: dataWithoutParent };
              }
            }
          }
          
          return updatedNode;
        } else if (node.data?.parentFrameId === draggingNode.id) {
          // Move child nodes when their parent frame is dragged
          const originalFrameNode = nodes.find(n => n.id === draggingNode.id)!;
          
          // Use the constrained frame position calculated earlier
          const deltaX = constrainedDraggedPosition.x - originalFrameNode.position.x;
          const deltaY = constrainedDraggedPosition.y - originalFrameNode.position.y;
          
          // Only move if there's actually a delta to avoid unnecessary updates
          if (deltaX === 0 && deltaY === 0) {
            return node;
          }
          

          
          return {
            ...node,
            position: {
              x: node.position.x + deltaX,
              y: node.position.y + deltaY
            }
          };
        }
        return node;
      });
      
      onNodesChange?.(updatedNodes);
      
      // Call drag callback
      onNodeDrag?.(draggingNode.id, newPosition);
      
      // Trigger KFrame adoption handlers only for non-KFrame nodes
      const draggedNodeData = nodes.find(n => n.id === draggingNode.id);
      if (draggedNodeData?.type !== 'kframe' && (window as any).kframeDragHandlers) {
        const handlers = Object.keys((window as any).kframeDragHandlers);
        if (handlers.length > 0) {

          Object.values((window as any).kframeDragHandlers).forEach((handler: any) => {
            handler(draggingNode.id, newPosition);
          });
        }
      }
    }
  }, [draggingNode, nodes, onNodesChange, currentSnapSettings, onNodeDrag, pendingDrag, onNodeDragStart, screenToCanvas, selectionStart, isPanning, disablePan, currentViewport, updateViewport, panStart, canvasRef, edges, onEdgesChange, dropZoneFrame]);

  const handleMouseUp = useCallback(() => {
    // Clear pending drag if it exists
    if (pendingDrag) {
      console.log('[Node] Canceling pending drag');
      if (dragDelayTimerRef.current) {
        clearTimeout(dragDelayTimerRef.current);
        dragDelayTimerRef.current = null;
      }
      setPendingDrag(null);
    }
    
    // Clear selection state
    if (selectionStart) {
      setSelectionStart(null);
      setSelectionBox(null);
    }
    
    if (draggingConn) {
      setDraggingConn(null);
    }
    
    if (draggingNode) {

      
      // Smart Connect: Check if we should create a connection automatically
      if (filteredSmartConnectPreview && onConnect) {
        console.log('[SmartConnect] Checking for duplicate edges:', {
          sourceId: filteredSmartConnectPreview.sourceId,
          targetId: filteredSmartConnectPreview.targetId
        });
        
        // Check if edge already exists between these nodes
        const existingEdge = edges.find(edge => 
          (edge.source === filteredSmartConnectPreview.sourceId && edge.target === filteredSmartConnectPreview.targetId) ||
          (edge.source === filteredSmartConnectPreview.targetId && edge.target === filteredSmartConnectPreview.sourceId)
        );
        
        if (existingEdge) {
          console.log('[SmartConnect] Cancelled - edge already exists:', existingEdge.id);
        } else {
          console.log('[SmartConnect] Creating connection:', {
            sourceId: filteredSmartConnectPreview.sourceId,
            targetId: filteredSmartConnectPreview.targetId
          });
          
          // Get theme-aware default edge color
          const getThemeAwareEdgeColor = () => {
            const isDark = document.documentElement.classList.contains('dark');
            return isDark ? '#82829f' : '#64748b';
          };

          // Create edge object to match expected signature
          const newEdge: Edge = {
            id: `edge-${Date.now()}-${filteredSmartConnectPreview.sourceId}-${filteredSmartConnectPreview.targetId}`,
            source: filteredSmartConnectPreview.sourceId,
            target: filteredSmartConnectPreview.targetId,
            type: defaultEdgeType || 'smoothstep',
            animated: false,
            data: {
              color: getThemeAwareEdgeColor()
            }
          };
          
          console.log('[SmartConnect] Calling onConnect with edge:', newEdge);
          console.log('[SmartConnect] Edge type:', typeof newEdge);
          onConnect(newEdge);
        }
      }
      
      const draggedNode = nodes.find(n => n.id === draggingNode.id);
      
      // Check if node was just adopted (dropZoneFrame is set and node is over that frame)
      // Include text nodes in adoption logic - they can be nested in KFrames
      if (dropZoneFrame && draggedNode && draggedNode.type !== 'kframe') {
        const adoptingFrame = nodes.find(n => n.id === dropZoneFrame);
        if (adoptingFrame) {
          // Check if the node is fully inside the frame
          const nodeWidth = draggedNode.style?.width || 200;
          const nodeHeight = draggedNode.style?.height || 100;
          const frameLeft = adoptingFrame.position.x;
          const frameTop = adoptingFrame.position.y;
          const frameRight = adoptingFrame.position.x + (adoptingFrame.style?.width || 400);
          const frameBottom = adoptingFrame.position.y + (adoptingFrame.style?.height || 300);
          
          const nodeLeft = draggedNode.position.x;
          const nodeTop = draggedNode.position.y;
          const nodeRight = draggedNode.position.x + nodeWidth;
          const nodeBottom = draggedNode.position.y + nodeHeight;
          
          // If node is fully inside frame and not already adopted by this frame
          if (nodeLeft >= frameLeft && nodeTop >= frameTop && 
              nodeRight <= frameRight && nodeBottom <= frameBottom &&
              draggedNode.data?.parentFrameId !== adoptingFrame.id) {
            
            // Show adoption success feedback at the node's position
            setAdoptionFeedback({
              frameId: adoptingFrame.id,
              position: {
                x: draggedNode.position.x + nodeWidth - 25,
                y: draggedNode.position.y + 5
              }
            });
            
            // Clear feedback after animation
            setTimeout(() => {
              setAdoptionFeedback(null);
            }, 1000);
          }
        }
      }
      
      // Call drag end callback
      if (draggedNode) {
        onNodeDragEnd?.(draggingNode.id, draggedNode.position);
      }
      
      setDraggingNode(null);
      setSnapGuides([]); // Clear snap guides when dragging stops
      setDropZoneFrame(null); // Clear drop zone feedback
    }
    setIsActiveCanvas(false);
  }, [draggingNode, draggingConn, nodes, onNodeDragEnd, smartConnectPreview, onConnect, pendingDrag, defaultEdgeType, edges, dropZoneFrame, onEdgesChange]);

  const handleNodeDrag = useCallback((nodeId: string, position: { x: number; y: number }) => {

    const updatedNodes = nodes.map(node => 
      node.id === nodeId 
        ? { ...node, position }
        : node
    );
    onNodesChange?.(updatedNodes);
  }, [nodes, onNodesChange]);

  const handleConnectStart = useCallback((nodeId: string, handlePosition: string, event: React.MouseEvent) => {
    console.log('[Connection] Starting connection from node:', nodeId, 'handle:', handlePosition);
    setDraggingConn({ sourceNodeId: nodeId, sourceHandle: handlePosition });
  }, []);



  const handleConnectEnd = useCallback((nodeId: string, handlePosition: string, event: React.MouseEvent) => {
    console.log('[Connection] Ending connection at node:', nodeId, 'handle:', handlePosition);
    
    if (draggingConn) {
      // Get source and target nodes
      const sourceNode = nodes.find(n => n.id === draggingConn.sourceNodeId);
      const targetNode = nodes.find(n => n.id === nodeId);
      
      console.log('[Connection] Source node:', sourceNode?.id, 'Target node:', targetNode?.id);
      
      // Don't connect to the same node
      if (draggingConn.sourceNodeId === nodeId) {
        console.log('[Connection] Cancelled - same node');
        setDraggingConn(null);
        return;
      }
      
      // Block ALL connections FROM child nodes (nodes within KFrames cannot connect to anything)
      if (sourceNode?.data?.parentFrameId) {
        console.log('[Connection] Cancelled - child nodes cannot connect to anything');
        setDraggingConn(null);
        return;
      }
      
      // Block ALL connections to/from text nodes (text elements don't participate in edge connections)
      if (sourceNode?.type === 'text' || targetNode?.type === 'text') {
        console.log('[Connection] Cancelled - text nodes cannot create connections');
        setDraggingConn(null);
        return;
      }
      
      // Check if a KFrame is trying to connect to its child
      if (targetNode?.data?.parentFrameId === draggingConn.sourceNodeId) {
        console.log('[Connection] Cancelled - parent to child');
        setDraggingConn(null);
        return;
      }
      
      // Allow non-child nodes to connect to child nodes (non-child → child)
      // Allow non-child nodes to connect to KFrames via handles (non-child → KFrame)
      
      // Check if edge already exists between these nodes
      const existingEdge = edges.find(edge => 
        (edge.source === draggingConn.sourceNodeId && edge.target === nodeId) ||
        (edge.source === nodeId && edge.target === draggingConn.sourceNodeId)
      );
      
      if (existingEdge) {
        console.log('[Connection] Cancelled - edge already exists');
        setDraggingConn(null);
        return;
      }
      
      console.log('[Connection] Creating connection from', draggingConn.sourceNodeId, 'to', nodeId);
      
      // Get theme-aware default edge color
      const getThemeAwareEdgeColor = () => {
        const isDark = document.documentElement.classList.contains('dark');
        return isDark ? '#82829f' : '#64748b';
      };

      // Create edge object to match expected signature
      const newEdge: Edge = {
        id: `edge-${Date.now()}-${draggingConn.sourceNodeId}-${nodeId}`,
        source: draggingConn.sourceNodeId,
        target: nodeId,
        type: defaultEdgeType || 'smoothstep',
        animated: false,
        data: {
          color: getThemeAwareEdgeColor()
        }
      };
      
      console.log('[Connection] Calling onConnect with edge:', newEdge);
      console.log('[Connection] Edge type:', typeof newEdge);
      // Call onConnect with edge object
      onConnect?.(newEdge);
    }
    setDraggingConn(null);
  }, [draggingConn, edges, onConnect, nodes, defaultEdgeType]);

  // Handle hover-based connections during connection drag
  useEffect(() => {
    if (!draggingConn) return;

    const handleGlobalMouseUp = (event: MouseEvent) => {
      console.log('[KiteFrameCanvas] Global mouse up during connection drag');
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Transform mouse position to canvas coordinates  
      const rawMouseX = event.clientX - rect.left;
      const rawMouseY = event.clientY - rect.top;
      const mousePos = {
        x: (rawMouseX - currentViewport.x) / currentViewport.zoom,
        y: (rawMouseY - currentViewport.y) / currentViewport.zoom
      };

      console.log('[KiteFrameCanvas] Mouse position:', { raw: { x: rawMouseX, y: rawMouseY }, transformed: mousePos });

      // Find hovered node using same two-pass logic as preview
      let hoveredNode = null;
      
      // First pass: Find child nodes (prioritize over KFrames)
      for (const node of nodes) {
        if (node.type === 'kframe' || node.id === draggingConn.sourceNodeId) continue;
        
        const nodeWidth = node.style?.width || 200;
        const nodeHeight = node.style?.height || 100;
        
        if (mousePos.x >= node.position.x && 
            mousePos.x <= node.position.x + nodeWidth &&
            mousePos.y >= node.position.y && 
            mousePos.y <= node.position.y + nodeHeight) {
          hoveredNode = node;
          console.log('[KiteFrameCanvas] Found hovered child node:', node.id);
          break;
        }
      }
      
      // Second pass: If no child node found, check KFrames
      if (!hoveredNode) {
        for (const node of nodes) {
          if (node.type !== 'kframe' || node.id === draggingConn.sourceNodeId) continue;
          
          const nodeWidth = node.style?.width || 400;
          const nodeHeight = node.style?.height || 300;
          
          if (mousePos.x >= node.position.x && 
              mousePos.x <= node.position.x + nodeWidth &&
              mousePos.y >= node.position.y && 
              mousePos.y <= node.position.y + nodeHeight) {
            hoveredNode = node;
            console.log('[KiteFrameCanvas] Found hovered KFrame:', node.id);
            break;
          }
        }
      }

      // If hovering over a valid target node, create connection
      if (hoveredNode) {
        const sourceNode = nodes.find(n => n.id === draggingConn.sourceNodeId);
        
        // Check if connection is forbidden using same logic as preview
        let isForbidden = false;
        // Check if child node is trying to connect to its parent KFrame
        if (sourceNode?.data?.parentFrameId === hoveredNode.id) {
          isForbidden = true;
        }
        // Prevent parent KFrame → child connections  
        else if (hoveredNode.data?.parentFrameId === draggingConn.sourceNodeId) {
          isForbidden = true;
        }
        // Allow all other connections:
        // - Child nodes can connect to other child nodes (same or different KFrames)
        // - Child nodes can connect to non-child nodes
        // - Non-child nodes can connect to anything except their children
        
        if (!isForbidden) {
          // Check if edge already exists
          const existingEdge = edges.find(edge => 
            (edge.source === draggingConn.sourceNodeId && edge.target === hoveredNode.id) ||
            (edge.source === hoveredNode.id && edge.target === draggingConn.sourceNodeId)
          );
          
          if (!existingEdge) {
            console.log('[KiteFrameCanvas] Creating hover-based connection from', draggingConn.sourceNodeId, 'to', hoveredNode.id);
            // Create proper edge object instead of passing node IDs
            const newEdge: Edge = {
              id: `edge-${Date.now()}-${draggingConn.sourceNodeId}-${hoveredNode.id}`,
              source: draggingConn.sourceNodeId,
              target: hoveredNode.id,
              type: defaultEdgeType || 'smoothstep',
              animated: false
            };
            
            console.log('[Hover Connection] Calling onConnect with edge:', newEdge);
            console.log('[Hover Connection] Edge type:', typeof newEdge);
            onConnect?.(newEdge);
          } else {
            console.log('[KiteFrameCanvas] Connection already exists');
          }
        } else {
          console.log('[KiteFrameCanvas] Connection forbidden');
        }
      } else {
        console.log('[KiteFrameCanvas] No valid target node found');
      }

      // Clear connection state
      setDraggingConn(null);
    };

    // Use capture phase to handle before NodeHandles
    document.addEventListener('mouseup', handleGlobalMouseUp, { capture: true });
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
    };
  }, [draggingConn, nodes, edges, onConnect, currentViewport]);

  // Remove duplicate mouse move handler

  // Event listeners
  useEffect(() => {

    
    const handleWheel = (e: WheelEvent) => {
      // Prevent page scrolling when interacting with canvas
      if (canvasRef.current?.contains(e.target as any)) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    // Edge handle drag event listeners
    const handleEdgeHandleDragStart = () => {
      console.log('[Canvas] Edge handle drag started, blocking canvas pan');
      setEdgeHandleDragActive(true);
    };
    
    const handleEdgeHandleDragEnd = () => {
      console.log('[Canvas] Edge handle drag ended, unblocking canvas pan');
      setEdgeHandleDragActive(false);
    };

    window.addEventListener('edgeHandleDragStart', handleEdgeHandleDragStart);
    window.addEventListener('edgeHandleDragEnd', handleEdgeHandleDragEnd);
    
    return () => {

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('wheel', handleWheel);
      window.removeEventListener('edgeHandleDragStart', handleEdgeHandleDragStart);
      window.removeEventListener('edgeHandleDragEnd', handleEdgeHandleDragEnd);
    };
  }, []); // Remove dependencies to prevent constant re-registration
  
  // Verify canvas mount
  useEffect(() => {

  }, []);

  // Canvas size tracking
  const previousSizeRef = useRef({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const newSize = { width: Math.max(rect.width, 800), height: Math.max(rect.height, 600) };
        
        // Only log if size change is significant (>20px) to reduce spam
        if (Math.abs(rect.width - previousSizeRef.current.width) > 20 || 
            Math.abs(rect.height - previousSizeRef.current.height) > 20) {

          previousSizeRef.current = { width: rect.width, height: rect.height };
        }
        setCanvasSize(newSize);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {

        setIsShiftPressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {

        setIsShiftPressed(false);
      }
    };
    
    updateCanvasSize();
    

    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {

      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Cleanup drag delay timer on unmount
  useEffect(() => {
    return () => {
      if (dragDelayTimerRef.current) {
        clearTimeout(dragDelayTimerRef.current);
      }
    };
  }, []);

  // Calculate inputs for each node based on connected edges
  const getNodeInputs = (nodeId: string) => {
    const inputEdges = edges.filter(edge => edge.target === nodeId);
    const inputs: any[] = [];
    
    inputEdges.forEach(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode) {
        // For sound processing nodes, pass the audio buffer
        if (sourceNode.type === 'inputSound') {
          inputs.push(sourceNode.data.audioBuffer);
        } else if (sourceNode.type === 'soundTransformer') {
          // Pass transformed buffer if available, otherwise original buffer
          inputs.push(sourceNode.data.transformedBuffer || sourceNode.data.audioBuffer);
        } else if (sourceNode.type === 'inputJson') {
          inputs.push(sourceNode.data.initialJson);
        } else if (sourceNode.type === 'transformer') {
          inputs.push(sourceNode.data.transformedData);
        }
      }
    });
    
    return inputs;
  };

  const renderNode = (node: Node) => {
    // Safety check to prevent undefined node access
    if (!node || !node.id) {
      console.error('[KiteFrameCanvas] renderNode: node or node.id is undefined:', node);
      return null;
    }
    
    // Check if node is selected based on selectedNodes array
    const isSelected = selectedNodes.includes(node.id);
    
    const nodeProps = {
      node,
      onDrag: handleNodeDrag,
      onClick: onNodeClick,
      onDoubleClick: onNodeDoubleClick,
      onRightClick: onNodeRightClick,
      onNodeSettingsChange,
      viewport: currentViewport,
      canvasRef,
      onConnectStart: handleConnectStart,
      onConnectEnd: handleConnectEnd,
      alwaysShowHandles,
      onNodeResize,
      onNodeDuplicate,
      inputs: getNodeInputs(node.id),
      selectedEdges: selectedEdges || [],
      hideHandlesWhenEdgeSelected: (selectedEdges || []).length > 0,
    };

    const nodeContainer = (content: React.ReactNode, zIndex: number) => {
      // Block mouse events on all other elements when a KFrame is being dragged
      const shouldBlockMouseEvents = isGlobalDragBlocked && draggingNode?.id !== node.id;
      


      // Wrap content with SparkleNodeWrapper if AI suggestions are enabled
      const wrappedContent = enableAISuggestions ? (
        <SparkleNodeWrapper
          node={node}
          allNodes={nodes}
          allEdges={edges}
          onNodesChange={onNodesChange || (() => {})}
          onEdgesChange={onEdgesChange || (() => {})}
        >
          {content}
        </SparkleNodeWrapper>
      ) : content;
      
      return (
        <div
          key={node.id}
          className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: node.position.x,
            top: node.position.y,
            cursor: node.draggable !== false ? (draggingNode?.id === node.id ? 'grabbing' : 'grab') : 'default',
            zIndex,
            pointerEvents: shouldBlockMouseEvents || isCommentMode ? 'none' : 'auto', // Block mouse events during KFrame drag or comment mode
            userSelect: 'none', // Prevent text selection during drag
            // Fix positioning for child nodes
            transform: node.data?.parentFrameId ? 'none' : undefined
          }}
          onMouseEnter={() => {
            if (node.data?.parentFrameId) setHoveredChildNode(node.id);
          }}
          onMouseLeave={() => {
            if (node.data?.parentFrameId) setHoveredChildNode(null);
          }}
          onMouseDown={(e) => {
            console.log('[Node] MouseDown event:', {
              nodeId: node.id,
              nodeType: node.type,
              draggable: node.draggable,
              shouldBlockMouseEvents,
              button: e.button,
              clientX: e.clientX,
              clientY: e.clientY,
              target: e.target,
              currentTarget: e.currentTarget,
              targetClasses: (e.target as HTMLElement)?.className,
              targetTagName: (e.target as HTMLElement)?.tagName
            });
            
            // Ignore right-clicks (let them trigger context menu instead of drag)
            if (e.button !== 0) {
              console.log('[Node] Ignored - right-click detected');
              return;
            }
            
            // Block mouse events when global drag is active (KFrame being dragged)
            if (shouldBlockMouseEvents) {
              console.log('[Node] Blocked due to global drag');
              return;
            }

            const target = e.target as HTMLElement;
            
            if (target.closest('.node-settings-popover') || 
                target.classList.contains('kiteline-handle') ||
                target.closest('.kiteline-node-handles')) {
              console.log('[Node] Ignored - interaction with popover/handle');
              return;
            }
            
            // Check if the event is on an interactive element (SELECT, INPUT, BUTTON)
            if (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'OPTION') {
              console.log('[Node] Ignored - interactive element:', target.tagName);
              return; // Don't stop propagation for interactive elements
            }
            
            e.stopPropagation();

            // Prevent node dragging when in comment mode
            if (isCommentMode) {
              console.log('[Node] onMouseDown drag blocked - comment mode active');
              return;
            }

            if (node.draggable !== false) {
              console.log('[Node] Setting up pending drag for node:', node.id);
              setIsActiveCanvas(true);
              const rect = canvasRef.current?.getBoundingClientRect();

              if (rect) {
                // Calculate mouse position in canvas coordinates
                const rawMouseX = e.clientX - rect.left;
                const rawMouseY = e.clientY - rect.top;
                const mouseX = (rawMouseX - currentViewport.x) / currentViewport.zoom;
                const mouseY = (rawMouseY - currentViewport.y) / currentViewport.zoom;
                
                // Store offset from mouse to node position
                const offset = {
                  x: mouseX - node.position.x,
                  y: mouseY - node.position.y
                };
                
                // Set pending drag state
                setPendingDrag({
                  nodeId: node.id,
                  offset,
                  startPos: { x: e.clientX, y: e.clientY }
                });
                
                // Start drag delay timer
                dragDelayTimerRef.current = setTimeout(() => {
                  console.log('[Node] Drag delay timer expired, starting drag');
                  // Only start drag if pending drag still exists and matches current node
                  if (pendingDrag && pendingDrag.nodeId === node.id) {
                    setDraggingNode({ id: node.id, offset });
                    setPendingDrag(null);
                    onNodeDragStart?.(node.id, node.position);
                  }
                }, DRAG_DELAY_MS);
              } else {
                console.log('[Node] No canvas rect found');
              }
            } else {
              console.log('[Node] Node not draggable');
            }
          }}
          onClick={(e) => {
            console.log('[Node] onClick:', {
              nodeId: node.id,
              nodeType: node.type,
              target: e.target,
              targetClasses: (e.target as HTMLElement)?.className,
              targetTagName: (e.target as HTMLElement)?.tagName,
              currentTarget: e.currentTarget,
              shouldBlockMouseEvents
            });
            
            // Block click events when global drag is active (KFrame being dragged)
            if (shouldBlockMouseEvents) {
              console.log('[Node] onClick blocked due to global drag');
              return;
            }
            
            // Check if the event is on an interactive element (SELECT, INPUT, BUTTON)
            const target = e.target as HTMLElement;
            
            if (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'OPTION') {
              console.log('[Node] onClick ignored - interactive element');
              return; // Don't stop propagation for interactive elements
            }
            
            e.stopPropagation();

            // Prevent node selection and interactions when in comment mode
            if (isCommentMode) {
              console.log('[Node] onClick blocked - comment mode active');
              return;
            }

            // Call onNodeClick for selection
            if (node.selectable !== false) {
              console.log('[Node] Calling onNodeClick for selection');
              onNodeClick?.(e, node);
            }
          }}
          onContextMenu={(e) => {
            // Block right-click events when global drag is active (KFrame being dragged)
            if (shouldBlockMouseEvents) {
              return;
            }
            
            e.preventDefault();
            e.stopPropagation();

            // Prevent context menu when in comment mode
            if (isCommentMode) {
              console.log('[Node] onContextMenu blocked - comment mode active');
              return;
            }

            // Call onNodeRightClick for context menu
            if (node.selectable !== false) {
              onNodeRightClick?.(e, node);
            }
          }}
          onDoubleClick={(e) => {
            console.log('[Node] DoubleClick event:', {
              nodeId: node.id,
              nodeType: node.type,
              doubleClickable: node.doubleClickable,
              shouldBlockMouseEvents,
              hasOnNodeDoubleClick: !!onNodeDoubleClick
            });
            
            // Block double-click events when global drag is active (KFrame being dragged)
            if (shouldBlockMouseEvents) {
              console.log('[Node] DoubleClick blocked due to global drag');
              return;
            }
            
            // Check if the event is on an interactive element (SELECT, INPUT, BUTTON)
            const target = e.target as HTMLElement;
            
            if (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'OPTION') {
              console.log('[Node] DoubleClick ignored - interactive element');
              return; // Don't stop propagation for interactive elements
            }
            
            e.stopPropagation();

            // Prevent double-click interactions when in comment mode
            if (isCommentMode) {
              console.log('[Node] onDoubleClick blocked - comment mode active');
              return;
            }

            if (node.doubleClickable !== false) {
              console.log('[Node] Calling onNodeDoubleClick');
              // Call onNodeDoubleClick if it exists - this is what the interactive demo uses
              if (onNodeDoubleClick) {
                onNodeDoubleClick(e, node);
              }
            }
          }}
          data-node-id={node.id}
        >
          {wrappedContent}
          

        </div>
      );
    };

    switch (node.type) {
      case 'kframe':
        return nodeContainer(
          <KFrame
            id={node.id}
            position={{ x: 0, y: 0 }}
            style={node.style}
            data={{
              ...node.data,
              labelPosition: (['inside-top-left', 'inside-top-right', 'inside-bottom-left', 'inside-bottom-right', 'outside-top', 'outside-bottom', 'centered'].includes(node.data?.labelPosition || '') 
                ? node.data.labelPosition 
                : 'inside-top-left') as 'inside-top-left' | 'inside-top-right' | 'inside-bottom-left' | 'inside-bottom-right' | 'outside-top' | 'outside-bottom' | 'centered'
            }}
            selected={selectedNodes.includes(node.id)}
            onNodesChange={onNodesChange}
            onLabelChange={(nodeId: string, label: string) => onKFrameLabelChange?.(nodeId, label)}
            onDescriptionChange={(nodeId: string, description: string) => onKFrameDescriptionChange?.(nodeId, description)}
            onResize={(id, width, height) => {
              // Only call the parent's onNodeResize callback - let the parent handle state updates
              // This prevents conflicts in the collaboration system where both KiteFrameCanvas
              // and the parent WorkflowApp try to update the nodes array simultaneously
              if (onNodeResize) {
                onNodeResize(id, width, height);
              }
            }}
            onHandleConnect={onHandleConnect}
            onConnectStart={(nodeId: string, handle: string) => handleConnectStart(nodeId, handle, {} as React.MouseEvent)}
            onConnectEnd={(nodeId: string, handle: string) => handleConnectEnd(nodeId, handle, {} as React.MouseEvent)}
            alwaysShowHandles={alwaysShowHandles}
            onNodeDrag={onNodeDrag}
            onNodeDragStart={onNodeDragStart}
            onNodeDragEnd={onNodeDragEnd}
            viewport={currentViewport}
            canvasRef={canvasRef}
            isDropZone={dropZoneFrame === node.id}
            childFrameNodes={nodes.filter(n => n.data?.parentFrameId === node.id)}
            onUnadoptNode={(nodeId) => {
              const updatedNodes = nodes.map(n => {
                if (n.id === nodeId) {
                  const { parentFrameId, ...dataWithoutParent } = n.data;
                  return { ...n, data: dataWithoutParent };
                }
                return n;
              });
              onNodesChange?.(updatedNodes);
            }}
          />,
          1  // KFrames render behind other nodes
        );
      case 'image':
        return nodeContainer(
          <ImageNode 
            {...nodeProps} 
            node={{
              ...node,
              selected: selectedNodes.includes(node.id),
              data: {
                ...node.data,
                labelPosition: (['outside-bottom', 'outside-top', 'centered', 'inside-bottom-right'].includes(node.data?.labelPosition || '')
                  ? node.data.labelPosition
                  : 'outside-bottom') as 'outside-bottom' | 'outside-top' | 'centered' | 'inside-bottom-right'
              }
            }}
            onLabelChange={onNodeLabelChange}
            onDescriptionChange={onNodeDescriptionChange}
          />,
          15
        );
      case 'annotation':
        return nodeContainer(
          <AnnotationNode {...nodeProps} />,
          10
        );
      case 'live-data':
        return nodeContainer(
          <LiveDataNode {...nodeProps} node={{...node, data: {...node.data, url: node.data.url || 'https://api.github.com/repos/facebook/react'}}} />,
          10
        );
      case 'map':
        return nodeContainer(
          <MapNode {...nodeProps} node={{...node, data: {...node.data, address: node.data.address || 'New York, NY'}}} />,
          10
        );
      case 'd3-chart':
        return nodeContainer(
          <D3MetricNode {...nodeProps} node={{...node, data: {...node.data, chartType: node.data.chartType === 'area' ? 'line' : node.data.chartType}}} />,
          10
        );
      case 'weather':
        return nodeContainer(
          <WeatherNode {...nodeProps} />,
          10
        );
      case 'duck':
        return nodeContainer(
          <DuckApiNode {...nodeProps} />,
          10
        );

      case 'nasa':
        return nodeContainer(
          <NasaApodNode {...nodeProps} />,
          10
        );
      case 'chart':
        return nodeContainer(
          <ChartNode {...nodeProps} />,
          10
        );
      case 'transformer':
        return nodeContainer(
          <DataTransformerNode {...nodeProps} />,
          10
        );
      case 'dataTransformer':
        return nodeContainer(
          <DataTransformerNode {...nodeProps} />,
          10
        );
      case 'inputJson':
        return nodeContainer(
          <InputJsonNode {...nodeProps} />,
          10
        );
      case 'outputJson':
        return nodeContainer(
          <OutputJsonNode {...nodeProps} />,
          10
        );
      case 'textExtractor':
        return nodeContainer(
          <TextExtractorNode {...nodeProps} />,
          10
        );
      case 'textOutput':
        return nodeContainer(
          <TextOutputNode {...nodeProps} />,
          10
        );
      case 'concat':
        return nodeContainer(
          <ConcatNode {...nodeProps} />,
          10
        );
      case 'inputSound':
        return nodeContainer(
          <InputSoundNode {...nodeProps} />,
          10
        );
      case 'soundTransformer':
        return nodeContainer(
          <SoundTransformerNode {...nodeProps} />,
          10
        );
      case 'outputSound':
        return nodeContainer(
          <OutputSoundNode {...nodeProps} />,
          10
        );
      case 'baseApi':
        return nodeContainer(
          <BaseApiNode {...nodeProps} />,
          10
        );
      case 'graphic':
        return nodeContainer(
          <GraphicNode {...nodeProps} />,
          10
        );
      case 'textInput':
        return nodeContainer(
          <TextInputNode {...nodeProps} />,
          10
        );
      case 'text':
        return nodeContainer(
          <TextNode 
            node={{...node, data: { 
              ...node.data, 
              text: node.data.text || 'Text',
              fontSize: node.data.fontSize || 16,
              fontFamily: node.data.fontFamily || 'Inter, system-ui, sans-serif',
              fontWeight: (node.data.fontWeight as 'normal' | 'medium' | 'semibold' | 'bold') || 'normal',
              textAlign: (['left', 'center', 'right'].includes(node.data?.textAlign || '') ? node.data.textAlign : 'left') as 'left' | 'center' | 'right',
              lineHeight: node.data.lineHeight || 1.4,
              letterSpacing: node.data.letterSpacing || 0,
              textColor: node.data.textColor || '#000000',
              textDecoration: (node.data.textDecoration as 'none' | 'underline' | 'strikethrough') || 'none',
              textTransform: (node.data.textTransform as 'none' | 'uppercase' | 'lowercase' | 'capitalize') || 'none'
            }}}
            onUpdate={(updates) => {
              const updatedNodes = nodes.map(n => 
                n.id === node.id 
                  ? { 
                      ...n, 
                      data: { 
                        ...n.data, 
                        ...updates,
                        textAlign: (['left', 'center', 'right'].includes(updates.textAlign || '') ? updates.textAlign : n.data.textAlign || 'left') as 'left' | 'center' | 'right'
                      } 
                    }
                  : n
              );
              onNodesChange?.(updatedNodes);
            }}
            onResize={(width, height) => {
              const updatedNodes = nodes.map(n => 
                n.id === node.id 
                  ? { ...n, style: { ...n.style, width, height } }
                  : n
              );
              onNodesChange?.(updatedNodes);
            }}
            style={node.style}
            autoFocus={false}
          />,
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
      style={{ 
        ...style, 
        cursor: draggingNode ? 'grabbing' : isPanning ? 'grabbing' : isShiftPressed ? 'crosshair' : 'default',
        touchAction: 'none' // Prevent default touch behaviors for better control
      }}
      data-kiteframe-canvas="true"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      data-canvas-container
      onWheel={(e) => {
        console.log('[Canvas] Wheel event captured on div');
        handleWheel(e);
      }}
      onMouseDown={(e) => {
        console.log('[Canvas] MouseDown event:', {
          clientX: e.clientX,
          clientY: e.clientY,
          isCanvas: e.target === e.currentTarget,
          isGlobalDragBlocked,
          disablePan,
          isCommentMode,
          isPanning
        });
        
        // Comment mode active - removed verbose logging
        
        // Block canvas mouse events during KFrame drag
        if (isGlobalDragBlocked) {
          console.log('[Canvas] Blocked due to global drag');
          return;
        }
        
        // Handle canvas clicks (empty area) - this must come before pan logic
        // Check if we clicked on the canvas background (not on a node)
        const clickedOnBackground = e.target === e.currentTarget || 
          (e.target as HTMLElement).classList.contains('grid-background') ||
          (e.target as HTMLElement).tagName === 'svg' ||
          (e.target as HTMLElement).tagName === 'path' ||
          (e.target as HTMLElement).tagName === 'line' ||
          (e.target as HTMLElement).tagName === 'circle' ||
          (e.target as HTMLElement).closest('.grid-background') !== null;
          
        if (clickedOnBackground) {
          // Check if in comment mode - if so, delegate to comment system
          if (isCommentMode && commentClickHandlerRef.current) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
              commentClickHandlerRef.current(e, screenPos);
            }
            return;
          } else if (isCommentMode && !commentClickHandlerRef.current) {
            console.log('[Canvas] Comment mode active but no click handler available');
            return;
          }
          
          if (isShiftPressed && !draggingNode) {
            // Start selection box
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              const startPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              };
              console.log('[Canvas] Starting selection box:', {
                clientX: e.clientX,
                clientY: e.clientY,
                startPos
              });
              setSelectionBox({
                start: startPos,
                end: startPos
              });
            }
          } else if (!isShiftPressed) {
            // Handle text tool mode first - prioritize text creation over canvas interaction
            if (activeTextTool && onCanvasClick) {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                // Calculate canvas coordinates for text tool
                const canvasPosition = {
                  x: (e.clientX - rect.left - currentViewport.x) / currentViewport.zoom,
                  y: (e.clientY - rect.top - currentViewport.y) / currentViewport.zoom
                };
                console.log('[Canvas] Text tool click:', {
                  clientPos: { x: e.clientX, y: e.clientY },
                  canvasPos: canvasPosition,
                  viewport: currentViewport
                });
                onCanvasClick(e, canvasPosition);
                return; // Don't proceed with other canvas interactions
              }
            } else {
              // Clicking on empty canvas deselects all nodes (only if not in text tool mode)
              console.log('[Canvas] Canvas click - deselecting all nodes:', {
                isCurrentTarget: e.target === e.currentTarget,
                hasOnCanvasClick: !!onCanvasClick,
                targetTag: (e.target as HTMLElement).tagName,
                targetClass: (e.target as HTMLElement).className
              });
              onCanvasClick?.();
            }
          }
        }
        
        // Start panning if clicking on empty area and not disabled (only if not in text tool mode or comment mode)
        if (!activeTextTool && !isCommentMode && !disablePan && !isShiftPressed && !draggingNode && clickedOnBackground && !edgeHandleDragActive) {
          console.log('[Canvas] Starting pan');
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          return;
        } else if (edgeHandleDragActive) {
          console.log('[Canvas] Pan blocked - edge handle drag is active');
        } else if (activeTextTool) {
          console.log('[Canvas] Pan blocked - text tool is active');
        } else if (isCommentMode) {
          console.log('[Canvas] Pan blocked - comment mode is active');
        }
      }}
      onMouseMove={(e) => {
        handleMouseMove(e.nativeEvent);
        
        // Additional logging for comment mode mouse move
        if (isCommentMode && isPanning) {
          console.log('[Canvas] Comment mode - mouse move during panning:', {
            timestamp: Date.now(),
            position: { x: e.clientX, y: e.clientY },
            isPanning,
            panStart
          });
        }
        
        // Block canvas mouse move events during KFrame drag (except for the dragged KFrame itself)
        if (isGlobalDragBlocked && !draggingNode) {
          return;
        }
        
        if (selectionBox && isShiftPressed && !draggingNode) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const endPos = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            };
            
            console.log('[Canvas] Selection box mouse move:', {
              clientX: e.clientX,
              clientY: e.clientY,
              endPos,
              startPos: selectionBox.start
            });
            
            setSelectionBox({
              ...selectionBox,
              end: endPos
            });
          }
        }
      }}
      onMouseUp={(e) => {
        handleMouseUp();
        
        // Additional logging for comment mode mouse up
        if (isCommentMode) {
          console.log('[Canvas] Comment mode - mouse up:', {
            timestamp: Date.now(),
            position: { x: e.clientX, y: e.clientY },
            wasPanning: isPanning,
            duration: panStart ? Date.now() - (panStart as any).timestamp : null
          });
        }
        
        // Stop panning
        if (isPanning) {
          setIsPanning(false);
        }
        
        // Block canvas mouse up events during KFrame drag (except for the dragged KFrame itself)
        if (isGlobalDragBlocked && !draggingNode) {
          return;
        }
        
        if (selectionBox && isShiftPressed) {
          // Convert canvas-relative coordinates to canvas coordinates
          const startCanvas = {
            x: (selectionBox.start.x - currentViewport.x) / currentViewport.zoom,
            y: (selectionBox.start.y - currentViewport.y) / currentViewport.zoom
          };
          const endCanvas = {
            x: (selectionBox.end.x - currentViewport.x) / currentViewport.zoom,
            y: (selectionBox.end.y - currentViewport.y) / currentViewport.zoom
          };
          
          const minX = Math.min(startCanvas.x, endCanvas.x);
          const maxX = Math.max(startCanvas.x, endCanvas.x);
          const minY = Math.min(startCanvas.y, endCanvas.y);
          const maxY = Math.max(startCanvas.y, endCanvas.y);
          
          console.log('[Canvas] Selection box bounds calculation:', {
            viewport: {
              start: selectionBox.start,
              end: selectionBox.end
            },
            canvas: {
              start: startCanvas,
              end: endCanvas
            },
            bounds: { minX, maxX, minY, maxY },
            transformation: {
              viewportX: currentViewport.x,
              viewportY: currentViewport.y,
              zoom: currentViewport.zoom
            }
          });
          
          const selectedNodeIds = nodes.filter(node => {
            const nodeRight = node.position.x + (node.style?.width || 200);
            const nodeBottom = node.position.y + (node.style?.height || 100);
            
            const intersects = node.position.x < maxX && nodeRight > minX &&
                   node.position.y < maxY && nodeBottom > minY;
            
            console.log(`[Canvas] Node ${node.id} intersects:`, { 
              nodePos: node.position,
              nodeRight,
              nodeBottom,
              intersects,
              boxBounds: { minX, maxX, minY, maxY }
            });
            
            return intersects;
          }).map(node => node.id);
          
          console.log('[Canvas] Selected node IDs:', selectedNodeIds);
          
          // Update node selection
          const updatedNodes = nodes.map(node => ({
            ...node,
            selected: selectedNodeIds.includes(node.id)
          }));
          onNodesChange?.(updatedNodes);
          
          // Update selectedNodes state for delete functionality  
          onSelectionChange?.(selectedNodeIds);
          
          setSelectionBox(null);
        }
      }}
    >
      {/* Viewport Transformed Container */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${currentViewport.x}px, ${currentViewport.y}px) scale(${currentViewport.zoom})`,
          transformOrigin: '0 0',
          pointerEvents: 'none'
        }}
      >
        {/* Background Grid */}
        {gridType !== 'none' && (
          <GridBackground 
            gridSize={20} 
            gridType={gridType}
            color="currentColor"
            viewport={currentViewport}
          />
        )}
      
        {/* Edges and Preview Connection */}
        <svg 
          className="absolute inset-0" 
          width="100%"
          height="100%"
          style={{ 
            zIndex: 5,
            overflow: 'visible',
            pointerEvents: 'none'
          }}
        >
          {/* Global arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="16"
              markerHeight="12"
              refX="12"
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
              className="text-slate-950 dark:text-slate-50"
            >
              <path d="M 0 0 L 0 12 L 14 6 z" fill="currentColor" />
            </marker>
          </defs>
          
          {/* Regular Edges */}
          {showEdges && edges
            .filter((edge, index, arr) => 
              edge && edge.id && arr.findIndex(e => e.id === edge.id) === index // Remove duplicates and invalid edges
            )
            .map((edge, index) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              // Skip rendering if nodes are missing to prevent duplicate key warnings
              if (!sourceNode || !targetNode) {
                return null;
              }
              
              return (
                <ConnectionEdge
                  key={`edge-${edge.id}-${index}`}
                  edge={edge}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  nodes={nodes}
                  edges={edges}
                  onClick={isCommentMode ? undefined : onEdgeClick}
                  onDoubleClick={isCommentMode ? undefined : onEdgeDoubleClick}
                  onLabelChange={isCommentMode ? undefined : onEdgeLabelChange}
                  onEdgeReconnect={isCommentMode ? undefined : onEdgeReconnect}
                  viewport={currentViewport}
                />
              );
            }).filter(Boolean)}
          
          {/* Preview connection edge */}
          {draggingConn && (() => {
          const sourceNode = nodes.find(n => n.id === draggingConn.sourceNodeId);
          
          // Get fresh mouse position relative to canvas
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return null;
          
          // Transform mouse position through viewport (same as drag system)
          const rawMouseX = mouse.x - rect.left;
          const rawMouseY = mouse.y - rect.top;
          const mousePos = {
            x: (rawMouseX - currentViewport.x) / currentViewport.zoom,
            y: (rawMouseY - currentViewport.y) / currentViewport.zoom
          };
          
          // COMPREHENSIVE CURSOR SYNC DIAGNOSTIC LOGGING
          console.log('[CONNECTION_PREVIEW] CURSOR ALIGNMENT DIAGNOSTIC:', {
            timestamp: Date.now(),
            sourceHandle: draggingConn.sourceHandle,
            mouseState: { x: mouse.x, y: mouse.y },
            canvasRect: { 
              left: rect.left, 
              top: rect.top, 
              width: rect.width, 
              height: rect.height 
            },
            rawMouse: { x: rawMouseX, y: rawMouseY },
            viewport: currentViewport,
            transformedMouse: mousePos,
            calculations: {
              rawMouseX_formula: `${mouse.x} - ${rect.left} = ${rawMouseX}`,
              rawMouseY_formula: `${mouse.y} - ${rect.top} = ${rawMouseY}`,
              mousePosX_formula: `(${rawMouseX} - ${currentViewport.x}) / ${currentViewport.zoom} = ${mousePos.x}`,
              mousePosY_formula: `(${rawMouseY} - ${currentViewport.y}) / ${currentViewport.zoom} = ${mousePos.y}`
            }
          });
          
          
          // Check if hovering over a target that would be forbidden
          let hoveredNode = null;
          let isForbidden = false;
          
          // First pass: Find child nodes (prioritize over KFrames)
          for (const node of nodes) {
            if (node.type === 'kframe' || node.id === draggingConn.sourceNodeId) continue;
            
            const nodeWidth = node.style?.width || 200;
            const nodeHeight = node.style?.height || 100;
            
            if (mousePos.x >= node.position.x && 
                mousePos.x <= node.position.x + nodeWidth &&
                mousePos.y >= node.position.y && 
                mousePos.y <= node.position.y + nodeHeight) {
              hoveredNode = node;
              break;
            }
          }
          
          // Second pass: If no child node found, check KFrames
          if (!hoveredNode) {
            for (const node of nodes) {
              if (node.type !== 'kframe' || node.id === draggingConn.sourceNodeId) continue;
              
              const nodeWidth = node.style?.width || 400;
              const nodeHeight = node.style?.height || 300;
              
              if (mousePos.x >= node.position.x && 
                  mousePos.x <= node.position.x + nodeWidth &&
                  mousePos.y >= node.position.y && 
                  mousePos.y <= node.position.y + nodeHeight) {
                hoveredNode = node;
                break;
              }
            }
          }
          
          // Check if the found connection would be forbidden
          if (hoveredNode) {
            // Check if child node is trying to connect to its parent KFrame
            if (sourceNode?.data?.parentFrameId === hoveredNode.id) {
              isForbidden = true;
            }
            // Prevent parent KFrame → child connections  
            else if (hoveredNode.data?.parentFrameId === draggingConn.sourceNodeId) {
              isForbidden = true;
            }
            // Allow all other connections:
            // - Child nodes can connect to other child nodes (same or different KFrames)
            // - Child nodes can connect to non-child nodes
            // - Non-child nodes can connect to anything except their children
            // Allow non-child → child connections
            // Allow non-child → KFrame connections (now enabled via hover)
            
            // Check if this connection already exists (duplicate edge)
            const edgeExists = edges.some(e => 
              (e.source === draggingConn.sourceNodeId && e.target === hoveredNode.id) || 
              (e.source === hoveredNode.id && e.target === draggingConn.sourceNodeId)
            );
            if (edgeExists) {
              isForbidden = true;
            }
          }
          
          // Render blue highlight for hovered target node (similar to edge reconnection)
          const targetHighlight = hoveredNode && !isForbidden ? (
            <rect
              x={hoveredNode.position.x - 4}
              y={hoveredNode.position.y - 4}
              width={(hoveredNode.type === 'kframe' ? (hoveredNode.style?.width || 400) : (hoveredNode.style?.width || 200)) + 8}
              height={(hoveredNode.type === 'kframe' ? (hoveredNode.style?.height || 300) : (hoveredNode.style?.height || 100)) + 8}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="none"
              opacity="0.8"
              pointerEvents="none"
              rx="8"
            />
          ) : null;
          
          return (
            <g>
              {/* Blue target highlight */}
              {targetHighlight}
              
              {/* Connection preview line */}
              <ConnectionEdge
                key={`preview-connection-${draggingConn.sourceNodeId}-${Date.now()}`}
                edge={{
                  id: `preview-${draggingConn.sourceNodeId}`,
                  source: draggingConn.sourceNodeId,
                  target: 'preview-target',
                  type: 'line',
                  data: {
                    color: hoveredNode ? (isForbidden ? '#ef4444' : '#22c55e') : '#3b82f6',
                    strokeWidth: 2
                  },
                  style: { 
                    strokeDasharray: 'none', 
                    stroke: hoveredNode ? (isForbidden ? '#ef4444' : '#22c55e') : '#3b82f6', 
                    strokeWidth: 2,
                    opacity: hoveredNode && isForbidden ? 0.5 : 0.8
                  },
                  animated: false,
                  // Add sourceHandle to edge data
                  sourceHandle: draggingConn.sourceHandle,
                }}
                sourceNode={sourceNode}
                targetNode={{
                  id: 'preview-target',
                  position: mousePos,
                  style: { width: 0, height: 0 },
                  data: { label: '' },
                  type: 'default'
                }}
                edges={edges}
                onClick={undefined}
              />
            </g>
          );
        })()}
        
        {/* Smart Connect Preview */}
        {filteredSmartConnectPreview && (
          <SmartConnectOverlay
            preview={filteredSmartConnectPreview}
            strokeColor="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5,5"
            opacity={0.8}
          />
        )}
        </svg>
      
      {/* Snap Guides - inside viewport-transformed container */}
      {snapGuides.length > 0 && (
        <SnapGuides 
          guides={snapGuides}
          canvasSize={canvasSize}
          viewport={currentViewport}
          show={currentSnapSettings.enabled && currentSnapSettings.showGuides}
        />
      )}

      {/* Nodes */}
      {Array.isArray(nodes) && nodes
        .filter((node, index, arr) => 
          node && node.id && arr.findIndex(n => n.id === node.id) === index // Remove duplicates and invalid nodes
        )
        .map((node, index) => {
          return (
            <div key={`node-${node.id}-${index}`}>
              {renderNode(node)}
            </div>
          );
        })}

      {/* Combined Reaction Bubbles - rendered inside viewport-transformed container */}
      {(() => {
        // Group reactions by nodeId
        const reactionsByNode = reactions.reduce((acc, reaction) => {
          if (!acc[reaction.nodeId]) {
            acc[reaction.nodeId] = [];
          }
          acc[reaction.nodeId].push(reaction);
          return acc;
        }, {} as Record<string, typeof reactions>);

        return Object.entries(reactionsByNode).map(([nodeId, nodeReactions]) => {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return null;

          return (
            <div
              key={`reactions-${nodeId}`}
              className="absolute pointer-events-none"
              style={{
                left: node.position.x,
                top: node.position.y,
                width: node.style?.width || 200,
                height: node.style?.height || 100,
                zIndex: 20
              }}
            >
              <div 
                className="absolute pointer-events-auto"
                style={{
                  top: -12,
                  left: -12,
                  transform: 'none'
                }}
              >
                <CombinedReactionBubble
                  reactions={nodeReactions}
                  position="top-left"
                  onReactionRemove={(reactionId) => onReactionRemove?.(reactionId)}
                />
              </div>
            </div>
          );
        });
      })()}



      {/* Unadopt buttons for child nodes */}
      {nodes.filter(node => node.type === 'kframe').map(kframe => {
        const childNodes = nodes.filter(n => n.data?.parentFrameId === kframe.id);
        
        return childNodes.map(child => {
          const nodeWidth = child.style?.width || 200;
          
          return (
            <div
              key={`unadopt-${child.id}`}
              className="absolute cursor-pointer bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all duration-200 z-20"
              style={{
                left: child.position.x + nodeWidth - 25,
                top: child.position.y + 5,
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: hoveredChildNode === child.id && !draggingNode ? 1 : 0,
                pointerEvents: 'auto',
              }}
              onMouseEnter={() => setHoveredChildNode(child.id)}
              onMouseLeave={() => setHoveredChildNode(null)}
              onClick={(e) => {
                e.stopPropagation();
                const updatedNodes = nodes.map(n => {
                  if (n.id === child.id) {
                    const { parentFrameId, ...dataWithoutParent } = n.data;
                    return { ...n, data: dataWithoutParent };
                  }
                  return n;
                });
                onNodesChange?.(updatedNodes);
              }}
              title="Remove from frame"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
              </svg>
            </div>
          );
        });
      })}
      </div>

      {/* Selection Box Overlay (outside viewport transform) */}
      {selectionBox && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none z-30"
          style={{
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            width: Math.abs(selectionBox.end.x - selectionBox.start.x),
            height: Math.abs(selectionBox.end.y - selectionBox.start.y),
            // Remove viewport transformation since cursor coordinates are already in viewport space
          }}
        />
      )}

      {/* MiniMap */}
      {showMiniMap && (
        <MiniMap
          nodes={nodes}
          edges={edges}
          viewport={currentViewport}
          canvasSize={canvasSize}
          onViewportChange={updateViewport}
        />
      )}

      {/* Floating Toolbar (outside viewport transform) */}
      {enableFloatingToolbar && (selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <FloatingToolbar
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          selectedTexts={[]} // Don't pass selected texts - use TextFormattingToolbar instead
          nodes={nodes}
          edges={edges}
          canvasTexts={canvasTexts || []}
          position={floatingToolbarPosition}
          onNodeStyleChange={handleNodeStyleChange}
          onEdgeStyleChange={handleEdgeStyleChange}
          onTextStyleChange={onTextStyleChange}
          onIconChange={onIconChange}
          onDeleteNode={onDeleteNode}
          onWorkflowOptimize={onWorkflowOptimize}
          onGenerateUIMock={onGenerateUIMock}
          workflowOptimizationState={workflowOptimizationState}
        />
      )}

      {/* Ghost Node Preview (outside viewport transform) */}
      {enableGhostPreview && ghostPreview && (
        <GhostNodePreview
          visible={ghostPreview.visible}
          position={ghostPreview.position}
          handlePosition="right"
        />
      )}
      
      {/* Ghost Preview Data for Snapshots */}
      {ghostPreviewData && (
        <div className="absolute inset-0 pointer-events-none z-40">
          {/* Ghost Preview Label */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            👻 Preview: {ghostPreviewData.label}
          </div>
          
          {/* Ghost Preview Nodes and Edges */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${currentViewport.x}px, ${currentViewport.y}px) scale(${currentViewport.zoom})`,
              transformOrigin: '0 0',
              opacity: 0.6
            }}
          >
            {/* Ghost Edges */}
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              {ghostPreviewData.edges.map(edge => {
                const sourceNode = ghostPreviewData.nodes.find(n => n.id === edge.source);
                const targetNode = ghostPreviewData.nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;
                
                const sourceX = sourceNode.position.x + (sourceNode.style?.width || 200) / 2;
                const sourceY = sourceNode.position.y + (sourceNode.style?.height || 100) / 2;
                const targetX = targetNode.position.x + (targetNode.style?.width || 200) / 2;
                const targetY = targetNode.position.y + (targetNode.style?.height || 100) / 2;
                
                return (
                  <path
                    key={`ghost-edge-${edge.id}`}
                    d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${(sourceY + targetY) / 2 - 50} ${targetX} ${targetY}`}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                );
              })}
            </svg>
            
            {/* Ghost Nodes */}
            {ghostPreviewData.nodes.map(node => (
              <div
                key={`ghost-node-${node.id}`}
                className="absolute bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-600 border-dashed rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-200"
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: node.style?.width || 200,
                  height: node.style?.height || 100,
                }}
              >
                <div className="text-center p-2">
                  <div className="font-medium text-sm">{node.data?.label || 'Node'}</div>
                  <div className="text-xs opacity-70">{node.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Comment System */}
      <CanvasCommentSystem
        canvasRef={canvasRef}
        viewport={currentViewport}
        isCommentMode={isCommentMode}
        onCommentModeToggle={onCommentModeToggle || (() => {})}
        onCommentAdd={onCommentAdd}
        onCommentUpdate={onCommentUpdate}
        onCommentDelete={onCommentDelete}
        onCanvasClickHandler={handleCommentClickHandlerCallback}
        onCommentFocus={(comment) => {
          // Removed pan-to/zoom behavior - comments should not move the viewport
          // Just pass through the callback if parent needs to know about focus
          onCommentFocus?.(comment);
        }}
      />

      {/* Layers Panel */}
      {showLayersPanel && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <NestedLayersPanel
            workflows={layerStructure}
            onSelect={(id, type) => {
              // Handle layer selection
              if (type === 'node') {
                // Find and select the node
                const node = nodes.find(n => n.id === id);
                if (node && onNodeClick) {
                  onNodeClick(new MouseEvent('click') as any, node);
                }
              } else if (type === 'edge') {
                // Find and select the edge  
                const edge = edges.find(e => e.id === id);
                if (edge && onEdgeClick) {
                  onEdgeClick(new MouseEvent('click') as any, edge);
                }
              } else if (type === 'text') {
                // Handle text selection
                const text = canvasTexts.find(t => t.id === id);
                if (text) {
                  // Focus on the text element
                  const canvasRect = canvasRef.current?.getBoundingClientRect();
                  if (canvasRect) {
                    const targetX = canvasRect.width / 2 - text.position.x * currentViewport.zoom;
                    const targetY = canvasRect.height / 2 - text.position.y * currentViewport.zoom;
                    updateViewport({
                      ...currentViewport,
                      x: targetX,
                      y: targetY
                    });
                  }
                }
              }
              onLayerSelect?.(id, type);
            }}
          />
        </div>
      )}

    </div>
  );
}