import React from 'react';
import { NodeData } from '../types';

export interface NodeHandlesProps {
  node: NodeData;
  onHandleConnect?: (pos: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  onConnectStart?: (nodeId: string, handlePosition: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean; // Default false for hover behavior
  nodeWidth?: number; // Override node width for positioning
  nodeHeight?: number; // Override node height for positioning
}

export const NodeHandles: React.FC<NodeHandlesProps> = ({ node, onHandleConnect, onConnectStart, onConnectEnd, alwaysShowHandles = false, nodeWidth, nodeHeight }) => {
  const size = 12;
  const half = size / 2;
  const w = nodeWidth ?? node.width ?? node.style?.width ?? 200;
  const h = nodeHeight ?? node.height ?? node.style?.height ?? 100;

  const positions: Record<'top'|'bottom'|'left'|'right', { cx: number; cy: number }> = {
    top: { cx: w / 2, cy: -half },
    bottom: { cx: w / 2, cy: h + half },
    left: { cx: -half, cy: h / 2 },
    right: { cx: w + half, cy: h / 2 },
  };

  return (
    <svg 
      width={w} 
      height={h} 
      className={`kiteline-node-handles absolute top-0 left-0 pointer-events-none overflow-visible ${
        alwaysShowHandles ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      } transition-opacity duration-200`}
      style={{ zIndex: 10 }}
    >
      {(['top', 'bottom', 'left', 'right'] as Array<'top'|'bottom'|'left'|'right'>).map((pos) => {
        const { cx, cy } = positions[pos];
        return (
          <circle
            key={pos}
            cx={cx}
            cy={cy}
            r={half}
            className="kiteline-handle pointer-events-auto cursor-crosshair hover:fill-blue-100 transition-all duration-200"
            fill="white"
            stroke="#3b82f6"
            strokeWidth={2}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();

              onHandleConnect?.(pos, e);
              onConnectStart?.(node.id, pos, e);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();

              onConnectEnd?.(node.id, pos, e);
            }}
            onMouseEnter={(e) => {
              (e.target as SVGCircleElement).setAttribute('r', String(half + 2));
              (e.target as SVGCircleElement).setAttribute('stroke-width', '3');
            }}
            onMouseLeave={(e) => {
              (e.target as SVGCircleElement).setAttribute('r', String(half));
              (e.target as SVGCircleElement).setAttribute('stroke-width', '2');
            }}
          />
        );
      })}
    </svg>
  );
};