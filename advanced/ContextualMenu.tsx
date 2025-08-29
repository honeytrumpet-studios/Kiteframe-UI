import React, { useState, useEffect, useRef } from 'react';
import { Copy, Trash2, Heart, ThumbsUp, PartyPopper, Smile, Flame, HandMetal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContextualMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAddReaction?: (emoji: string) => void;
  showDuplicate?: boolean;
  showDelete?: boolean;
  showReactions?: boolean;
  className?: string;
}

const REACTION_EMOJIS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '🎉', icon: PartyPopper, label: 'Celebrate' },
  { emoji: '😀', icon: Smile, label: 'Happy' },
  { emoji: '🔥', icon: Flame, label: 'Fire' },
  { emoji: '👏', icon: HandMetal, label: 'Applause' }
];

export const ContextualMenu: React.FC<ContextualMenuProps> = ({
  isOpen,
  position,
  onClose,
  onDuplicate,
  onDelete,
  onAddReaction,
  showDuplicate = true,
  showDelete = true,
  showReactions = true,
  className
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontal position if menu goes off-screen
      if (position.x + rect.width > viewport.width) {
        adjustedX = viewport.width - rect.width - 10;
      }

      // Adjust vertical position if menu goes off-screen
      if (position.y + rect.height > viewport.height) {
        adjustedY = viewport.height - rect.height - 10;
      }

      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDuplicate = () => {
    onDuplicate?.();
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  const handleAddReaction = (emoji: string) => {
    onAddReaction?.(emoji);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[180px]',
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Action buttons */}
      <div className="px-1">
        {showDuplicate && (
          <button
            onClick={handleDuplicate}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
        )}
        
        {showDelete && (
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      {/* Reactions section */}
      {showReactions && (showDuplicate || showDelete) && (
        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
      )}
      
      {showReactions && (
        <div className="px-1">
          <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            Add Reaction
          </div>
          <div className="grid grid-cols-3 gap-1 p-1">
            {REACTION_EMOJIS.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleAddReaction(reaction.emoji)}
                className="flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title={reaction.label}
              >
                <span className="text-lg">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};