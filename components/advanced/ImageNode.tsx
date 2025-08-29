import React, { useState, useRef, useEffect } from "react";
import { NodeData } from "../types";
import { NodeHandles } from "./NodeHandles";
import { ResizeHandle } from "./ResizeHandle";
import { Upload, Link, Image } from "lucide-react";

export interface ImageNodeProps {
  node: NodeData & {
    data: {
      src?: string;
      label?: string;
      description?: string;
      objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
      labelPosition?:
        | "inside-top-left"
        | "inside-top-right"
        | "inside-bottom-left"
        | "inside-bottom-right"
        | "outside-top"
        | "outside-bottom"
        | "centered";
    };
  };
  style?: React.CSSProperties;
  onHandleConnect?: (
    pos: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => void;
  onConnectStart?: (
    nodeId: string,
    handlePosition: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => void;
  onConnectEnd?: (
    nodeId: string,
    handlePosition: "top" | "bottom" | "left" | "right",
    event: React.MouseEvent,
  ) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  onClick?: (event: React.MouseEvent, node?: any) => void;
  onDoubleClick?: (event: React.MouseEvent, node: any) => void;
  onImageUpload?: (nodeId: string, imageData: string) => void;
  onImageUrlSet?: (nodeId: string, imageUrl: string) => void;
  onImageRemove?: (nodeId: string) => void;
  onLabelChange?: (nodeId: string, label: string) => void;
  onDescriptionChange?: (nodeId: string, description: string) => void;
  onObjectFitChange?: (nodeId: string, objectFit: "cover" | "contain" | "fill" | "none" | "scale-down") => void;
  hideHandlesWhenEdgeSelected?: boolean;
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
  onDoubleClick,
  onImageUpload,
  onImageUrlSet,
  onImageRemove,
  onLabelChange,
  onDescriptionChange,
  onObjectFitChange,
  hideHandlesWhenEdgeSelected = false,
}) => {
  // Handle case where node might be undefined during rendering
  if (!node) {
    return null;
  }

  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 200,
    height: node.style?.height || 150,
  });
  const [imageUrl, setImageUrl] = useState("");
  
  // Theme reactivity - force re-render when theme changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const observer = new MutationObserver(() => {
      forceUpdate({});
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const {
    src,
    label,
    description,
    labelPosition = "outside-bottom",
    labelBackgroundColor = "white",
    labelCornerStyle = "round",
    showLabel = true,
    objectFit = "cover",
  } = node.data;

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempLabel, setTempLabel] = useState(label || "");
  const [tempDescription, setTempDescription] = useState(description || "");
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
      setImageUrl("");
    }
  };

  const handleLabelClick = () => {
    setIsEditingLabel(true);
    setTempLabel(label || "");
  };

  const handleLabelSubmit = () => {
    if (onLabelChange) {
      onLabelChange(node.id, tempLabel);
    }
    setIsEditingLabel(false);
  };

  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
    setTempDescription(description || "");
  };

  const handleDescriptionSubmit = () => {
    if (onDescriptionChange) {
      onDescriptionChange(node.id, tempDescription);
    }
    setIsEditingDescription(false);
  };

  const renderLabel = () => {
    // Show label area if there's a label or if the image is selected (for editing)
    if (!showLabel) return null;
    const hasLabel = label && label !== "Image Node";
    const showLabelArea = hasLabel || node.selected;

    // Calculate if we need extra space for outside labels
    const needsTopSpace = labelPosition === "outside-top";
    const needsBottomSpace = labelPosition === "outside-bottom";

    // Determine label background and text color
    const isBlackBackground = labelBackgroundColor === "black";
    const backgroundColor = isBlackBackground ? "#000000" : "#ffffff";
    const textColor = isBlackBackground ? "#ffffff" : "#000000";

    // Determine border radius
    const borderRadius = labelCornerStyle === "round" ? "4px" : "0px";

    const base: React.CSSProperties = {
      position: "absolute",
      whiteSpace: "nowrap",
      fontSize: 12,
      color: textColor,
      backgroundColor: backgroundColor,
      padding: "2px 6px",
      borderRadius: borderRadius,
      border: "1px solid #6b7280",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      zIndex: 10,
    };
    let posStyle: React.CSSProperties = {};
    const imageTop = needsTopSpace ? 25 : 0;

    switch (labelPosition) {
      case "outside-top":
        posStyle = {
          ...base,
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
        };
        break;
      case "outside-bottom":
        posStyle = {
          ...base,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
        };
        break;
      case "inside-top-left":
        posStyle = { ...base, top: imageTop + 4, left: 4 };
        break;
      case "inside-top-right":
        posStyle = { ...base, top: imageTop + 4, right: 4 };
        break;
      case "inside-bottom-left":
        posStyle = { ...base, bottom: needsBottomSpace ? 25 + 4 : 4, left: 4 };
        break;
      case "inside-bottom-right":
        posStyle = { ...base, bottom: needsBottomSpace ? 25 + 4 : 4, right: 4 };
        break;
      case "centered":
        posStyle = {
          ...base,
          top: imageTop + height / 2,
          left: width / 2,
          transform: "translate(-50%, -50%)",
          zIndex: 20,
        };
        break;
    }

    if (!showLabelArea) return null;

    return (
      <div style={posStyle}>
        {isEditingLabel ? (
          <input
            type="text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLabelSubmit();
              } else if (e.key === 'Escape') {
                setIsEditingLabel(false);
                setTempLabel(label || "");
              }
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ width: 'max-content', minWidth: '100px' }}
            autoFocus
          />
        ) : (
          <div 
            onClick={handleLabelClick}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1"
            style={{ minHeight: '20px', minWidth: '60px' }}
          >
            {hasLabel ? label : "Add label"}
          </div>
        )}
      </div>
    );
  };

  const handleResize = (width: number, height: number) => {
    console.log(`🔧 RESIZE EVENT: ImageNode ${node.id} - New size: ${width}x${height}`);
    setNodeSize({ width, height });
    // Update nodes array immediately during resize (like KFrame does)
    if (onNodeResize) {
      onNodeResize(node.id, width, height);
      console.log(`🔧 RESIZE CALLBACK: Called onNodeResize for ImageNode ${node.id} with size ${width}x${height}`);
    }
  };

  const handleResizeEnd = () => {
    console.log(`🔧 RESIZE END: ImageNode ${node.id} - Final size: ${nodeSize.width}x${nodeSize.height}`);
    // No need to call onNodeResize again since we're doing it in handleResize
    // if (onNodeResize) {
    //   onNodeResize(node.id, nodeSize.width, nodeSize.height);
    // }
  };
  
  // Get theme-aware colors - reactive to theme changes
  const getThemeAwareColors = () => {
    const isDark = document.documentElement.classList.contains('dark');
    
    // If node has custom colors set, use those
    const nodeData = node.data as any;
    if (nodeData.backgroundColor && nodeData.borderColor) {
      return {
        backgroundColor: nodeData.backgroundColor,
        borderColor: nodeData.borderColor
      };
    }
    
    // Otherwise use theme-aware card component colors (same as default nodes)
    return {
      backgroundColor: isDark ? '#374151' : '#ffffff', // bg-gray-700 / bg-white
      borderColor: isDark ? '#4b5563' : '#e5e7eb' // border-gray-600 / border-gray-200
    };
  };
  
  const themeColors = getThemeAwareColors();

  // Calculate if we need extra space for outside labels and description footer
  const needsTopSpace = labelPosition === "outside-top";
  const needsBottomSpace = labelPosition === "outside-bottom";
  const needsDescriptionSpace = description && description.trim().length > 0;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width,
    height: height + (needsTopSpace ? 30 : 0) + (needsBottomSpace ? 30 : 0) + (needsDescriptionSpace ? 35 : 0),
    cursor: node.draggable !== false ? "grab" : "default",
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    position: "absolute",
    top: needsTopSpace ? 25 : 0,
    left: 0,
    width,
    height,
    borderRadius: "8px",
    overflow: "visible", // Allow handles to extend beyond image boundaries
    boxShadow: node.selected
      ? "0 4px 12px rgba(59, 130, 246, 0.3)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.2s ease-in-out",
  };

  return (
    <div
      ref={nodeRef}
      className="kiteframe-image-node group select-none"
      style={containerStyle}
    >
      <div 
        style={imageStyle} 
        onClick={(e) => {
          console.log('[ImageNode] Click event:', {
            nodeId: node.id,
            nodeType: node.type,
            selected: node.selected,
            onClickFunction: !!onClick
          });
          // Pass both event and node object to match handleNodeClick signature
          if (onClick) {
            console.log('[ImageNode] Calling onClick with node object');
            (onClick as any)(e, node);
          }
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            width={width}
            height={height}
            style={{
              display: "block",
              objectFit: objectFit as any,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              borderRadius: "8px", // Move border radius to image itself
            }}
            draggable={false}
            onError={(e) => {
              console.error('[ImageNode] Image failed to load:', {
                nodeId: node.id,
                src: src.substring(0, 100) + '...',
                error: e
              });
              // Hide the broken image and show placeholder instead
              (e.target as HTMLImageElement).style.display = 'none';
              const container = (e.target as HTMLImageElement).parentElement;
              if (container) {
                const placeholder = container.querySelector('.image-error-placeholder');
                if (!placeholder) {
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'image-error-placeholder flex items-center justify-center w-full h-full bg-red-50 dark:bg-red-900 border-2 border-dashed border-red-300 dark:border-red-600 rounded-lg';
                  errorDiv.innerHTML = '<div class="text-center"><div class="w-8 h-8 text-red-400 dark:text-red-500 mx-auto mb-2">⚠️</div><div class="text-xs text-red-600 dark:text-red-400">Image failed to load</div></div>';
                  container.appendChild(errorDiv);
                }
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <NodeHandles
          node={{ ...node, width, height }}
          onHandleConnect={onHandleConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          alwaysShowHandles={alwaysShowHandles}
          hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
        />
      </div>
      {renderLabel()}
      
      {/* Description Footer */}
      {(needsDescriptionSpace || node.selected) && !(node.data as any)?.uiMockDataUri && (
        <div
          className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            fontSize: "12px",
            lineHeight: "1.4",
          }}
        >
          {isEditingDescription ? (
            <input
              type="text"
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              onBlur={handleDescriptionSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDescriptionSubmit();
                } else if (e.key === 'Escape') {
                  setIsEditingDescription(false);
                  setTempDescription(description || "");
                }
              }}
              className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-700 dark:text-gray-300 text-xs"
              placeholder="Add description"
              autoFocus
            />
          ) : (
            <p 
              onClick={handleDescriptionClick}
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1 text-gray-700 dark:text-gray-300 text-xs"
              style={{ minHeight: '20px' }}
            >
              {description || "Add description"}
            </p>
          )}
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
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
          />
          <ResizeHandle
            position="top-right"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
          />
          <ResizeHandle
            position="bottom-left"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
          />
          <ResizeHandle
            position="bottom-right"
            visibility="hover"
            nodeRef={nodeRef}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            hideHandlesWhenEdgeSelected={hideHandlesWhenEdgeSelected}
          />
        </>
      )}
    </div>
  );
};
