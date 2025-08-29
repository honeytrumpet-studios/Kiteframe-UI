import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Move, RotateCw } from 'lucide-react';

interface FlowControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onReset: () => void;
  position?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function FlowControls({ 
  onZoomIn, 
  onZoomOut, 
  onFitView, 
  onReset, 
  position = 'bottom-left',
  orientation = 'vertical' 
}: FlowControlsProps) {
  
  const getPositionClass = (pos: string) => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top': 'top-4 left-1/2 transform -translate-x-1/2',
      'top-right': 'top-4 right-4',
      'left': 'top-1/2 left-4 transform -translate-y-1/2',
      'right': 'top-1/2 right-4 transform -translate-y-1/2',
      'bottom-left': 'bottom-4 left-4',
      'bottom': 'bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4'
    };
    return positions[pos] || 'bottom-4 left-4';
  };

  const getOrientationClass = (orient: string, pos: string) => {
    // For top/bottom positions, default to horizontal
    if (pos === 'top' || pos === 'bottom') {
      return orient === 'vertical' ? 'flex flex-col space-y-1' : 'flex flex-row space-x-1';
    }
    // For other positions, use specified orientation
    return orient === 'horizontal' ? 'flex flex-row space-x-1' : 'flex flex-col space-y-1';
  };

  return (
    <Card className={`absolute p-2 z-10 ${getPositionClass(position)}`}>
      <div className={getOrientationClass(orientation, position)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onFitView}
          title="Fit View"
        >
          <Move className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          title="Reset"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
