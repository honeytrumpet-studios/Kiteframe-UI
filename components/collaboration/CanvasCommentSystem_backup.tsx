import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useYjs } from './YjsProvider';
import { MessageCircle, Send, X, Clock, Smile, Reply, Heart, ThumbsUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';
import { cn } from '@/lib/utils';
import { CommentMarker } from '../components/CommentMarker';
import { CommentPopover } from '../components/CommentPopover';

export interface CanvasComment {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: number;
  canvasPosition: { x: number; y: number }; // Position relative to canvas, not viewport
  nodeId?: string;
  resolved: boolean;
  replies: CanvasComment[];
  reactions: { [emoji: string]: { count: number; users: string[] } };
}

interface CanvasCommentSystemProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  viewport: { x: number; y: number; zoom: number };
  isCommentMode: boolean;
  onCommentModeToggle: () => void;
  onCommentAdd?: (comment: CanvasComment) => void;
  onCommentUpdate?: (comment: CanvasComment) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentFocus?: (comment: CanvasComment) => void;
  onCanvasClickHandler?: (handler: (e: any, screenPos?: { x: number; y: number }) => boolean) => void;
}

export const CanvasCommentSystem: React.FC<CanvasCommentSystemProps> = ({
  canvasRef,
  viewport,
  isCommentMode,
  onCommentModeToggle,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
  onCommentFocus,
  onCanvasClickHandler,
}) => {
  console.log('[CanvasCommentSystem] Rendered with props:', {
    isCommentMode,
    hasCanvasRef: !!canvasRef.current,
    viewport,
    hasOnCanvasClickHandler: !!onCanvasClickHandler
  });
  const { doc, userId, userName, userColor } = useYjs();
  const [comments, setComments] = useState<CanvasComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentInputPosition, setCommentInputPosition] = useState({ x: 0, y: 0 });
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const commentsArray = doc.getArray('canvasComments');
  const isUpdatingFromYjsRef = useRef(false);

  // Convert canvas position to screen position
  const canvasToScreen = useCallback((canvasPos: { x: number; y: number }) => {
    return {
      x: (canvasPos.x + viewport.x) * viewport.zoom,
      y: (canvasPos.y + viewport.y) * viewport.zoom,
    };
  }, [viewport]);

  // Convert screen position to canvas position
  const screenToCanvas = useCallback((screenPos: { x: number; y: number }) => {
    return {
      x: screenPos.x / viewport.zoom - viewport.x,
      y: screenPos.y / viewport.zoom - viewport.y,
    };
  }, [viewport]);

  // Listen to Yjs changes
  useEffect(() => {
    const handleCommentsChange = () => {
      if (isUpdatingFromYjsRef.current) {
        console.log('[Comment System] Yjs change ignored (updating from local)');
        return;
      }
      
      const commentsData = commentsArray.toArray() as CanvasComment[];
      console.log('[Comment System] Yjs comments changed:', {
        newLength: commentsData.length,
        comments: commentsData.map(c => ({ id: c.id, content: c.content, position: c.canvasPosition }))
      });
      setComments(commentsData);
    };

    console.log('[Comment System] Setting up Yjs observer');
    commentsArray.observe(handleCommentsChange);
    handleCommentsChange(); // Initial sync

    return () => {
      console.log('[Comment System] Cleaning up Yjs observer');
      commentsArray.unobserve(handleCommentsChange);
    };
  }, [commentsArray]);

  // Expose handleCanvasClick for external use
  const handleCanvasClick = useCallback((e: MouseEvent | React.MouseEvent | TouchEvent, screenPos?: { x: number; y: number }) => {
    if (!isCommentMode || !canvasRef.current) return false;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clickPosition: { x: number; y: number };
    
    if (screenPos) {
      clickPosition = screenPos;
    } else if ('clientX' in e) {
      // Mouse event
      clickPosition = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    } else if ('touches' in e && e.touches.length > 0) {
      // Touch event
      clickPosition = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      // Touch end event
      clickPosition = { x: e.changedTouches[0].clientX - rect.left, y: e.changedTouches[0].clientY - rect.top };
    } else {
      return false;
    }
    
    const canvasPos = screenToCanvas(clickPosition);
    console.log('[Comment System] Placing comment at:', { screenPos: clickPosition, canvasPos });
    
    setCommentInputPosition(clickPosition);
    setShowCommentInput(true);
    
    // Prevent event from bubbling to document click handler
    e.preventDefault?.();
    e.stopPropagation?.();
    if ('stopImmediatePropagation' in e) {
      (e as Event).stopImmediatePropagation();
    }
    
    console.log('[Comment System] Comment input should now be visible');
    return true;
  }, [isCommentMode, canvasRef, screenToCanvas]);

  // Set cursor style when comment mode changes and expose click handler
  useEffect(() => {
    console.log('[CanvasCommentSystem] useEffect - setting cursor and exposing handler:', {
      isCommentMode,
      hasCanvasRef: !!canvasRef.current,
      hasOnCanvasClickHandler: !!onCanvasClickHandler
    });
    
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.style.cursor = isCommentMode ? 'crosshair' : 'default';
    console.log('[CanvasCommentSystem] Set cursor to:', canvas.style.cursor);

    // Expose the click handler to parent
    if (onCanvasClickHandler) {
      console.log('[CanvasCommentSystem] Exposing click handler to parent');
      onCanvasClickHandler(handleCanvasClick);
    }

    return () => {
      canvas.style.cursor = 'default';
    };
  }, [isCommentMode, canvasRef, handleCanvasClick, onCanvasClickHandler]);

  // Handle clicking outside to close popovers (with delay to prevent immediate closure)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      console.log('[Comment System] Document click detected:', {
        showCommentInput,
        selectedComment,
        targetElement: (e.target as Element).tagName,
        targetClass: (e.target as Element).className,
        isCommentInput: !!(e.target as Element).closest('.comment-input'),
        isCommentBubble: !!(e.target as Element).closest('.comment-bubble'),
        isCommentPopover: !!(e.target as Element).closest('.comment-popover')
      });

      if (
        showCommentInput && 
        !(e.target as Element).closest('.comment-input') &&
        !(e.target as Element).closest('.comment-bubble')
      ) {
        console.log('[Comment System] Closing comment input due to outside click');
        setShowCommentInput(false);
      }
      if (
        selectedComment && 
        !(e.target as Element).closest('.comment-popover') &&
        !(e.target as Element).closest('.comment-bubble')
      ) {
        console.log('[Comment System] Closing comment popover due to outside click');
        setSelectedComment(null);
      }
    };

    // Add small delay to prevent immediate closure when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 100); // 100ms delay

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClick);
    };
  }, [showCommentInput, selectedComment]);

  const addComment = useCallback((content: string, canvasPosition: { x: number; y: number }, parentId?: string) => {
    console.log('[Comment System] addComment called with:', {
      content,
      canvasPosition,
      parentId,
      userId,
      userName,
      userColor,
      hasCommentsArray: !!commentsArray
    });

    const comment: CanvasComment = {
      id: uuidv4(),
      userId,
      userName,
      userColor,
      content,
      timestamp: Date.now(),
      canvasPosition,
      resolved: false,
      replies: [],
      reactions: {},
    };

    console.log('[Comment System] Created comment object:', comment);

    isUpdatingFromYjsRef.current = true;
    
    try {
      if (parentId) {
        // Add as reply
        const commentsData = commentsArray.toArray() as CanvasComment[];
        console.log('[Comment System] Adding reply, current comments:', commentsData.length);
        const parentIndex = commentsData.findIndex(c => c.id === parentId);
        if (parentIndex !== -1) {
          const parentComment = { ...commentsData[parentIndex] };
          parentComment.replies = [...parentComment.replies, comment];
          commentsArray.delete(parentIndex, 1);
          commentsArray.insert(parentIndex, [parentComment]);
          console.log('[Comment System] Reply added to parent comment');
        }
      } else {
        // Add as top-level comment
        console.log('[Comment System] Adding top-level comment to Yjs array');
        commentsArray.push([comment]);
        console.log('[Comment System] Comment pushed to Yjs, new length:', commentsArray.length);
      }
      
      console.log('[Comment System] Yjs operations completed, calling onCommentAdd');
      onCommentAdd?.(comment);
    } catch (error) {
      console.error('[Comment System] Error adding comment to Yjs:', error);
    }
    
    isUpdatingFromYjsRef.current = false;
  }, [userId, userName, userColor, commentsArray, onCommentAdd]);

  const updateComment = useCallback((commentId: string, updates: Partial<CanvasComment>) => {
    isUpdatingFromYjsRef.current = true;
    const commentsData = commentsArray.toArray() as CanvasComment[];
    const index = commentsData.findIndex(c => c.id === commentId);
    
    if (index !== -1) {
      const updatedComment = { ...commentsData[index], ...updates };
      commentsArray.delete(index, 1);
      commentsArray.insert(index, [updatedComment]);
      onCommentUpdate?.(updatedComment);
    }
    isUpdatingFromYjsRef.current = false;
  }, [commentsArray, onCommentUpdate]);

  const addReaction = useCallback((commentId: string, emoji: string) => {
    const commentsData = commentsArray.toArray() as CanvasComment[];
    const comment = commentsData.find(c => c.id === commentId);
    
    if (comment) {
      const reactions = { ...comment.reactions };
      if (!reactions[emoji]) {
        reactions[emoji] = { count: 0, users: [] };
      }
      
      if (!reactions[emoji].users.includes(userId)) {
        reactions[emoji].count++;
        reactions[emoji].users.push(userId);
      } else {
        reactions[emoji].count--;
        reactions[emoji].users = reactions[emoji].users.filter(id => id !== userId);
        if (reactions[emoji].count === 0) {
          delete reactions[emoji];
        }
      }
      
      updateComment(commentId, { reactions });
    }
  }, [commentsArray, userId, updateComment]);

  const handleSubmitComment = () => {
    console.log('[Comment System] handleSubmitComment called:', {
      commentText: newComment,
      hasText: !!newComment.trim(),
      commentInputPosition,
      userId,
      userName
    });
    
    if (newComment.trim()) {
      const canvasPos = screenToCanvas(commentInputPosition);
      console.log('[Comment System] Converting screen to canvas position:', {
        screenPos: commentInputPosition,
        canvasPos,
        viewport
      });
      
      addComment(newComment.trim(), canvasPos);
      setNewComment('');
      setShowCommentInput(false);
      console.log('[Comment System] Comment submitted and form cleared');
    } else {
      console.log('[Comment System] No comment text to submit');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      const parentComment = comments.find(c => c.id === parentId);
      if (parentComment) {
        addComment(replyContent.trim(), parentComment.canvasPosition, parentId);
        setReplyContent('');
        setReplyingTo(null);
      }
    }
  };

  const handleCommentBubbleClick = (comment: CanvasComment) => {
    setSelectedComment(comment.id);
    onCommentFocus?.(comment);
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
      {/* Comment bubbles */}
      {comments.map((comment) => {
        if (!comment || !comment.canvasPosition) {
          console.warn('[Comment System] Skipping invalid comment:', comment);
          return null;
        }
        
        const screenPos = canvasToScreen(comment.canvasPosition);
        const isSelected = selectedComment === comment.id;
        
        console.log('[Comment System] Rendering comment bubble:', {
          commentId: comment.id,
          canvasPos: comment.canvasPosition,
          screenPos,
          viewport
        });
        const hasReactions = Object.keys(comment.reactions).length > 0;
        
        return (
          <div key={comment.id}>
            {/* Comment bubble using new CommentMarker */}
            <CommentMarker
              x={screenPos.x}
              y={screenPos.y}
              count={comment.replies ? comment.replies.length : 0}
              userColor={comment.userColor}
              userName={comment.userName}
              isSelected={isSelected}
              isResolved={comment.resolved}
              onClick={() => handleCommentBubbleClick(comment)}
            />

            {/* Comment popover using new CommentPopover */}
            {isSelected && (
              <CommentPopover
                comment={comment}
                position={{ x: screenPos.x, y: screenPos.y }}
                onClose={() => setSelectedComment(null)}
                onReply={(content) => handleAddReply(comment.id, content)}
                onReact={(emoji) => handleReaction(comment.id, emoji)}
                onResolve={() => handleResolveComment(comment.id)}
                onDelete={() => handleDeleteComment(comment.id)}
                canDelete={comment.userId === currentUserId}
              />
            )}
          </div>
        );
        })}

      {/* Comment input */}
      {showCommentInput && (
        <div
          className="absolute z-60 comment-input"
          style={{
            left: commentInputPosition.x,
            top: commentInputPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
          onClick={(e) => {
            console.log('[Comment System] Comment input clicked - preventing close');
            e.stopPropagation();
          }}
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-[250px]">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Add Comment
              </span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => {
                console.log('[Comment System] Textarea changed:', {
                  newValue: e.target.value,
                  hasValue: !!e.target.value.trim()
                });
                setNewComment(e.target.value);
              }}
              onFocus={() => console.log('[Comment System] Textarea focused')}
              onBlur={() => console.log('[Comment System] Textarea blurred')}
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
                onClick={(e) => {
                  console.log('[Comment System] Add button clicked:', {
                    commentText: newComment,
                    hasText: !!newComment.trim(),
                    disabled: !newComment.trim()
                  });
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmitComment();
                }}
                disabled={!newComment.trim()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                style={{ border: '2px solid green' }}
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