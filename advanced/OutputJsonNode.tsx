import React from 'react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';
import { FileCheck } from 'lucide-react';

interface OutputJsonNodeProps {
  node: Node;
  selected?: boolean;
  onDoubleClick?: (e: React.MouseEvent, node: Node) => void;
  inputs?: any[];
  [key: string]: any;
}

export const OutputJsonNode: React.FC<OutputJsonNodeProps> = (props) => {
  const { node, ...otherProps } = props;

  return (
    <div className="shadow-md hover:shadow-lg transition-shadow">
      <DefaultNode
        {...otherProps}
        node={{
          ...node,
          data: {
            ...node.data,
            label: node.data.label ?? 'Output JSON',
            color: '#e3f2fd',
            borderColor: '#1976d2',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 12,
            textColor: '#0d47a1',
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
          <span className="text-lg">📤</span>
          <span className="font-semibold text-sm">{node.data.label ?? 'Output JSON'}</span>
        </div>
        <div className="text-xs space-y-1">
          {node.data.result && typeof node.data.result === 'object' && (
            <div className="space-y-1">
              {Object.entries(node.data.result).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="font-medium text-[#1976d2]">{key}:</span>
                  <span className="ml-2 font-mono text-[#0d47a1]">
                    {typeof value === 'string' ? `"${value}"` : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {(!node.data.result || typeof node.data.result !== 'object') && (
            <pre className="font-mono max-h-32 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(node.data.result, null, 2)}
            </pre>
          )}
        </div>
      </DefaultNode>
    </div>
  );
};