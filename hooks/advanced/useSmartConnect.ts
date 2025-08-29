import { useState, useEffect } from 'react';
import type { Node } from '../types';

// Calculate the minimum distance between two rectangles (boundary-to-boundary)
function calculateBoundaryDistance(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): number {
  // Calculate the closest points between the two rectangles
  const left1 = rect1.x;
  const right1 = rect1.x + rect1.width;
  const top1 = rect1.y;
  const bottom1 = rect1.y + rect1.height;
  
  const left2 = rect2.x;
  const right2 = rect2.x + rect2.width;
  const top2 = rect2.y;
  const bottom2 = rect2.y + rect2.height;
  
  // Check if rectangles overlap
  if (right1 >= left2 && left1 <= right2 && bottom1 >= top2 && top1 <= bottom2) {
    return 0; // Overlapping rectangles have 0 distance
  }
  
  // Calculate horizontal distance
  let dx = 0;
  if (right1 < left2) {
    dx = left2 - right1;
  } else if (left1 > right2) {
    dx = left1 - right2;
  }
  
  // Calculate vertical distance
  let dy = 0;
  if (bottom1 < top2) {
    dy = top2 - bottom1;
  } else if (top1 > bottom2) {
    dy = top1 - bottom2;
  }
  
  return Math.hypot(dx, dy);
}

export interface SmartConnectPreview {
  sourceId: string;
  targetId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export function useSmartConnect(
  nodes: Node[],
  draggedNode: Node | null
): SmartConnectPreview | null {
  const [preview, setPreview] = useState<SmartConnectPreview | null>(null);

  useEffect(() => {
    if (!draggedNode || !draggedNode.smartConnect?.enabled) {
      setPreview(null);
      return;
    }

    const threshold = draggedNode.smartConnect.threshold ?? 40;
    const { x: sx, y: sy } = draggedNode.position;
    const sw = draggedNode.style?.width ?? 150;
    const sh = draggedNode.style?.height ?? 80;
    const sourceCenter = { x: sx + sw / 2, y: sy + sh / 2 };

    // Debug nearby nodes check
    console.log('SmartConnect: Checking nearby nodes', {
      draggedNodeId: draggedNode.id,
      threshold,
      sourceRect: { x: sx, y: sy, width: sw, height: sh }
    });


    let closest: { node: Node; dist: number } | null = null;
    
    for (const node of nodes) {
      if (node.id === draggedNode.id) continue;
      if (node.type === 'kframe') continue; // Exclude KFrame nodes from smart connect
      if (!node.smartConnect?.enabled) continue;
      
      const { x: tx, y: ty } = node.position;
      const tw = node.style?.width ?? 150;
      const th = node.style?.height ?? 80;
      const targetCenter = { x: tx + tw / 2, y: ty + th / 2 };
      
      // Calculate boundary-to-boundary distance for precise proximity detection
      const distance = calculateBoundaryDistance(
        { x: sx, y: sy, width: sw, height: sh },
        { x: tx, y: ty, width: tw, height: th }
      );
      
      // Debug distance calculation
      console.log('SmartConnect: Distance to', node.id, '=', Math.round(distance), 'px');
      
      if (distance <= threshold && (closest === null || distance < closest.dist)) {
        closest = { node, dist: distance };
        console.log('SmartConnect: Preview to', node.id, '(', Math.round(distance), 'px )');
      }
    }

    if (closest) {

      const targetNode = closest.node;
      const tw = targetNode.style?.width ?? 150;
      const th = targetNode.style?.height ?? 80;
      const targetCenter = {
        x: targetNode.position.x + tw / 2,
        y: targetNode.position.y + th / 2,
      };
      
      setPreview({
        sourceId: draggedNode.id,
        targetId: targetNode.id,
        sourceX: sourceCenter.x,
        sourceY: sourceCenter.y,
        targetX: targetCenter.x,
        targetY: targetCenter.y,
      });
    } else {
      console.log('SmartConnect: No nodes within threshold, clearing preview');
      setPreview(null);
    }
  }, [nodes, draggedNode]);

  return preview;
}