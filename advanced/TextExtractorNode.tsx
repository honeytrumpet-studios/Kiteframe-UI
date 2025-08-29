import React from 'react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';
import { Type } from 'lucide-react';

interface TextExtractorNodeProps {
  node: Node;
  selected?: boolean;
  onDoubleClick?: (e: React.MouseEvent, node: Node) => void;
  inputs?: any[];
  [key: string]: any;
}

export const TextExtractorNode: React.FC<TextExtractorNodeProps> = (props) => {
  const { node, ...otherProps } = props;

  return (
    <div className="shadow-md hover:shadow-lg transition-shadow">
      <DefaultNode
        {...otherProps}
        node={{
          ...node,
          data: {
            ...node.data,
            label: node.data.label ?? 'Text Extractor',
            color: '#f3e5f5',
            borderColor: '#7b1fa2',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 12,
            textColor: '#4a148c',
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
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📝</span>
          <span className="font-semibold text-sm">{node.data.extractType ?? 'Text Extractor'}</span>
        </div>
        <div className="text-xs text-gray-900 dark:text-gray-100 opacity-80">
          Extracts readable text from JSON
        </div>
      </DefaultNode>
    </div>
  );
};