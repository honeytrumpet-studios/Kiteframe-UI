import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Palette, 
  AlignCenter, 
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Type, 
  Minus,
  CornerUpRight,
  ArrowRight,
  Square,
  Settings,
  ArrowUpRight,
  TrendingUp,
  MoreHorizontal,
  CornerDownRight,
  AlignJustify,
  Play,
  Zap,
  ZapOff,
  ArrowRightLeft,
  Bolt,
  Upload,
  Link,
  X,
  Trash2,
  Wand2,
  Sparkles,
  Check,
  Monitor
} from 'lucide-react';
import { Node, Edge } from '../types';
import { IconPickerPopover } from './IconPickerPopover';

interface FloatingToolbarProps {
  selectedNodes: string[];
  selectedEdges: string[];
  selectedTexts?: string[];
  nodes: Node[];
  edges: Edge[];
  canvasTexts?: any[];
  onNodeStyleChange?: (nodeId: string, style: any) => void;
  onEdgeStyleChange?: (edgeId: string, style: any) => void;
  onTextStyleChange?: (textId: string, style: any) => void;
  onIconChange?: (nodeId: string, icon: string, iconType: 'lucide' | 'emoji') => void;
  onDeleteNode?: (nodeId: string) => void;
  onWorkflowOptimize?: (workflowId: string) => void;
  onGenerateUIMock?: (nodeId: string) => void;
  workflowOptimizationState?: {
    nodeId: string;
    workflowId: string;
    canOptimize: boolean;
    isOptimized: boolean;
  } | null;
  position: { x: number; y: number };
}

