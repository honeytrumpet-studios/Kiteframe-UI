import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Move, Square, Palette, Paintbrush, AlignLeft, AlignCenter, AlignRight, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Type } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Node } from '../types';

interface NodeSettingsPopoverProps {
  node: Node;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, updates: Partial<Node['data']>) => void;
  children?: React.ReactNode;
  displayMode?: 'popover' | 'modal';
}

// Utility function to update node styles
const updateNodeStyle = (node: Node, styleUpdates: Record<string, any>): Node => {
  return {
    ...node,
    data: {
      ...node.data,
      ...styleUpdates
    }
  };
};

const colorOptions = {
  muted: [
    { name: 'Light Blue', value: '#dbeafe' },
    { name: 'Light Green', value: '#dcfce7' },
    { name: 'Light Red', value: '#fef2f2' },
    { name: 'Light Yellow', value: '#fefce8' },
    { name: 'Light Purple', value: '#f3e8ff' },
    { name: 'Light Aqua', value: '#ecfeff' },
  ],
  vibrant: [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Aqua', value: '#06b6d4' },
  ],
  greyscale: [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Grey', value: '#374151' },
    { name: 'Light Grey', value: '#d1d5db' },
    { name: 'White', value: '#ffffff' },
  ],
};

const textColorOptions = [
  { name: 'Black', value: '#000000' },
  { name: 'Grey', value: '#6b7280' },
  { name: 'White', value: '#ffffff' },
];

const borderStyles = [
  { name: 'Solid', value: 'solid' },
  { name: 'Dashed', value: 'dashed' },
  { name: 'Dotted', value: 'dotted' },
];

