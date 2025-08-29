import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

interface CommentModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const CommentModeToggle: React.FC<CommentModeToggleProps> = ({ 
  enabled, 
  onToggle, 
  className = '' 
}) => {
  return (
    <Button 
      variant={enabled ? "default" : "ghost"}
      size="sm"
      onClick={() => onToggle(!enabled)}
      className={`h-10 w-10 p-0 touch-manipulation relative z-50 ${className}`}
      title={enabled ? "Exit Comment Mode" : "Comment Mode"}
    >
      {enabled ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
    </Button>
  );
};