export function FloatingToolbar({
  selectedNodes,
  selectedEdges,
  selectedTexts = [],
  nodes,
  edges,
  canvasTexts = [],
  onNodeStyleChange,
  onEdgeStyleChange,
  onTextStyleChange,
  onIconChange,
  onDeleteNode,
  onWorkflowOptimize,
  onGenerateUIMock,
  workflowOptimizationState,
  position
}: FloatingToolbarProps) {
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [borderPopoverOpen, setBorderPopoverOpen] = useState(false);
  const [imageUrlPopoverOpen, setImageUrlPopoverOpen] = useState(false);
  const [aspectRatioPopoverOpen, setAspectRatioPopoverOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [textStyleOpen, setTextStyleOpen] = useState(false);

  // Simple null checks
  if (!selectedNodes || !selectedEdges || !nodes || !edges) {
    return null;
  }

  // Font family options
  const fontFamilies = [
    { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
    { name: 'System UI', value: 'system-ui, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
    { name: 'Monaco', value: 'Monaco, monospace' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { name: 'Impact', value: 'Impact, sans-serif' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' }
  ];

  // Font size options
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];

  // Font weight options
  const fontWeights = [
    { name: 'Regular', value: 'normal' },
    { name: 'Medium', value: 'medium' },
    { name: 'Semi Bold', value: 'semibold' },
    { name: 'Bold', value: 'bold' }
  ];

  // Adaptive text color function - returns white or black based on background brightness
  const getAdaptiveTextColor = (backgroundColor: string): string => {
    if (!backgroundColor) return '#000000';
    
    // Remove # if present
    const hex = backgroundColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance using the W3C formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white text for dark backgrounds, black text for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Color options with greyscale
  const backgroundColors = [
    // Greyscale (including black and white)
    '#000000', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#ffffff',
    // Existing colors
    '#fef3c7', '#fde68a', '#f59e0b', '#d97706', '#92400e',
    '#fecaca', '#f87171', '#ef4444', '#dc2626', '#991b1b',
    '#bfdbfe', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
    '#c7d2fe', '#818cf8', '#6366f1', '#4f46e5', '#4338ca',
    '#d8b4fe', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9',
    '#fbb6ce', '#f472b6', '#ec4899', '#db2777', '#be185d',
    '#99f6e4', '#34d399', '#10b981', '#059669', '#047857'
  ];

  const strokeColors = [
    // Greyscale (including black and white)
    '#000000', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#ffffff',
    // Primary colors
    '#3b82f6', '#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4',
    // Extended palette
    '#f59e0b', '#d97706', '#92400e', '#dc2626', '#991b1b', '#2563eb', '#1d4ed8',
    '#6366f1', '#4f46e5', '#4338ca', '#8b5cf6', '#7c3aed', '#6d28d9',
    '#ec4899', '#db2777', '#be185d', '#10b981', '#059669', '#047857'
  ];

  // Don't show toolbar if nothing is selected
  if (selectedNodes.length === 0 && selectedEdges.length === 0 && selectedTexts.length === 0) {
    return null;
  }
  
  // Handle text objects
  if (selectedTexts.length > 0) {
    const selectedText = canvasTexts.find(t => t.id === selectedTexts[0]);
    if (!selectedText) return null;
    
    return (
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-1 touch-manipulation"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translateY(-100%)'
        }}
      >
        {/* Font Family */}
        <Popover open={textStyleOpen} onOpenChange={setTextStyleOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 touch-manipulation min-h-[44px]">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium mb-2 block">Font Family</Label>
                <Select
                  value={selectedText.fontFamily || 'Inter, system-ui, sans-serif'}
                  onValueChange={(value) => onTextStyleChange?.(selectedText.id, { fontFamily: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs font-medium mb-2 block">Font Size</Label>
                <Select
                  value={selectedText.fontSize?.toString() || '16'}
                  onValueChange={(value) => onTextStyleChange?.(selectedText.id, { fontSize: parseInt(value) })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizes.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs font-medium mb-2 block">Font Weight</Label>
                <Select
                  value={selectedText.fontWeight || 'normal'}
                  onValueChange={(value) => onTextStyleChange?.(selectedText.id, { fontWeight: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeights.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs font-medium mb-2 block">Text Color</Label>
                <div className="grid grid-cols-6 gap-1">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onTextStyleChange?.(selectedText.id, { color });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Text Alignment */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const alignments = ['left', 'center', 'right'];
            const currentIndex = alignments.indexOf(selectedText.textAlign || 'left');
            const nextAlignment = alignments[(currentIndex + 1) % alignments.length];
            onTextStyleChange?.(selectedText.id, { textAlign: nextAlignment });
          }}
        >
          {selectedText.textAlign === 'center' ? (
            <AlignCenter className="h-4 w-4" />
          ) : selectedText.textAlign === 'right' ? (
            <AlignRight className="h-4 w-4" />
          ) : (
            <AlignLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Show node toolbar for single node selection
  if (selectedNodes.length === 1 && selectedEdges.length === 0) {
    const selectedNode = nodes.find(n => n?.id === selectedNodes[0]);
    if (!selectedNode) return null;

    // Image node toolbar with image-specific controls
    if (selectedNode.type === 'image') {
      return (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 text-black dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg flex items-center justify-between gap-1 p-1"
          style={{
            left: position.x,
            top: position.y - 60,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Left side controls */}
          <div className="flex items-center gap-1">
            {/* Upload Image */}
          <label 
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Upload size={16} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                e.stopPropagation();
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const result = event.target?.result as string;
                    onNodeStyleChange?.(selectedNode.id, { src: result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>

          {/* Image URL */}
          <Popover open={imageUrlPopoverOpen} onOpenChange={setImageUrlPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Link size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="top">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Image URL</Label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onNodeStyleChange?.(selectedNode.id, { src: imageUrlInput });
                        setImageUrlPopoverOpen(false);
                        setImageUrlInput('');
                      }
                    }}
                    className="w-full px-3 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onNodeStyleChange?.(selectedNode.id, { src: imageUrlInput });
                      setImageUrlPopoverOpen(false);
                      setImageUrlInput('');
                    }}
                  >
                    Set Image
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Remove Image */}
          {selectedNode.data?.src && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onNodeStyleChange?.(selectedNode.id, { src: null });
              }}
            >
              <X size={16} />
            </Button>
          )}

          {/* Aspect Ratio */}
          <Popover open={aspectRatioPopoverOpen} onOpenChange={setAspectRatioPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Square size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" side="top">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Image Fit</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'cover', label: 'Cover' },
                    { value: 'contain', label: 'Contain' },
                    { value: 'fill', label: 'Fill' },
                    { value: 'scale-down', label: 'Scale Down' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={(selectedNode.data as any)?.objectFit === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onNodeStyleChange?.(selectedNode.id, { 
                          data: {
                            ...selectedNode.data,
                            objectFit: option.value
                          }
                        });
                        setAspectRatioPopoverOpen(false);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Text Position for Labels */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const currentAlign = selectedNode.data?.labelPosition || 'outside-bottom';
              const alignments = ['outside-bottom', 'outside-top', 'centered', 'inside-bottom-right'];
              const currentIndex = alignments.indexOf(currentAlign);
              const nextAlign = alignments[(currentIndex + 1) % alignments.length];
              onNodeStyleChange?.(selectedNode.id, { labelPosition: nextAlign });
            }}
          >
            <Type size={16} />
          </Button>
          </div>

          {/* Right side - Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDeleteNode?.(selectedNode.id);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    }

    // Text node toolbar
    if (selectedNode.type === 'text') {
      return (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 text-black dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg flex items-center gap-1 p-1"
          style={{
            left: position.x,
            top: position.y - 60,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Font Family Picker */}
          <Popover open={textStyleOpen} onOpenChange={setTextStyleOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs">
                {fontFamilies.find(f => f.value === selectedNode.data?.fontFamily)?.name || 'Inter'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" side="top">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Font Family</Label>
                  <Select
                    value={selectedNode.data?.fontFamily || 'Inter, system-ui, sans-serif'}
                    onValueChange={(value) => {
                      onNodeStyleChange?.(selectedNode.id, { fontFamily: value });
                      setTextStyleOpen(false);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Font Size</Label>
                  <Select
                    value={String(selectedNode.data?.fontSize || 16)}
                    onValueChange={(value) => {
                      onNodeStyleChange?.(selectedNode.id, { fontSize: Number(value) });
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Font Weight</Label>
                  <Select
                    value={selectedNode.data?.fontWeight || 'normal'}
                    onValueChange={(value) => {
                      onNodeStyleChange?.(selectedNode.id, { fontWeight: value });
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeights.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Line Height</Label>
                  <Slider
                    value={[selectedNode.data?.lineHeight || 1.4]}
                    onValueChange={([value]) => {
                      onNodeStyleChange?.(selectedNode.id, { lineHeight: value });
                    }}
                    min={1}
                    max={3}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedNode.data?.lineHeight || 1.4).toFixed(1)}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Letter Spacing</Label>
                  <Slider
                    value={[selectedNode.data?.letterSpacing || 0]}
                    onValueChange={([value]) => {
                      onNodeStyleChange?.(selectedNode.id, { letterSpacing: value });
                    }}
                    min={-2}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedNode.data?.letterSpacing || 0).toFixed(1)}px
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Text Color */}
          <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700">
                <div 
                  className="w-5 h-5 rounded border-2 border-slate-600"
                  style={{ backgroundColor: selectedNode.data?.textColor || '#000000' }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" side="top">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Text Color</Label>
                <div className="grid grid-cols-7 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onNodeStyleChange?.(selectedNode.id, { textColor: color });
                        setColorPopoverOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Text Alignment */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => {
              const currentAlign = selectedNode.data?.textAlign || 'left';
              const nextAlign = currentAlign === 'left' ? 'center' : currentAlign === 'center' ? 'right' : 'left';
              onNodeStyleChange?.(selectedNode.id, { textAlign: nextAlign });
            }}
          >
            {selectedNode.data?.textAlign === 'center' ? (
              <AlignCenter size={16} />
            ) : selectedNode.data?.textAlign === 'right' ? (
              <AlignRight size={16} />
            ) : (
              <AlignLeft size={16} />
            )}
          </Button>
        </div>
      );
    }

    // KFrame toolbar
    if (selectedNode.type === 'kframe') {
      return (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 text-black dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg flex items-center gap-1 p-1"
          style={{
            left: position.x,
            top: position.y - 60,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Color Picker */}
          <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 border-slate-600"
                  style={{ backgroundColor: selectedNode.data?.style?.backgroundColor || '#3b82f6' }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" side="top">
              <Tabs defaultValue="background" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="background">Background</TabsTrigger>
                  <TabsTrigger value="stroke">Stroke</TabsTrigger>
                </TabsList>
                <TabsContent value="background" className="p-4">
                  <div className="grid grid-cols-7 gap-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={`kframe-bg-${color}`}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onNodeStyleChange?.(selectedNode.id, { 
                            style: { 
                              ...selectedNode.data?.style,
                              backgroundColor: color
                            }
                          });
                          setColorPopoverOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="stroke" className="p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {strokeColors.map((color) => (
                      <button
                        key={`kframe-stroke-${color}`}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onNodeStyleChange?.(selectedNode.id, { 
                            style: { 
                              ...selectedNode.data?.style,
                              borderColor: color
                            }
                          });
                          setColorPopoverOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

          {/* Icon Picker for KFrame */}
          <IconPickerPopover
            open={iconPickerOpen}
            onOpenChange={setIconPickerOpen}
            onIconSelect={(icon, type) => {
              onIconChange?.(selectedNode.id, icon, type);
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <Bolt size={16} />
            </Button>
          </IconPickerPopover>

          {/* Stroke Controls */}
          <Popover open={borderPopoverOpen} onOpenChange={setBorderPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700">
                <Settings size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" side="top">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Stroke Weight</Label>
                  <Slider
                    value={[selectedNode.data?.style?.borderWidth || 2]}
                    onValueChange={([value]) => {
                      onNodeStyleChange?.(selectedNode.id, { 
                        style: { 
                          ...selectedNode.data?.style,
                          borderWidth: value
                        }
                      });
                    }}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedNode.data?.style?.borderWidth || 2}px
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Stroke Type</Label>
                  <Select
                    value={selectedNode.data?.style?.borderStyle || 'dashed'}
                    onValueChange={(value: 'solid' | 'dashed') => {
                      onNodeStyleChange?.(selectedNode.id, { 
                        style: { 
                          ...selectedNode.data?.style,
                          borderStyle: value
                        }
                      });
                      setBorderPopoverOpen(false);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Text Alignment */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => {
              const currentAlign = selectedNode.data?.textAlign || 'left';
              const nextAlign = currentAlign === 'left' ? 'center' : currentAlign === 'center' ? 'right' : 'left';
              onNodeStyleChange?.(selectedNode.id, { 
                textAlign: nextAlign
              });
            }}
          >
            {selectedNode.data?.textAlign === 'center' ? (
              <AlignCenter size={16} />
            ) : selectedNode.data?.textAlign === 'right' ? (
              <AlignRight size={16} />
            ) : (
              <AlignLeft size={16} />
            )}
          </Button>

          {/* Vertical Alignment */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => {
              const currentAlign = selectedNode.data?.verticalAlign || 'top';
              const nextAlign = currentAlign === 'top' ? 'center' : currentAlign === 'center' ? 'bottom' : 'top';
              onNodeStyleChange?.(selectedNode.id, { 
                verticalAlign: nextAlign
              });
            }}
          >
            {selectedNode.data?.verticalAlign === 'center' ? (
              <AlignVerticalJustifyCenter size={16} />
            ) : selectedNode.data?.verticalAlign === 'bottom' ? (
              <AlignVerticalJustifyEnd size={16} />
            ) : (
              <AlignVerticalJustifyStart size={16} />
            )}
          </Button>
        </div>
      );
    }

    return (
      <div
        className="fixed z-50 bg-white dark:bg-slate-800 text-black dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg flex items-center gap-1 p-1"
        style={{
          left: position.x,
          top: position.y - 60,
          transform: 'translateX(-50%)'
        }}
      >
        {/* Fill Color - Circular with Popover */}
        <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <div 
                className="w-5 h-5 rounded-full border-2 border-slate-600"
                style={{ backgroundColor: selectedNode.data?.style?.backgroundColor || selectedNode.data?.color || '#ffffff' }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" side="top">
            <Tabs defaultValue="background" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="stroke">Stroke</TabsTrigger>
              </TabsList>
              <TabsContent value="background" className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={`default-bg-${color}`}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        const adaptiveTextColor = getAdaptiveTextColor(color);
                        onNodeStyleChange?.(selectedNode.id, { 
                          backgroundColor: color,
                          color: adaptiveTextColor,
                          style: { 
                            ...selectedNode.data?.style,
                            backgroundColor: color 
                          } 
                        });
                        setColorPopoverOpen(false);
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="stroke" className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {strokeColors.map((color) => (
                    <button
                      key={`default-stroke-${color}`}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onNodeStyleChange?.(selectedNode.id, { 
                          borderColor: color,
                          borderWidth: 2
                        });
                        setColorPopoverOpen(false);
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* Icon Picker */}
        <IconPickerPopover
          open={iconPickerOpen}
          onOpenChange={setIconPickerOpen}
          onIconSelect={(icon, type) => {
            if (selectedNodes.length === 0) return;
            
            selectedNodes.forEach(nodeId => {
              onIconChange?.(nodeId, icon, type);
            });
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <Bolt size={16} />
          </Button>
        </IconPickerPopover>

        {/* Border Settings - Popover */}
        <Popover open={borderPopoverOpen} onOpenChange={setBorderPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <Square className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" side="top">
            <div className="space-y-4">
              <div>
                <Label htmlFor="border-width">Border Width</Label>
                <Slider
                  id="border-width"
                  min={0}
                  max={10}
                  step={1}
                  value={[selectedNode.data?.borderWidth || 0]}
                  onValueChange={(value) => {
                    onNodeStyleChange?.(selectedNode.id, { 
                      borderWidth: value[0],
                      borderColor: value[0] > 0 ? (selectedNode.data?.borderColor || '#3b82f6') : 'transparent'
                    });
                  }}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">{selectedNode.data?.borderWidth || 0}px</div>
              </div>
              
              <div>
                <Label htmlFor="border-radius">Corner Radius</Label>
                <Slider
                  id="border-radius"
                  min={0}
                  max={20}
                  step={1}
                  value={[selectedNode.data?.borderRadius || 8]}
                  onValueChange={(value) => {
                    onNodeStyleChange?.(selectedNode.id, { borderRadius: value[0] });
                  }}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">{selectedNode.data?.borderRadius || 8}px</div>
              </div>
              
              <div>
                <Label htmlFor="border-style">Border Style</Label>
                <Select
                  value={selectedNode.data?.borderStyle || 'solid'}
                  onValueChange={(value) => {
                    onNodeStyleChange?.(selectedNode.id, { borderStyle: value });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Horizontal Alignment - Cycling */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
          onClick={() => {
            // Cycle through left, center, right alignment
            const currentAlign = selectedNode.data?.contentHorizontalAlign || 'center';
            let newAlign: string;
            
            switch (currentAlign) {
              case 'left':
                newAlign = 'center';
                break;
              case 'center':
                newAlign = 'right';
                break;
              case 'right':
                newAlign = 'left';
                break;
              default:
                newAlign = 'left';
            }
            
            onNodeStyleChange?.(selectedNode.id, { contentHorizontalAlign: newAlign });
          }}
        >
          {(() => {
            const currentAlign = selectedNode.data?.contentHorizontalAlign || 'center';
            switch (currentAlign) {
              case 'left':
                return <AlignLeft className="w-4 h-4" />;
              case 'right':
                return <AlignRight className="w-4 h-4" />;
              default:
                return <AlignCenter className="w-4 h-4" />;
            }
          })()}
        </Button>

        {/* Vertical Alignment - Cycling */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
          onClick={() => {
            // Cycle through top, center, bottom alignment
            const currentAlign = selectedNode.data?.contentVerticalAlign || 'center';
            let newAlign: string;
            
            switch (currentAlign) {
              case 'top':
                newAlign = 'center';
                break;
              case 'center':
                newAlign = 'bottom';
                break;
              case 'bottom':
                newAlign = 'top';
                break;
              default:
                newAlign = 'top';
            }
            
            onNodeStyleChange?.(selectedNode.id, { contentVerticalAlign: newAlign });
          }}
        >
          {(() => {
            const currentAlign = selectedNode.data?.contentVerticalAlign || 'center';
            switch (currentAlign) {
              case 'top':
                return <AlignVerticalJustifyStart className="w-4 h-4" />;
              case 'bottom':
                return <AlignVerticalJustifyEnd className="w-4 h-4" />;
              default:
                return <AlignVerticalJustifyCenter className="w-4 h-4" />;
            }
          })()}
        </Button>

        {/* Workflow Optimization Magic Wand */}
        {workflowOptimizationState?.canOptimize && workflowOptimizationState.nodeId === selectedNode.id && (
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              workflowOptimizationState.isOptimized 
                ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900' 
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (!workflowOptimizationState.isOptimized) {
                onWorkflowOptimize?.(workflowOptimizationState.workflowId);
              }
            }}
            title={workflowOptimizationState.isOptimized ? "Workflow Optimized" : "Optimize Workflow with AI"}
          >
            {workflowOptimizationState.isOptimized ? (
              <div className="relative">
                <Check className="w-4 h-4" />
                <Sparkles className="w-2 h-2 absolute -top-1 -right-1" />
              </div>
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </Button>
        )}

        {/* Generate UI Mock Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onGenerateUIMock?.(selectedNode.id);
          }}
          title="Generate UI Mock"
        >
          <Monitor className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Show edge toolbar for single edge selection
  if (selectedEdges.length === 1 && selectedNodes.length === 0) {
    const selectedEdge = edges.find(e => e?.id === selectedEdges[0]);
    if (!selectedEdge) return null;

    return (
      <div
        className="fixed z-50 bg-slate-900 text-white rounded-lg shadow-lg flex items-center gap-1 p-1"
        style={{
          left: position.x,
          top: position.y - 60,
          transform: 'translateX(-50%)'
        }}
      >
        {/* Edge Color - Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <div 
                className="w-5 h-5 rounded-full border-2 border-slate-600"
                style={{ backgroundColor: selectedEdge.data?.color || '#64748b' }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" side="top">
            <div>
              <Label className="text-sm font-medium mb-3 block">Edge Color</Label>
              <div className="grid grid-cols-7 gap-2">
                {strokeColors.map((color) => (
                  <button
                    key={`edge-${color}`}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onEdgeStyleChange?.(selectedEdge.id, { data: { ...selectedEdge.data, color } });
                    }}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Edge Type - Bent Arrow Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
              title="Edge Type"
            >
              <CornerDownRight className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" side="top">
            <div className="space-y-1">
              {[
                { value: 'line', icon: Minus, label: 'Line' },
                { value: 'bezier', icon: ArrowUpRight, label: 'Bezier' },
                { value: 'step', icon: CornerUpRight, label: 'Step' },
                { value: 'smoothstep', icon: TrendingUp, label: 'Smooth' }
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = selectedEdge.type === type.value;
                return (
                  <button
                    key={type.value}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onEdgeStyleChange?.(selectedEdge.id, { type: type.value });
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Stroke Width - Stacked Lines Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
              title="Stroke Width"
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" side="top">
            <div className="space-y-1">
              {[
                { value: 2, label: 'Thin' },
                { value: 4, label: 'Regular' },
                { value: 6, label: 'Bold' },
                { value: 8, label: 'Heavy' }
              ].map((width) => {
                const isSelected = (selectedEdge.data?.strokeWidth || 2) === width.value;
                return (
                  <button
                    key={width.value}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onEdgeStyleChange?.(selectedEdge.id, { data: { ...selectedEdge.data, strokeWidth: width.value } });
                    }}
                  >
                    <span>{width.label}</span>
                    <span className="text-xs">{width.value}px</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Dashed Line Toggle - Shows opposite state */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const style = selectedEdge.data?.style === 'dashed' ? 'solid' : 'dashed';
            onEdgeStyleChange?.(selectedEdge.id, { data: { ...selectedEdge.data, style } });
          }}
          title={selectedEdge.data?.style === 'dashed' ? 'Switch to Solid' : 'Switch to Dashed'}
        >
          {selectedEdge.data?.style === 'dashed' ? <Minus className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
        </Button>

        {/* Animation Toggle - Only show for dashed lines */}
        {selectedEdge.data?.style === 'dashed' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdgeStyleChange?.(selectedEdge.id, { animated: !selectedEdge.animated });
            }}
            title={selectedEdge.animated ? 'Disable Animation' : 'Enable Animation'}
          >
            {selectedEdge.animated ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          </Button>
        )}

        {/* Direction Switch */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Swap source and target to reverse edge direction
            onEdgeStyleChange?.(selectedEdge.id, { 
              source: selectedEdge.target, 
              target: selectedEdge.source 
            });
          }}
          title="Switch Edge Direction"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return null;
}