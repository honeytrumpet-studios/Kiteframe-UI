import React, { useState, useRef, useEffect } from 'react';
import { Type, Code, MessageSquare, FileText, Edit3, Copy, Check, Play } from 'lucide-react';
import { NodeHandles } from './NodeHandles';
import { ResizeHandle } from './ResizeHandle';
import { cn } from '@/lib/utils';

export interface TextInputNodeProps {
  node: {
    id: string;
    type: string;
    position: { x: number; y: number };
    style?: { width?: number; height?: number };
    data: {
      label?: string;
      description?: string;
      icon?: string;
      text?: string;
      placeholder?: string;
      multiline?: boolean;
      language?: string;
      syntaxHighlighting?: boolean;
      lineNumbers?: boolean;
      wordWrap?: boolean;
      readOnly?: boolean;
      maxLength?: number;
      fontSize?: number;
      fontFamily?: string;
      textAlign?: 'left' | 'center' | 'right';
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
      showCharCount?: boolean;
      autoSave?: boolean;
      autoSaveDelay?: number;
      inputType?: 'text' | 'code' | 'note' | 'comment' | 'markdown';
      [key: string]: any;
    };
    selected?: boolean;
    draggable?: boolean;
    selectable?: boolean;
    resizable?: boolean;
    showHandles?: boolean;
  };
  onConnectStart?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  onTextChange?: (nodeId: string, text: string) => void;
  onTextSave?: (nodeId: string, text: string) => void;
  onNodeDuplicate?: (nodeId: string) => void;
  children?: React.ReactNode;
  customToolbar?: React.ReactNode;
  validators?: ((text: string) => string | null)[];
  formatters?: Record<string, (text: string) => string>;
}

