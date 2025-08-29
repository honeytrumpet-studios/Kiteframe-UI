# KiteFrame UI Library - Complete Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Catalog](#component-catalog)
3. [Coordinate System](#coordinate-system)
4. [Advanced Features](#advanced-features)
5. [Integration Guide](#integration-guide)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Core Design Principles

KiteFrame is built on a modular, event-driven architecture that prioritizes:

- **Performance**: Virtual rendering and GPU acceleration
- **Extensibility**: Plugin-based architecture for custom features
- **Type Safety**: Full TypeScript coverage with strict mode
- **Accessibility**: WCAG 2.1 AA compliant components
- **Developer Experience**: Intuitive APIs and comprehensive IntelliSense

### Package Structure

```
@kiteline/kiteframe/
├── components/          # Core UI components
│   ├── canvas/         # Canvas and viewport components
│   ├── nodes/          # Node type implementations
│   ├── edges/          # Edge rendering and interaction
│   ├── controls/       # UI controls (minimap, toolbar, etc.)
│   └── advanced/       # Complex features (KFrames, etc.)
├── hooks/              # React hooks
├── providers/          # Context providers
├── collaboration/      # Real-time collaboration modules
├── ai/                # AI integration features
├── utils/             # Utility functions
├── types/             # TypeScript definitions
└── constants/         # Configuration constants
```

## Component Catalog

### Canvas Components

#### KiteFrameCanvas

The main canvas component manages the infinite canvas space and coordinates all interactions.

**Props:**
```typescript
interface KiteFrameCanvasProps {
  nodes: NodeData[];
  edges: Edge[];
  canvasTexts?: CanvasText[];
  viewport?: Viewport;
  onNodesChange?: (nodes: NodeData[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onViewportChange?: (viewport: Viewport) => void;
  enableGhostPreview?: boolean;
  enableSmartConnect?: boolean;
  smartConnectThreshold?: number;
  gridSize?: number;
  snapToGrid?: boolean;
  minZoom?: number;
  maxZoom?: number;
  nodeTypes?: Record<string, React.ComponentType<NodeProps>>;
  edgeTypes?: Record<string, React.ComponentType<EdgeProps>>;
}
```

**Features:**
- Infinite canvas with pan and zoom
- GPU-accelerated rendering using CSS transforms
- Virtual scrolling for large diagrams
- Touch gesture support
- Keyboard shortcuts

### Node Components

#### DefaultNode
Standard rectangular node with customizable content.

```typescript
interface DefaultNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    icon?: string;
    color?: string;
    borderColor?: string;
  };
  selected?: boolean;
  position: { x: number; y: number };
  style?: React.CSSProperties;
}
```

#### KFrame (Container Node)
Advanced container for grouping nodes with auto-sizing.

```typescript
interface KFrameProps extends DefaultNodeProps {
  data: {
    title: string;
    description?: string;
    children?: string[]; // Node IDs
    collapsed?: boolean;
    backgroundColor?: string;
    minWidth?: number;
    minHeight?: number;
  };
}
```

**Auto-sizing Algorithm:**
- Calculates bounding box of child nodes
- Adds configurable padding
- Maintains minimum dimensions
- Animates size changes smoothly

#### ImageNode
Display images with intelligent loading and caching.

```typescript
interface ImageNodeProps extends DefaultNodeProps {
  data: {
    imageUrl: string;
    alt?: string;
    caption?: string;
    aspectRatio?: number;
    fallbackUrl?: string;
    loading?: 'lazy' | 'eager';
  };
}
```

#### UIMockNode
Wireframe generator for UI mockups.

```typescript
interface UIMockNodeProps extends DefaultNodeProps {
  data: {
    mockType: 'dashboard' | 'form' | 'list' | 'custom';
    uiMockDataUri?: string; // SVG data URI
    wireframeConfig?: {
      theme: 'light' | 'dark';
      density: 'compact' | 'normal' | 'comfortable';
    };
  };
}
```

### Edge Components

#### ConnectionEdge
Configurable edge with multiple path types.

```typescript
interface ConnectionEdgeProps {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'straight' | 'step' | 'smoothstep' | 'bezier';
  selected?: boolean;
  data?: {
    label?: string;
    color?: string;
    strokeWidth?: number;
    animated?: boolean;
    animationSpeed?: number;
    animationDirection?: 'forward' | 'reverse';
    arrowType?: 'arrow' | 'arrowclosed' | 'none';
  };
}
```

**Path Algorithms:**
- **Straight**: Direct line between points
- **Step**: Manhattan routing with 90° angles
- **Smoothstep**: Curved corners on step paths
- **Bezier**: Smooth cubic bezier curves

### Interactive Components

#### NodeHandles
Connection points with hover interactions.

```typescript
interface NodeHandlesProps {
  node: NodeData;
  alwaysShowHandles?: boolean;
  enableGhostPreview?: boolean;
  onQuickAddNode?: (nodeId: string, position: HandlePosition) => void;
  onConnectStart?: (nodeId: string, handle: HandlePosition, event: MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handle: HandlePosition, event: MouseEvent) => void;
}
```

**Ghost Preview Feature:**
1. User hovers over handle for 300ms
2. "+" button appears 30px offset from handle
3. Click creates new node 160px away
4. Automatic edge connection created

#### EdgeSettingsPopover
Inline edge customization UI.

```typescript
interface EdgeSettingsPopoverProps {
  edge: Edge;
  position: { x: number; y: number };
  onUpdate: (edge: Edge) => void;
  onDelete: () => void;
}
```

## Coordinate System

### Three-Layer Architecture

KiteFrame uses a sophisticated coordinate transformation system:

1. **Screen Space**: Browser viewport coordinates
2. **Canvas Space**: Relative to canvas container
3. **World Space**: Infinite canvas coordinates

### Transformation Pipeline

```typescript
// Screen to World transformation
function screenToWorld(screenX: number, screenY: number, viewport: Viewport): Point {
  const canvasRect = canvasElement.getBoundingClientRect();
  const canvasX = screenX - canvasRect.left;
  const canvasY = screenY - canvasRect.top;
  
  return {
    x: (canvasX - viewport.x) / viewport.zoom,
    y: (canvasY - viewport.y) / viewport.zoom
  };
}

// World to Screen transformation
function worldToScreen(worldX: number, worldY: number, viewport: Viewport): Point {
  const canvasRect = canvasElement.getBoundingClientRect();
  
  return {
    x: worldX * viewport.zoom + viewport.x + canvasRect.left,
    y: worldY * viewport.zoom + viewport.y + canvasRect.top
  };
}
```

### Viewport Management

```typescript
interface Viewport {
  x: number;      // Pan offset X
  y: number;      // Pan offset Y
  zoom: number;   // Zoom level (0.1 to 4)
}
```

**Zoom Behavior:**
- Cursor-centered zooming
- Smooth transitions with requestAnimationFrame
- Momentum scrolling on trackpads
- Pinch-to-zoom on touch devices

## Advanced Features

### AI Integration

#### Workflow Generation

```typescript
interface AIGenerationConfig {
  apiKey: string;
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  temperature?: number;
  maxTokens?: number;
}

async function generateWorkflow(
  prompt: string, 
  config: AIGenerationConfig
): Promise<WorkflowData> {
  // Sends prompt to OpenAI
  // Parses structured JSON response
  // Validates node/edge structure
  // Returns complete workflow
}
```

#### Image Analysis

```typescript
async function analyzeWorkflowImage(
  imageFile: File,
  config: AIGenerationConfig
): Promise<WorkflowData> {
  // Converts image to base64
  // Sends to GPT-4 Vision
  // Extracts workflow structure
  // Generates nodes and edges
}
```

### Real-time Collaboration

#### Yjs Integration

```typescript
interface CollaborationConfig {
  roomId: string;
  serverUrl?: string;
  awareness?: AwarenessConfig;
  provider?: 'websocket' | 'webrtc';
}

// Initialize collaboration
const provider = new YjsProvider({
  roomId: 'my-diagram-room',
  serverUrl: 'wss://yjs.example.com'
});

// Sync state automatically
provider.on('sync', (state) => {
  setNodes(state.nodes);
  setEdges(state.edges);
});
```

#### Conflict Resolution

KiteFrame uses Yjs's CRDT (Conflict-free Replicated Data Type) for automatic conflict resolution:

1. **Last-Write-Wins**: For simple properties
2. **Operational Transform**: For text editing
3. **Vector Clocks**: For ordering operations
4. **Tombstones**: For deletion tracking

### Auto-Layout System

#### Force-Directed Layout

```typescript
interface ForceLayoutConfig {
  strength?: number;        // Force strength (0-1)
  distance?: number;        // Ideal edge length
  iterations?: number;      // Simulation iterations
  centerForce?: boolean;    // Center nodes in viewport
  collisionRadius?: number; // Node collision detection
}

function forceDirectedLayout(
  nodes: NodeData[], 
  edges: Edge[], 
  config: ForceLayoutConfig
): NodeData[] {
  // D3-force simulation
  // Applies attractive/repulsive forces
  // Prevents node overlap
  // Returns optimized positions
}
```

#### Hierarchical Layout

```typescript
interface HierarchicalLayoutConfig {
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  levelSeparation?: number;
  nodeSeparation?: number;
  rankdir?: 'same' | 'min' | 'max';
}

function hierarchicalLayout(
  nodes: NodeData[],
  edges: Edge[],
  config: HierarchicalLayoutConfig
): NodeData[] {
  // Dagre layout algorithm
  // Creates layered graph
  // Minimizes edge crossings
  // Returns positioned nodes
}
```

### Smart Connect

Intelligent edge routing and connection suggestions.

```typescript
interface SmartConnectConfig {
  threshold: number;         // Proximity threshold in pixels
  showGuides: boolean;      // Visual alignment guides
  magneticSnap: boolean;    // Snap to connection points
  avoidOverlap: boolean;    // Route around nodes
}
```

**Algorithm:**
1. Calculate proximity to nearby nodes
2. Find optimal connection points
3. Generate alignment guides
4. Apply magnetic snapping
5. Route edges to avoid overlaps

### Export System

#### PNG Export

```typescript
async function exportAsPNG(
  viewport: ExportViewport,
  options?: {
    scale?: number;
    backgroundColor?: string;
    quality?: number;
  }
): Promise<Blob> {
  // Renders canvas to offscreen canvas
  // Applies viewport transformations
  // Converts to PNG blob
}
```

#### PDF Export

```typescript
async function exportAsPDF(
  options?: {
    orientation?: 'portrait' | 'landscape';
    format?: 'a4' | 'letter' | 'legal';
    margin?: number;
    includeMetadata?: boolean;
  }
): Promise<Blob> {
  // Uses jsPDF library
  // Vectorizes diagram elements
  // Embeds fonts and images
  // Generates PDF document
}
```

## Integration Guide

### React Application

```tsx
// 1. Install dependencies
npm install @kiteline/kiteframe react react-dom

// 2. Import styles
import '@kiteline/kiteframe/styles.css';

// 3. Setup provider
import { KiteFrameProvider } from '@kiteline/kiteframe';

function App() {
  return (
    <KiteFrameProvider>
      <DiagramEditor />
    </KiteFrameProvider>
  );
}

// 4. Use components
import { KiteFrameCanvas, useKiteFrame } from '@kiteline/kiteframe';

function DiagramEditor() {
  const { nodes, edges, addNode, updateNode } = useKiteFrame();
  
  return (
    <KiteFrameCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={updateNode}
    />
  );
}
```

### Next.js Integration

```tsx
// pages/_app.tsx
import '@kiteline/kiteframe/styles.css';

// components/Diagram.tsx
import dynamic from 'next/dynamic';

const KiteFrameCanvas = dynamic(
  () => import('@kiteline/kiteframe').then(mod => mod.KiteFrameCanvas),
  { ssr: false }
);

export default function Diagram() {
  return <KiteFrameCanvas {...props} />;
}
```

### Custom Node Types

```tsx
// 1. Define custom node component
const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
      <header>{data.title}</header>
      <div className="content">{data.content}</div>
      <NodeHandles node={data} />
    </div>
  );
};

// 2. Register node type
const nodeTypes = {
  custom: CustomNode
};

// 3. Use in canvas
<KiteFrameCanvas nodeTypes={nodeTypes} />
```

### Custom Edge Types

```tsx
// 1. Define custom edge component
const CustomEdge: React.FC<EdgeProps> = ({ 
  sourceX, 
  sourceY, 
  targetX, 
  targetY,
  data 
}) => {
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  
  return (
    <g>
      <path d={path} stroke={data.color} strokeWidth={2} />
      <text x={(sourceX + targetX) / 2} y={(sourceY + targetY) / 2}>
        {data.label}
      </text>
    </g>
  );
};

// 2. Register edge type
const edgeTypes = {
  custom: CustomEdge
};

// 3. Use in canvas
<KiteFrameCanvas edgeTypes={edgeTypes} />
```

## Performance Optimization

### Rendering Optimization

#### Virtual Rendering
Only visible nodes are rendered using intersection observer:

```typescript
const visibleNodes = nodes.filter(node => {
  const nodeBounds = getNodeBounds(node);
  return intersectsViewport(nodeBounds, viewport);
});
```

#### React.memo Optimization
All components use React.memo with custom comparison:

```typescript
export const Node = React.memo(NodeComponent, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.selected === next.selected &&
    prev.data === next.data &&
    prev.position.x === next.position.x &&
    prev.position.y === next.position.y
  );
});
```

#### CSS Transform Performance
Uses GPU-accelerated transforms:

```css
.canvas-content {
  transform: translate3d(var(--x), var(--y), 0) scale(var(--zoom));
  will-change: transform;
  transform-style: preserve-3d;
}
```

### State Management

#### Debounced Updates
Prevents excessive re-renders:

```typescript
const debouncedUpdate = useMemo(
  () => debounce((nodes: NodeData[]) => {
    onNodesChange(nodes);
  }, 100),
  [onNodesChange]
);
```

#### Immutable Updates
Uses Immer for immutable state updates:

```typescript
const updateNode = (id: string, updates: Partial<NodeData>) => {
  setNodes(produce(draft => {
    const node = draft.find(n => n.id === id);
    if (node) Object.assign(node, updates);
  }));
};
```

### Large Dataset Handling

#### Chunked Rendering
Renders large datasets in chunks:

```typescript
function ChunkedRenderer({ items, chunkSize = 100 }) {
  const [rendered, setRendered] = useState(chunkSize);
  
  useEffect(() => {
    if (rendered < items.length) {
      requestIdleCallback(() => {
        setRendered(prev => Math.min(prev + chunkSize, items.length));
      });
    }
  }, [rendered, items.length]);
  
  return items.slice(0, rendered).map(renderItem);
}
```

#### Web Worker Processing
Offloads heavy computations:

```typescript
// layout.worker.ts
self.onmessage = (e) => {
  const { nodes, edges, config } = e.data;
  const layout = calculateLayout(nodes, edges, config);
  self.postMessage(layout);
};

// Main thread
const worker = new Worker('./layout.worker.js');
worker.postMessage({ nodes, edges, config });
worker.onmessage = (e) => setNodes(e.data);
```

## Troubleshooting

### Common Issues

#### 1. Nodes Not Rendering
- **Check**: Node IDs are unique
- **Check**: Position values are numbers
- **Check**: Node type is registered
- **Solution**: Validate node data structure

#### 2. Edges Not Connecting
- **Check**: Source and target IDs exist
- **Check**: Handle positions are valid
- **Check**: Edge type is supported
- **Solution**: Use edge validation utility

#### 3. Performance Issues
- **Check**: Number of visible nodes
- **Check**: Re-render frequency
- **Check**: Event handler optimization
- **Solution**: Enable virtual rendering

#### 4. Collaboration Sync Issues
- **Check**: WebSocket connection
- **Check**: Room ID consistency
- **Check**: Yjs provider status
- **Solution**: Implement reconnection logic

### Debug Mode

Enable debug mode for detailed logging:

```typescript
<KiteFrameProvider debug={true}>
  {/* Logs all state changes and events */}
</KiteFrameProvider>
```

### Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile Safari | 14+ | Touch gestures supported |
| Chrome Android | 90+ | Touch gestures supported |

### Performance Metrics

Typical performance benchmarks:

| Metric | Small (< 100 nodes) | Medium (100-1000) | Large (1000+) |
|--------|-------------------|------------------|--------------|
| Initial Render | < 100ms | < 500ms | < 2s |
| Pan/Zoom | 60 fps | 60 fps | 30-60 fps |
| Node Update | < 16ms | < 16ms | < 33ms |
| Layout Calculation | < 100ms | < 1s | < 5s |

---

## Additional Resources

- **API Reference**: Complete TypeScript definitions
- **Examples**: Interactive demos and code samples
- **Storybook**: Component playground
- **GitHub**: Source code and issue tracking
- **Discord**: Community support

For the latest updates and announcements, follow [@kiteframe](https://twitter.com/kiteframe) on Twitter.

---

*Last updated: January 2025 | Version 1.0.0*