import { useState, useCallback } from 'react';
import { FileAuthorData, FilePermissions, FileState, ShareSettings, PendingInvite, FileAccess } from '../components/FileAuthorControls';

export interface FileAuthorControlsState {
  files: Record<string, FileState>;
  currentUser: FileAuthorData;
}

export interface FileAuthorControlsActions {
  lockFile: (fileId: string) => void;
  unlockFile: (fileId: string) => void;
  removeCollaborator: (fileId: string, userId: string) => void;
  addCollaborator: (fileId: string, user: FileAuthorData, permissions: FilePermissions) => void;
  rollback: (fileId: string, versionId: string) => void;
  changePermissions: (fileId: string, userId: string, permissions: FilePermissions) => void;
  createFile: (fileName: string, author: FileAuthorData) => string;
  deleteFile: (fileId: string) => void;
  updateShareSettings: (fileId: string, settings: ShareSettings) => void;
  inviteUser: (fileId: string, email: string, accessLevel: FileAccess, message?: string) => void;
  cancelInvite: (fileId: string, inviteId: string) => void;
  toggleReadOnly: (fileId: string) => void;
}

interface UseFileAuthorControlsOptions {
  currentUser: FileAuthorData;
  onFileStateChange?: (fileId: string, state: FileState) => void;
  onPermissionDenied?: (action: string, reason: string) => void;
}

