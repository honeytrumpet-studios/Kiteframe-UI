import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { NodeHandles } from './NodeHandles';
import { ResizeHandle } from './ResizeHandle';
import { cn } from '@/lib/utils';

export interface BaseApiNodeProps {
  node: {
    id: string;
    type: string;
    position: { x: number; y: number };
    style?: { width?: number; height?: number };
    data: {
      label?: string;
      description?: string;
      icon?: string;
      apiUrl?: string;
      interval?: number;
      headers?: Record<string, string>;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      [key: string]: any;
    };
    selected?: boolean;
    draggable?: boolean;
    selectable?: boolean;
    resizable?: boolean;
    showHandles?: boolean;
  };
  onConnectStart?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  onDataUpdate?: (nodeId: string, data: any) => void;
  children?: React.ReactNode;
  renderContent?: (data: any, loading: boolean, error: string | null) => React.ReactNode;
  transformData?: (rawData: any) => any;
  onApiCall?: (url: string, options: RequestInit) => Promise<Response>;
}

export const BaseApiNode: React.FC<BaseApiNodeProps> = ({
  node,
  onConnectStart,
  onConnectEnd,
  alwaysShowHandles = false,
  onNodeResize,
  onDataUpdate,
  children,
  renderContent,
  transformData,
  onApiCall
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 250,
    height: node.style?.height || 180,
  });

  const fetchData = async () => {
    if (!node.data.apiUrl) return;

    setLoading(true);
    setError(null);

    try {
      const options: RequestInit = {
        method: node.data.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...node.data.headers,
        },
      };

      if (node.data.body && node.data.method !== 'GET') {
        options.body = JSON.stringify(node.data.body);
      }

      let response: Response;
      if (onApiCall) {
        response = await onApiCall(node.data.apiUrl, options);
      } else {
        // Check if it's a local API endpoint
        const isLocalEndpoint = node.data.apiUrl.startsWith('/api/');
        
        if (isLocalEndpoint) {
          // Direct fetch for local endpoints
          response = await fetch(node.data.apiUrl, options);
        } else {
          // Use proxy endpoint to avoid CORS issues for external APIs
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(node.data.apiUrl)}`;
          response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      const processedData = transformData ? transformData(rawData) : rawData;
      
      setData(processedData);
      setLastUpdated(new Date());
      
      if (onDataUpdate) {
        onDataUpdate(node.id, processedData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('BaseApiNode fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling interval
  useEffect(() => {
    if (node.data.interval && node.data.interval > 0) {
      intervalRef.current = setInterval(fetchData, node.data.interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [node.data.interval, node.data.apiUrl]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [node.data.apiUrl, node.data.method, node.data.body]);

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
    if (onNodeResize) {
      onNodeResize(node.id, width, height);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (data) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return `Error: ${error}`;
    if (lastUpdated) return `Updated ${lastUpdated.toLocaleTimeString()}`;
    return 'Ready';
  };

  return (
    <div
      ref={nodeRef}
      className={cn(
        'group relative bg-white dark:bg-gray-800 border-2 rounded-lg shadow-md transition-all duration-200',
        node.selected ? 'ring-2 ring-blue-500 shadow-lg' : '',
        'hover:shadow-lg'
      )}
      style={{
        width: nodeSize.width,
        height: nodeSize.height,
        borderColor: node.selected ? '#3b82f6' : node.data.borderColor || '#e5e7eb',
        backgroundColor: node.data.backgroundColor || '#ffffff',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {node.data.icon && (
            <span className="text-lg">{node.data.icon}</span>
          )}
          <div>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {node.data.label || 'API Node'}
            </h3>
            {node.data.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {node.data.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          disabled={loading}
        >
          {getStatusIcon()}
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 overflow-auto">
        {renderContent ? (
          renderContent(data, loading, error)
        ) : (
          <div className="space-y-2">
            {loading && (
              <div className="flex items-center gap-2 text-blue-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            
            {error && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
            
            {data && !loading && (
              <div>
                <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {children}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Node Handles */}
      {(alwaysShowHandles || node.showHandles) && (
        <NodeHandles
          node={node}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          nodeWidth={nodeSize.width}
          nodeHeight={nodeSize.height}
        />
      )}

      {/* Resize Handle */}
      {node.resizable && (
        <ResizeHandle
          position="bottom-right"
          nodeRef={nodeRef}
          onResize={handleResize}
          minWidth={200}
          minHeight={150}
        />
      )}
    </div>
  );
};