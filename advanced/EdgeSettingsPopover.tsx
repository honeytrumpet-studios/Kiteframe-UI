import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Palette, Zap, Settings, Minus, CornerUpRight, ArrowUpRight, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Edge } from '../types';

interface EdgeSettingsPopoverProps {
  edge: Edge;
  position: { x: number; y: number };
  onClose?: () => void;
  onSave?: (settings: any) => void;
  className?: string;
}

export function EdgeSettingsPopover({
  edge,
  position,
  onClose = () => {},
  onSave = () => {},
  className
}: EdgeSettingsPopoverProps) {
  const [settings, setSettings] = useState({
    label: edge.data?.label || '',
    color: edge.data?.color || 'hsl(var(--foreground))',
    strokeWidth: edge.data?.strokeWidth || 2,
    animated: edge.animated || edge.data?.animated || false,
    animationSpeed: edge.data?.animationSpeed || 2,
    animationDirection: edge.data?.animationDirection || 'forward',
    type: edge.type || 'smoothstep'
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState(position || { x: 100, y: 100 });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Stable callback references to prevent re-registration
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>();
  const handleMouseUpRef = useRef<(e: MouseEvent) => void>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const canvas = document.querySelector('[data-kiteframe-canvas]');
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      setPopoverPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Store stable references
    handleMouseMoveRef.current = handleMouseMove;
    handleMouseUpRef.current = handleMouseUp;

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      const canvas = document.querySelector('[data-kiteframe-canvas]');
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - canvasRect.left - popoverPosition.x,
          y: e.clientY - canvasRect.top - popoverPosition.y
        });
      }
    }
    
    setIsDragging(true);
  };

  const handleSettingChange = (key: string, value: any) => {
    console.log('[EdgeSettingsPopover] Changing:', key, '=', value);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    console.log('[EdgeSettingsPopover] Saving to edge:', edge.id);
    onSave(newSettings);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[EdgeSettingsPopover] Close button clicked');
    onClose();
  };

  const colorSwatches = [
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Green', color: '#22c55e' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Yellow', color: '#eab308' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Cyan', color: '#06b6d4' }
  ];

  const edgeTypeIcons: { [key: string]: React.ElementType } = {
    line: Minus,
    step: CornerUpRight,
    smoothstep: ArrowUpRight,
    bezier: Waves
  };

  // Debug: Log when popover renders (reduced)
  React.useEffect(() => {
    console.log('[EdgeSettingsPopover] Opened for edge:', edge.id);
  }, [edge.id]);

  return (
    <div
      ref={popoverRef}
      className={cn(
        'absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg',
        className
      )}
      style={{
        left: popoverPosition.x,
        top: popoverPosition.y,
        width: '320px'
      }}
    >
      <Card className="border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-move flex-1"
              onMouseDown={handleMouseDown}
            >
              <Settings className="h-4 w-4" />
              <CardTitle className="text-base">Edge Settings</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Edge Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Edge Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {['line', 'step', 'smoothstep', 'bezier'].map((type) => {
                const IconComponent = edgeTypeIcons[type as keyof typeof edgeTypeIcons];
                return (
                  <Button
                    key={type}
                    variant={settings.type === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSettingChange('type', type);
                    }}
                    className="text-xs flex items-center gap-2"
                  >
                    <IconComponent className="h-3 w-3" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Label */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Label</Label>
            <Input
              value={settings.label}
              onChange={(e) => {
                e.stopPropagation();
                handleSettingChange('label', e.target.value);
              }}
              placeholder="Enter edge label"
              className="text-sm"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-3 w-3" />
              Color
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {colorSwatches.map((swatch) => (
                <button
                  key={swatch.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSettingChange('color', swatch.color);
                  }}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    settings.color === swatch.color
                      ? 'border-blue-500 scale-110'
                      : 'border-slate-300 dark:border-slate-600 hover:scale-105'
                  )}
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center justify-between">
              Stroke Width
              <Badge variant="outline">{settings.strokeWidth}px</Badge>
            </Label>
            <Slider
              value={[settings.strokeWidth]}
              onValueChange={(value) => {
                handleSettingChange('strokeWidth', value[0]);
              }}
              max={8}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Animation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Animation
              </Label>
              <Switch
                checked={settings.animated}
                onCheckedChange={(checked) => {
                  handleSettingChange('animated', checked);
                }}
              />
            </div>

            {settings.animated && (
              <div className="space-y-3 pl-4 border-l-2 border-blue-100 dark:border-blue-900">
                {/* Animation Speed */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center justify-between">
                    Speed
                    <Badge variant="outline">{settings.animationSpeed}s</Badge>
                  </Label>
                  <Slider
                    value={[settings.animationSpeed]}
                    onValueChange={(value) => {
                      handleSettingChange('animationSpeed', value[0]);
                    }}
                    max={10}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Animation Direction */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Direction</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['forward', 'reverse', 'alternate'].map((direction) => (
                      <Button
                        key={direction}
                        variant={settings.animationDirection === direction ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettingChange('animationDirection', direction);
                        }}
                        className="text-xs"
                      >
                        {direction.charAt(0).toUpperCase() + direction.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}