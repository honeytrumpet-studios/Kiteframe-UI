import { useEffect } from 'react';
import { NodeData, EdgeData } from '../types';

export function useCopyPaste(
  nodes: NodeData[],
  edges: EdgeData[],
  onPaste: (nodes: NodeData[], edges: EdgeData[]) => void
) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selNodes = nodes.filter(n => n.selected);
        const selEdges = edges.filter(e => selNodes.some(n => n.id === e.source || n.id === e.target));
        sessionStorage.setItem('kf-copy', JSON.stringify({ selNodes, selEdges }));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const data = sessionStorage.getItem('kf-copy');
        if (data) {
          const { selNodes, selEdges } = JSON.parse(data);
          const offset = 20;
          const newNodes = selNodes.map(n => ({ ...n, id: n.id + '-copy', position: { x: n.position.x + offset, y: n.position.y + offset }, selected: false }));
          const newEdges = selEdges.map(e => ({ ...e, id: e.id + '-copy', source: e.source + '-copy', target: e.target + '-copy' }));
          onPaste(newNodes, newEdges);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nodes, edges, onPaste]);
}