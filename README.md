# KiteFrame UI Library

<div align="center">
  <img src="https://raw.githubusercontent.com/yourusername/kiteframe/main/assets/logo.png" alt="KiteFrame Logo" width="200"/>
  
  <h3>A Production-Ready React Flow Diagram Library</h3>
  
  [![npm version](https://img.shields.io/npm/v/@kiteline/kiteframe.svg)](https://www.npmjs.com/package/@kiteline/kiteframe)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18%2B-61dafb.svg)](https://reactjs.org/)
</div>

## 🚀 Overview

KiteFrame is a comprehensive React component library for building interactive flow diagrams, workflow editors, and node-based interfaces. With 82+ production-ready components, real-time collaboration features, and AI-powered capabilities, KiteFrame provides everything you need to create sophisticated diagramming applications.

### ✨ Key Features

- **🎨 82+ Production Components** - Complete set of nodes, edges, and UI elements
- **🤖 AI-Powered Workflows** - Generate and optimize workflows using GPT-4
- **👥 Real-time Collaboration** - Built-in Yjs support for multi-user editing
- **🎯 Smart Interactions** - Hover handles, quick node creation, smart connections
- **📐 Auto-Layout System** - Intelligent node positioning and alignment
- **🎭 Full Theming Support** - Light/dark modes with CSS variables
- **📦 Tree-Shakeable** - Import only what you need
- **📝 TypeScript Native** - Full type safety and IntelliSense support

## 📦 Installation

```bash
npm install @kiteline/kiteframe
# or
yarn add @kiteline/kiteframe
# or
pnpm add @kiteline/kiteframe
```

### Peer Dependencies

```bash
npm install react react-dom lucide-react
```

## 🎯 Quick Start

```tsx
import React from 'react';
import { 
  KiteFrameProvider, 
  KiteFrameCanvas, 
  useKiteFrame 
} from '@kiteline/kiteframe';
import '@kiteline/kiteframe/styles.css';

function MyDiagramApp() {
  return (
    <KiteFrameProvider>
      <div style={{ width: '100vw', height: '100vh' }}>
        <KiteFrameCanvas
          nodes={[
            {
              id: 'node-1',
              type: 'default',
              position: { x: 100, y: 100 },
              data: { label: 'Start Node' }
            },
            {
              id: 'node-2',
              type: 'default',
              position: { x: 300, y: 200 },
              data: { label: 'End Node' }
            }
          ]}
          edges={[
            {
              id: 'edge-1',
              source: 'node-1',
              target: 'node-2',
              type: 'smoothstep'
            }
          ]}
        />
      </div>
    </KiteFrameProvider>
  );
}

export default MyDiagramApp;
```

## 🎨 Core Components

### Canvas Components

#### KiteFrameCanvas
The main canvas component for rendering and interacting with diagrams.

```tsx
<KiteFrameCanvas
  nodes={nodes}
  edges={edges}
  onNodesChange={handleNodesChange}
  onEdgesChange={handleEdgesChange}
  enableGhostPreview={true}
  enableSmartConnect={true}
/>
```

#### Node Types

KiteFrame includes multiple built-in node types:

- **DefaultNode** - Standard rectangular node
- **KFrame** - Container node for grouping
- **ImageNode** - Display images with captions
- **UIMockNode** - Wireframe/mockup nodes
- **TextNode** - Standalone text elements
- **MapNode** - Interactive map integration
- **WeatherNode** - Real-time weather data
- **LiveDataNode** - Dynamic data visualization

### Interactive Features

#### Hover Handles with Quick Add
Nodes display connection handles on hover with "+" buttons for quick node creation:

```tsx
<NodeHandles
  node={node}
  enableGhostPreview={true}
  onQuickAddNode={(nodeId, position) => {
    // Create new connected node
  }}
/>
```

#### Edge Customization
Full edge selection and customization support:

```tsx
<ConnectionEdge
  edge={{
    type: 'smoothstep',
    data: {
      label: 'Data Flow',
      color: '#3b82f6',
      strokeWidth: 3,
      animated: true,
      animationSpeed: 2
    }
  }}
/>
```

## 🤝 Collaboration Features

### Real-time Collaboration
Built-in Yjs provider for multi-user editing:

```tsx
import { YjsProvider } from '@kiteline/kiteframe/collaboration';

<YjsProvider roomId="my-diagram-room">
  <KiteFrameCanvas />
  <LiveCursors />
  <CollaborationAvatars />
</YjsProvider>
```

### Collaboration Components
- **LiveCursors** - Show other users' cursor positions
- **CollaborationAvatars** - Display active user avatars
- **CommentSystem** - Inline commenting on nodes
- **ChatPanel** - Real-time chat interface

## 🤖 AI Features

### Workflow Generation
Generate complete workflows from text descriptions:

```tsx
import { useAIGeneration } from '@kiteline/kiteframe/ai';

const { generateWorkflow } = useAIGeneration();

const workflow = await generateWorkflow({
  prompt: "Create a user onboarding flow",
  apiKey: process.env.OPENAI_API_KEY
});
```

### Image Analysis
Generate workflows from uploaded images:

```tsx
const { analyzeImage } = useAIGeneration();

const workflow = await analyzeImage({
  imageFile: file,
  apiKey: process.env.OPENAI_API_KEY
});
```

## 🎨 Theming

KiteFrame supports full theming through CSS variables:

```css
:root {
  --kiteframe-primary: 220 90% 56%;
  --kiteframe-background: 0 0% 100%;
  --kiteframe-foreground: 222 84% 5%;
  --kiteframe-border: 214 32% 91%;
}

.dark {
  --kiteframe-primary: 217 91% 60%;
  --kiteframe-background: 222 84% 5%;
  --kiteframe-foreground: 210 40% 98%;
  --kiteframe-border: 217 32% 17%;
}
```

## 📐 Layout System

### Auto-Layout
Intelligent node positioning with collision detection:

```tsx
import { useAutoLayout } from '@kiteline/kiteframe/hooks';

const { arrangeNodes } = useAutoLayout();

const arrangedNodes = arrangeNodes(nodes, {
  direction: 'horizontal',
  spacing: 50,
  respectGroups: true
});
```

### Smart Connect
Automatic edge routing and connection suggestions:

```tsx
<KiteFrameCanvas
  enableSmartConnect={true}
  smartConnectThreshold={50}
/>
```

## 🛠️ Advanced Features

### Export System
Export diagrams in multiple formats:

```tsx
import { useExport } from '@kiteline/kiteframe/hooks';

const { exportDiagram } = useExport();

// Export as PNG
const pngBlob = await exportDiagram('png', {
  viewport: { x: 0, y: 0, width: 1920, height: 1080 }
});

// Export as PDF
const pdfBlob = await exportDiagram('pdf');

// Export as JSON
const jsonData = exportDiagram('json');
```

### Minimap
Interactive minimap for navigation:

```tsx
import { Minimap } from '@kiteline/kiteframe/components';

<Minimap
  position="bottom-left"
  size={{ width: 200, height: 150 }}
/>
```

### Layers Panel
Hierarchical view of diagram structure:

```tsx
import { LayersPanel } from '@kiteline/kiteframe/components';

<LayersPanel
  nodes={nodes}
  edges={edges}
  onNodeSelect={handleNodeSelect}
/>
```

## 📚 API Reference

### Hooks

- `useKiteFrame()` - Access canvas state and methods
- `useNodes()` - Manage node state
- `useEdges()` - Manage edge state
- `useViewport()` - Control canvas viewport
- `useAutoLayout()` - Automatic layout algorithms
- `useExport()` - Export functionality
- `useAIGeneration()` - AI-powered features
- `useCollaboration()` - Collaboration state

### Types

```typescript
interface NodeData {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  style?: NodeStyle;
  selected?: boolean;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: 'straight' | 'step' | 'smoothstep' | 'bezier';
  data?: EdgeData;
  selected?: boolean;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}
```

## 🔧 Configuration

### Provider Options

```tsx
<KiteFrameProvider
  theme="light"
  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
  gridSize={20}
  snapToGrid={true}
  minZoom={0.1}
  maxZoom={4}
>
  {/* Your app */}
</KiteFrameProvider>
```

## 📖 Examples

### Create a Simple Flow

```tsx
const SimpleFlow = () => {
  const [nodes, setNodes] = useState([
    { id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Input' } },
    { id: '2', type: 'default', position: { x: 0, y: 100 }, data: { label: 'Process' } },
    { id: '3', type: 'default', position: { x: 0, y: 200 }, data: { label: 'Output' } }
  ]);

  const [edges, setEdges] = useState([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' }
  ]);

  return (
    <KiteFrameCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={setNodes}
      onEdgesChange={setEdges}
    />
  );
};
```

### Add Custom Node Type

```tsx
const CustomNode = ({ data, selected }) => {
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      <NodeHandles node={data} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode
};

<KiteFrameCanvas nodeTypes={nodeTypes} />
```

## 🚀 Performance

KiteFrame is optimized for performance:

- **Virtual Rendering** - Only visible nodes are rendered
- **GPU Acceleration** - CSS transforms for smooth panning/zooming
- **Debounced Updates** - Intelligent batching of state changes
- **Memoization** - Prevents unnecessary re-renders
- **Web Workers** - Offload heavy computations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repository
git clone https://github.com/yourusername/kiteframe.git

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build library
npm run build
```

## 📄 License

MIT © KiteFrame Team

## 🙏 Acknowledgments

- Built with React and TypeScript
- Powered by OpenAI for AI features
- Real-time collaboration via Yjs
- Inspired by React Flow and other great libraries

## 📞 Support

- [Documentation](https://kiteframe.dev/docs)
- [GitHub Issues](https://github.com/yourusername/kiteframe/issues)
- [Discord Community](https://discord.gg/kiteframe)
- [Twitter](https://twitter.com/kiteframe)

---

<div align="center">
  Made with ❤️ by the KiteFrame Team
</div>