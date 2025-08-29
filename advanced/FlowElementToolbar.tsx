import React from 'react';
import { Button } from '@/components/ui/button';
import { Square, FileImage, Frame, Type, X } from 'lucide-react';

interface FlowElementToolbarProps {
  onAddDefaultNode?: () => void;
  onAddImageNode?: () => void;
  onAddKFrame?: () => void;
  onAddTextNode?: () => void;
  activeTextTool?: boolean;
  onTextToolChange?: (active: boolean) => void;
  isCommentMode?: boolean;
  onCommentModeToggle?: () => void;
  className?: string;
}

export const FlowElementToolbar: React.FC<FlowElementToolbarProps> = ({
  onAddDefaultNode,
  onAddImageNode,
  onAddKFrame,
  onAddTextNode,
  activeTextTool = false,
  onTextToolChange,
  isCommentMode = false,
  onCommentModeToggle,
  className = '',
}) => {
  // When in comment mode, show only the Exit Comment Mode button
  if (isCommentMode) {
    return (
      <div className={`flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 ${className}`}>
        <Button
          variant="default"
          size="sm"
          onClick={onCommentModeToggle}
          className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white"
          title="Exit Comment Mode"
        >
          <X className="h-4 w-4 mr-2" />
          Exit Comment Mode
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddDefaultNode}
        className="h-10 w-10 p-0"
        title="Add Default Node"
      >
        <Square className="h-5 w-5" />
      </Button>
      
      {/* Temporarily hidden due to sync issues 
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddImageNode}
        className="h-10 w-10 p-0"
        title="Add Image Node"
      >
        <FileImage className="h-5 w-5" />
      </Button>
      */}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddKFrame}
        className="h-10 w-10 p-0"
        title="Add KFrame"
      >
        <Frame className="h-5 w-5" />
      </Button>
      
      <Button
        variant={activeTextTool ? "default" : "ghost"}
        size="sm"
        onClick={() => {
          if (activeTextTool) {
            onAddTextNode?.();
          } else {
            onTextToolChange?.(true);
          }
        }}
        className="h-10 w-10 p-0"
        title="Add Text (T)"
      >
        <Type className="h-5 w-5" />
      </Button>
    </div>
  );
};