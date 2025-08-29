/**
 * @kiteline/kiteframe - Production-ready React component library
 * for building interactive flow diagrams and collaborative canvases
 */

// Core Canvas Components
export { KiteFrameCanvas } from './components/advanced/KiteFrameCanvas';
export { GridBackground } from './components/GridBackground';
export { SelectionBox } from './components/SelectionBox';
export { CanvasText } from './components/advanced/CanvasText';

// Node Components
export { DefaultNode } from './components/DefaultNode';
export { ImageNode } from './components/ImageNode';
export { ResizableNode } from './components/ResizableNode';
export { NodeHandles } from './components/NodeHandles';
export { AnnotationNode } from './components/advanced/AnnotationNode';
export { ChartNode } from './components/advanced/ChartNode';
export { DataTransformerNode } from './components/advanced/DataTransformerNode';
export { FilterNode } from './components/advanced/FilterNode';
export { SortNode } from './components/advanced/SortNode';
export { GroupByNode } from './components/advanced/GroupByNode';
export { PivotNode } from './components/advanced/PivotNode';
export { JoinNode } from './components/advanced/JoinNode';
export { ConcatNode } from './components/advanced/ConcatNode';
export { FileNode } from './components/advanced/FileNode';
export { EmailNode } from './components/advanced/EmailNode';
export { FormNode } from './components/advanced/FormNode';
export { FormulaNode } from './components/advanced/FormulaNode';
export { IntegrationNode } from './components/advanced/IntegrationNode';
export { LiveDataNode } from './components/advanced/LiveDataNode';
export { MapNode } from './components/advanced/MapNode';
export { NotificationNode } from './components/advanced/NotificationNode';
export { SchedulerNode } from './components/advanced/SchedulerNode';
export { VideoNode } from './components/advanced/VideoNode';
export { WeatherNode } from './components/advanced/WeatherNode';
export { WebhookNode } from './components/advanced/WebhookNode';
export { BaseApiNode } from './components/advanced/BaseApiNode';
export { D3MetricNode } from './components/advanced/D3MetricNode';

// KFrame Components
export { KFrame } from './components/advanced/KFrame';
export { KFrameToolbar } from './components/advanced/KFrameToolbar';

// Edge Components
export { ConnectionEdge } from './components/ConnectionEdge';
export { EdgeHandles } from './components/advanced/EdgeHandles';
export { SmartConnect } from './components/advanced/SmartConnect';

// Toolbar Components
export { ControlsToolbar } from './components/ControlsToolbar';
export { FlowControls } from './components/FlowControls';
export { FlowActionsToolbar } from './components/FlowActionsToolbar';
export { FlowElementToolbar } from './components/FlowElementToolbar';
export { Toolbar } from './components/Toolbar';
export { ContextualMenu } from './components/advanced/ContextualMenu';

// Settings Popovers
export { NodeSettingsPopover } from './components/NodeSettingsPopover';
export { ConnectionSettingsPopover } from './components/ConnectionSettingsPopover';
export { ImageSettingsPopover } from './components/ImageSettingsPopover';

// Collaboration Components
export { YjsProvider } from './components/collaboration/YjsProvider';
export { YjsLiveCursor } from './components/collaboration/YjsLiveCursor';
export { CollaborationUI } from './components/collaboration/CollaborationUI';
export { ChatSystem } from './components/collaboration/ChatSystem';
export { CommentSystem } from './components/collaboration/CommentSystem';
export { CanvasCommentSystem } from './components/collaboration/CanvasCommentSystem';
export { CommentMarker } from './components/advanced/CommentMarker';
export { CommentPopover } from './components/advanced/CommentPopover';
export { CommentModeToggle } from './components/advanced/CommentModeToggle';
export { CollaborationPresence } from './components/advanced/CollaborationPresence';

// Panel Components
export { LayersPanel } from './components/advanced/LayersPanel';
export { PropertiesPanel } from './components/advanced/PropertiesPanel';
export { NodePalette } from './components/advanced/NodePalette';
export { ZoomToolbar } from './components/advanced/ZoomToolbar';
export { SearchBar } from './components/advanced/SearchBar';
export { SearchModal } from './components/advanced/SearchModal';
export { ExportPreviewModal } from './components/advanced/ExportPreviewModal';
export { ImprovementModal } from './components/advanced/ImprovementModal';

// Utility Components
export { ReactionBubble } from './components/ReactionBubble';
export { ResizeHandle } from './components/ResizeHandle';
export { LoadingPanel } from './components/advanced/LoadingPanel';
export { HelpPanel } from './components/advanced/HelpPanel';
export { HelpTooltip } from './components/advanced/HelpTooltip';

// Hooks
export { useCopyPaste } from './hooks/useCopyPaste';
export { useMultiSelect } from './hooks/useMultiSelect';
export { useSmartConnect } from './hooks/advanced/useSmartConnect';
export { useLiveCollaboration } from './hooks/advanced/useLiveCollaboration';
export { useVersionPreview } from './hooks/advanced/useVersionPreview';
export { useFileAuthorControls } from './hooks/advanced/useFileAuthorControls';
export { useKiteFrameStore } from './store/useKiteFrameStore';

// Providers
export { HistoryProvider } from './providers/HistoryProvider';
export { VersionProvider } from './providers/VersionProvider';
export { PluginProvider } from './providers/PluginProvider';

// Types
export type {
  Node,
  Edge,
  NodeData,
  EdgeData,
  Position,
  ViewportState,
  KFrameData,
  CanvasTextData,
  ConnectionHandle,
  FlowState,
  LayerNode,
  WorkflowAnalysis,
  CollaborationUser,
  Comment,
  ChatMessage,
  VersionSnapshot,
  ExportFormat,
  AIWorkflowRequest,
  AIWorkflowResponse,
  SecurityPolicy,
  ProjectData,
  UIMockData
} from './types';

// Utility Functions
export {
  generateNodeId,
  generateEdgeId,
  calculateNodeBounds,
  isNodeIntersecting,
  getConnectedNodes,
  getNodeDependencies,
  validateConnection,
  autoLayoutNodes,
  exportToJSON,
  exportToPNG,
  exportToPDF,
  importFromJSON,
  analyzeWorkflow,
  optimizeWorkflow,
  detectCycles,
  findCriticalPath
} from './utils/flowUtils';

export {
  getNodeStyle,
  getEdgeStyle,
  getHandleStyle,
  getKFrameStyle,
  getThemeColors,
  applyColorScheme
} from './utils/nodeStyles';

// Constants
export { NODE_TYPES, EDGE_TYPES, LAYOUT_ALGORITHMS } from './constants';

// Version
export const VERSION = '1.0.0';

// Re-export useful types from dependencies
export type { DragEvent, MouseEvent, WheelEvent } from 'react';