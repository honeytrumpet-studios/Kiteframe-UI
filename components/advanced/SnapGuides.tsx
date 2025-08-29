import React from 'react';
import { SnapGuide } from '../utils/snapUtils';

interface SnapGuidesProps {
  guides: SnapGuide[];
  canvasSize: { width: number; height: number };
  viewport: { x: number; y: number; zoom: number };
  show: boolean;
}

export const SnapGuides: React.FC<SnapGuidesProps> = ({
  guides,
  canvasSize,
  viewport,
  show
}) => {
  if (!show || guides.length === 0) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
    >
      {guides.map((guide, index) => {
        const isHorizontal = guide.type === 'horizontal';
        const opacity = Math.min(0.8, 0.4 + (guide.strength * 0.1));
        
        // No manual transformation needed - this component is now inside the viewport-transformed container
        
        return (
          <div
            key={`${guide.type}-${guide.position}-${index}`}
            className="absolute"
            style={{
              [isHorizontal ? 'top' : 'left']: `${guide.position}px`,
              [isHorizontal ? 'left' : 'top']: '0px',
              [isHorizontal ? 'width' : 'height']: `${isHorizontal ? canvasSize.width : canvasSize.height}px`,
              [isHorizontal ? 'height' : 'width']: '1px',
              backgroundColor: '#3b82f6',
              opacity,
              boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)',
              zIndex: 1000
            }}
          >
            {/* Guide line indicator dots */}
            <div
              className="absolute w-2 h-2 bg-blue-500 rounded-full border border-white shadow-sm"
              style={{
                [isHorizontal ? 'top' : 'left']: '-4px',
                [isHorizontal ? 'left' : 'top']: `${(isHorizontal ? canvasSize.width : canvasSize.height) / 2 - 4}px`
              }}
            />
            
            {/* Guide strength indicator */}
            {guide.strength > 2 && (
              <div
                className="absolute text-xs bg-blue-500 text-white px-1 py-0.5 rounded text-center"
                style={{
                  [isHorizontal ? 'top' : 'left']: isHorizontal ? '-20px' : '-24px',
                  [isHorizontal ? 'left' : 'top']: `${(isHorizontal ? canvasSize.width : canvasSize.height) / 2 - 10}px`,
                  fontSize: '10px',
                  minWidth: '20px'
                }}
              >
                {guide.strength}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};