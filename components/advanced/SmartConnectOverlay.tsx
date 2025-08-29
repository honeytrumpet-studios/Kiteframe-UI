import React from 'react';
import { SmartConnectPreview } from '../hooks/useSmartConnect';

export interface SmartConnectOverlayProps {
  preview: SmartConnectPreview | null;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
}

export const SmartConnectOverlay: React.FC<SmartConnectOverlayProps> = ({
  preview,
  strokeColor = '#3b82f6',
  strokeWidth = 2,
  strokeDasharray = '4 4',
  opacity = 0.8,
}) => {
  if (!preview) return null;

  const { sourceX, sourceY, targetX, targetY } = preview;

  // Create a smooth curve path instead of straight line
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const controlOffset = 50;
  
  // Calculate control points for a smooth curve
  const controlX1 = sourceX + (targetX - sourceX) * 0.3;
  const controlY1 = sourceY;
  const controlX2 = targetX - (targetX - sourceX) * 0.3;
  const controlY2 = targetY;

  const path = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`;

  return (
    <g className="smart-connect-overlay">
      {/* Glow effect */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth + 2}
        strokeDasharray={strokeDasharray}
        opacity={opacity * 0.3}
        pointerEvents="none"
      />
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        opacity={opacity}
        pointerEvents="none"
      />
      {/* Connection indicator dots */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={4}
        fill={strokeColor}
        opacity={opacity}
        pointerEvents="none"
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={4}
        fill={strokeColor}
        opacity={opacity}
        pointerEvents="none"
      />
    </g>
  );
};