import React, { useState, useRef, useEffect } from 'react';
import { MapIcon, X, Settings } from 'lucide-react';
import { MapNodeData } from './MapNode';

export interface MapSettingsPopoverProps {
  node: any;
  onSave?: (data: MapNodeData) => void;
  onClose?: () => void;
}

export const MapSettingsPopover: React.FC<MapSettingsPopoverProps> = ({ 
  node, 
  onSave = () => {}, 
  onClose = () => {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [address, setAddress] = useState(node.data.address || '');
  const [title, setTitle] = useState(node.data.title || '');
  const [zoom, setZoom] = useState(node.data.zoom || 12);
  const [mapStyle, setMapStyle] = useState(node.data.mapStyle || 'streets');
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const mouseDownRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const nodeRect = document.querySelector(`[data-node-id="${node.id}"]`)?.getBoundingClientRect();
      if (nodeRect) {
        setPopoverPosition({
          x: nodeRect.right + 10,
          y: nodeRect.top
        });
      }
    }
  }, [isOpen, node.id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === popoverRef.current || (e.target as Element).closest('.popover-drag-handle')) {
      setIsDragging(true);
      mouseDownRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && mouseDownRef.current) {
      const deltaX = e.clientX - mouseDownRef.current.x;
      const deltaY = e.clientY - mouseDownRef.current.y;
      
      setPopoverPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      mouseDownRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    mouseDownRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSave = () => {
    onSave({
      address,
      title,
      zoom,
      mapStyle: mapStyle as 'streets' | 'satellite' | 'outdoors' | 'light' | 'dark'
    });
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity"
        style={{ zIndex: 10 }}
      >
        <Settings className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50"
          style={{
            left: popoverPosition.x,
            top: popoverPosition.y,
            width: '300px',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="popover-drag-handle flex items-center justify-between mb-3 cursor-move">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapIcon className="w-4 h-4" />
              Map Settings
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Map title (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or location"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zoom Level
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
                onMouseDown={(e) => e.stopPropagation()}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {zoom} (1 = World, 20 = Building)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Map Style
              </label>
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option value="streets">Streets</option>
                <option value="satellite">Satellite</option>
                <option value="outdoors">Outdoors</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onMouseDown={(e) => e.stopPropagation()}
              >
                Save
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                onMouseDown={(e) => e.stopPropagation()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};