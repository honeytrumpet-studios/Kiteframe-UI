import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { 
  Undo, 
  Redo, 
  Blocks, 
  Maximize, 
  Save, 
  Share,
  Lock, 
  Unlock,
  Eraser,
  Trash2,
  Wand2,
  MessageCircle,
  X,
} from 'lucide-react';
import { CommentModeToggle } from './CommentModeToggle';

export type AutoLayoutType = 'hierarchy' | 'horizontal' | 'grid';

interface FlowControlsToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onAutoLayout?: (layoutType: AutoLayoutType) => void;
  onFitToView?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onLockToggle?: () => void;
  onClearCanvas?: () => void;
  onDeleteProject?: () => void;
  onElevateWorkflow?: () => void;
  onCommentModeToggle?: () => void;

  isLocked?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  isCommentMode?: boolean;
  className?: string;
}

export const FlowControlsToolbar: React.FC<FlowControlsToolbarProps> = (props) => {

  
  const {
    onUndo,
    onRedo,
    onAutoLayout,
    onFitToView,
    onSave,
    onShare,
    onExport,
    onLockToggle,
    onClearCanvas,
    onDeleteProject,
    onElevateWorkflow,
    onCommentModeToggle,

    isLocked = false,
    canUndo = true,
    canRedo = true,
    isCommentMode = false,
    className = '',
  } = props;

  
  // Hide entire toolbar when in comment mode
  if (isCommentMode) {
    return null;
  }

  return (
    <div 
      className={`flex flex-col gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 ${className}`}
      style={{ position: 'relative', zIndex: 100 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-10 w-10 p-0"
        title="Undo"
      >
        <Undo className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-10 w-10 p-0"
        title="Redo"
      >
        <Redo className="h-5 w-5" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            title="Auto Layout"
          >
            <Blocks className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" className="w-48">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Auto Layout</h4>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAutoLayout?.('hierarchy')}
                className="w-full justify-start"
              >
                Hierarchy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAutoLayout?.('horizontal')}
                className="w-full justify-start"
              >
                Horizontal
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAutoLayout?.('grid')}
                className="w-full justify-start"
              >
                Grid
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onFitToView}
        className="h-10 w-10 p-0"
        title="Fit to View"
      >
        <Maximize className="h-5 w-5" />
      </Button>
      
      <CommentModeToggle 
        enabled={isCommentMode}
        onToggle={(enabled) => onCommentModeToggle?.()}
        className={isCommentMode ? "bg-blue-500 text-white" : ""}
      />
      

      <Button
        variant="ghost"
        size="sm"
        onClick={onSave}
        className="h-10 w-10 p-0"
        title="Save"
      >
        <Save className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onShare}
        disabled={!onShare}
        className="h-10 w-10 p-0"
        title="Share"
      >
        <Share className="h-5 w-5" />
      </Button>



      <Button
        variant="ghost"
        size="sm"
        onClick={onElevateWorkflow}
        disabled={!onElevateWorkflow || isCommentMode}
        className="h-10 w-10 p-0"
        title={isCommentMode ? "Disabled in Comment Mode" : "AI Elevate Workflow"}
      >
        <Wand2 className="h-5 w-5" />
      </Button>
      

      
      <Button
        variant="ghost"
        size="sm"
        onClick={onLockToggle}
        className="h-10 w-10 p-0"
        title={isLocked ? "Unlock" : "Lock"}
      >
        {isLocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
      </Button>
    </div>
  );
};