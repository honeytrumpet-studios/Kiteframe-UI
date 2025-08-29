import React, { useEffect, useState, useRef } from 'react';
import { NodeData } from '../types';
import { NodeHandles } from './NodeHandles';
import { ResizeHandle } from './ResizeHandle';

export interface DuckApiNodeProps {
  node: NodeData;
  style?: React.CSSProperties;
  onResize?: (width: number, height: number) => void;
  onConnectStart?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
}

export const DuckApiNode: React.FC<DuckApiNodeProps> = ({ node, style, onResize, onConnectStart, onConnectEnd, alwaysShowHandles = false }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 225,
    height: node.style?.height || 200
  });

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/duck/random');
        const data = await response.json();
        
        if (data.fallback) {
          setError(data.fallback.message);
        } else if (data.url) {
          setImageUrl(data.url);
        } else {
          setError('No duck image available');
        }
      } catch (err) {
        setError('Failed to fetch duck image');
        console.error('Error fetching duck image:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  const refreshImage = () => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/duck/random');
        const data = await response.json();
        
        if (data.fallback) {
          setError(data.fallback.message);
        } else if (data.url) {
          setImageUrl(data.url);
        } else {
          setError('No duck image available');
        }
      } catch (err) {
        setError('Failed to fetch duck image');
        console.error('Error fetching duck image:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  };

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
  };

  const handleResizeEnd = () => {
    onResize?.(nodeSize.width, nodeSize.height);
  };

  return (
    <div
      ref={nodeRef}
      style={{ ...style, width: nodeSize.width, height: nodeSize.height }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 relative group"
    >
      {/* Connection Handles */}
      <NodeHandles
        node={node}
        nodeWidth={nodeSize.width}
        nodeHeight={nodeSize.height}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        alwaysShow={alwaysShowHandles}
      />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🦆</span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            Random Duck
          </h3>
        </div>
        <button
          onClick={refreshImage}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          disabled={loading}
        >
          {loading ? '⟳' : '↻'}
        </button>
      </div>
      
      <div className="min-h-[140px] flex items-center justify-center">
        {loading && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Loading duck image...
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-500 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        
        {imageUrl && !loading && !error && (
          <img
            src={imageUrl}
            alt="Random duck"
            className="max-w-full max-h-[140px] object-contain rounded"
            onError={() => setError('Failed to load duck image')}
          />
        )}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Duck API • random-d.uk
      </div>

      {/* Resize Handles */}
      {node.resizable !== false && (
        <>
          <ResizeHandle 
            position="top-left" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle 
            position="top-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle 
            position="bottom-left" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle 
            position="bottom-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable !== false}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        </>
      )}
    </div>
  );
};