import React, { useEffect, useState, useRef } from 'react';
import { Node } from '../types';
import { ResizeHandle } from './ResizeHandle';

export interface MapNodeData {
  /** Address to display on the map */
  address: string;
  /** Zoom level for the map */
  zoom?: number;
  /** Map style (satellite, streets, etc.) */
  mapStyle?: 'streets' | 'satellite' | 'outdoors' | 'light' | 'dark';
  /** Display title */
  title?: string;
}

export interface MapNodeProps {
  node: Node & { data: MapNodeData };
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  viewport?: { x: number; y: number; zoom: number };
  canvasRef?: React.RefObject<HTMLElement>;
}

export const MapNode: React.FC<MapNodeProps> = ({ node, onNodeResize, viewport = { x: 0, y: 0, zoom: 1 }, canvasRef }) => {
  const { address, zoom = 12, mapStyle = 'streets', title } = node.data;
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 250,
    height: node.style?.height || 180,
  });

  useEffect(() => {
    if (!address) return;

    setLoading(true);
    setError(null);

    // Geocode the address using our backend API
    fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCoordinates({ lat: data.latitude, lng: data.longitude });
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address]);

  const handleResize = (width: number, height: number) => {
    console.log(`🔧 RESIZE EVENT: MapNode ${node.id} - New size: ${width}x${height}`);
    setNodeSize({ width, height });
    if (onNodeResize) {
      onNodeResize(node.id, width, height);
      console.log(`🔧 RESIZE CALLBACK: Called onNodeResize for MapNode ${node.id} with size ${width}x${height}`);
    }
  };

  const handleResizeEnd = () => {
    console.log(`🔧 RESIZE END: MapNode ${node.id} - Final size: ${nodeSize.width}x${nodeSize.height}`);
  };

  const getStaticMapUrl = () => {
    if (!coordinates) return '';
    
    const style = mapStyle === 'streets' ? 'streets-v11' : 
                 mapStyle === 'satellite' ? 'satellite-v9' :
                 mapStyle === 'outdoors' ? 'outdoors-v11' :
                 mapStyle === 'light' ? 'light-v10' : 'dark-v10';
    
    const width = nodeSize.width;
    const height = nodeSize.height;
    
    return `/api/static-map?lat=${coordinates.lat}&lng=${coordinates.lng}&zoom=${zoom}&width=${width}&height=${height}&style=${style}`;
  };

  return (
    <div
      ref={nodeRef}
      className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden relative"
      style={{
        width: nodeSize.width,
        height: nodeSize.height,
        minWidth: 180,
        minHeight: 120,
      }}
    >
      {title && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
            {title}
          </div>
        </div>
      )}
      
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading map...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-3">
            <div className="text-center">
              <div className="text-red-500 text-sm mb-1">Map Error</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{error}</div>
            </div>
          </div>
        ) : !address ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="text-sm">Enter an address</div>
            </div>
          </div>
        ) : coordinates ? (
          <img
            src={getStaticMapUrl()}
            alt={`Map of ${address}`}
            className="w-full h-full object-cover"
            style={{ 
              height: title ? `calc(100% - 40px)` : '100%',
            }}
            draggable={false}
          />
        ) : null}
      </div>
      
      {address && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {address}
          </div>
        </div>
      )}

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