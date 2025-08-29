import { useCallback } from 'react';
import { useYjsAwareness } from '../collaboration/useYjsAwareness';
import { useYjs } from '../collaboration/YjsProvider';
import { CursorData } from '../components/LiveCursor';
import { CollaboratorData } from '../components/CollaborationPresence';

export interface CollaborationState {
  cursors: CursorData[];
  collaborators: CollaboratorData[];
  currentUser: CollaboratorData | null;
  isConnected: boolean;
}

export interface CollaborationActions {
  updateCursor: (position: { x: number; y: number }) => void;
  setUserStatus: (status: CollaboratorData['status']) => void;
  setCurrentAction: (action: CollaboratorData['currentAction'], element?: string) => void;
  addCollaborator: (collaborator: CollaboratorData) => void;
  removeCollaborator: (userId: string) => void;
  connect: () => void;
  disconnect: () => void;
}

interface UseLiveCollaborationOptions {
  userId: string;
  userName: string;
  userColor?: string;
  roomId?: string;
  autoConnect?: boolean;
  cursorUpdateThrottle?: number;
}

export const useLiveCollaboration = (options: UseLiveCollaborationOptions): [CollaborationState, CollaborationActions] => {
  const { isConnected, userId, userName, userColor } = useYjs();
  const [awarenessState, awarenessActions] = useYjsAwareness();

  // Convert Yjs awareness data to legacy format for compatibility
  const cursors: CursorData[] = awarenessState.cursors.map(user => ({
    id: `cursor-${user.id}`,
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    position: user.cursor,
    lastUpdate: user.lastSeen || Date.now(),
    isActive: true
  }));

  const collaborators: CollaboratorData[] = awarenessState.users.map(user => ({
    id: user.id,
    userName: user.name,
    userColor: user.color,
    status: 'active' as const,
    lastSeen: new Date(user.lastSeen || Date.now()),
    currentAction: 'viewing' as const
  }));

  const currentUser: CollaboratorData = {
    id: userId,
    userName,
    userColor,
    status: 'active',
    lastSeen: new Date(),
    currentAction: 'viewing'
  };

  const state: CollaborationState = {
    cursors,
    collaborators,
    currentUser,
    isConnected
  };

  const updateCursor = useCallback((position: { x: number; y: number }) => {
    awarenessActions.updateCursor(position);
  }, [awarenessActions]);

  const setUserStatus = useCallback((status: CollaboratorData['status']) => {
    // Status is handled by Yjs awareness automatically
    console.log('User status updated:', status);
  }, []);

  const setCurrentAction = useCallback((action: CollaboratorData['currentAction'], element?: string) => {
    // Action tracking can be extended with Yjs if needed
    console.log('Current action updated:', action, element);
  }, []);

  const addCollaborator = useCallback((collaborator: CollaboratorData) => {
    // Collaborators are automatically managed by Yjs awareness
    console.log('Collaborator added:', collaborator);
  }, []);

  const removeCollaborator = useCallback((collaboratorUserId: string) => {
    // Collaborators are automatically managed by Yjs awareness
    console.log('Collaborator removed:', collaboratorUserId);
  }, []);

  const connect = useCallback(() => {
    console.log('Connection managed by Yjs provider');
  }, []);

  const disconnect = useCallback(() => {
    console.log('Disconnection managed by Yjs provider');
  }, []);

  const actions: CollaborationActions = {
    updateCursor,
    setUserStatus,
    setCurrentAction,
    addCollaborator,
    removeCollaborator,
    connect,
    disconnect
  };

  return [state, actions];
};