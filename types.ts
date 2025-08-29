export type NodeType = 'input' | 'default' | 'output' | 'image' | 'kframe' | 'annotation' | 'd3metric' | 'liveData' | 'map' | 'coindesk' | 'age' | 'quote' | 'bored' | 'chart' | 'transformer' | 'live-data' | 'weather' | 'duck' | 'nasa' | 'dataTransformer' | 'inputJson' | 'outputJson' | 'textExtractor' | 'textOutput' | 'concat' | 'inputSound' | 'soundTransformer' | 'outputSound' | 'baseApi' | 'graphic' | 'textInput' | 'text' | 'd3-chart';

export type EdgeType = 'line' | 'step' | 'smoothstep' | 'bezier';

export interface SmartConnectOptions {
  /** enable smart-connect on this node */
  enabled: boolean;
  /** snap distance in pixels (default: 20) */
  threshold?: number;
}

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  selected?: boolean;
  createdBy?: string; // User ID of the node creator for ownership tracking
  style?: { 
    width?: number; 
    height?: number; 
  };
  data: {
    label: string;
    description?: string;
    color?: string;
    icon?: string;
    iconType?: 'lucide' | 'emoji';
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;
    handles?: {
      input?: boolean;
      output?: boolean;
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
    };
    // for image nodes:
    src?: string;
    showLabel?: boolean;
    labelPosition?:
      | 'inside-top-left'
      | 'inside-top-right'
      | 'inside-bottom-left'
      | 'inside-bottom-right'
      | 'outside-top'
      | 'outside-bottom'
      | 'centered'
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'top'
      | 'bottom'
      | 'center';
    // label styling properties:
    labelBackgroundColor?: 'white' | 'black';
    labelCornerStyle?: 'round' | 'square';
    // content alignment properties:
    contentHorizontalAlign?: 'left' | 'center' | 'right';
    contentVerticalAlign?: 'top' | 'center' | 'bottom';
    // for kframe nodes:
    parentFrameId?: string;
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'center' | 'bottom';
    labelStyle?: {
      fontSize?: number;
      fontWeight?: React.CSSProperties['fontWeight'];
      fontStyle?: React.CSSProperties['fontStyle'];
      color?: string;
    };
    style?: {
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      borderStyle?: 'solid' | 'dashed' | 'dotted';
    };
    // for annotation nodes:
    text?: string;
    // for d3metric nodes:
    series?: number[];
    title?: string;
    // for liveData nodes:
    url?: string;
    // for progressive hover functionality:
    enableGhostPreview?: boolean;
    interval?: number;
    jsonPath?: string;
    formatter?: (value: any) => string;
    // for map nodes:
    address?: string;
    zoom?: number;
    mapStyle?: 'streets' | 'satellite' | 'outdoors' | 'light' | 'dark';
    // for advanced nodes:
    name?: string; // for age prediction node
    points?: number[][]; // for chart node
    chartType?: 'line' | 'bar' | 'area'; // for chart and d3metric nodes
    snippet?: string; // for data transformer node
    input?: string; // for data transformer node
    // for text nodes:
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    lineHeight?: number;
    letterSpacing?: number;
    textColor?: string;
    textDecoration?: string;
    textTransform?: string;
    // for audio/sound nodes:
    audioBuffer?: any;
    transformedBuffer?: any;
    initialJson?: any;
    transformedData?: any;
  };
  // Node behavior controls
  selectable?: boolean;
  doubleClickable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  smartConnect?: SmartConnectOptions;
}

// Alias for backward compatibility with new components
export type NodeData = Node;
export type EdgeData = Edge;

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  sourceHandle?: string;
  targetHandle?: string;
  selected?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    opacity?: number;
  };
  data?: {
    label?: string;
    color?: string;
    strokeWidth?: number;
    style?: 'solid' | 'dashed' | 'dotted' | 'animated';
    animationSpeed?: number;
    animationDirection?: 'forward' | 'reverse';
    animated?: boolean;
    dashArray?: string;
  };
}

export interface FlowCallbacks {
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeRightClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeSettingsChange?: (nodeId: string, updates: Partial<Node['data']>) => void;
  onKFrameLabelChange?: (nodeId: string, label: string) => void;
  onKFrameDescriptionChange?: (nodeId: string, description: string) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeLabelChange?: (edgeId: string, newLabel: string) => void;
  onConnect?: (edge: Edge) => void;
  onHandleConnect?: (pos: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
}

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];
  viewport: { x: number; y: number; zoom: number };
}

// Enhanced types for new components
export interface ToolbarProps {
  actions: ToolbarAction[];
  orientation?: 'horizontal' | 'vertical';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface ToolbarAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export interface GridBackgroundProps {
  gridSize?: number;
  color?: string;
}

export interface ResizableNodeProps {
  node: NodeData;
  onResize: (id: string, w: number, h: number) => void;
  children: React.ReactNode;
}