export function NodeSettingsPopover({ 
  node, 
  open, 
  onOpenChange, 
  onSave, 
  children,
  displayMode = 'popover'
}: NodeSettingsPopoverProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState(() => {
    // Calculate initial position next to the node
    return {
      x: node.position.x + (node.width || 200) + 20,
      y: node.position.y
    };
  });
  
  // Use refs to store current values for stable callbacks
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const popoverPositionRef = useRef(popoverPosition);
  const [localNode, setLocalNode] = useState(node);
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#ffffff');
  const [customBorderColor, setCustomBorderColor] = useState('#d1d5db');
  const [customTextColor, setCustomTextColor] = useState('#000000');
  const [activeTab, setActiveTab] = useState('background');
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);

  useEffect(() => {
    setLocalNode(node);
  }, [node]);

  // Update position ref when position changes
  useEffect(() => {
    popoverPositionRef.current = popoverPosition;
  }, [popoverPosition]);



  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('NodeSettingsPopover mouseDown:', {
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
          console.log('NodeSettingsPopover dragging:', {
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
        console.log('NodeSettingsPopover mouseUp - releasing drag');
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
      // Don't close if currently dragging
      if (isDragging) return;
      
      const target = event.target as HTMLElement;
      if (!target.closest('.node-settings-popover')) {
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
    const updatedNode = updateNodeStyle(localNode, { [property]: value });
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

  const handleEmojiChange = (newEmoji: string) => {
    const updatedNode = {
      ...localNode,
      data: { ...localNode.data, icon: newEmoji },
    };
    setLocalNode(updatedNode);
    onSave(node.id, updatedNode.data);
  };

  const handleColorChange = (colorType: 'backgroundColor' | 'borderColor' | 'textColor', color: string) => {
    if (colorType === 'borderColor') {
      // Update border color only
      handleStyleChange('borderColor', color);
    } else if (colorType === 'textColor') {
      // Update text color
      handleStyleChange('textColor', color);
    } else {
      // For background color, update the 'color' property (which is the background in DefaultNode)
      handleStyleChange('color', color);
    }
  };

  const handleContentAlignmentChange = (alignType: 'horizontal' | 'vertical', value: string) => {
    if (alignType === 'horizontal') {
      handleStyleChange('contentHorizontalAlign', value);
    } else {
      handleStyleChange('contentVerticalAlign', value);
    }
  };

  if (!open) return null;

  // Custom draggable popover implementation
  const draggablePopoverContent = (
    <div
      className="node-settings-popover absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-80"
      style={{
        left: `${popoverPosition.x}px`,
        top: `${popoverPosition.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="popover-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-move">
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">Node Settings</span>
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
        {/* Node Label */}
        <div>
          <Label htmlFor="node-label" className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Node Label
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
            placeholder="Enter node label"
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

        {/* Node Emoji */}
        <div>
          <Label htmlFor="node-emoji" className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Emoji/Icon
          </Label>
          <Input
            id="node-emoji"
            value={localNode.data?.icon || ''}
            onChange={(e) => {
              e.stopPropagation();
              handleEmojiChange(e.target.value);
            }}
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Enter emoji (e.g., 🚀)"
            className="w-full"
          />
        </div>

        {/* Text Color Swatches */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Text Color
          </Label>
          <div className="flex items-center gap-2">
            {textColorOptions.map((color) => (
              <button
                key={color.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorChange('textColor', color.value);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <Popover open={showTextColorPicker} onOpenChange={setShowTextColorPicker}>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: customTextColor }}
                  title="Custom Text Color"
                >
                  <Palette className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Text Color</Label>
                  <input
                    type="color"
                    value={customTextColor}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCustomTextColor(e.target.value);
                      handleColorChange('textColor', e.target.value);
                    }}
                    className="w-full h-10 rounded border"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Content Alignment Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Content Alignment
          </Label>
          
          {/* Horizontal Alignment */}
          <div>
            <Label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">
              Horizontal Align
            </Label>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContentAlignmentChange('horizontal', 'left');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded border transition-colors ${
                  localNode.data?.contentHorizontalAlign === 'left' || !localNode.data?.contentHorizontalAlign
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContentAlignmentChange('horizontal', 'center');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded border transition-colors ${
                  localNode.data?.contentHorizontalAlign === 'center'
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContentAlignmentChange('horizontal', 'right');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded border transition-colors ${
                  localNode.data?.contentHorizontalAlign === 'right'
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vertical Alignment */}
          <div>
            <Label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">
              Vertical Align
            </Label>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContentAlignmentChange('vertical', 'top');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded border transition-colors ${
                  localNode.data?.contentVerticalAlign === 'top'
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
                title="Align Top"
              >
                <AlignVerticalJustifyStart className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContentAlignmentChange('vertical', 'center');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded border transition-colors ${
                  localNode.data?.contentVerticalAlign === 'center' || !localNode.data?.contentVerticalAlign
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
                title="Align Middle"
              >
                <AlignVerticalJustifyCenter className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContentAlignmentChange('vertical', 'bottom');
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`p-2 rounded border transition-colors ${
                  localNode.data?.contentVerticalAlign === 'bottom'
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
                title="Align Bottom"
              >
                <AlignVerticalJustifyEnd className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Tab Interface */}
        <div className="space-y-3">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('background');
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'background'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Square className="w-4 h-4" />
                <span>Background</span>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('border');
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'border'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Paintbrush className="w-4 h-4" />
                <span>Border</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              {/* Muted Colors */}
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.muted.map((color) => (
                  <button
                    key={color.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange('backgroundColor', color.value);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              {/* Vibrant Colors */}
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.vibrant.map((color) => (
                  <button
                    key={color.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange('backgroundColor', color.value);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              {/* Greyscale Colors + Custom */}
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.greyscale.map((color) => (
                  <button
                    key={color.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange('backgroundColor', color.value);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <div className="col-span-2">
                  <Popover open={showBackgroundColorPicker} onOpenChange={setShowBackgroundColorPicker}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: customBackgroundColor }}
                        title="Custom Color"
                      >
                        <Palette className="w-3 h-3 text-gray-600" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" side="top">
                      <div className="space-y-2">
                        <input
                          type="color"
                          value={customBackgroundColor}
                          onChange={(e) => {
                            e.stopPropagation();
                            setCustomBackgroundColor(e.target.value);
                            handleColorChange('backgroundColor', e.target.value);
                          }}
                          className="w-full h-8 rounded border"
                        />
                        <input
                          type="text"
                          value={customBackgroundColor}
                          onChange={(e) => {
                            e.stopPropagation();
                            setCustomBackgroundColor(e.target.value);
                            handleColorChange('backgroundColor', e.target.value);
                          }}
                          className="w-full px-2 py-1 text-sm border rounded"
                          placeholder="#ffffff"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'border' && (
            <div className="space-y-4">
              {/* Border Style */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Border Style</Label>
                <Select
                  value={localNode.data?.borderStyle || 'solid'}
                  onValueChange={(value) => handleStyleChange('borderStyle', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {borderStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Border Width */}
              <div>
                <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
                  Border Width: {localNode.data?.borderWidth || 1}px
                </Label>
                <div 
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Slider
                    value={[localNode.data?.borderWidth || 1]}
                    onValueChange={(value) => handleStyleChange('borderWidth', value[0])}
                    max={8}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
                  Border Radius: {localNode.data?.borderRadius || 8}px
                </Label>
                <div 
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Slider
                    value={[localNode.data?.borderRadius || 8]}
                    onValueChange={(value) => handleStyleChange('borderRadius', value[0])}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Border Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium mb-2 block">Border Color</Label>
                
                {/* Muted Colors */}
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.muted.map((color) => (
                    <button
                      key={color.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorChange('borderColor', color.value);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>

                {/* Vibrant Colors */}
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.vibrant.map((color) => (
                    <button
                      key={color.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorChange('borderColor', color.value);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>

                {/* Greyscale Colors + Custom */}
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.greyscale.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorChange('borderColor', color.value)}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  <div className="col-span-2">
                    <Popover open={showBorderColorPicker} onOpenChange={setShowBorderColorPicker}>
                      <PopoverTrigger asChild>
                        <button
                          className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform flex items-center justify-center"
                          style={{ backgroundColor: customBorderColor }}
                          title="Custom Color"
                        >
                          <Palette className="w-3 h-3 text-gray-600" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" side="top">
                        <div className="space-y-2">
                          <input
                            type="color"
                            value={customBorderColor}
                            onChange={(e) => {
                              setCustomBorderColor(e.target.value);
                              handleColorChange('borderColor', e.target.value);
                            }}
                            className="w-full h-8 rounded border"
                          />
                          <input
                            type="text"
                            value={customBorderColor}
                            onChange={(e) => {
                              setCustomBorderColor(e.target.value);
                              handleColorChange('borderColor', e.target.value);
                            }}
                            className="w-full px-2 py-1 text-sm border rounded"
                            placeholder="#d1d5db"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return draggablePopoverContent;
}