import React from "react";
import { Button } from "@/components/ui/button";
import {
  Undo,
  Redo,
  Grid3x3,
  ZoomIn,
  Save,
  Lock,
  Unlock,
  LayoutGrid,
  Layers,
  GitBranch,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type LayoutType = "hierarchy" | "grid" | "radial" | "organic";

interface FlowActionsToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onAutoLayout?: (layoutType: LayoutType) => void;
  onFitView?: () => void;
  onSave?: () => void;
  onLockToggle?: () => void;
  isLocked?: boolean;
  className?: string;
}

export const FlowActionsToolbar: React.FC<FlowActionsToolbarProps> = ({
  onUndo,
  onRedo,
  onAutoLayout,
  onFitView,
  onSave,
  onLockToggle,
  isLocked = false,
  className = "",
}) => {
  const handleAutoLayout = (layoutType: string) => {
    if (onAutoLayout) {
      onAutoLayout(layoutType as LayoutType);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm sm:flex-row ${className}`}
    >
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!onUndo}
          className="h-8 w-8 p-0"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!onRedo}
          className="h-8 w-8 p-0"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

      {/* Auto Layout */}
      <Select onValueChange={handleAutoLayout}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue placeholder="Layout" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hierarchy">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Hierarchy
            </div>
          </SelectItem>
          <SelectItem value="grid">
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Grid
            </div>
          </SelectItem>
          <SelectItem value="radial">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Radial
            </div>
          </SelectItem>
          <SelectItem value="organic">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Organic
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Fit View */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onFitView}
        disabled={!onFitView}
        className="h-8 w-8 p-0"
        title="Fit View"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

      {/* Save */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSave}
        disabled={!onSave}
        className="h-8 w-8 p-0"
        title="Save"
      >
        <Save className="h-4 w-4" />
      </Button>

      {/* Lock Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onLockToggle}
        disabled={!onLockToggle}
        className="h-8 w-8 p-0"
        title={isLocked ? "Unlock" : "Lock"}
      >
        {isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
