import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Copy, Clipboard, Grid, PlusCircle } from 'lucide-react';

export type ToolbarAction = {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

export interface ToolbarProps {
  actions: ToolbarAction[];
  orientation?: 'horizontal' | 'vertical';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Toolbar: React.FC<ToolbarProps> = ({
  actions,
  orientation = 'horizontal',
  position = 'top',
}) => (
  <div
    className={`kiteline-toolbar kiteline-toolbar--${orientation} kiteline-toolbar--${position}`}
  >
    {actions.map(a => (
      <Button
        key={a.id}
        variant="ghost"
        size="sm"
        onClick={a.onClick}
        title={a.label}
      >
        {a.icon}
      </Button>
    ))}
  </div>
);