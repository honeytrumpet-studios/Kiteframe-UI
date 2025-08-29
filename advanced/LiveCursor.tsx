import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, User } from 'lucide-react';

export interface CursorData {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  position: { x: number; y: number };
  lastUpdate: number;
  isActive: boolean;
}

interface LiveCursorProps {
  cursor: CursorData;
  showUserName?: boolean;
  fadeAfterMs?: number;
  onCursorClick?: (cursor: CursorData) => void;
}

export const LiveCursor: React.FC<LiveCursorProps> = ({
  cursor,
  showUserName = true,
  fadeAfterMs = 3000,
  onCursorClick
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!cursor.isActive) {
      setIsVisible(false);
      return;
    }

    const fadeTimeout = setTimeout(() => {
      const timeSinceUpdate = Date.now() - cursor.lastUpdate;
      if (timeSinceUpdate > fadeAfterMs) {
        setIsVisible(false);
      }
    }, fadeAfterMs);

    return () => clearTimeout(fadeTimeout);
  }, [cursor.lastUpdate, cursor.isActive, fadeAfterMs]);

  const handleClick = () => {
    if (onCursorClick) {
      onCursorClick(cursor);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-none z-50"
          style={{
            left: cursor.position.x,
            top: cursor.position.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          {/* Cursor Icon */}
          <div
            className="relative cursor-pointer pointer-events-auto"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <MousePointer2
              className="w-5 h-5 drop-shadow-md"
              style={{ color: cursor.userColor }}
              fill={cursor.userColor}
            />
            
            {/* User Name Bubble */}
            {showUserName && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0.8, 
                  y: isHovered ? 0 : 5,
                  scale: isHovered ? 1.05 : 1 
                }}
                transition={{ duration: 0.15 }}
                className="absolute top-6 left-2 whitespace-nowrap"
              >
                <div
                  className="px-2 py-1 rounded-md text-white text-xs font-medium shadow-lg"
                  style={{ backgroundColor: cursor.userColor }}
                >
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {cursor.userName}
                  </div>
                  {/* Speech bubble tail */}
                  <div
                    className="absolute -top-1 left-2 w-2 h-2 rotate-45"
                    style={{ backgroundColor: cursor.userColor }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LiveCursorsProps {
  cursors: CursorData[];
  showUserNames?: boolean;
  fadeAfterMs?: number;
  onCursorClick?: (cursor: CursorData) => void;
}

export const LiveCursors: React.FC<LiveCursorsProps> = ({
  cursors,
  showUserNames = true,
  fadeAfterMs = 3000,
  onCursorClick
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {cursors.map((cursor) => (
        <LiveCursor
          key={cursor.id}
          cursor={cursor}
          showUserName={showUserNames}
          fadeAfterMs={fadeAfterMs}
          onCursorClick={onCursorClick}
        />
      ))}
    </div>
  );
};

export default LiveCursors;