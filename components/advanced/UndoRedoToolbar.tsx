import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo } from 'lucide-react';
import { useHistory } from '../history';

export function UndoRedoToolbar() {
  const { undo, redo, canUndo, canRedo } = useHistory<any>();
  
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
  
  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        className="flex items-center gap-1"
      >
        <Undo className="h-4 w-4" />
        <span className="text-xs">Undo</span>
      </Button>
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />
      <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        className="flex items-center gap-1"
      >
        <Redo className="h-4 w-4" />
        <span className="text-xs">Redo</span>
      </Button>
    </div>
  );
}