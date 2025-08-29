import React, { useState } from 'react';
import { Edge } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface ConnectionSettingsPopoverProps {
  edge: Edge;
  onClose: () => void;
  onUpdate?: (edgeId: string, updates: Partial<Edge>) => void;
}

export function ConnectionSettingsPopover({ edge, onClose, onUpdate }: ConnectionSettingsPopoverProps) {
  const [label, setLabel] = useState(edge.data?.label || '');
  const [color, setColor] = useState(edge.data?.color || 'hsl(var(--foreground))');
  const [strokeWidth, setStrokeWidth] = useState(edge.data?.strokeWidth || 2);
  const [animated, setAnimated] = useState(edge.data?.animated || false);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(edge.id, {
        ...edge,
        data: {
          ...edge.data,
          label,
          color,
          strokeWidth,
          animated
        }
      });
    }
    onClose();
  };

  return (
    <div className="absolute top-0 left-0 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Connection Settings</CardTitle>
              <CardDescription>Configure edge properties</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edge-label">Label</Label>
            <Input
              id="edge-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter edge label"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edge-color">Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { name: 'Blue', color: '#3b82f6' },
                { name: 'Green', color: '#22c55e' },
                { name: 'Red', color: '#ef4444' },
                { name: 'Yellow', color: '#eab308' },
                { name: 'Purple', color: '#8b5cf6' },
                { name: 'Cyan', color: '#06b6d4' }
              ].map((swatch) => (
                <button
                  key={swatch.name}
                  onClick={() => setColor(swatch.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === swatch.color
                      ? 'border-blue-500 scale-110'
                      : 'border-slate-300 dark:border-slate-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stroke-width">Stroke Width: {strokeWidth}px</Label>
            <Slider
              id="stroke-width"
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="animated"
              checked={animated}
              onCheckedChange={setAnimated}
            />
            <Label htmlFor="animated">Animated</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
