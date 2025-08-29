import { useState, useCallback } from 'react';

interface UseMultiSelectOptions {
  maxSelection?: number;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const useMultiSelect = (options: UseMultiSelectOptions = {}) => {
  const { maxSelection, onSelectionChange } = options;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string, isMultiSelect: boolean = false) => {
    console.log('DEBUG: toggleSelection called with id:', id, 'isMultiSelect:', isMultiSelect);
    setSelectedIds(prev => {
      console.log('DEBUG: Previous selectedIds:', prev);
      let newSelection: string[];
      
      if (isMultiSelect) {
        // Multi-select mode (shift/ctrl key held)
        console.log('DEBUG: Multi-select mode');
        if (prev.includes(id)) {
          // Remove from selection
          newSelection = prev.filter(selectedId => selectedId !== id);
          console.log('DEBUG: Removing from selection, new:', newSelection);
        } else {
          // Add to selection
          newSelection = [...prev, id];
          console.log('DEBUG: Adding to selection, new:', newSelection);
          
          // Respect max selection limit
          if (maxSelection && newSelection.length > maxSelection) {
            newSelection = newSelection.slice(-maxSelection);
            console.log('DEBUG: Respecting max selection limit, new:', newSelection);
          }
        }
      } else {
        // Single select mode
        console.log('DEBUG: Single select mode');
        if (prev.includes(id) && prev.length === 1) {
          // If only this item is selected, deselect it
          newSelection = [];
          console.log('DEBUG: Deselecting single item');
        } else {
          // Select only this item
          newSelection = [id];
          console.log('DEBUG: Selecting single item');
        }
      }
      
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      console.log('DEBUG: Final selectedIds:', newSelection);
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