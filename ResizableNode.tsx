import React, { useRef, useState } from 'react';
import { Node } from '../types';
import { ResizeHandle } from './ResizeHandle';

export interface ResizableNodeProps {
  node: Node;
  onNodeResize: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
}

export const ResizableNode: React.FC<ResizableNodeProps> = ({
  node,
  onNodeResize,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: node.style?.width ?? 150,
    h: node.style?.height ?? 80,
  });

  const handleResize = (w: number, h: number) => {
    setSize({ w, h });
  };
  const handleResizeEnd = () => {
    onNodeResize(node.id, size.w, size.h);
  };

  return (
    <div
      ref={ref}
      className="resizable-node relative"
      style={{
        width: size.w,
        height: size.h,
      }}
    >
      {children}
      {node.resizable !== false &&
        (['top-left','top-right','bottom-left','bottom-right'] as const).map(pos => (
          <ResizeHandle
            key={pos}
            position={pos}
            visibility="hover"
            nodeRef={ref}
            resizable={node.resizable}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        ))}
    </div>
  );
};