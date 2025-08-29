import React, { useState, useEffect, useRef } from 'react';
import { Node } from '../types';
import { NodeHandles } from './NodeHandles';
import { cn } from '@/lib/utils';
import { Volume2, Upload } from 'lucide-react';

interface InputSoundNodeData {
  audioBuffer?: AudioBuffer;
  selectedSound?: string;
  audioFile?: File;
}

interface InputSoundNodeProps {
  node: Node & { data: InputSoundNodeData };
  onDrag: (nodeId: string, position: { x: number; y: number }) => void;
  onClick?: (event: React.MouseEvent, node: Node) => void;
  onDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeSettingsChange?: (nodeId: string, updates: Partial<Node['data']>) => void;
  viewport?: { x: number; y: number; zoom: number };
  onConnectStart?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  onConnectEnd?: (nodeId: string, handlePosition: 'top' | 'bottom' | 'left' | 'right', event: React.MouseEvent) => void;
  alwaysShowHandles?: boolean;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
}

export function InputSoundNode({ 
  node, 
  onDrag, 
  onClick, 
  onDoubleClick, 
  onNodeSettingsChange, 
  viewport = { x: 0, y: 0, zoom: 1 }, 
  onConnectStart, 
  onConnectEnd, 
  alwaysShowHandles = false, 
  onNodeResize 
}: InputSoundNodeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSound, setSelectedSound] = useState<string>(node.data.selectedSound || '');
  
  // Sound library options
  const soundLibrary = [
    { name: 'Select from library...', value: '' },
    { name: 'Sine Wave (440Hz)', value: 'sine-440' },
    { name: 'Square Wave (440Hz)', value: 'square-440' },
    { name: 'Sawtooth Wave (440Hz)', value: 'sawtooth-440' },
    { name: 'White Noise', value: 'white-noise' },
    { name: 'Chirp Sound', value: 'chirp' }
  ];

  const generateAudioBuffer = async (soundType: string): Promise<AudioBuffer> => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioCtx.sampleRate;
    const duration = 2; // 2 seconds
    const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      
      switch (soundType) {
        case 'sine-440':
          data[i] = Math.sin(2 * Math.PI * 440 * time) * 0.3;
          break;
        case 'square-440':
          data[i] = Math.sign(Math.sin(2 * Math.PI * 440 * time)) * 0.3;
          break;
        case 'sawtooth-440':
          data[i] = (2 * (440 * time - Math.floor(440 * time + 0.5))) * 0.3;
          break;
        case 'white-noise':
          data[i] = (Math.random() * 2 - 1) * 0.3;
          break;
        case 'chirp':
          const frequency = 200 + (time / duration) * 1000;
          data[i] = Math.sin(2 * Math.PI * frequency * time) * 0.3;
          break;
      }
    }
    
    return buffer;
  };

  const handleSoundSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const soundType = e.target.value;

    
    if (!soundType) {
      setSelectedSound('');
      return;
    }
    
    try {
      const audioBuffer = await generateAudioBuffer(soundType);
      setSelectedSound(soundType);
      
      if (onNodeSettingsChange) {
        onNodeSettingsChange(node.id, { 
          audioBuffer, 
          selectedSound: soundType 
        });

      }
    } catch (error) {
      console.error('🔊 INPUT: Error generating audio:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      setSelectedSound('');
      
      if (onNodeSettingsChange) {
        onNodeSettingsChange(node.id, { 
          audioBuffer, 
          selectedSound: '',
          audioFile: file 
        });

      }
    } catch (error) {
      console.error('🔊 INPUT: Error loading audio file:', error);
    }
  };

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

  const { audioBuffer, audioFile } = node.data;

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
          <Volume2 className="w-5 h-5 mr-2 text-green-600" />
          <strong className="text-sm font-medium">Audio Input</strong>
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <label className="block text-xs font-medium mb-1">Sound Library</label>
            <select
              value={selectedSound}
              onChange={handleSoundSelect}
              className="w-full px-2 py-1 border rounded text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {soundLibrary.map((sound) => (
                <option key={sound.value} value={sound.value}>
                  {sound.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Or Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="w-full px-2 py-1 border rounded text-xs hover:bg-gray-50 flex items-center justify-center"
            >
              <Upload className="w-3 h-3 mr-1" />
              Choose File
            </button>
          </div>

          {audioBuffer && (
            <div className="text-xs text-green-600">
              ✓ Audio loaded: {audioBuffer.duration.toFixed(2)}s
            </div>
          )}
          
          {audioFile && (
            <div className="text-xs text-blue-600">
              File: {audioFile.name}
            </div>
          )}
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