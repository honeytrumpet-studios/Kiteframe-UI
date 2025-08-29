import { Node, Edge } from '../types';

export function layoutNodes(nodes: Node[], layout: 'horizontal' | 'vertical' | 'grid' | 'radial' | 'organic' = 'horizontal'): Node[] {
  if (nodes.length === 0) return nodes;

  const spacing = 250;
  const startX = 100;
  const startY = 100;

  return nodes.map((node, index) => {
    let position = { x: startX, y: startY };

    switch (layout) {
      case 'horizontal':
        position = { x: startX + index * spacing, y: startY };
        break;
      case 'vertical':
        position = { x: startX, y: startY + index * spacing };
        break;
      case 'grid':
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const row = Math.floor(index / cols);
        const col = index % cols;
        position = { x: startX + col * spacing, y: startY + row * spacing };
        break;
      case 'radial':
        const centerX = 400;
        const centerY = 300;
        const radius = 200;
        const angleStep = (2 * Math.PI) / nodes.length;
        const angle = index * angleStep;
        position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
        break;
      case 'organic':
        // Organic layout with slight randomization and clustering
        const clusterSize = Math.ceil(nodes.length / 3);
        const clusterIndex = Math.floor(index / clusterSize);
        const positionInCluster = index % clusterSize;
        
        // Create clusters with some randomization
        const clusterCenterX = 200 + clusterIndex * 300 + (Math.random() - 0.5) * 100;
        const clusterCenterY = 200 + Math.sin(clusterIndex * 0.8) * 150 + (Math.random() - 0.5) * 100;
        
        // Position within cluster
        const clusterRadius = 80 + positionInCluster * 20;
        const clusterAngle = (positionInCluster * 2.1) + (Math.random() - 0.5) * 0.5;
        
        position = {
          x: clusterCenterX + clusterRadius * Math.cos(clusterAngle),
          y: clusterCenterY + clusterRadius * Math.sin(clusterAngle)
        };
        break;
    }

    return { ...node, position };
  });
}

export function autoPosition(nodes: Node[], edges: Edge[]): Node[] {
  // Simple auto-positioning algorithm
  const positioned = new Set<string>();
  const result = [...nodes];

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );

  // Position root nodes
  rootNodes.forEach((node, index) => {
    const nodeIndex = result.findIndex(n => n.id === node.id);
    if (nodeIndex !== -1) {
      result[nodeIndex].position = { x: 100, y: 100 + index * 200 };
      positioned.add(node.id);
    }
  });

  // Position remaining nodes based on their connections
  let iterations = 0;
  while (positioned.size < nodes.length && iterations < 100) {
    nodes.forEach(node => {
      if (positioned.has(node.id)) return;

      const incomingEdges = edges.filter(edge => edge.target === node.id);
      const sourceNodes = incomingEdges
        .map(edge => result.find(n => n.id === edge.source))
        .filter(n => n && positioned.has(n.id));

      if (sourceNodes.length > 0) {
        // Position based on average of source positions
        const avgX = sourceNodes.reduce((sum, n) => sum + n!.position.x, 0) / sourceNodes.length;
        const avgY = sourceNodes.reduce((sum, n) => sum + n!.position.y, 0) / sourceNodes.length;
        
        const nodeIndex = result.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          result[nodeIndex].position = { x: avgX + 300, y: avgY };
          positioned.add(node.id);
        }
      }
    });
    iterations++;
  }

  return result;
}

export function getNodeBounds(nodes: Node[]): { minX: number; minY: number; maxX: number; maxY: number } {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  const bounds = nodes.reduce((acc, node) => {
    const nodeWidth = node.width || 200;
    const nodeHeight = node.height || 100;
    
    return {
      minX: Math.min(acc.minX, node.position.x),
      minY: Math.min(acc.minY, node.position.y),
      maxX: Math.max(acc.maxX, node.position.x + nodeWidth),
      maxY: Math.max(acc.maxY, node.position.y + nodeHeight)
    };
  }, {
    minX: nodes[0].position.x,
    minY: nodes[0].position.y,
    maxX: nodes[0].position.x + (nodes[0].width || 200),
    maxY: nodes[0].position.y + (nodes[0].height || 100)
  });

  return bounds;
}
