import React from 'react';

export interface GridBackgroundProps {
  gridSize?: number;
  color?: string;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  gridSize = 20,
  color = '#e0e0e0',
}) => (
  <svg className="kiteline-grid" width="100%" height="100%">
    <defs>
      <pattern
        id="grid"
        width={gridSize}
        height={gridSize}
        patternUnits="userSpaceOnUse"
      >
        <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke={color} strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);