export const TextInputNode: React.FC<TextInputNodeProps> = ({
  node,
  onConnectStart,
  onConnectEnd,
  alwaysShowHandles = false,
  onNodeResize,
  onTextChange,
  onTextSave,
  onNodeDuplicate,
  children,
  customToolbar,
  validators = [],
  formatters = {}
}) => {
  const [text, setText] = useState(node.data.text || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [codeOutput, setCodeOutput] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [nodeSize, setNodeSize] = useState({
    width: node.style?.width || 300,
    height: node.style?.height || 200,
  });

  const handleResize = (width: number, height: number) => {
    setNodeSize({ width, height });
    if (onNodeResize) {
      onNodeResize(node.id, width, height);
    }
  };

  const handleTextUpdate = (newText: string) => {
    setText(newText);
    setCharCount(newText.length);
    setIsSaved(false);
    
    // Run validation
    const errors = validators.map(validator => validator(newText)).filter(Boolean) as string[];
    setValidationErrors(errors);
    
    if (onTextChange) {
      onTextChange(node.id, newText);
    }
    
    // Real-time markdown preview
    if (node.data.inputType === 'markdown') {
      updateMarkdownOutput(newText);
    }
    
    // Auto-save functionality
    if (node.data.autoSave && node.data.autoSaveDelay) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, node.data.autoSaveDelay);
    }
  };

  const handleSave = () => {
    if (onTextSave) {
      onTextSave(node.id, text);
    }
    setIsSaved(true);
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };

  const handleDuplicate = () => {
    if (onNodeDuplicate) {
      onNodeDuplicate(node.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFormat = (formatType: string) => {
    if (formatters[formatType]) {
      const formattedText = formatters[formatType](text);
      handleTextUpdate(formattedText);
    }
  };

  const executeCode = () => {
    try {
      // Create a safe execution environment for JavaScript
      if (node.data.language === 'javascript' || node.data.inputType === 'code') {
        // Execute the code directly and capture the result
        let result;
        // Check if it's a simple expression or function call
        if (text.includes('return') || text.includes('function')) {
          // If it contains a function definition, try to execute it
          const lastLine = text.split('\n').pop()?.trim();
          if (lastLine && !lastLine.startsWith('//') && !lastLine.startsWith('/*')) {
            // If last line looks like a function call, execute the full code
            result = eval(text);
          } else {
            // If it's just a function definition, execute it and call the function
            eval(text);
            // Try to find function name and call it
            const functionMatch = text.match(/function\s+(\w+)\s*\(/);
            if (functionMatch) {
              const functionName = functionMatch[1];
              result = eval(`${functionName}()`);
            } else {
              result = undefined;
            }
          }
        } else {
          // Simple expression
          result = eval(text);
        }
        setCodeOutput(result !== undefined ? String(result) : 'undefined');
      } else {
        // For other languages, show formatted output
        setCodeOutput(`Output (${node.data.language || 'code'}):\n${text}`);
      }
    } catch (error: any) {
      setCodeOutput(`Error: ${error.message}`);
    }
  };

  const updateMarkdownOutput = (markdownText: string) => {
    // Simple markdown to HTML conversion (basic implementation)
    let html = markdownText
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/`(.*)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
    
    setMarkdownOutput(html);
  };

  const getInputTypeIcon = () => {
    switch (node.data.inputType) {
      case 'code': return <Code className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'markdown': return <Edit3 className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getPlaceholderText = () => {
    if (node.data.placeholder) return node.data.placeholder;
    
    switch (node.data.inputType) {
      case 'code': return 'Enter your code here...';
      case 'note': return 'Add your note...';
      case 'comment': return 'Write a comment...';
      case 'markdown': return 'Write in markdown...';
      default: return 'Enter text...';
    }
  };

  const renderTextInput = () => {
    const commonProps = {
      value: text,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleTextUpdate(e.target.value),
      placeholder: getPlaceholderText(),
      readOnly: node.data.readOnly,
      maxLength: node.data.maxLength,
      className: cn(
        'w-full bg-transparent border-none outline-none resize-none',
        node.data.syntaxHighlighting && 'font-mono',
        node.data.textAlign === 'center' && 'text-center',
        node.data.textAlign === 'right' && 'text-right'
      ),
      style: {
        fontSize: node.data.fontSize || 14,
        fontFamily: node.data.fontFamily || 'inherit',
        color: node.data.textColor || 'inherit',
        lineHeight: 1.5,
      }
    };

    // Always use textarea for better text input experience
    return (
      <textarea
        ref={textareaRef}
        {...commonProps}
        className={cn(
          commonProps.className,
          'h-full min-h-[60px] p-3 whitespace-pre-wrap'
        )}
      />
    );
  };

  const renderPreview = () => {
    if (!text) return <div className="text-gray-400 p-3">No content to preview</div>;
    
    switch (node.data.inputType) {
      case 'code':
        return (
          <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm font-mono overflow-auto">
            <code>{text}</code>
          </pre>
        );
      case 'markdown':
        return (
          <div className="p-3 prose prose-sm max-w-none">
            {text.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        );
      default:
        return (
          <div className="p-3 whitespace-pre-wrap">
            {text}
          </div>
        );
    }
  };

  useEffect(() => {
    setCharCount(text.length);
    // Initialize markdown output for markdown nodes
    if (node.data.inputType === 'markdown') {
      updateMarkdownOutput(text);
    }
  }, [text]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={nodeRef}
      className={cn(
        'group relative bg-white dark:bg-gray-800 border-2 rounded-lg shadow-md transition-all duration-200',
        node.selected ? 'ring-2 ring-blue-500 shadow-lg' : '',
        'hover:shadow-lg'
      )}
      style={{
        width: nodeSize.width,
        height: nodeSize.height,
        borderColor: node.selected ? '#3b82f6' : node.data.borderColor || '#e5e7eb',
        backgroundColor: node.data.backgroundColor || '#ffffff',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {node.data.icon ? (
            <span className="text-lg">{node.data.icon}</span>
          ) : (
            getInputTypeIcon()
          )}
          <div>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {node.data.label || `${node.data.inputType || 'Text'} Input`}
            </h3>
            {node.data.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {node.data.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1">
          {customToolbar}
          
          {!node.data.readOnly && (node.data.inputType === 'markdown' || node.data.inputType === 'code') && (
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={isPreview ? 'Edit' : 'Preview'}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={handleDuplicate}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Duplicate Node"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {isPreview ? renderPreview() : renderTextInput()}
        </div>
        
        {/* Code/Markdown Output Footer */}
        {(node.data.inputType === 'code' || node.data.inputType === 'markdown') && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Run Button for Code */}
            {node.data.inputType === 'code' && (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={executeCode}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Run
                </button>
              </div>
            )}
            
            {/* Output Display */}
            <div 
              className="overflow-y-auto bg-gray-50 dark:bg-gray-900"
              style={{ 
                maxHeight: Math.max(120, (nodeSize.height - 200) * 0.3) // Scale with node height
              }}
            >
              {node.data.inputType === 'code' && codeOutput && (
                <pre className="p-3 text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {codeOutput}
                </pre>
              )}
              {node.data.inputType === 'markdown' && markdownOutput && (
                <div 
                  className="p-3 text-sm text-gray-800 dark:text-gray-200 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownOutput }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isSaved && (
              <span className="text-xs text-blue-500">Unsaved changes</span>
            )}
            {validationErrors.length > 0 && (
              <span className="text-xs text-red-500">
                {validationErrors.length} error(s)
              </span>
            )}
          </div>
          
          {node.data.showCharCount && (
            <span className="text-xs text-gray-500">
              {charCount}{node.data.maxLength ? `/${node.data.maxLength}` : ''} characters
            </span>
          )}
        </div>
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-1 space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-xs text-red-500">
                {error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Children */}
      {children}

      {/* Node Handles */}
      {(alwaysShowHandles || node.showHandles !== false) && (
        <NodeHandles
          node={node}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          nodeWidth={nodeSize.width}
          nodeHeight={nodeSize.height}
        />
      )}

      {/* Resize Handle */}
      {node.resizable && (
        <ResizeHandle
          position="bottom-right"
          nodeRef={nodeRef}
          onResize={handleResize}
          minWidth={250}
          minHeight={150}
        />
      )}
    </div>
  );
};