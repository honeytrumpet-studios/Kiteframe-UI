# KiteFrame Library Build Instructions

## Overview
The @kiteline/kiteframe library is a production-ready React component library for building interactive flow diagrams and collaborative canvases. This document provides instructions for building and publishing the library.

## Directory Structure
```
kiteframe-library/
├── components/           # UI components
│   ├── advanced/        # 82+ advanced components
│   └── collaboration/   # Real-time collaboration components
├── hooks/               # React hooks
├── providers/           # Context providers
├── store/              # Zustand store
├── utils/              # Utility functions
├── types/              # TypeScript types
├── constants.ts        # Library constants
├── index.ts           # Main entry point
├── package.json       # Package configuration
├── tsconfig.json      # TypeScript configuration
├── LICENSE           # MIT License
├── README.md         # Documentation
└── CHANGELOG.md      # Version history
```

## Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- TypeScript 5.0+

## Build Steps

### 1. Install Dependencies
```bash
cd kiteframe-library
npm install
# or
yarn install
# or
pnpm install
```

### 2. Build the Library
```bash
npm run build
# This will:
# - Compile TypeScript to JavaScript
# - Generate type definitions
# - Create ESM and CommonJS builds
# - Output to dist/ directory
```

### 3. Local Testing
To test the library locally in another project:
```bash
# In kiteframe-library directory
npm link

# In your test project
npm link @kiteline/kiteframe
```

### 4. Publishing to npm

#### First-time Setup
1. Create an npm account at https://www.npmjs.com/signup
2. Login to npm:
```bash
npm login
```

#### Publishing
```bash
# Ensure you're in kiteframe-library directory
npm publish --access public
```

## Component Count
- **Total Components**: 82+ advanced components
- **Collaboration Modules**: 7 real-time modules
- **Utility Functions**: 5+ helper utilities
- **Hooks**: 6+ custom React hooks
- **Providers**: 3 context providers

## Key Features Included
✅ 80+ pre-built components
✅ Real-time collaboration (Yjs)
✅ AI workflow generation
✅ Security features (UUID validation, rate limiting)
✅ Export/Import (PNG, PDF, JSON)
✅ Full TypeScript support
✅ Tree-shakeable exports
✅ Comprehensive theming

## Version Management
Current Version: 1.0.0

To update version:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## Example Usage
```tsx
import { KiteFrameCanvas, Node, Edge } from '@kiteline/kiteframe';
import '@kiteline/kiteframe/styles';

function App() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'default', position: { x: 100, y: 100 }, data: { label: 'Start' } }
  ]);
  
  const [edges, setEdges] = useState<Edge[]>([]);

  return (
    <KiteFrameCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={setNodes}
      onEdgesChange={setEdges}
    />
  );
}
```

## Support
- GitHub: https://github.com/kiteline/kiteframe
- Documentation: https://kiteframe.kiteline.com
- Issues: https://github.com/kiteline/kiteframe/issues

## License
MIT © Kiteline