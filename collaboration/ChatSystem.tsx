import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useYjs } from './YjsProvider';
import { Send, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: number;
  type: 'message' | 'system';
}

interface ChatSystemProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onMessageAdd?: (message: ChatMessage) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  position = 'bottom-right',
  onMessageAdd,
}) => {
  const { doc, userId, userName, userColor } = useYjs();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesArray = doc.getArray('chat');
  const isUpdatingFromYjsRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastReadTimestampRef = useRef(Date.now());

  // Listen to Yjs changes
  useEffect(() => {
    const handleMessagesChange = () => {
      if (isUpdatingFromYjsRef.current) return;
      
      const messagesData = messagesArray.toArray() as ChatMessage[];
      setMessages(messagesData);
      
      // Update unread count if chat is closed or minimized
      if (!isOpen || isMinimized) {
        const newUnreadCount = messagesData.filter(
          msg => msg.timestamp > lastReadTimestampRef.current && msg.userId !== userId
        ).length;
        setUnreadCount(newUnreadCount);
      }
    };

    messagesArray.observe(handleMessagesChange);
    handleMessagesChange(); // Initial sync

    return () => {
      messagesArray.unobserve(handleMessagesChange);
    };
  }, [messagesArray, isOpen, isMinimized, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      lastReadTimestampRef.current = Date.now();
    }
  }, [isOpen, isMinimized]);

  const addMessage = useCallback((content: string, type: 'message' | 'system' = 'message') => {
    const message: ChatMessage = {
      id: uuidv4(),
      userId,
      userName,
      userColor,
      content,
      timestamp: Date.now(),
      type,
    };

    isUpdatingFromYjsRef.current = true;
    messagesArray.push([message]);
    isUpdatingFromYjsRef.current = false;

    onMessageAdd?.(message);
  }, [userId, userName, userColor, messagesArray, onMessageAdd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Team Chat
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 h-80 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.userId === userId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        {message.userId !== userId && (
                          <div className="flex items-center space-x-2 mb-1">
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: message.userColor }}
                            >
                              {message.userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium">
                              {message.userName}
                            </span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.userId === userId ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};