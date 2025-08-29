import React, { useState } from 'react';
import type { Node, Edge } from '../types';
import { SparklePopover } from './SparklePopover';
import { generateNextSteps, type Suggestion } from '../utils/ai';

export interface SparkleNodeWrapperProps {
  node: Node;
  allNodes: Node[];
  allEdges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  children: React.ReactNode;
  className?: string;
}

export const SparkleNodeWrapper: React.FC<SparkleNodeWrapperProps> = ({
  node,
  allNodes,
  allEdges,
  onNodesChange,
  onEdgesChange,
  children,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  console.log('[SparkleNodeWrapper] Rendering for node:', {
    nodeId: node.id,
    label: node.data?.label,
    isHovered,
    hasLabel: !!(node.data?.label && typeof node.data.label === 'string')
  });

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    // Generate unique ID for new node
    const newId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate position for new node (to the right of current node)
    const nodeWidth = node.style?.width || 200;
    const newPosition = {
      x: node.position.x + nodeWidth + 150,
      y: node.position.y
    };

    // Create new node with AI suggestion data
    const newNode: Node = {
      id: newId,
      type: suggestion.type || 'default',
      position: newPosition,
      data: { 
        label: suggestion.label,
        description: suggestion.description,
        color: suggestion.color || '#64748b',
        enableGhostPreview: true
      },
      style: {
        width: 200,
        height: 100
      },
      draggable: true,
      selectable: true,
      doubleClickable: true,
      resizable: true,
      smartConnect: { enabled: true, threshold: 50 }
    };

    // Create edge connecting current node to new node
    const newEdge: Edge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: node.id,
      target: newId,
      type: 'smoothstep',
      data: { 
        color: suggestion.color || '#64748b',
        strokeWidth: 2,
        animated: false
      }
    };

    // Update nodes and edges
    onNodesChange([...allNodes, newNode]);
    onEdgesChange([...allEdges, newEdge]);

    console.log('[SparkleNodeWrapper] Created AI suggestion node:', {
      suggestion: suggestion.label,
      newNodeId: newId,
      position: newPosition
    });
  };

  // Only show sparkle button for nodes with labels
  const showSparkle = isHovered && node.data?.label && typeof node.data.label === 'string';
  
  console.log('[SparkleNodeWrapper] Sparkle visibility check:', {
    nodeId: node.id,
    isHovered,
    hasLabel: !!(node.data?.label && typeof node.data.label === 'string'),
    showSparkle
  });

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => {
        console.log('[SparkleNodeWrapper] Mouse enter on node:', node.id);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log('[SparkleNodeWrapper] Mouse leave on node:', node.id);
        setIsHovered(false);
      }}
    >
      {children}
      
      {showSparkle && (
        <div 
          className="absolute -top-1 -right-1 z-20"
          style={{
            pointerEvents: 'auto'
          }}
        >
          <SparklePopover
            nodeId={node.id}
            label={node.data.label as string}
            description={node.data.description as string}
            onSelect={handleSuggestionSelect}
          />
        </div>
      )}
    </div>
  );
};