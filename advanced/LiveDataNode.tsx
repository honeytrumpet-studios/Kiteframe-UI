import React, { useEffect, useState, useRef } from 'react';
import { Node } from '../types';
import { ResizeHandle } from './ResizeHandle';

export interface LiveDataNodeData {
  /** URL to fetch; you can template `{id}` etc */
  url: string;
  /** milliseconds between polls */
  interval?: number;
  /** a JS path into the JSON (e.g. "main.temp" to pick out data.main.temp) */
  jsonPath?: string;
  /** optional formatter fn */
  formatter?: (value: any) => React.ReactNode;
  /** display title */
  title?: string;
}

export interface LiveDataNodeProps {
  node: Node & { data: LiveDataNodeData };
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  viewport?: { x: number; y: number; zoom: number };
  canvasRef?: React.RefObject<HTMLElement>;
}

export const LiveDataNode: React.FC<LiveDataNodeProps> = ({ node, onNodeResize, viewport = { x: 0, y: 0, zoom: 1 }, canvasRef }) => {
  const { url, interval = 60_000, jsonPath, formatter, title } = node.data;
  const [value, setValue] = useState<any>('—');
  const [error, setError] = useState<string | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 200,
    height: node.style?.height || 100,
  });

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = async () => {
      try {
        console.log('LiveDataNode: Fetching data from', url);
        
        // Use proxy for GitHub API requests to avoid CORS issues
        let fetchUrl = url;
        if (url.includes('api.github.com')) {
          fetchUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        }
        
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json = await res.json();
        console.log('LiveDataNode: Received data:', json);
        
        let v = jsonPath
          ? jsonPath.split('.').reduce((o: any, k) => o?.[k], json)
          : json;
        
        console.log('LiveDataNode: Extracted value:', v, 'from path:', jsonPath);
        if (formatter) v = formatter(v);
        
        if (!cancelled) {
          setValue(v);
          setError(null);
          console.log('LiveDataNode: Updated display value:', v);
        }
      } catch (err: any) {
        console.error('LiveDataNode: Fetch error:', err);
        if (!cancelled) setError(err.message);
      }
    };

    fetchOnce();
    const h = window.setInterval(fetchOnce, interval);
    return () => {
      cancelled = true;
      window.clearInterval(h);
    };
  }, [url, interval, jsonPath, formatter]);

  const handleResize = (width: number, height: number) => {
    console.log(`🔧 RESIZE EVENT: LiveDataNode ${node.id} - New size: ${width}x${height}`);
    setNodeSize({ width, height });
    if (onNodeResize) {
      onNodeResize(node.id, width, height);
      console.log(`🔧 RESIZE CALLBACK: Called onNodeResize for LiveDataNode ${node.id} with size ${width}x${height}`);
    }
  };

  const handleResizeEnd = () => {
    console.log(`🔧 RESIZE END: LiveDataNode ${node.id} - Final size: ${nodeSize.width}x${nodeSize.height}`);
  };

  return (
    <div
      ref={nodeRef}
      className={`bg-white dark:bg-gray-800 border-2 rounded-lg shadow-sm relative transition-all duration-200 ${
        node.selected 
          ? 'border-blue-500 dark:border-blue-400 shadow-md' 
          : 'border-gray-200 dark:border-gray-600'
      }`}
      style={{
        width: nodeSize.width,
        height: nodeSize.height,
        minWidth: 140,
        minHeight: 60,
      }}
    >
      <div className="flex flex-col items-center justify-center h-full p-3 text-center">
        {title && (
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {title}
          </div>
        )}
        <div className="text-lg font-mono">
          {error ? (
            <span className="text-red-500 text-sm">ERR</span>
          ) : (
            <span className="text-gray-900 dark:text-gray-100">{value}</span>
          )}
        </div>
      </div>

      {/* Resize Handles */}
      {node.resizable !== false && (
        <>
          <ResizeHandle
            position="top-left"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            viewport={viewport}
            canvasRef={canvasRef}
          />
          <ResizeHandle
            position="top-right"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            viewport={viewport}
            canvasRef={canvasRef}
          />
          <ResizeHandle
            position="bottom-left"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            viewport={viewport}
            canvasRef={canvasRef}
          />
          <ResizeHandle
            position="bottom-right"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            viewport={viewport}
            canvasRef={canvasRef}
          />
        </>
      )}
    </div>
  );
};