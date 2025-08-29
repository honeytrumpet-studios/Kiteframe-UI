import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useYjs } from './YjsProvider';
import { MessageCircle, Send, X, User, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: number;
  position: { x: number; y: number };
  nodeId?: string;
  resolved: boolean;
  replies: Comment[];
}

interface CommentSystemProps {
  onCommentAdd?: (comment: Comment) => void;
  onCommentUpdate?: (comment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
}) => {
  const { doc, userId, userName, userColor } = useYjs();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  
  const commentsArray = doc.getArray('comments');
  const isUpdatingFromYjsRef = useRef(false);

  // Listen to Yjs changes
  useEffect(() => {
    const handleCommentsChange = () => {
      if (isUpdatingFromYjsRef.current) return;
      
      const commentsData = commentsArray.toArray() as Comment[];
      setComments(commentsData);
    };

    commentsArray.observe(handleCommentsChange);
    handleCommentsChange(); // Initial sync

    return () => {
      commentsArray.unobserve(handleCommentsChange);
    };
  }, [commentsArray]);

  // Handle right-click to add comment
  useEffect(() => {
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setCommentPosition({ x: e.clientX, y: e.clientY });
      setShowCommentInput(true);
    };

    const handleClick = (e: MouseEvent) => {
      if (showCommentInput && !(e.target as Element).closest('.comment-input')) {
        setShowCommentInput(false);
      }
    };

    document.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('click', handleClick);
    };
  }, [showCommentInput]);

  const addComment = useCallback((content: string, position: { x: number; y: number }, nodeId?: string) => {
    const comment: Comment = {
      id: uuidv4(),
      userId,
      userName,
      userColor,
      content,
      timestamp: Date.now(),
      position,
      nodeId,
      resolved: false,
      replies: [],
    };

    isUpdatingFromYjsRef.current = true;
    commentsArray.push([comment]);
    isUpdatingFromYjsRef.current = false;

    onCommentAdd?.(comment);
  }, [userId, userName, userColor, commentsArray, onCommentAdd]);

  const updateComment = useCallback((commentId: string, updates: Partial<Comment>) => {
    isUpdatingFromYjsRef.current = true;
    const commentsData = commentsArray.toArray() as Comment[];
    const index = commentsData.findIndex(c => c.id === commentId);
    
    if (index !== -1) {
      const updatedComment = { ...commentsData[index], ...updates };
      commentsArray.delete(index, 1);
      commentsArray.insert(index, [updatedComment]);
      onCommentUpdate?.(updatedComment);
    }
    isUpdatingFromYjsRef.current = false;
  }, [commentsArray, onCommentUpdate]);

  const deleteComment = useCallback((commentId: string) => {
    isUpdatingFromYjsRef.current = true;
    const commentsData = commentsArray.toArray() as Comment[];
    const index = commentsData.findIndex(c => c.id === commentId);
    
    if (index !== -1) {
      commentsArray.delete(index, 1);
      onCommentDelete?.(commentId);
    }
    isUpdatingFromYjsRef.current = false;
  }, [commentsArray, onCommentDelete]);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      addComment(newComment.trim(), commentPosition);
      setNewComment('');
      setShowCommentInput(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Comments overlay */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="fixed pointer-events-auto z-50"
          style={{
            left: comment.position.x,
            top: comment.position.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: comment.userColor }}
                >
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {comment.userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimestamp(comment.timestamp)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {comment.content}
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => updateComment(comment.id, { resolved: !comment.resolved })}
                className={`text-xs px-2 py-1 rounded ${
                  comment.resolved
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {comment.resolved ? 'Resolved' : 'Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Comment input */}
      {showCommentInput && (
        <div
          className="fixed pointer-events-auto z-50 comment-input"
          style={{
            left: commentPosition.x,
            top: commentPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[250px]">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Add Comment
              </span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment..."
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowCommentInput(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};