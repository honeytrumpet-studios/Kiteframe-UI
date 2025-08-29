import React from 'react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';
import { Sliders } from 'lucide-react';

interface DataTransformerNodeProps {
  node: Node;
  selected?: boolean;
  onDoubleClick?: (e: React.MouseEvent, node: Node) => void;
  inputs?: any[];
  [key: string]: any;
}

export const DataTransformerNode: React.FC<DataTransformerNodeProps> = (props) => {
  const { node, ...otherProps } = props;

  return (
    <div className="shadow-md hover:shadow-lg transition-shadow">
      <DefaultNode
        {...otherProps}
        node={{
          ...node,
          data: {
            ...node.data,
            label: 'Transformer',
            color: '#fff3e0',
            borderColor: '#ef6c00',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 12,
            textColor: '#e65100',
            contentHorizontalAlign: 'center',
            contentVerticalAlign: 'center',
          },
          style: { 
            ...node.style,
            width: 260, 
            height: 120,
          }
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-lg">⚙️</span>
          <span className="font-semibold text-sm">{node.data.transformName}</span>
        </div>
        <small className="text-xs italic text-gray-900 dark:text-gray-100">Data transformation</small>
      </DefaultNode>
    </div>
  );
};