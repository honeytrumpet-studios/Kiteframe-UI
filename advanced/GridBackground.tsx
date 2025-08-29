import React from 'react';

export interface GridBackgroundProps {
  gridSize?: number;
  color?: string;
  gridType?: 'lines' | 'dots' | 'crosshairs';
  viewport?: { x: number; y: number; zoom: number };
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  gridSize = 20,
  color = '#e0e0e0',
  gridType = 'lines',
  viewport = { x: 0, y: 0, zoom: 1 },
}) => {
  const patternId = `grid-${gridType}-${gridSize}`;
  
  // Calculate grid dimensions to cover the entire viewport
  const gridWidth = 10000; // Large enough to cover any reasonable viewport
  const gridHeight = 10000;
  
  return (
    <svg 
      className="kiteline-grid absolute pointer-events-none opacity-20" 
      width={gridWidth} 
      height={gridHeight}
      style={{
        left: -gridWidth / 2,
        top: -gridHeight / 2,
      }}
    >
      <defs>
        <pattern
          id={patternId}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          {gridType === 'lines' && (
            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke={color} strokeWidth="0.5" />
          )}
          {gridType === 'dots' && (
            <circle cx={gridSize / 2} cy={gridSize / 2} r="1" fill={color} />
          )}
          {gridType === 'crosshairs' && (
            <>
              <path d={`M ${gridSize / 2} 0 L ${gridSize / 2} ${gridSize}`} fill="none" stroke={color} strokeWidth="0.5" />
              <path d={`M 0 ${gridSize / 2} L ${gridSize} ${gridSize / 2}`} fill="none" stroke={color} strokeWidth="0.5" />
            </>
          )}
        </pattern>
      </defs>
      <rect width={gridWidth} height={gridHeight} fill={`url(#${patternId})`} />
    </svg>
  );
};