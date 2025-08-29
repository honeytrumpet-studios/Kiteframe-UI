import { NodeData } from '../components/types';

export interface SnapGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  nodes: string[]; // Node IDs that contribute to this guide
  strength: number; // How many nodes align to this guide
}

export interface SnapResult {
  position: { x: number; y: number };
  guides: SnapGuide[];
  snapped: boolean;
}

export interface SnapSettings {
  enabled: boolean;
  threshold: number; // Distance threshold for snapping (in canvas units)
  showGuides: boolean;
  snapToNodes: boolean;
  snapToGrid: boolean;
  gridSize: number;
  snapToCanvas: boolean; // Snap to canvas edges
}

export const defaultSnapSettings: SnapSettings = {
  enabled: true,
  threshold: 10,
  showGuides: true,
  snapToNodes: true,
  snapToGrid: false,
  gridSize: 20,
  snapToCanvas: true
};

export function calculateSnapPosition(
  draggedNode: NodeData,
  targetPosition: { x: number; y: number },
  allNodes: NodeData[],
  canvasSize: { width: number; height: number },
  settings: SnapSettings
): SnapResult {
  if (!settings.enabled) {
    return {
      position: targetPosition,
      guides: [],
      snapped: false
    };
  }

  const draggedWidth = draggedNode.style?.width || 200;
  const draggedHeight = draggedNode.style?.height || 100;
  
  // Calculate key points for the dragged node
  const draggedPoints = {
    left: targetPosition.x,
    right: targetPosition.x + draggedWidth,
    centerX: targetPosition.x + draggedWidth / 2,
    top: targetPosition.y,
    bottom: targetPosition.y + draggedHeight,
    centerY: targetPosition.y + draggedHeight / 2
  };

  let snappedPosition = { ...targetPosition };
  const activeGuides: SnapGuide[] = [];
  let hasSnapped = false;

  // Collect snap targets from other nodes
  const snapTargets: { horizontal: number[]; vertical: number[] } = {
    horizontal: [],
    vertical: []
  };

  if (settings.snapToNodes) {
    allNodes.forEach(node => {
      if (node.id === draggedNode.id) return; // Skip self
      
      const nodeWidth = node.style?.width || 200;
      const nodeHeight = node.style?.height || 100;
      
      // Add horizontal snap lines (Y positions)
      snapTargets.horizontal.push(
        node.position.y, // Top edge
        node.position.y + nodeHeight, // Bottom edge
        node.position.y + nodeHeight / 2 // Center
      );
      
      // Add vertical snap lines (X positions)
      snapTargets.vertical.push(
        node.position.x, // Left edge
        node.position.x + nodeWidth, // Right edge
        node.position.x + nodeWidth / 2 // Center
      );
    });
  }

  // Snap to canvas functionality removed as requested
  // Canvas edge snapping is no longer available

  // Add grid snap targets
  if (settings.snapToGrid) {
    const gridSize = settings.gridSize;
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      snapTargets.vertical.push(x);
    }
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      snapTargets.horizontal.push(y);
    }
  }

  // Check horizontal snapping (Y positions)
  const horizontalChecks = [
    { point: draggedPoints.top, name: 'top' },
    { point: draggedPoints.bottom, name: 'bottom' },
    { point: draggedPoints.centerY, name: 'centerY' }
  ];

  for (const check of horizontalChecks) {
    for (const snapY of snapTargets.horizontal) {
      const distance = Math.abs(check.point - snapY);
      if (distance <= settings.threshold) {
        let newY: number;
        if (check.name === 'top') {
          newY = snapY;
        } else if (check.name === 'bottom') {
          newY = snapY - draggedHeight;
        } else { // centerY
          newY = snapY - draggedHeight / 2;
        }
        
        snappedPosition.y = newY;
        hasSnapped = true;
        
        activeGuides.push({
          id: `h-${snapY}`,
          type: 'horizontal',
          position: snapY,
          nodes: [draggedNode.id],
          strength: 1
        });
        break;
      }
    }
  }

  // Check vertical snapping (X positions)
  const verticalChecks = [
    { point: draggedPoints.left, name: 'left' },
    { point: draggedPoints.right, name: 'right' },
    { point: draggedPoints.centerX, name: 'centerX' }
  ];

  for (const check of verticalChecks) {
    for (const snapX of snapTargets.vertical) {
      const distance = Math.abs(check.point - snapX);
      if (distance <= settings.threshold) {
        let newX: number;
        if (check.name === 'left') {
          newX = snapX;
        } else if (check.name === 'right') {
          newX = snapX - draggedWidth;
        } else { // centerX
          newX = snapX - draggedWidth / 2;
        }
        
        snappedPosition.x = newX;
        hasSnapped = true;
        
        activeGuides.push({
          id: `v-${snapX}`,
          type: 'vertical',
          position: snapX,
          nodes: [draggedNode.id],
          strength: 1
        });
        break;
      }
    }
  }

  return {
    position: snappedPosition,
    guides: activeGuides,
    snapped: hasSnapped
  };
}

