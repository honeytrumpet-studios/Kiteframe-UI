import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Settings, Upload, Link, Palette, Layout, AlignCenter } from 'lucide-react';
import type { Node } from '../types';

interface GraphicSettingsPopoverProps {
  node: Node;
  onSave: (nodeId: string, updates: Partial<Node>) => void;
  onClose: () => void;
}

export const GraphicSettingsPopover: React.FC<GraphicSettingsPopoverProps> = ({
  node,
  onSave,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    label: node.data.label || '',
    description: node.data.description || '',
    src: node.data.src || '',
    alt: node.data.alt || '',
    caption: node.data.caption || '',
    fit: node.data.fit || 'cover',
    alignment: node.data.alignment || 'center',
    borderRadius: node.data.borderRadius || 0,
    showCaption: node.data.showCaption || false,
    backgroundColor: node.data.backgroundColor || '#ffffff',
    borderColor: node.data.borderColor || '#e5e7eb',
    overlayColor: node.data.overlayColor || '#000000',
    overlayOpacity: node.data.overlayOpacity || 0,
  });

  const handleSave = () => {
    onSave(node.id, {
      data: {
        ...node.data,
        ...formData,
      },
    });
    setIsOpen(false);
    onClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div
        ref={popoverRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-96 max-h-[500px] overflow-hidden"
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
        }}
      >
        {/* Header */}
        <div
          ref={dragHandleRef}
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-move"
          onMouseDown={(e) => {
            if (popoverRef.current) {
              const rect = popoverRef.current.getBoundingClientRect();
              setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
              setIsDragging(true);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Graphic Settings
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
              placeholder="Enter label"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
              placeholder="Enter description"
            />
          </div>

          {/* Image Source */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Image URL
            </label>
            <input
              type="url"
              value={formData.src}
              onChange={(e) => handleInputChange('src', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Image Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fit
              </label>
              <select
                value={formData.fit}
                onChange={(e) => handleInputChange('fit', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="scale-down">Scale Down</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Alignment
              </label>
              <select
                value={formData.alignment}
                onChange={(e) => handleInputChange('alignment', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showCaption"
                checked={formData.showCaption}
                onChange={(e) => handleInputChange('showCaption', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showCaption" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Caption
              </label>
            </div>
            {formData.showCaption && (
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                placeholder="Enter caption"
              />
            )}
          </div>

          {/* Styling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Border Radius
              </label>
              <input
                type="number"
                value={formData.borderRadius}
                onChange={(e) => handleInputChange('borderRadius', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                min="0"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overlay Opacity
              </label>
              <input
                type="number"
                value={formData.overlayOpacity}
                onChange={(e) => handleInputChange('overlayOpacity', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Color
              </label>
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Border Color
              </label>
              <input
                type="color"
                value={formData.borderColor}
                onChange={(e) => handleInputChange('borderColor', e.target.value)}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          </div>

          {formData.overlayOpacity > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overlay Color
              </label>
              <input
                type="color"
                value={formData.overlayColor}
                onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={handleClose}
            className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};