import { useState, useCallback } from 'react';
import { VersionData } from '../components/VersionPreview';

export interface VersionPreviewState {
  isPreviewMode: boolean;
  currentVersion: VersionData | null;
  previewVersion: VersionData | null;
  ghostOpacity: number;
}

export interface VersionPreviewActions {
  startPreview: (current: VersionData, preview: VersionData) => void;
  togglePreview: () => void;
  setGhostOpacity: (opacity: number) => void;
  rollback: () => void;
  cancel: () => void;
}

export const useVersionPreview = (
  onRollback?: (version: VersionData) => void,
  onCancel?: () => void
): [VersionPreviewState, VersionPreviewActions] => {
  const [state, setState] = useState<VersionPreviewState>({
    isPreviewMode: false,
    currentVersion: null,
    previewVersion: null,
    ghostOpacity: 0.6
  });

  const startPreview = useCallback((current: VersionData, preview: VersionData) => {
    setState(prev => ({
      ...prev,
      currentVersion: current,
      previewVersion: preview,
      isPreviewMode: true
    }));
  }, []);

  const togglePreview = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPreviewMode: !prev.isPreviewMode
    }));
  }, []);

  const setGhostOpacity = useCallback((opacity: number) => {
    setState(prev => ({
      ...prev,
      ghostOpacity: Math.max(0, Math.min(1, opacity))
    }));
  }, []);

  const rollback = useCallback(() => {
    if (state.previewVersion && onRollback) {
      onRollback(state.previewVersion);
    }
    setState(prev => ({
      ...prev,
      isPreviewMode: false,
      currentVersion: null,
      previewVersion: null
    }));
  }, [state.previewVersion, onRollback]);

  const cancel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPreviewMode: false,
      currentVersion: null,
      previewVersion: null
    }));
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const actions: VersionPreviewActions = {
    startPreview,
    togglePreview,
    setGhostOpacity,
    rollback,
    cancel
  };

  return [state, actions];
};