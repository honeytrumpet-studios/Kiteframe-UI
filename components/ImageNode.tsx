import React, { useState, useRef } from 'react';
import { NodeData } from '../types';
import { NodeHandles } from './NodeHandles';
import { ResizeHandle } from './ResizeHandle';
import { Upload, Link } from 'lucide-react';

export interface ImageNodeProps {
  node: NodeData & {
    data: {
      src?: string;
      label?: string;
      labelPosition?:
        | 'inside-top-left'
        | 'inside-top-right'
        | 'inside-bottom-left'
        | 'inside-bottom-right'
        | 'outside-top'
        | 'outside-bottom'
        | 'centered';
    };
  };
  style?: React.CSSProperties;
  onHandleConnect?: (pos: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  onConnectStart?: (nodeId: string, handlePosition: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top'|'bottom'|'left'|'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  onClick?: (event: React.MouseEvent) => void;
  onImageUpload?: (nodeId: string, imageData: string) => void;
  onImageUrlSet?: (nodeId: string, imageUrl: string) => void;
}

export const ImageNode: React.FC<ImageNodeProps> = ({ 
  node, 
  style, 
  onHandleConnect, 
  onConnectStart, 
  onConnectEnd, 
  alwaysShowHandles = false,
  onNodeResize,
  onClick,
  onImageUpload,
  onImageUrlSet 
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeSize, setNodeSize] = useState({ 
    width: node.style?.width || 200, 
    height: node.style?.height || 150 
  });
  const [imageUrl, setImageUrl] = useState('');
  
  const { 
    src, 
    label, 
    labelPosition = 'outside-bottom',
    labelBackgroundColor = 'white',
    labelCornerStyle = 'round',
    showLabel = true
  } = node.data;
  const width = nodeSize.width;
  const height = nodeSize.height;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(node.id, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim() && onImageUrlSet) {
      onImageUrlSet(node.id, imageUrl.trim());
      setImageUrl('');
    }
  };

  const renderLabel = () => {
    if (!label || !showLabel) return null;
    
    // Calculate if we need extra space for outside labels
    const needsTopSpace = labelPosition === 'outside-top';
    const needsBottomSpace = labelPosition === 'outside-bottom';
    
    // Determine label background and text color
    const isBlackBackground = labelBackgroundColor === 'black';
    const backgroundColor = isBlackBackground ? '#000000' : '#ffffff';
    const textColor = isBlackBackground ? '#ffffff' : '#000000';
    
    // Determine border radius
    const borderRadius = labelCornerStyle === 'round' ? '4px' : '0px';
    
    const base: React.CSSProperties = { 
      position: 'absolute', 
      whiteSpace: 'nowrap', 
      fontSize: 12, 
      color: textColor,
      backgroundColor: backgroundColor,
      padding: '2px 6px',
      borderRadius: borderRadius,
      border: '1px solid #6b7280',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      zIndex: 10
    };
    let posStyle: React.CSSProperties = {};
    const imageTop = needsTopSpace ? 25 : 0;
    
    switch (labelPosition) {
      case 'outside-top':
        posStyle = { ...base, top: 0, left: '50%', transform: 'translateX(-50%)' };
        break;
      case 'outside-bottom':
        posStyle = { ...base, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
        break;
      case 'inside-top-left':
        posStyle = { ...base, top: imageTop + 4, left: 4 };
        break;
      case 'inside-top-right':
        posStyle = { ...base, top: imageTop + 4, right: 4 };
        break;
      case 'inside-bottom-left':
        posStyle = { ...base, bottom: needsBottomSpace ? 25 + 4 : 4, left: 4 };
        break;
      case 'inside-bottom-right':
        posStyle = { ...base, bottom: needsBottomSpace ? 25 + 4 : 4, right: 4 };
        break;
      case 'centered':
        posStyle = { 
          ...base, 
          top: imageTop + height/2, 
          left: width/2, 
          transform: 'translate(-50%, -50%)',
          zIndex: 20
        };
        break;
    }
    return <div style={posStyle}>{label}</div>;
  };

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
  };

  const handleResizeEnd = () => {
    if (onNodeResize) {
      onNodeResize(node.id, nodeSize.width, nodeSize.height);
    }
  };

  // Calculate if we need extra space for outside labels
  const needsTopSpace = labelPosition === 'outside-top';
  const needsBottomSpace = labelPosition === 'outside-bottom';
  
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width,
    height: height + (needsTopSpace ? 30 : 0) + (needsBottomSpace ? 30 : 0),
    cursor: (node.draggable !== false) ? 'grab' : 'default',
    userSelect: 'none',
    ...style
  };
  
  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    top: needsTopSpace ? 25 : 0,
    left: 0,
    width,
    height,
    borderRadius: '8px',
    overflow: 'visible', // Allow handles to extend beyond image boundaries
    boxShadow: node.selected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s ease-in-out',
  };

  return (
    <div 
      ref={nodeRef}
      className="kiteframe-image-node group"
      style={containerStyle}
    >
      <div style={imageStyle} onClick={onClick}>
        {src ? (
          <img 
            src={src} 
            alt={label} 
            width={width} 
            height={height} 
            style={{ 
              display: 'block',
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              borderRadius: '8px' // Move border radius to image itself
            }} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center" style={{ padding: '12px' }}>
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Upload an image
              </p>
              <div className="space-y-2">
                {/* Upload file input */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center justify-center px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors">
                    <Upload className="w-3 h-3 mr-1" />
                    Choose file
                  </div>
                </div>
                
                {/* URL input */}
                <div className="flex items-center gap-1">
                  <input
                    type="url"
                    placeholder="or paste URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={handleImageUrlSubmit}
                    disabled={!imageUrl.trim()}
                    className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Link className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <NodeHandles 
          node={{ ...node, width, height }}
          onHandleConnect={onHandleConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          alwaysShowHandles={alwaysShowHandles}
        />
      </div>
      {renderLabel()}
      
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
          />
          <ResizeHandle 
            position="top-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle 
            position="bottom-left" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle 
            position="bottom-right" 
            visibility="hover" 
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        </>
      )}
    </div>
  );
};