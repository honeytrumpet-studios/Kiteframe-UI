import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { Node, Edge } from '../types';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface HistoryContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveState: (nodes: Node[], edges: Edge[]) => void;
  clearHistory: () => void;
  historySize: number;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

interface HistoryProviderProps {
  children: React.ReactNode;
  maxHistorySize?: number;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  children,
  maxHistorySize = 50
}) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const saveState = useCallback((nodes: Node[], edges: Edge[]) => {
    // Don't save state if this is from an undo/redo operation
    if (isUndoRedoRef.current) return;

    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now()
    };

    setHistory(prev => {
      // Remove any states after current index (when user made changes after undo)
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add new state
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => prev - 1);
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      setCurrentIndex(prev => prev - 1);
      
      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setCurrentIndex(prev => prev + 1);
      
      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [currentIndex, history.length]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const value: HistoryContextType = {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    clearHistory,
    historySize: history.length
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export const useHistoryState = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryState must be used within a HistoryProvider');
  }
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  return {
    history,
    currentIndex,
    getCurrentState: () => history[currentIndex] || null,
    getPreviousState: () => history[currentIndex - 1] || null,
    getNextState: () => history[currentIndex + 1] || null
  };
};