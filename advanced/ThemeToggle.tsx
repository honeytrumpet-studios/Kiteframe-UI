import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {theme.mode === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          <span className="text-xs">Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span className="text-xs">Light</span>
        </>
      )}
    </Button>
  );
}