export function findAlignmentGuides(
  nodes: NodeData[],
  canvasSize: { width: number; height: number }
): SnapGuide[] {
  const guides: SnapGuide[] = [];
  const tolerance = 2; // Tolerance for considering nodes aligned
  
  // Group nodes by their alignment positions
  const horizontalGroups: Map<number, string[]> = new Map();
  const verticalGroups: Map<number, string[]> = new Map();
  
  nodes.forEach(node => {
    const nodeWidth = node.style?.width || 200;
    const nodeHeight = node.style?.height || 100;
    
    // Check horizontal alignments (Y positions)
    const yPositions = [
      node.position.y, // top
      node.position.y + nodeHeight, // bottom
      node.position.y + nodeHeight / 2 // center
    ];
    
    yPositions.forEach(y => {
      let foundGroup = false;
      for (const [groupY, nodeIds] of horizontalGroups.entries()) {
        if (Math.abs(y - groupY) <= tolerance) {
          nodeIds.push(node.id);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        horizontalGroups.set(y, [node.id]);
      }
    });
    
    // Check vertical alignments (X positions)
    const xPositions = [
      node.position.x, // left
      node.position.x + nodeWidth, // right
      node.position.x + nodeWidth / 2 // center
    ];
    
    xPositions.forEach(x => {
      let foundGroup = false;
      for (const [groupX, nodeIds] of verticalGroups.entries()) {
        if (Math.abs(x - groupX) <= tolerance) {
          nodeIds.push(node.id);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        verticalGroups.set(x, [node.id]);
      }
    });
  });
  
  // Create guides for groups with multiple nodes
  horizontalGroups.forEach((nodeIds, y) => {
    if (nodeIds.length >= 2) {
      guides.push({
        id: `align-h-${y}`,
        type: 'horizontal',
        position: y,
        nodes: [...new Set(nodeIds)], // Remove duplicates
        strength: nodeIds.length
      });
    }
  });
  
  verticalGroups.forEach((nodeIds, x) => {
    if (nodeIds.length >= 2) {
      guides.push({
        id: `align-v-${x}`,
        type: 'vertical',
        position: x,
        nodes: [...new Set(nodeIds)], // Remove duplicates
        strength: nodeIds.length
      });
    }
  });
  
  return guides;
}

export function getDistributionGuides(
  selectedNodes: NodeData[]
): SnapGuide[] {
  if (selectedNodes.length < 3) return [];
  
  const guides: SnapGuide[] = [];
  
  // Sort nodes by position for distribution calculations
  const nodesByX = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
  const nodesByY = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
  
  // Calculate horizontal distribution
  if (nodesByX.length >= 3) {
    const spacing = (nodesByX[nodesByX.length - 1].position.x - nodesByX[0].position.x) / (nodesByX.length - 1);
    for (let i = 1; i < nodesByX.length - 1; i++) {
      const expectedX = nodesByX[0].position.x + (spacing * i);
      guides.push({
        id: `dist-v-${i}`,
        type: 'vertical',
        position: expectedX,
        nodes: [nodesByX[i].id],
        strength: 1
      });
    }
  }
  
  // Calculate vertical distribution
  if (nodesByY.length >= 3) {
    const spacing = (nodesByY[nodesByY.length - 1].position.y - nodesByY[0].position.y) / (nodesByY.length - 1);
    for (let i = 1; i < nodesByY.length - 1; i++) {
      const expectedY = nodesByY[0].position.y + (spacing * i);
      guides.push({
        id: `dist-h-${i}`,
        type: 'horizontal',
        position: expectedY,
        nodes: [nodesByY[i].id],
        strength: 1
      });
    }
  }
  
  return guides;
}