export const useFileAuthorControls = (options: UseFileAuthorControlsOptions): [FileAuthorControlsState, FileAuthorControlsActions] => {
  const { currentUser, onFileStateChange, onPermissionDenied } = options;
  
  const [files, setFiles] = useState<Record<string, FileState>>({});

  const hasPermission = useCallback((fileId: string, permission: keyof FilePermissions): boolean => {
    const file = files[fileId];
    if (!file) return false;
    
    // Author has all permissions
    if (file.author.id === currentUser.id) return true;
    
    // Check specific permission
    const userPermissions = file.permissions[currentUser.id];
    return userPermissions?.[permission] || false;
  }, [files, currentUser.id]);

  const lockFile = useCallback((fileId: string) => {
    const file = files[fileId];
    if (!file) return;
    
    if (!hasPermission(fileId, 'canLock')) {
      onPermissionDenied?.('lock', 'You do not have permission to lock this file');
      return;
    }
    
    if (file.isLocked) {
      onPermissionDenied?.('lock', 'File is already locked');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      isLocked: true,
      lockedBy: currentUser,
      lockedAt: new Date(),
      // Ensure required properties exist
      shareSettings: file.shareSettings || {
        visibility: 'private',
        allowPublicEdit: false,
        requireSignIn: true,
        shareLink: `https://example.com/file/${fileId}`
      },
      isReadOnly: file.isReadOnly || false,
      pendingInvites: file.pendingInvites || []
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, hasPermission, currentUser, onPermissionDenied, onFileStateChange]);

  const unlockFile = useCallback((fileId: string) => {
    const file = files[fileId];
    if (!file) return;
    
    // Only the person who locked it or the author can unlock
    const canUnlock = file.author.id === currentUser.id || 
                     file.lockedBy?.id === currentUser.id ||
                     hasPermission(fileId, 'canLock');
    
    if (!canUnlock) {
      onPermissionDenied?.('unlock', 'You do not have permission to unlock this file');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      isLocked: false,
      lockedBy: undefined,
      lockedAt: undefined,
      // Ensure required properties exist
      shareSettings: file.shareSettings || {
        visibility: 'private',
        allowPublicEdit: false,
        requireSignIn: true,
        shareLink: `https://example.com/file/${fileId}`
      },
      isReadOnly: file.isReadOnly || false,
      pendingInvites: file.pendingInvites || []
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, hasPermission, currentUser, onPermissionDenied, onFileStateChange]);

  const removeCollaborator = useCallback((fileId: string, userId: string) => {
    const file = files[fileId];
    if (!file) return;
    
    if (!hasPermission(fileId, 'canManageCollaborators')) {
      onPermissionDenied?.('removeCollaborator', 'You do not have permission to manage collaborators');
      return;
    }
    
    // Cannot remove the author
    if (file.author.id === userId) {
      onPermissionDenied?.('removeCollaborator', 'Cannot remove the file author');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      collaborators: file.collaborators.filter(c => c.id !== userId),
      permissions: Object.fromEntries(
        Object.entries(file.permissions).filter(([id]) => id !== userId)
      ),
      // Ensure required properties exist
      shareSettings: file.shareSettings || {
        visibility: 'private',
        allowPublicEdit: false,
        requireSignIn: true,
        shareLink: `https://example.com/file/${fileId}`
      },
      isReadOnly: file.isReadOnly || false,
      pendingInvites: file.pendingInvites || []
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, hasPermission, onPermissionDenied, onFileStateChange]);

  const addCollaborator = useCallback((fileId: string, user: FileAuthorData, permissions: FilePermissions) => {
    const file = files[fileId];
    if (!file) return;
    
    if (!hasPermission(fileId, 'canManageCollaborators')) {
      onPermissionDenied?.('addCollaborator', 'You do not have permission to manage collaborators');
      return;
    }
    
    // Check if user is already a collaborator
    if (file.collaborators.some(c => c.id === user.id)) {
      onPermissionDenied?.('addCollaborator', 'User is already a collaborator');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      collaborators: [...file.collaborators, user],
      permissions: {
        ...file.permissions,
        [user.id]: permissions
      },
      // Ensure shareSettings and other required properties exist
      shareSettings: file.shareSettings || {
        visibility: 'private',
        allowPublicEdit: false,
        requireSignIn: true,
        shareLink: `https://example.com/file/${fileId}`
      },
      isReadOnly: file.isReadOnly || false,
      pendingInvites: file.pendingInvites || []
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, hasPermission, onPermissionDenied, onFileStateChange]);

  const rollback = useCallback((fileId: string, versionId: string) => {
    const file = files[fileId];
    if (!file) return;
    
    if (!hasPermission(fileId, 'canRollback')) {
      onPermissionDenied?.('rollback', 'You do not have permission to rollback changes');
      return;
    }
    
    // In a real implementation, this would rollback to the specified version
    console.log(`Rolling back file ${fileId} to version ${versionId}`);
    
    // For demo purposes, we'll just log the action
    onFileStateChange?.(fileId, file);
  }, [files, hasPermission, onPermissionDenied, onFileStateChange]);

  const changePermissions = useCallback((fileId: string, userId: string, permissions: FilePermissions) => {
    const file = files[fileId];
    if (!file) return;
    
    // Only the author can change permissions
    if (file.author.id !== currentUser.id) {
      onPermissionDenied?.('changePermissions', 'Only the file author can change permissions');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      permissions: {
        ...file.permissions,
        [userId]: permissions
      },
      // Ensure required properties exist
      shareSettings: file.shareSettings || {
        visibility: 'private',
        allowPublicEdit: false,
        requireSignIn: true,
        shareLink: `https://example.com/file/${fileId}`
      },
      isReadOnly: file.isReadOnly || false,
      pendingInvites: file.pendingInvites || []
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, currentUser.id, onPermissionDenied, onFileStateChange]);

  const createFile = useCallback((fileName: string, author: FileAuthorData): string => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newFile: FileState = {
      id: fileId,
      name: fileName,
      isLocked: false,
      isReadOnly: false,
      author,
      collaborators: [author],
      permissions: {
        [author.id]: {
          canEdit: true,
          canDelete: true,
          canLock: true,
          canManageCollaborators: true,
          canRollback: true,
          canChangePermissions: true,
          canView: true,
          canShare: true,
          canInvite: true
        }
      },
      shareSettings: {
        visibility: 'private',
        allowPublicEdit: false,
        requireSignIn: true,
        shareLink: `https://example.com/file/${fileId}`
      },
      pendingInvites: []
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: newFile
    }));
    
    onFileStateChange?.(fileId, newFile);
    return fileId;
  }, [onFileStateChange]);

  const deleteFile = useCallback((fileId: string) => {
    const file = files[fileId];
    if (!file) return;
    
    if (!hasPermission(fileId, 'canDelete')) {
      onPermissionDenied?.('deleteFile', 'You do not have permission to delete this file');
      return;
    }
    
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fileId];
      return newFiles;
    });
  }, [files, hasPermission, onPermissionDenied]);

  const updateShareSettings = useCallback((fileId: string, settings: ShareSettings) => {
    const file = files[fileId];
    if (!file) return;
    
    if (file.author.id !== currentUser.id && !hasPermission(fileId, 'canShare')) {
      onPermissionDenied?.('updateShareSettings', 'You do not have permission to change share settings');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      shareSettings: settings
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, currentUser.id, hasPermission, onPermissionDenied, onFileStateChange]);

  const inviteUser = useCallback((fileId: string, email: string, accessLevel: FileAccess, message?: string) => {
    const file = files[fileId];
    if (!file) return;
    
    if (!hasPermission(fileId, 'canInvite')) {
      onPermissionDenied?.('inviteUser', 'You do not have permission to invite users');
      return;
    }
    
    // Check if user is already invited or is a collaborator
    const existingCollaborator = file.collaborators.find(c => c.email === email);
    const existingInvite = file.pendingInvites.find(i => i.email === email);
    
    if (existingCollaborator) {
      onPermissionDenied?.('inviteUser', 'User is already a collaborator');
      return;
    }
    
    if (existingInvite) {
      onPermissionDenied?.('inviteUser', 'User already has a pending invite');
      return;
    }
    
    const invite: PendingInvite = {
      id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      accessLevel,
      invitedBy: currentUser,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      message
    };
    
    const updatedFile: FileState = {
      ...file,
      pendingInvites: [...file.pendingInvites, invite]
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
    
    // In a real implementation, send email invitation
    console.log(`Invitation sent to ${email} for file ${file.name}`);
  }, [files, currentUser, hasPermission, onPermissionDenied, onFileStateChange]);

  const cancelInvite = useCallback((fileId: string, inviteId: string) => {
    const file = files[fileId];
    if (!file) return;
    
    if (!hasPermission(fileId, 'canInvite')) {
      onPermissionDenied?.('cancelInvite', 'You do not have permission to cancel invites');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      pendingInvites: file.pendingInvites.filter(i => i.id !== inviteId)
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, hasPermission, onPermissionDenied, onFileStateChange]);

  const toggleReadOnly = useCallback((fileId: string) => {
    const file = files[fileId];
    if (!file) return;
    
    // Only author can toggle read-only mode
    if (file.author.id !== currentUser.id) {
      onPermissionDenied?.('toggleReadOnly', 'Only the file author can change read-only mode');
      return;
    }
    
    const updatedFile: FileState = {
      ...file,
      isReadOnly: !file.isReadOnly
    };
    
    setFiles(prev => ({
      ...prev,
      [fileId]: updatedFile
    }));
    
    onFileStateChange?.(fileId, updatedFile);
  }, [files, currentUser.id, onPermissionDenied, onFileStateChange]);

  const state: FileAuthorControlsState = {
    files,
    currentUser
  };

  const actions: FileAuthorControlsActions = {
    lockFile,
    unlockFile,
    removeCollaborator,
    addCollaborator,
    rollback,
    changePermissions,
    createFile,
    deleteFile,
    updateShareSettings,
    inviteUser,
    cancelInvite,
    toggleReadOnly
  };

  return [state, actions];
};