import React from 'react';
import { Edge, Node } from '../types';

interface ConnectionEdgeProps {
  edge: Edge;
  sourceNode?: Node;
  targetNode?: Node;
  onClick?: (event: React.MouseEvent, edge: Edge) => void;
}

// Helper function to get the connection point on a node's boundary
const getConnectionPoint = (node: Node, otherNode: Node, isSource: boolean) => {
  const nodeWidth = node.style?.width || 200;
  const nodeHeight = node.style?.height || 100;
  const nodeX = node.position.x;
  const nodeY = node.position.y;
  const nodeCenterX = nodeX + nodeWidth / 2;
  const nodeCenterY = nodeY + nodeHeight / 2;
  
  const otherNodeWidth = otherNode.style?.width || 200;
  const otherNodeHeight = otherNode.style?.height || 100;
  const otherCenterX = otherNode.position.x + otherNodeWidth / 2;
  const otherCenterY = otherNode.position.y + otherNodeHeight / 2;
  
  // Calculate angle between nodes
  const deltaX = otherCenterX - nodeCenterX;
  const deltaY = otherCenterY - nodeCenterY;
  const angle = Math.atan2(deltaY, deltaX);
  
  // Determine which edge to connect to based on angle
  const absAngle = Math.abs(angle);
  const isHorizontal = absAngle < Math.PI / 4 || absAngle > (3 * Math.PI / 4);
  
  if (isHorizontal) {
    // Connect to left or right edge
    if (deltaX > 0) {
      // Connect to right edge
      return { x: nodeX + nodeWidth, y: nodeCenterY };
    } else {
      // Connect to left edge
      return { x: nodeX, y: nodeCenterY };
    }
  } else {
    // Connect to top or bottom edge
    if (deltaY > 0) {
      // Connect to bottom edge
      return { x: nodeCenterX, y: nodeY + nodeHeight };
    } else {
      // Connect to top edge
      return { x: nodeCenterX, y: nodeY };
    }
  }
};

export function ConnectionEdge({ edge, sourceNode, targetNode, onClick }: ConnectionEdgeProps) {
  if (!sourceNode || !targetNode) return null;

  const sourcePoint = getConnectionPoint(sourceNode, targetNode, true);
  const targetPoint = getConnectionPoint(targetNode, sourceNode, false);
  
  const sourceX = sourcePoint.x;
  const sourceY = sourcePoint.y;
  const targetX = targetPoint.x;
  const targetY = targetPoint.y;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e, edge);
    }
  };

  // Generate path based on edge type
  const getPathData = () => {
    const edgeType = edge.type || 'smoothstep';
    
    switch (edgeType) {
      case 'straight':
        return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      
      case 'step':
        const midX = sourceX + (targetX - sourceX) / 2;
        return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
      
      case 'smoothstep':
      default:
        const controlPoint1X = sourceX + (targetX - sourceX) * 0.5;
        const controlPoint1Y = sourceY;
        const controlPoint2X = targetX - (targetX - sourceX) * 0.5;
        const controlPoint2Y = targetY;
        return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;
    }
  };

  const pathData = getPathData();

  // Check if edge should be animated
  const isAnimated = edge.animated || edge.data?.animated;
  const animationSpeed = edge.data?.animationSpeed || 2;
  const animationDirection = edge.data?.animationDirection || 'forward';
  
  // Generate animation style based on direction
  const getAnimationStyle = () => {
    if (!isAnimated) return {};
    
    const baseAnimation = `edgeAnimation ${animationSpeed}s infinite linear`;
    return {
      animation: animationDirection === 'reverse' ? 
        `${baseAnimation} reverse` : 
        baseAnimation
    };
  };

  return (
    <g>
      {/* Invisible thick line for easier clicking */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="cursor-pointer"
        onClick={handleClick}
      />
      
      {/* Visible edge */}
      <path
        d={pathData}
        fill="none"
        stroke={edge.data?.color || "#64748b"}
        strokeWidth={edge.data?.strokeWidth || 2}
        className={`transition-colors ${edge.selected ? 'stroke-blue-500' : 'hover:stroke-blue-400'}`}
        markerEnd="url(#arrowhead)"
        strokeDasharray={isAnimated ? "5,5" : "none"}
        style={getAnimationStyle()}
      />

      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={edge.data?.color || "#64748b"}
          />
        </marker>
      </defs>



      {/* Edge label */}
      {edge.data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-slate-600 dark:fill-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded"
        >
          {edge.data.label}
        </text>
      )}
    </g>
  );
}
