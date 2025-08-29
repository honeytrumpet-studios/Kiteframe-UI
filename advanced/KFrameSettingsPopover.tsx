import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Node } from "../types";

interface KFrameSettingsPopoverProps {
  node: Node | null;
  onSave?: (node: Node) => void;
  onClose?: () => void;
  largeView?: boolean;
}

// Color palette options - keeping vibrant and greyscale as requested
const colorOptions = {
  vibrant: [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#22c55e" },
    { name: "Red", value: "#ef4444" },
    { name: "Yellow", value: "#eab308" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Aqua", value: "#06b6d4" },
  ],
  greyscale: [
    { name: "Black", value: "#000000" },
    { name: "Dark Grey", value: "#374151" },
    { name: "Light Grey", value: "#d1d5db" },
    { name: "White", value: "#ffffff" },
  ],
};

const borderStyles = [
  { name: "Solid", value: "solid" },
  { name: "Dashed", value: "dashed" },
  { name: "Dotted", value: "dotted" },
];

const labelPositions = [
  { name: "Top Left", value: "top-left" },
  { name: "Top", value: "top" },
  { name: "Top Right", value: "top-right" },
  { name: "Center", value: "center" },
  { name: "Bottom Left", value: "bottom-left" },
  { name: "Bottom", value: "bottom" },
  { name: "Bottom Right", value: "bottom-right" },
];

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export function KFrameSettingsPopover({
  node,
  onSave = () => {},
  onClose = () => {},
  largeView = false,
}: KFrameSettingsPopoverProps) {
  if (!node) {
    return null;
  }

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState(() => {
    // Calculate initial position next to the node
    const canvas = document.querySelector(
      "[data-kiteframe-canvas]",
    ) as HTMLElement;
    const canvasRect = canvas?.getBoundingClientRect();

    if (canvasRect) {
      return {
        x: canvasRect.left + canvasRect.width / 2,
        y: canvasRect.top + 100,
      };
    }

    return {
      x: window.innerWidth / 2,
      y: 100,
    };
  });

  // Use refs to store current values for stable callbacks
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const popoverPositionRef = useRef(popoverPosition);
  
  // Initialize state from current node properties
  const [localNode, setLocalNode] = useState(node);
  const [customBackgroundColor, setCustomBackgroundColor] = useState(() => {
    // Extract color from rgba background if present
    const currentBg = node.data?.style?.backgroundColor;
    if (currentBg && currentBg.startsWith('rgba')) {
      const match = currentBg.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
      if (match) {
        const [, r, g, b] = match;
        return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
      }
    }
    return currentBg || "#ffffff";
  });
  const [customBorderColor, setCustomBorderColor] = useState(node.data?.style?.borderColor || "#d1d5db");
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);

  useEffect(() => {
    if (node) {
      setLocalNode(node);
      // Update custom colors when node changes
      const currentBg = node.data?.style?.backgroundColor;
      if (currentBg && currentBg.startsWith('rgba')) {
        const match = currentBg.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
        if (match) {
          const [, r, g, b] = match;
          setCustomBackgroundColor(`#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`);
        }
      } else if (currentBg && currentBg.startsWith('#')) {
        setCustomBackgroundColor(currentBg);
      }
      
      if (node.data?.style?.borderColor) {
        setCustomBorderColor(node.data.style.borderColor);
      }
    }
  }, [node]);

  // Update position ref when position changes
  useEffect(() => {
    popoverPositionRef.current = popoverPosition;
  }, [popoverPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      (e.target as HTMLElement).closest(".popover-header") &&
      !isDraggingRef.current
    ) {
      const canvas = document.querySelector(
        "[data-kiteframe-canvas]",
      ) as HTMLElement;
      const canvasRect = canvas?.getBoundingClientRect();
      const canvasX = canvasRect?.left || 0;
      const canvasY = canvasRect?.top || 0;

      const newOffset = {
        x: e.clientX - (canvasX + popoverPositionRef.current.x),
        y: e.clientY - (canvasY + popoverPositionRef.current.y),
      };

      console.log("Starting drag with offset:", newOffset);

      setDragOffset(newOffset);
      dragOffsetRef.current = newOffset;
      setIsDragging(true);
      isDraggingRef.current = true;
    }
  };

  const handleMouseUp = () => {
    console.log("KFrameSettingsPopover mouseUp - releasing drag");
    setIsDragging(false);
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const canvas = document.querySelector(
      "[data-kiteframe-canvas]",
    ) as HTMLElement;
    const canvasRect = canvas?.getBoundingClientRect();
    const canvasX = canvasRect?.left || 0;
    const canvasY = canvasRect?.top || 0;

    const newPosition = {
      x: e.clientX - canvasX - dragOffsetRef.current.x,
      y: e.clientY - canvasY - dragOffsetRef.current.y,
    };

    setPopoverPosition(newPosition);
    popoverPositionRef.current = newPosition;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const popover = document.querySelector('.kframe-settings-popover');
      
      // Don't close if clicking on popover content or Select dropdown content
      if (popover && !popover.contains(target) && !target.closest('[data-radix-popper-content-wrapper]')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Real-time update function
  const updateNodeAndPropagate = (updatedNode: Node) => {
    setLocalNode(updatedNode);
    onSave(updatedNode);
  };

  const handleLabelChange = (value: string) => {
    const updatedNode = {
      ...localNode,
      data: {
        ...localNode.data,
        label: value,
      },
    };
    updateNodeAndPropagate(updatedNode);
  };

  const handleLabelPositionChange = (value: string) => {
    const updatedNode = {
      ...localNode,
      data: {
        ...localNode.data,
        labelPosition: value,
      },
    };
    updateNodeAndPropagate(updatedNode);
  };

  const handleColorChange = (property: string, value: string) => {
    if (property === "backgroundColor") {
      // Apply 10% opacity to background color for KFrames
      const rgbaColor = hexToRgba(value, 0.1);
      const updatedNode = {
        ...localNode,
        data: {
          ...localNode.data,
          style: {
            ...localNode.data?.style,
            backgroundColor: rgbaColor,
          },
        },
      };
      updateNodeAndPropagate(updatedNode);
    } else if (property === "borderColor") {
      const updatedNode = {
        ...localNode,
        data: {
          ...localNode.data,
          style: {
            ...localNode.data?.style,
            borderColor: value,
          },
        },
      };
      updateNodeAndPropagate(updatedNode);
    }
  };

  const handleBorderWidthChange = (value: number[]) => {
    const updatedNode = {
      ...localNode,
      data: {
        ...localNode.data,
        style: {
          ...localNode.data?.style,
          borderWidth: value[0],
        },
      },
    };
    updateNodeAndPropagate(updatedNode);
  };

  const handleBorderStyleChange = (value: string) => {
    const updatedNode = {
      ...localNode,
      data: {
        ...localNode.data,
        style: {
          ...localNode.data?.style,
          borderStyle: value as "solid" | "dashed" | "dotted",
        },
      },
    };
    updateNodeAndPropagate(updatedNode);
  };

  const handleSave = () => {
    onSave(localNode);
    onClose();
  };

  const content = (
    <div
      className={`kframe-settings-popover bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ${
        largeView
          ? "w-full max-w-2xl h-full max-h-[600px]"
          : "w-96 max-h-[500px]"
      } flex flex-col`}
      style={
        largeView
          ? {}
          : {
              position: "fixed",
              left: popoverPosition.x,
              top: popoverPosition.y,
              zIndex: 9999,
            }
      }
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="popover-header flex items-center justify-between px-2 py-1 bg-white border rounded shadow-sm cursor-move">
        <div className="flex items-center">
          <span className="px-2 py-1 font-medium text-gray-900 dark:text-gray-100">
            KFrame Settings
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <div>
          <Label
            htmlFor="kframe-label"
            className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100"
          >
            Label
          </Label>
          <Input
            id="kframe-label"
            value={localNode.data?.label || ""}
            onChange={(e) => {
              e.stopPropagation();
              handleLabelChange(e.target.value);
            }}
            onFocus={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Enter KFrame label"
            className="w-full"
          />
        </div>

        {/* Label Position */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Label Position
          </Label>
          <Select
            value={localNode.data?.labelPosition || "top"}
            onValueChange={handleLabelPositionChange}
          >
            <SelectTrigger onMouseDown={(e) => e.stopPropagation()}>
              <SelectValue placeholder="Select label position" />
            </SelectTrigger>
            <SelectContent style={{ zIndex: 10000 }}>
              {labelPositions.map((position) => (
                <SelectItem key={position.value} value={position.value}>
                  {position.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Background Color */}
        <div>
          <Label className="text-sm font-medium mb-3 block text-gray-900 dark:text-gray-100">
            Background Color
          </Label>
          
          {/* Vibrant Colors */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Vibrant
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {colorOptions.vibrant.map((color) => (
                <button
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange("backgroundColor", color.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={`${color.name} (10% opacity)`}
                />
              ))}
            </div>
          </div>

          {/* Greyscale Colors */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Greyscale
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {colorOptions.greyscale.map((color) => (
                <button
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange("backgroundColor", color.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={`${color.name} (10% opacity)`}
                />
              ))}
            </div>
          </div>

          {/* Custom Background Color Picker */}
          <Popover
            open={showBackgroundColorPicker}
            onOpenChange={setShowBackgroundColorPicker}
          >
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400"
                title="Custom color (10% opacity)"
              />
            </PopoverTrigger>
            <PopoverContent className="w-64" side="right">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Custom Background Color</Label>
                <input
                  type="color"
                  value={customBackgroundColor}
                  onChange={(e) => {
                    setCustomBackgroundColor(e.target.value);
                    handleColorChange("backgroundColor", e.target.value);
                  }}
                  className="w-full h-10 rounded border"
                />
                <p className="text-xs text-gray-500">Applied at 10% opacity</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Separator />

        {/* Border Settings */}
        <div>
          <Label className="text-sm font-medium mb-3 block text-gray-900 dark:text-gray-100">
            Border Color
          </Label>
          
          {/* Vibrant Border Colors */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Vibrant
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {colorOptions.vibrant.map((color) => (
                <button
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange("borderColor", color.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Greyscale Border Colors */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Greyscale
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {colorOptions.greyscale.map((color) => (
                <button
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange("borderColor", color.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Border Color Picker */}
          <Popover
            open={showBorderColorPicker}
            onOpenChange={setShowBorderColorPicker}
          >
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400"
                title="Custom border color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-64" side="right">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Custom Border Color</Label>
                <input
                  type="color"
                  value={customBorderColor}
                  onChange={(e) => {
                    setCustomBorderColor(e.target.value);
                    handleColorChange("borderColor", e.target.value);
                  }}
                  className="w-full h-10 rounded border"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Border Width */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Border Width: {localNode.data?.style?.borderWidth || 2}px
          </Label>
          <Slider
            value={[localNode.data?.style?.borderWidth || 2]}
            onValueChange={handleBorderWidthChange}
            max={8}
            min={0}
            step={1}
            className="w-full"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>

        {/* Border Style */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
            Border Style
          </Label>
          <Select
            value={localNode.data?.style?.borderStyle || "dashed"}
            onValueChange={handleBorderStyleChange}
          >
            <SelectTrigger onMouseDown={(e) => e.stopPropagation()}>
              <SelectValue placeholder="Select border style" />
            </SelectTrigger>
            <SelectContent style={{ zIndex: 10000 }}>
              {borderStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  if (largeView) {
    return content;
  }

  return <div>{content}</div>;
}