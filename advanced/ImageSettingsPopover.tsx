import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Move, Upload, Link, Trash2, Camera, Check, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Node } from '../types';

interface ImageSettingsPopoverProps {
  node: Node;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, updates: Partial<Node['data']>) => void;
  children?: React.ReactNode;
  displayMode?: 'popover' | 'modal';
}

const labelPositions = [
  { value: 'inside-top-left', label: 'Inside Top Left' },
  { value: 'inside-top-right', label: 'Inside Top Right' },
  { value: 'inside-bottom-left', label: 'Inside Bottom Left' },
  { value: 'inside-bottom-right', label: 'Inside Bottom Right' },
  { value: 'outside-top', label: 'Outside Top' },
  { value: 'outside-bottom', label: 'Outside Bottom' },
  { value: 'centered', label: 'Centered' },
];

const aspectRatioOptions = [
  { value: 'cover', label: 'Cover', description: 'Fill entire container, may crop image' },
  { value: 'contain', label: 'Contain', description: 'Fit entire image, may show empty space' },
  { value: 'fill', label: 'Fill', description: 'Stretch image to fill container' },
  { value: 'scale-down', label: 'Scale Down', description: 'Same as contain but never scale up' },
];

export function ImageSettingsPopover({ 
  node, 
  open, 
  onOpenChange, 
  onSave, 
  children,
  displayMode = 'popover'
}: ImageSettingsPopoverProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState(() => {
    // Calculate initial position next to the node
    if (!node || !node.position) {
      return { x: 100, y: 100 }; // Default position if node is undefined
    }
    return {
      x: node.position.x + (node.style?.width || 200) + 20,
      y: node.position.y
    };
  });
  
  // Use refs to store current values for stable callbacks
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const popoverPositionRef = useRef(popoverPosition);

  const [localNode, setLocalNode] = useState(node);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');

  useEffect(() => {
    if (node) {
      setLocalNode(node);
    }
  }, [node]);

  // Early return if node is undefined
  if (!node) {
    return null;
  }

  // Update position ref when position changes
  useEffect(() => {
    popoverPositionRef.current = popoverPosition;
  }, [popoverPosition]);



  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('ImageSettingsPopover mouseDown:', {
      clientX: e.clientX,
      clientY: e.clientY,
      popoverPosition: popoverPositionRef.current,
      isDragging: isDraggingRef.current,
      target: e.target
    });
    
    e.stopPropagation();
    e.preventDefault();
    
    if ((e.target as HTMLElement).closest('.popover-header') && !isDraggingRef.current) {
      // Convert viewport coordinates to canvas coordinates
      const canvas = document.querySelector('[data-kiteframe-canvas]') as HTMLElement;
      const canvasRect = canvas?.getBoundingClientRect();
      const canvasX = canvasRect?.left || 0;
      const canvasY = canvasRect?.top || 0;
      
      console.log('Canvas coordinates:', { canvasX, canvasY, canvasRect, canvasElement: canvas });
      
      const newOffset = {
        x: e.clientX - (canvasX + popoverPositionRef.current.x),
        y: e.clientY - (canvasY + popoverPositionRef.current.y),
      };
      
      console.log('Starting drag with offset:', newOffset);
      
      dragOffsetRef.current = newOffset;
      setDragOffset(newOffset);
      setIsDragging(true);
      isDraggingRef.current = true;
    }
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        // Convert viewport coordinates to canvas coordinates
        const canvas = document.querySelector('[data-kiteframe-canvas]') as HTMLElement;
        const canvasRect = canvas?.getBoundingClientRect();
        const canvasX = canvasRect?.left || 0;
        const canvasY = canvasRect?.top || 0;
        
        const newPosition = {
          x: e.clientX - canvasX - dragOffsetRef.current.x,
          y: e.clientY - canvasY - dragOffsetRef.current.y,
        };
        
        // Reduced logging - only log occasionally for debugging
        if (Math.random() < 0.1) {
          console.log('ImageSettingsPopover dragging:', {
            clientPos: { x: e.clientX, y: e.clientY },
            canvasPos: { x: canvasX, y: canvasY },
            dragOffset: dragOffsetRef.current,
            newPosition,
            isDragging: isDraggingRef.current
          });
        }
        
        setPopoverPosition(newPosition);
      }
    };

    const handleMouseUpGlobal = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        console.log('ImageSettingsPopover mouseUp - releasing drag');
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        isDraggingRef.current = false;
      }
    };

    // Only add listeners if dragging
    if (isDraggingRef.current) {
      document.addEventListener('mousemove', handleMouseMoveGlobal, { passive: false });
      document.addEventListener('mouseup', handleMouseUpGlobal, { passive: false, capture: true });
      
      // Also capture mouse up on window to handle cases where mouse is released outside viewport
      window.addEventListener('mouseup', handleMouseUpGlobal, { passive: false, capture: true });
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging]); // Re-run when isDragging changes

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDragging) return;
      
      const target = event.target as HTMLElement;
      if (!target.closest('.image-settings-popover')) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, onOpenChange, isDragging]);

  const handleStyleChange = (property: string, value: any) => {
    const updatedNode = {
      ...localNode,
      data: { ...localNode.data, [property]: value }
    };
    setLocalNode(updatedNode);
    onSave(node.id, updatedNode.data);
  };

  const handleLabelChange = (newLabel: string) => {
    const updatedNode = {
      ...localNode,
      data: { ...localNode.data, label: newLabel },
    };
    setLocalNode(updatedNode);
    onSave(node.id, updatedNode.data);
  };

  const handleDescriptionChange = (newDescription: string) => {
    const updatedNode = {
      ...localNode,
      data: { ...localNode.data, description: newDescription },
    };
    setLocalNode(updatedNode);
    onSave(node.id, updatedNode.data);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleStyleChange('src', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlSet = () => {
    if (imageUrl.trim()) {
      handleStyleChange('src', imageUrl.trim());
      setImageUrl('');
    }
  };

  const handleImageDelete = () => {
    handleStyleChange('src', '');
    setImageUrl('');
  };

  if (!open) return null;

  const hasImage = localNode.data?.src;

  // Custom draggable popover implementation
  const draggablePopoverContent = (
    <div
      className="image-settings-popover absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-80"
      style={{
        left: `${popoverPosition.x}px`,
        top: `${popoverPosition.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      onMouseMove={(e) => {
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Header */}
      <div className="popover-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-move">
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">Image Settings</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Image Management */}
        <div className="space-y-3">
          <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Image Source
          </Label>
          
          {hasImage ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-sm text-green-700 dark:text-green-300">Image set</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageDelete();
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as 'upload' | 'url')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
                <TabsTrigger value="url">URL Link</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        JPG, PNG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onFocus={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      setImageUrl(e.target.value);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageUrlSet();
                    }}
                    disabled={!imageUrl.trim()}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Node Label */}
        <div>
          <Label htmlFor="node-label" className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Label
          </Label>
          <Input
            id="node-label"
            value={localNode.data?.label || ''}
            onChange={(e) => {
              e.stopPropagation();
              handleLabelChange(e.target.value);
            }}
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Enter label"
            className="w-full"
          />
        </div>

        {/* Node Description */}
        <div>
          <Label htmlFor="node-description" className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Description
          </Label>
          <textarea
            id="node-description"
            value={localNode.data?.description || ''}
            onChange={(e) => {
              e.stopPropagation();
              handleDescriptionChange(e.target.value);
            }}
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Enter description"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
          />
        </div>

        {/* Show Label Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Show Label
          </Label>
          <Switch
            checked={localNode.data?.showLabel !== false}
            onCheckedChange={(checked) => {
              handleStyleChange('showLabel', checked);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Label Position */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Label Position
          </Label>
          <Select 
            value={localNode.data?.labelPosition || 'outside-bottom'} 
            onValueChange={(value) => handleStyleChange('labelPosition', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select label position" />
            </SelectTrigger>
            <SelectContent>
              {labelPositions.map((position) => (
                <SelectItem key={position.value} value={position.value}>
                  {position.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aspect Ratio */}
        {hasImage && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Image Fit
              </Label>
            </div>
            <Select 
              value={localNode.data?.objectFit || 'cover'} 
              onValueChange={(value) => handleStyleChange('objectFit', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select how image fits" />
              </SelectTrigger>
              <SelectContent>
                {aspectRatioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );

  return draggablePopoverContent;
}