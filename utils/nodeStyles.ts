import { Node } from '../types';

export function getNodeStyle(node: Node): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: node.position.x,
    top: node.position.y,
    width: node.width || 200,
    height: node.height || 100,
    backgroundColor: node.data.color || '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'grab',
    userSelect: 'none'
  };

  if (node.selected) {
    baseStyle.boxShadow = '0 0 0 2px #3b82f6';
  }

  // Dragging state handled by CSS classes

  return baseStyle;
}

export function getNodeClassName(node: Node): string {
  const classes = ['kiteframe-node'];
  
  if (node.selected) {
    classes.push('kiteframe-node-selected');
  }
  
  // Dragging class added dynamically during drag operations
  
  if (node.type) {
    classes.push(`kiteframe-node-${node.type}`);
  }
  
  return classes.join(' ');
}
