import React, { useState } from 'react';
import { Node } from '../types';
import { NodeHandles } from './NodeHandles';
import { cn } from '@/lib/utils';
import { Headphones, Play, Pause } from 'lucide-react';

interface OutputSoundNodeData {
  audioBuffer?: AudioBuffer;
  transformedBuffer?: AudioBuffer;
}

interface OutputSoundNodeProps {
  node: Node & { data: OutputSoundNodeData };
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

export function OutputSoundNode({ 
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
}: OutputSoundNodeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState<AudioBufferSourceNode | null>(null);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Get audio buffer from inputs if not in node data
    const inputAudioBuffer = inputs.length > 0 ? inputs[0] : null;
    const effectiveAudioBuffer = node.data.audioBuffer || inputAudioBuffer;
    const effectiveTransformedBuffer = node.data.transformedBuffer || (inputs.length > 1 ? inputs[1] : null);
    
    // Use transformed buffer if available, otherwise use original
    const buffer = effectiveTransformedBuffer || effectiveAudioBuffer;
    if (!buffer) {
      return;
    }

    try {
      if (isPlaying && currentSource) {
        // Stop current playback
        currentSource.stop();
        setCurrentSource(null);
        setIsPlaying(false);

      } else {
        // Start new playback
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          setCurrentSource(null);

        };
        
        source.start();
        setCurrentSource(source);
        setIsPlaying(true);

      }
    } catch (error) {
      console.error('🎧 OUTPUT: Error playing audio:', error);
      setIsPlaying(false);
      setCurrentSource(null);
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

  const { audioBuffer, transformedBuffer } = node.data;
  
  // Get audio buffer from inputs if not in node data
  const inputAudioBuffer = inputs.length > 0 ? inputs[0] : null;
  const effectiveAudioBuffer = audioBuffer || inputAudioBuffer;
  const effectiveTransformedBuffer = transformedBuffer || (inputs.length > 1 ? inputs[1] : null);
  
  const hasAudio = effectiveAudioBuffer || effectiveTransformedBuffer;
  const playbackBuffer = effectiveTransformedBuffer || effectiveAudioBuffer;

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
          <Headphones className="w-5 h-5 mr-2 text-purple-600" />
          <strong className="text-sm font-medium">Audio Output</strong>
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <button
              onClick={handlePlay}
              disabled={!hasAudio}
              className={cn(
                "w-full px-3 py-2 rounded text-sm font-medium flex items-center justify-center space-x-2 transition-colors",
                hasAudio
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Play Audio</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            {playbackBuffer && (
              <div className="text-xs text-purple-600">
                Ready: {playbackBuffer.duration.toFixed(2)}s
              </div>
            )}
            
            {effectiveTransformedBuffer && (
              <div className="text-xs text-green-600">
                ✓ Using transformed audio
              </div>
            )}
            
            {!hasAudio && (
              <div className="text-xs text-gray-500">
                No audio input detected
              </div>
            )}
            
            {isPlaying && (
              <div className="text-xs text-blue-600">
                🎵 Playing...
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