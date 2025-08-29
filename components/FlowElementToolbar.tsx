import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Square, 
  Circle, 
  Triangle, 
  Image, 
  Type,
  ArrowRight,
  Trash2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface FlowElementToolbarProps {
  onAddNode?: (type: string) => void;
  onAddEdge?: () => void;
  onDeleteSelected?: () => void;
  onCopySelected?: () => void;
  onToggleVisibility?: () => void;
  selectedCount?: number;
  isVisible?: boolean;
  className?: string;
}

export const FlowElementToolbar: React.FC<FlowElementToolbarProps> = ({
  onAddNode,
  onAddEdge,
  onDeleteSelected,
  onCopySelected,
  onToggleVisibility,
  selectedCount = 0,
  isVisible = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm ${className}`}>
      {/* Add Elements */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode?.('default')}
          className="h-8 w-8 p-0"
          title="Add Rectangle Node"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode?.('circle')}
          className="h-8 w-8 p-0"
          title="Add Circle Node"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode?.('triangle')}
          className="h-8 w-8 p-0"
          title="Add Triangle Node"
        >
          <Triangle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode?.('image')}
          className="h-8 w-8 p-0"
          title="Add Image Node"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddNode?.('text')}
          className="h-8 w-8 p-0"
          title="Add Text Node"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

      {/* Add Edge */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddEdge}
        disabled={!onAddEdge}
        className="h-8 w-8 p-0"
        title="Add Connection"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

      {/* Selection Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopySelected}
          disabled={!onCopySelected || selectedCount === 0}
          className="h-8 w-8 p-0"
          title={`Copy ${selectedCount} selected`}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteSelected}
          disabled={!onDeleteSelected || selectedCount === 0}
          className="h-8 w-8 p-0"
          title={`Delete ${selectedCount} selected`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          disabled={!onToggleVisibility || selectedCount === 0}
          className="h-8 w-8 p-0"
          title={`${isVisible ? 'Hide' : 'Show'} ${selectedCount} selected`}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Selection Count */}
      {selectedCount > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
          {selectedCount} selected
        </div>
      )}
    </div>
  );
};