import React, { useState, useRef, useCallback } from 'react';
import { Image, Upload, Link, X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { NodeHandles } from './NodeHandles';
import { ResizeHandle } from './ResizeHandle';
import { GraphicSettingsPopover } from './GraphicSettingsPopover';
import { cn } from '@/lib/utils';

export interface GraphicNodeProps {
  node: {
    id: string;
    type: string;
    position: { x: number; y: number };
    style?: { width?: number; height?: number };
    data: {
      label?: string;
      description?: string;
      icon?: string;
      src?: string;
      alt?: string;
      caption?: string;
      fit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
      alignment?: 'left' | 'center' | 'right';
      borderRadius?: number;
      showCaption?: boolean;
      backgroundColor?: string;
      overlayColor?: string;
      overlayOpacity?: number;
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
  onImageUpdate?: (nodeId: string, imageData: { src: string; alt?: string; caption?: string }) => void;
  onImageUpload?: (nodeId: string, file: File) => void;
  onNodeSettingsChange?: (nodeId: string, node: any) => void;
  children?: React.ReactNode;
  allowUpload?: boolean;
  allowUrlInput?: boolean;
  showImageControls?: boolean;
  viewport?: { x: number; y: number; zoom: number };
  canvasRef?: React.RefObject<HTMLElement>;
}

export const GraphicNode: React.FC<GraphicNodeProps> = ({
  node,
  onConnectStart,
  onConnectEnd,
  alwaysShowHandles = false,
  onNodeResize,
  onImageUpdate,
  viewport = { x: 0, y: 0, zoom: 1 },
  canvasRef,
  onImageUpload,
  onNodeSettingsChange,
  children,
  allowUpload = true,
  allowUrlInput = true,
  showImageControls = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 300,
    height: node.style?.height || 200,
  });

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
    if (onNodeResize) {
      onNodeResize(node.id, width, height);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(node.id, file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim() && onImageUpdate) {
      onImageUpdate(node.id, {
        src: urlInput.trim(),
        alt: node.data.alt || 'Image',
        caption: node.data.caption
      });
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  const handleRemoveImage = () => {
    if (onImageUpdate) {
      onImageUpdate(node.id, { src: '', alt: '', caption: '' });
    }
    setImageError(false);
  };

  const renderImageContent = () => {
    if (!node.data.src) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Image className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No image selected</p>
          
          {(allowUpload || allowUrlInput) && (
            <div className="flex gap-2">
              {allowUpload && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              )}
              
              {allowUrlInput && (
                <button
                  onClick={() => setShowUrlInput(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  <Link className="w-4 h-4" />
                  URL
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    if (imageError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <X className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to load image</p>
          <button
            onClick={handleRemoveImage}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      );
    }

    return (
      <div className="relative h-full">
        <img
          src={node.data.src}
          alt={node.data.alt || 'Image'}
          className={cn(
            'w-full h-full transition-all duration-200',
            node.data.fit === 'contain' && 'object-contain',
            node.data.fit === 'cover' && 'object-cover',
            node.data.fit === 'fill' && 'object-fill',
            node.data.fit === 'scale-down' && 'object-scale-down',
            node.data.fit === 'none' && 'object-none'
          )}
          style={{
            borderRadius: node.data.borderRadius || 0,
            objectPosition: node.data.alignment || 'center',
            maxHeight: 'none'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />
        
        {/* Overlay */}
        {node.data.overlayColor && node.data.overlayOpacity && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: node.data.overlayColor,
              opacity: node.data.overlayOpacity / 100,
              borderRadius: node.data.borderRadius || 0,
            }}
          />
        )}
        
        {/* Image Controls */}
        {showImageControls && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 bg-black/50 text-white rounded hover:bg-black/70"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRemoveImage}
              className="p-1 bg-black/50 text-white rounded hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        ref={nodeRef}
        className={cn(
          'relative bg-white dark:bg-gray-800 border-2 rounded-lg shadow-md transition-all duration-200 overflow-visible group',
          node.selected ? 'ring-2 ring-blue-500 shadow-lg' : '',
          'hover:shadow-lg'
        )}
        style={{
          width: nodeSize.width,
          height: nodeSize.height,
          borderColor: node.selected ? '#3b82f6' : node.data.borderColor || '#e5e7eb',
          backgroundColor: node.data.backgroundColor || '#ffffff',
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setShowSettingsPopover(true);
        }}
      >
      {/* Header */}
      {(node.data.label || node.data.description) && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {node.data.icon && (
              <span className="text-lg">{node.data.icon}</span>
            )}
            <div>
              {node.data.label && (
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {node.data.label}
                </h3>
              )}
              {node.data.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {node.data.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Content */}
      <div className="flex-1 p-3 flex flex-col min-h-0">
        <div 
          className={cn(
            'relative flex-1 min-h-0'
          )}
        >
          {renderImageContent()}
        </div>
      </div>

      {/* Caption */}
      {node.data.showCaption && node.data.caption && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {node.data.caption}
          </p>
        </div>
      )}

      {/* URL Input Modal */}
      {showUrlInput && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-sm">
            <h3 className="font-medium mb-3">Add Image URL</h3>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-3"
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleUrlSubmit}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => setShowUrlInput(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Custom Children */}
      {children}

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
          viewport={viewport}
          canvasRef={canvasRef}
        />
      )}
    </div>
    
    {/* Settings Popover */}
    {showSettingsPopover && (
      <GraphicSettingsPopover
        node={node}
        onSave={(nodeId, updates) => {
          if (onNodeSettingsChange) {
            onNodeSettingsChange(nodeId, { ...node, ...updates });
          }
          setShowSettingsPopover(false);
        }}
        onClose={() => setShowSettingsPopover(false)}
      />
    )}
  </>
  );
};