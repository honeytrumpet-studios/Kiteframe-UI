import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export type ReactionPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

interface ReactionBubbleProps {
  emoji: string;
  position: ReactionPosition;
  count?: number;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  animate?: boolean;
  showCount?: boolean;
}

export const ReactionBubble: React.FC<ReactionBubbleProps> = ({
  emoji,
  position,
  count = 0,
  onClick,
  onRemove,
  className = "",
  animate = true,
  showCount = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-0 left-0 -translate-x-1/2 -translate-y-1/2";
      case "top-right":
        return "top-0 right-0 translate-x-1/2 -translate-y-1/2";
      case "bottom-left":
        return "bottom-0 left-0 -translate-x-1/2 translate-y-1/2";
      case "bottom-right":
        return "bottom-0 right-0 translate-x-1/2 translate-y-1/2";
      case "top-center":
        return "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "bottom-center":
        return "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";
      default:
        return "top-0 right-0 translate-x-1/2 -translate-y-1/2";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div
      className={`absolute z-10 ${getPositionClasses()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={`
          h-8 min-w-8 px-2 py-1 
          bg-white/90 dark:bg-slate-800/90 
          border-slate-200 dark:border-slate-700 
          hover:bg-white dark:hover:bg-slate-800 
          backdrop-blur-sm
          transition-all duration-200
          ${animate ? "animate-in slide-in-from-bottom-2 fade-in-0" : ""}
          ${isHovered ? "scale-110 shadow-lg" : "shadow-md"}
        `}
      >
        <span className="text-base leading-none">{emoji}</span>
        {showCount && count > 0 && (
          <span className="ml-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            {count}
          </span>
        )}
      </Button>

      {/* Remove button on hover */}
      {isHovered && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
        >
          ×
        </Button>
      )}
    </div>
  );
};

// Reaction Bubble Collection Component
interface ReactionBubbleCollectionProps {
  reactions: Array<{
    id: string;
    emoji: string;
    count: number;
    position: ReactionPosition;
  }>;
  onReactionClick?: (id: string) => void;
  onReactionRemove?: (id: string) => void;
  className?: string;
}

export const ReactionBubbleCollection: React.FC<
  ReactionBubbleCollectionProps
> = ({ reactions, onReactionClick, onReactionRemove, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {reactions.map((reaction) => (
        <ReactionBubble
          key={reaction.id}
          emoji={reaction.emoji}
          position={reaction.position}
          count={reaction.count}
          onClick={() => onReactionClick?.(reaction.id)}
          onRemove={() => onReactionRemove?.(reaction.id)}
        />
      ))}
    </div>
  );
};
