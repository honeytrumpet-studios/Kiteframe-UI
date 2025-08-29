import { useState, useCallback } from 'react';

interface UseMultiSelectOptions {
  maxSelection?: number;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const useMultiSelect = (options: UseMultiSelectOptions = {}) => {
  const { maxSelection, onSelectionChange } = options;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string, isMultiSelect: boolean = false) => {
    setSelectedIds(prev => {
      let newSelection: string[];
      
      if (isMultiSelect) {
        // Multi-select mode (shift/ctrl key held)
        if (prev.includes(id)) {
          // Remove from selection
          newSelection = prev.filter(selectedId => selectedId !== id);
        } else {
          // Add to selection
          newSelection = [...prev, id];
          
          // Respect max selection limit
          if (maxSelection && newSelection.length > maxSelection) {
            newSelection = newSelection.slice(-maxSelection);
          }
        }
      } else {
        // Single select mode
        if (prev.includes(id) && prev.length === 1) {
          // If only this item is selected, deselect it
          newSelection = [];
        } else {
          // Select only this item
          newSelection = [id];
        }
      }
      
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  }, [maxSelection, onSelectionChange]);

  const selectRange = useCallback((startId: string, endId: string, allIds: string[]) => {
    const startIndex = allIds.indexOf(startId);
    const endIndex = allIds.indexOf(endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    const rangeIds = allIds.slice(start, end + 1);
    
    setSelectedIds(prev => {
      const newSelection = [...new Set([...prev, ...rangeIds])];
      
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  }, [onSelectionChange]);

  const selectAll = useCallback((allIds: string[]) => {
    const newSelection = maxSelection ? allIds.slice(0, maxSelection) : allIds;
    setSelectedIds(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [maxSelection, onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  const selectMultiple = useCallback((ids: string[]) => {
    const newSelection = maxSelection ? ids.slice(0, maxSelection) : ids;
    setSelectedIds(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [maxSelection, onSelectionChange]);

  const getSelectedCount = useCallback(() => {
    return selectedIds.length;
  }, [selectedIds]);

  return {
    selectedIds,
    toggleSelection,
    selectRange,
    selectAll,
    selectMultiple,
    clearSelection,
    isSelected,
    getSelectedCount
  };
};