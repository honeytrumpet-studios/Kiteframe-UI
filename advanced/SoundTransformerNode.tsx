import React, { useState, useEffect } from 'react';
import { Node } from '../types';
import { NodeHandles } from './NodeHandles';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';

interface SoundTransformerNodeData {
  audioBuffer?: AudioBuffer;
  transformedBuffer?: AudioBuffer;
  transform?: string;
}

interface SoundTransformerNodeProps {
  node: Node & { data: SoundTransformerNodeData };
  onDrag: (nodeId: string, position: { x: number; y: number }) => void;
  onClick?: (event: React.MouseEvent, node: Node) => void;
  onDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeSettingsChange?: (nodeId: string, updates: Partial<Node['data']>) => void;
  viewport?: { x: number; y: number; zoom: number };
  onConnectStart?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  inputs?: any[];
}

export function SoundTransformerNode({ 
  node, 
  onDrag, 
  onClick, 
  onDoubleClick, 
  onNodeSettingsChange, 
  viewport = { x: 0, y: 0, zoom: 1 }, 
  onConnectStart, 
  onConnectEnd, 
  alwaysShowHandles = false, 
  onNodeResize,
  inputs = []
}: SoundTransformerNodeProps) {
  const [transform, setTransform] = useState<string>(node.data.transform || '');
  
  const transformOptions = [
    { name: 'Select transformation...', value: '' },
    { name: 'Gain Boost', value: 'gain' },
    { name: 'Low Pass Filter', value: 'filter' },
    { name: 'Delay Effect', value: 'delay' }
  ];

  const applyTransform = async (audioBuffer: AudioBuffer, transformType: string): Promise<AudioBuffer> => {
    if (!audioBuffer || !transformType) return audioBuffer;

    try {
      const audioCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
        1,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      let node;

      switch (transformType) {
        case 'gain':
          node = audioCtx.createGain();
          node.gain.value = 1.5;
          break;
        case 'filter':
          node = audioCtx.createBiquadFilter();
          node.type = 'lowpass';
          node.frequency.value = 1000;
          break;
        case 'delay':
          node = audioCtx.createDelay(5.0);
          node.delayTime.value = 0.5;
          break;
        default:
          node = null;
      }

      if (node) {
        source.connect(node);
        node.connect(audioCtx.destination);
      } else {
        source.connect(audioCtx.destination);
      }

      source.start();
      return await audioCtx.startRendering();
    } catch (error) {
      console.error('🎛️ TRANSFORMER: Error applying transform:', error);
      return audioBuffer;
    }
  };

  const handleTransformChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const transformType = e.target.value;

    
    setTransform(transformType);
    
    if (onNodeSettingsChange) {
      const updates: Partial<Node['data']> = { transform: transformType };
      
      // If we have an audio buffer, apply the transformation
      if (node.data.audioBuffer && transformType) {
        try {
          const transformedBuffer = await applyTransform(node.data.audioBuffer, transformType);
          updates.transformedBuffer = transformedBuffer;

        } catch (error) {
          console.error('🎛️ TRANSFORMER: Error during transformation:', error);
        }
      }
      
      onNodeSettingsChange(node.id, updates);
    }
  };

  // Apply transformation when audio buffer changes or inputs change
  useEffect(() => {
    const processAudio = async () => {
      try {
        // Get audio buffer from inputs or node data
        let audioBuffer = node.data.audioBuffer;
        
        // If no local audio buffer, try to get from connected inputs
        if (!audioBuffer && inputs.length > 0) {
          audioBuffer = inputs[0]; // Assume first input is audio buffer
        }
        
        if (audioBuffer && transform) {
          const transformedBuffer = await applyTransform(audioBuffer, transform);
          if (onNodeSettingsChange) {
            onNodeSettingsChange(node.id, { 
              audioBuffer, // Store the input audio buffer
              transformedBuffer 
            });

          }
        }
      } catch (error) {
        console.error('🎛️ TRANSFORMER: Error in effect transformation:', error);
      }
    };
    
    processAudio();
  }, [node.data.audioBuffer, transform, inputs]);

  const handleClick = (e: React.MouseEvent) => {
    // Check if the click is on an interactive element
    const target = e.target as HTMLElement;
    if (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'BUTTON' || 
        target.closest('select') || target.closest('input') || target.closest('button')) {
      return;
    }
    
    if (onClick && node.selectable !== false) {
      onClick(e, node);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'SELECT' || target.tagName === 'INPUT' || target.tagName === 'BUTTON' || 
        target.closest('select') || target.closest('input') || target.closest('button')) {
      return;
    }
    
    if (onDoubleClick && node.doubleClickable !== false) {
      onDoubleClick(e, node);
    }
  };

  const { audioBuffer, transformedBuffer } = node.data;
  
  // Get audio buffer from inputs if not in node data
  const inputAudioBuffer = inputs.length > 0 ? inputs[0] : null;
  const effectiveAudioBuffer = audioBuffer || inputAudioBuffer;

  return (
    <div
      className={cn(
        "shadow-sm hover:shadow-md transition-shadow kiteframe-node group select-none",
        node.selected && "ring-2 ring-blue-500 kiteframe-node-selected"
      )}
      data-node-id={node.id}
      style={{
        width: `${node.style?.width || 200}px`,
        height: `${node.style?.height || 160}px`,
        minWidth: '200px',
        minHeight: '160px',
        backgroundColor: node.data.color || 'var(--card)',
        borderColor: node.data.borderColor || 'var(--border)',
        borderWidth: `${node.data.borderWidth || 1}px`,
        borderStyle: node.data.borderStyle || 'solid',
        borderRadius: `${node.data.borderRadius || 8}px`,
        userSelect: 'none',
        boxSizing: 'border-box',
        cursor: node.draggable !== false ? 'grab' : 'default',
        position: 'relative'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="node-content p-4 flex flex-col h-full">
        <div className="flex items-center mb-3">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          <strong className="text-sm font-medium">Sound Transformer</strong>
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <label className="block text-xs font-medium mb-1">Transform</label>
            <select
              value={transform}
              onChange={handleTransformChange}
              className="w-full px-2 py-1 border rounded text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {transformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            {effectiveAudioBuffer && (
              <div className="text-xs text-blue-600">
                Input: {effectiveAudioBuffer.duration.toFixed(2)}s
              </div>
            )}
            
            {transformedBuffer && (
              <div className="text-xs text-green-600">
                ✓ Transformed: {transformedBuffer.duration.toFixed(2)}s
              </div>
            )}
            
            {transform && (
              <div className="text-xs text-purple-600">
                Effect: {transformOptions.find(opt => opt.value === transform)?.name || transform}
              </div>
            )}
            
            {!effectiveAudioBuffer && (
              <div className="text-xs text-gray-500">
                No audio input detected
              </div>
            )}
          </div>
        </div>
      </div>

      <NodeHandles 
        node={node} 
        nodeWidth={node.style?.width || 200}
        nodeHeight={node.style?.height || 160}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        alwaysShowHandles={alwaysShowHandles}
      />
    </div>
  );
}