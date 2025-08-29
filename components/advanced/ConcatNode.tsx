import React from 'react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';
import { Link } from 'lucide-react';

interface ConcatNodeProps {
  node: Node;
  selected?: boolean;
  onDoubleClick?: (e: React.MouseEvent, node: Node) => void;
  inputs?: any[];
  [key: string]: any;
}

export const ConcatNode: React.FC<ConcatNodeProps> = (props) => {
  const { node, ...otherProps } = props;

  return (
    <div className="shadow-md hover:shadow-lg transition-shadow">
      <DefaultNode
        {...otherProps}
        node={{
          ...node,
          data: {
            ...node.data,
            label: node.data.label ?? 'Concat',
            color: '#fce4ec',
            borderColor: '#ad1457',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 12,
            textColor: '#880e4f',
            contentHorizontalAlign: 'center',
            contentVerticalAlign: 'center',
          },
          style: { 
            ...node.style,
            width: 320, 
            height: 140,
          }
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔗</span>
          <span className="font-semibold text-sm">{node.data.label ?? 'Concat'}</span>
        </div>
        <div className="text-xs text-gray-900 dark:text-gray-100 p-2 bg-gray-100 dark:bg-gray-800 rounded border font-mono">
          {node.data.concatResult || 'No concatenation result'}
        </div>
      </DefaultNode>
    </div>
  );
};