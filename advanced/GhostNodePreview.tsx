import React from 'react';
import { Plus } from 'lucide-react';

interface GhostNodePreviewProps {
  position: { x: number; y: number };
  handlePosition: 'top' | 'bottom' | 'left' | 'right';
  onCreateNode?: () => void;
  visible: boolean;
}

export function GhostNodePreview({ 
  position, 
  handlePosition, 
  onCreateNode, 
  visible 
}: GhostNodePreviewProps) {
  if (!visible) return null;

  // Calculate ghost node position based on handle position
  const getGhostPosition = () => {
    const offset = 120; // Distance from the original node
    switch (handlePosition) {
      case 'top':
        return { x: position.x, y: position.y - offset };
      case 'bottom':
        return { x: position.x, y: position.y + offset };
      case 'left':
        return { x: position.x - offset, y: position.y };
      case 'right':
        return { x: position.x + offset, y: position.y };
      default:
        return position;
    }
  };

  const ghostPos = getGhostPosition();

  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: ghostPos.x - 100, // Center the 200px wide ghost node
        top: ghostPos.y - 50,   // Center the 100px tall ghost node
      }}
    >
      {/* Ghost Node */}
      <div 
        className="w-48 h-24 bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg opacity-70 transition-opacity duration-200 flex items-center justify-center cursor-pointer pointer-events-auto"
        onClick={onCreateNode}
      >
        <Plus className="w-6 h-6 text-slate-500 dark:text-slate-400" />
      </div>
      
      {/* Enhanced Handle Indicator */}
      <div
        className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center pointer-events-auto cursor-pointer"
        style={{
          left: handlePosition === 'left' ? -16 : 
                handlePosition === 'right' ? 176 : 88,
          top: handlePosition === 'top' ? -16 :
               handlePosition === 'bottom' ? 80 : 32
        }}
        onClick={onCreateNode}
      >
        <Plus className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}