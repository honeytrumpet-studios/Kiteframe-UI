import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/UserAuthProvider';
import { collaborationLogger } from '../../collaboration-logger';
import { UserIdentityService } from '../../collaboration/UserIdentityService';

interface YjsContextType {
  doc: Y.Doc;
  provider: WebsocketProvider | null;
  awareness: any;
  isConnected: boolean;
  userId: string;
  userName: string;
  userColor: string;
  setUserName: (name: string) => void;
  setUserColor: (color: string) => void;
  userCount: number;
  isMultiUser: boolean;
}

const YjsContext = createContext<YjsContextType | null>(null);

export const useYjs = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjs must be used within a YjsProvider');
  }
  return context;
};

interface YjsProviderProps {
  children: React.ReactNode;
  roomId: string;
  userId?: string;
  userName?: string;
  userColor?: string;
  serverUrl?: string;
}

// Legacy emoji system - keeping for backward compatibility during migration
// TODO: Remove after full migration to UserIdentityService
const LEGACY_EMOJI_AVATARS = ['🍌', '🚀', '🎨', '⚡', '🌟', '🎯', '🦄', '🐝', '🎪', '🌈', '🔥', '💎', '🎳', '🦋', '🎭', '🌺', '🎸', '🦊', '🌙', '⭐'];
const LEGACY_FUN_DESCRIPTORS = ['goofy', 'clever', 'swift', 'bright', 'cheerful', 'brave', 'witty', 'bold', 'curious', 'creative', 'friendly', 'happy', 'silly', 'smart', 'cool', 'awesome', 'funny', 'amazing', 'super', 'magical'];

