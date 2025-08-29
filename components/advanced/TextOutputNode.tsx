import React from 'react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';
import { FileText } from 'lucide-react';

interface TextOutputNodeProps {
  node: Node;
  selected?: boolean;
  onDoubleClick?: (e: React.MouseEvent, node: Node) => void;
  inputs?: any[];
  [key: string]: any;
}

export const TextOutputNode: React.FC<TextOutputNodeProps> = (props) => {
  const { node, ...otherProps } = props;

  return (
    <div className="shadow-md hover:shadow-lg transition-shadow">
      <DefaultNode
        {...otherProps}
        node={{
          ...node,
          data: {
            ...node.data,
            label: node.data.label ?? 'Text Output',
            color: '#e8f5e9',
            borderColor: '#388e3c',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 12,
            textColor: '#1b5e20',
            contentHorizontalAlign: 'stretch',
            contentVerticalAlign: 'top',
          },
          style: { 
            ...node.style,
            width: 240, 
            height: 140,
          }
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📄</span>
          <span className="font-semibold text-sm">{node.data.label ?? 'Text Output'}</span>
        </div>
        <div className="text-xs text-gray-900 dark:text-gray-100 font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded border">
          {node.data.textResult || 'No text extracted'}
        </div>
      </DefaultNode>
    </div>
  );
};