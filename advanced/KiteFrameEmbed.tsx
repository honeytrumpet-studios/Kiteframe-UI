import React from 'react';
import { KiteFrameCanvas } from './KiteFrameCanvas';
import { MiniMap } from './MiniMap';
import { Node, Edge } from '../types';
import { cn } from '@/lib/utils';

export interface KiteFrameEmbedProps {
  nodes: Node[];
  edges: Edge[];
  width?: number | string;
  height?: number | string;
  showMiniMap?: boolean;
  miniMapWidth?: number;
  miniMapHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  description?: string;
}

export const KiteFrameEmbed: React.FC<KiteFrameEmbedProps> = ({
  nodes,
  edges,
  width = '100%',
  height = 400,
  showMiniMap = false,
  miniMapWidth = 200,
  miniMapHeight = 150,
  className,
  style,
  title,
  description,
}) => {
  return (
    <div
      className={cn(
        'relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
        className
      )}
      style={{ width, height, ...style }}
    >
      {/* Header */}
      {(title || description) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex-1">
        <KiteFrameCanvas
          nodes={nodes}
          edges={edges}
          className="w-full h-full"
          style={{ 
            height: typeof height === 'number' 
              ? `${height - (title || description ? 80 : 0)}px` 
              : '100%',
            pointerEvents: 'none' // Make it read-only
          }}
          disableZoom={true}
          onNodesChange={() => {}} // No-op for read-only
          onEdgesChange={() => {}} // No-op for read-only
          onNodeClick={() => {}} // No-op for read-only
          onEdgeClick={() => {}} // No-op for read-only
        />

        {/* MiniMap Overlay */}
        {showMiniMap && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
            <MiniMap
              width={miniMapWidth}
              height={miniMapHeight}
              nodes={nodes}
              edges={edges}
              viewport={{ x: 0, y: 0, zoom: 1 }}
            />
          </div>
        )}

        {/* Read-only badge */}
        <div className="absolute bottom-4 left-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-700">
          Read-only
        </div>
      </div>
    </div>
  );
};