export const YjsProvider: React.FC<YjsProviderProps> = ({
  children,
  roomId,
  userId,
  userName = 'Anonymous',
  userColor = '#3b82f6',
  serverUrl = window.location.origin.replace(/^http/, 'ws') + '/yjs'
}) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserName, setCurrentUserName] = useState(userName);
  const [currentUserColor, setCurrentUserColor] = useState(userColor);
  const [awarenessReady, setAwarenessReady] = useState(false);
  const [userCount, setUserCount] = useState(1);
  const [isMultiUser, setIsMultiUser] = useState(false);
  
  // Stable anonymous ID generation - only generate once per component instance
  const stableAnonymousIdRef = useRef<string | null>(null);
  if (!stableAnonymousIdRef.current) {
    stableAnonymousIdRef.current = `anonymous-${uuidv4()}`;
  }
  
  // Use Firebase UID if authenticated, otherwise use provided userId, otherwise use stable anonymous ID
  const effectiveUserId = authUser?.uid || userId || stableAnonymousIdRef.current;
  
  // Get emoji avatar info for anonymous users using unified service
  const avatarInfo = UserIdentityService.getUserAvatarInfo(effectiveUserId, isAuthenticated);
  

  
  const doc = useMemo(() => new Y.Doc(), []);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const awarenessRef = useRef<any>(null);

  useEffect(() => {
    try {
      // Create WebSocket provider with better connection management
      const provider = new WebsocketProvider(serverUrl, roomId, doc, {
        connect: false, // Don't auto-connect to avoid immediate errors
        // Note: y-websocket doesn't support these options, but we handle stability elsewhere
      });

      providerRef.current = provider;
      
      // Set awareness immediately - it's available after provider creation
      awarenessRef.current = provider.awareness;
      
      // Wait for provider to be ready before setting awareness as ready
      const checkAwarenessReady = () => {
        if (provider.awareness && provider.awareness.on && typeof provider.awareness.on === 'function') {
          setAwarenessReady(true);
          
          // Set initial user awareness using unified identity service
          const collaborationUser = UserIdentityService.createCollaborationUser({
            id: effectiveUserId,
            authUser,
            isAuthenticated,
            isCurrentUser: true,
            customColor: currentUserColor
          });
              
          provider.awareness.setLocalStateField('user', {
            id: collaborationUser.id,
            name: collaborationUser.displayName,
            color: collaborationUser.color,
            cursor: null,
            isAuthenticated: collaborationUser.isAuthenticated,
            photoURL: collaborationUser.photoURL,
            lastSeen: Date.now(),
            // Add avatar info for better cursor display
            emoji: collaborationUser.emoji,
            descriptor: collaborationUser.descriptor
          });
          
          // Track user count changes for collaboration optimization
          provider.awareness.on('change', () => {
            const users = provider.awareness.getStates();
            const activeUsers = Array.from(users.values()).filter((state: any) => 
              state.user && (Date.now() - (state.user.lastSeen || 0)) < 30000 // Active within 30 seconds
            );
            const count = activeUsers.length;
            setUserCount(count);
            setIsMultiUser(count > 1);
            
            if (count > 1) {
              console.log(`Collaboration active: ${count} users connected`);
            }
          });
          
          console.log('Yjs awareness initialized successfully');
        }
      };
      
      // Check awareness readiness
      checkAwarenessReady();
      
      // Try to connect with error handling and auto-reconnect
      try {
        let reconnectTimeout: NodeJS.Timeout | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10;
        const baseReconnectDelay = 1000; // Start with 1 second
        
        const attemptReconnect = () => {
          if (reconnectAttempts >= maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
          }
          
          const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
          reconnectAttempts++;
          
          console.log(`Attempting to reconnect (attempt ${reconnectAttempts}/${maxReconnectAttempts}) in ${delay}ms...`);
          reconnectTimeout = setTimeout(() => {
            if (providerRef.current && !providerRef.current.wsconnected) {
              providerRef.current.connect();
            }
          }, delay);
        };
        
        // Listen for connection status changes
        provider.on('status', ({ status }: { status: string }) => {
          setIsConnected(status === 'connected');
          
          if (status === 'connected') {
            collaborationLogger.connection.connected({ roomId, userId: effectiveUserId });
            reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            if (reconnectTimeout) {
              clearTimeout(reconnectTimeout);
              reconnectTimeout = null;
            }
            checkAwarenessReady();
          } else if (status === 'disconnected') {
            collaborationLogger.connection.disconnected({ roomId, userId: effectiveUserId });
            // Attempt to reconnect
            attemptReconnect();
          } else if (status === 'connecting') {
            collaborationLogger.connection.connecting({ roomId, userId: effectiveUserId });
          }
        });

        provider.on('connection-error', (error: any) => {
          collaborationLogger.connection.error(error?.message || 'Unknown error', { roomId, userId: effectiveUserId });
          // Attempt reconnection on error
          if (!providerRef.current?.wsconnected) {
            attemptReconnect();
          }
        });

        provider.on('connection-close', () => {
          console.log('Yjs connection closed');
          setIsConnected(false);
          // Attempt to reconnect
          attemptReconnect();
        });
        
        // Initial connection
        provider.connect();
      } catch (connectionError) {
        console.warn('WebSocket connection failed, running in offline mode:', connectionError);
        // Awareness still works without WebSocket connection
      }

      // Component unmount cleanup
      return () => {
        const provider = providerRef.current;
        if (!provider) return;

        // Clear presence and close socket
        try {
          provider.awareness.setLocalState(null);
          provider.disconnect();
          provider.destroy();
        } catch (e) {
          console.warn('Error during Yjs cleanup:', e);
        }
      };
    } catch (error) {
      console.error('Error initializing Yjs provider:', error);
    }
  }, [roomId, serverUrl]); // ← drop "doc" so we don't re-create on every render

  // Add beforeunload handler for page unload cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      const provider = providerRef.current;
      if (provider) {
        try {
          provider.awareness.setLocalState(null);
          provider.disconnect();
          console.log('Yjs cleanup on page unload');
        } catch (e) {
          console.warn('Error during beforeunload cleanup:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  
  // Add periodic heartbeat to keep awareness fresh and detect stale connections
  useEffect(() => {
    if (!awarenessRef.current || !awarenessReady) return;
    
    const heartbeatInterval = setInterval(() => {
      if (awarenessRef.current && providerRef.current) {
        // Update lastSeen to keep user active
        awarenessRef.current.setLocalStateField('user', {
          id: effectiveUserId,
          name: authUser?.displayName || authUser?.email?.split('@')[0] || currentUserName,
          color: currentUserColor,
          cursor: null,
          isAuthenticated: isAuthenticated,
          photoURL: authUser?.photoURL || null,
          lastSeen: Date.now()
        });
        
        // Check connection health
        if (providerRef.current && !providerRef.current.wsconnected && isConnected) {
          console.warn('WebSocket appears disconnected, triggering reconnect...');
          providerRef.current.connect();
        }
      }
    }, 10000); // Heartbeat every 10 seconds
    
    return () => clearInterval(heartbeatInterval);
  }, [awarenessReady, effectiveUserId, currentUserName, currentUserColor, isAuthenticated, authUser, isConnected]);

  // Update user awareness when name or color changes
  useEffect(() => {
    if (awarenessRef.current && providerRef.current && awarenessReady) {
      awarenessRef.current.setLocalStateField('user', {
        id: effectiveUserId,
        name: authUser?.displayName || authUser?.email?.split('@')[0] || currentUserName,
        color: currentUserColor,
        cursor: null,
        isAuthenticated: isAuthenticated,
        photoURL: authUser?.photoURL || null,
        lastSeen: Date.now()
      });
    }
  }, [effectiveUserId, awarenessReady, isAuthenticated, authUser, currentUserName, currentUserColor]);

  const contextValue: YjsContextType = {
    doc,
    provider: providerRef.current,
    awareness: awarenessReady ? awarenessRef.current : null,
    isConnected,
    userId: effectiveUserId,
    userName: currentUserName,
    userColor: currentUserColor,
    setUserName: setCurrentUserName,
    setUserColor: setCurrentUserColor,
    userCount,
    isMultiUser,
  };

  return (
    <YjsContext.Provider value={contextValue}>
      {children}
    </YjsContext.Provider>
  );
};