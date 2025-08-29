import { create } from 'zustand';
import { Node, Edge, FlowState } from '../types';

interface KiteFrameStore extends FlowState {
  // Node actions
  setNodes: (nodes: Node[]) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  
  // Edge actions
  setEdges: (edges: Edge[]) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  
  // Selection actions
  selectNode: (nodeId: string) => void;
  selectEdge: (edgeId: string) => void;
  clearSelection: () => void;
  
  // Viewport actions
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  
  // Reset
  reset: () => void;
}

export const useKiteFrameStore = create<KiteFrameStore>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  
  // Node actions
  setNodes: (nodes) => set({ nodes }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== nodeId),
    edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
    selectedNodes: state.selectedNodes.filter(id => id !== nodeId)
  })),
  
  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    )
  })),
  
  // Edge actions
  setEdges: (edges) => set({ edges }),
  
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  })),
  
  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter(edge => edge.id !== edgeId),
    selectedEdges: state.selectedEdges.filter(id => id !== edgeId)
  })),
  
  updateEdge: (edgeId, updates) => set((state) => ({
    edges: state.edges.map(edge =>
      edge.id === edgeId ? { ...edge, ...updates } : edge
    )
  })),
  
  // Selection actions
  selectNode: (nodeId) => set((state) => {
    // Ensure only one node is selected at a time
    const isSelected = state.selectedNodes.includes(nodeId);
    const newSelectedNodes = isSelected ? [] : [nodeId];
    
    // Update node selection state
    const updatedNodes = state.nodes.map(node => ({
      ...node,
      selected: node.id === nodeId && !isSelected
    }));
    
    return {
      nodes: updatedNodes,
      selectedNodes: newSelectedNodes,
      selectedEdges: [] // Clear edge selection when selecting a node
    };
  }),
  
  selectEdge: (edgeId) => set((state) => {
    // Ensure only one edge is selected at a time
    const isSelected = state.selectedEdges.includes(edgeId);
    const newSelectedEdges = isSelected ? [] : [edgeId];
    
    // Update edge selection state
    const updatedEdges = state.edges.map(edge => ({
      ...edge,
      selected: edge.id === edgeId && !isSelected
    }));
    
    // Update node selection state (clear all)
    const updatedNodes = state.nodes.map(node => ({
      ...node,
      selected: false
    }));
    
    return {
      nodes: updatedNodes,
      edges: updatedEdges,
      selectedNodes: [], // Clear node selection when selecting an edge
      selectedEdges: newSelectedEdges
    };
  }),
  
  clearSelection: () => set((state) => ({
    selectedNodes: [],
    selectedEdges: [],
    nodes: state.nodes.map(node => ({ ...node, selected: false })),
    edges: state.edges.map(edge => ({ ...edge, selected: false }))
  })),
  
  // Viewport actions
  setViewport: (viewport) => set({ viewport }),
  
  // Reset
  reset: () => set({
    nodes: [],
    edges: [],
    selectedNodes: [],
    selectedEdges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  })
}));
