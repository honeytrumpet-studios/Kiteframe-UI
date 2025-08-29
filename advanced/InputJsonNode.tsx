import React from 'react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';
import { FileJson } from 'lucide-react';

interface InputJsonNodeProps {
  node: Node;
  selected?: boolean;
  onDoubleClick?: (e: React.MouseEvent, node: Node) => void;
  inputs?: any[];
  [key: string]: any;
}

export const InputJsonNode: React.FC<InputJsonNodeProps> = (props) => {
  const { node, ...otherProps } = props;

  return (
    <div className="shadow-md hover:shadow-lg transition-shadow">
      <DefaultNode
        {...otherProps}
        node={{
          ...node,
          data: {
            ...node.data,
            label: node.data.label ?? 'Input JSON',
            color: '#e0f7fa',
            borderColor: '#00838f',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 12,
            textColor: '#006064',
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
          <span className="text-lg">📥</span>
          <span className="font-semibold text-sm">{node.data.label ?? 'Input JSON'}</span>
        </div>
        <pre className="text-xs font-mono max-h-32 overflow-auto whitespace-pre-wrap">
          {JSON.stringify(node.data.payload, null, 2)}
        </pre>
      </DefaultNode>
    </div>
  );
};