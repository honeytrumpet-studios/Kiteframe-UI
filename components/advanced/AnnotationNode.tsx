import React, { useState } from 'react';
import { NodeData } from '../types';

interface AnnotationNodeProps {
  node: NodeData & {
    data: {
      text?: string;
      backgroundColor?: string;
      color?: string;
    };
  };
  onUpdate?: (data: any) => void;
  style?: React.CSSProperties;
}

export const AnnotationNode: React.FC<AnnotationNodeProps> = ({ node, onUpdate, style }) => {
  const [text, setText] = useState(node.data.text || 'Add note...');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleTextChange = (newText: string) => {
    setText(newText);
    onUpdate?.({ ...node.data, text: newText });
  };
  
  return (
    <div 
      className="annotation-node relative border-2 border-dashed border-yellow-400 p-3 rounded-lg shadow-lg cursor-pointer"
      style={{
        backgroundColor: node.data.backgroundColor || '#fffbeb',
        color: node.data.color || '#92400e',
        width: node.style?.width || 200,
        height: node.style?.height || 120,
        ...style,
      }}
      onClick={() => setIsEditing(true)}
    >
      <div className="absolute -top-2 -left-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
        📝 Note
      </div>
      
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className="w-full h-full bg-transparent resize-none outline-none border-none p-0 text-sm leading-relaxed"
          placeholder="Add your note here..."
          autoFocus
        />
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
};