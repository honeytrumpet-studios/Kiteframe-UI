// Core types for KiteFrame
export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  width?: number;
  height?: number;
  selected?: boolean;
  dragging?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: EdgeData;
  selected?: boolean;
  animated?: boolean;
}

export interface NodeData {
  label: string;
  description?: string;
  color?: string;
  icon?: string;
  handles?: HandleData[];
  [key: string]: any;
}

export interface EdgeData {
  label?: string;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
  [key: string]: any;
}

export interface HandleData {
  id: string;
  type: 'source' | 'target';
  position: 'top' | 'right' | 'bottom' | 'left';
  style?: React.CSSProperties;
}

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];
  viewport: { x: number; y: number; zoom: number };
}

export interface FlowCallbacks {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeSettingsChange?: (nodeId: string, updates: Partial<Node['data']>) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onConnect?: (params: { source: string; target: string }) => void;
}
