import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw, 
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface ControlsToolbarProps {
  viewport: { x: number; y: number; zoom: number };
  onViewportChange: (viewport: { x: number; y: number; zoom: number }) => void;
  onFitView: () => void;
}

export function ControlsToolbar({ viewport, onViewportChange, onFitView }: ControlsToolbarProps) {
  const handleZoomIn = () => {
    onViewportChange({
      ...viewport,
      zoom: Math.min(2, viewport.zoom * 1.2)
    });
  };

  const handleZoomOut = () => {
    onViewportChange({
      ...viewport,
      zoom: Math.max(0.1, viewport.zoom / 1.2)
    });
  };

  const handleReset = () => {
    onViewportChange({ x: 0, y: 0, zoom: 1 });
  };

  return (
    <Card className="absolute top-4 right-4 p-2 z-10">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onFitView}
          title="Fit View"
        >
          <Maximize className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Export functionality placeholder
            console.log('Export clicked - Feature coming soon!');
          }}
          title="Export"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Import functionality placeholder
            console.log('Import clicked - Feature coming soon!');
          }}
          title="Import"
        >
          <Upload className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Settings functionality placeholder
            console.log('Settings clicked - Feature coming soon!');
          }}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </Card>
  );
}
