import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, X, Clock, Reply, Smile, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanvasComment } from '../collaboration/CanvasCommentSystem';

interface CommentPopoverProps {
  comment: CanvasComment;
  position: { x: number; y: number };
  onClose: () => void;
  onReply: (content: string) => void;
  onReact: (emoji: string) => void;
  onResolve: () => void;
  onDelete: () => void;
  canDelete?: boolean;
  className?: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '😄', '🎉', '🔥', '👏'];

export const CommentPopover: React.FC<CommentPopoverProps> = ({
  comment,
  position,
  onClose,
  onReply,
  onReact,
  onResolve,
  onDelete,
  canDelete = false,
  className = ''
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-focus reply input when replying
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [isReplying]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    } else if (e.key === 'Escape') {
      setIsReplying(false);
      setReplyContent('');
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
    <div
      ref={popoverRef}
      className={cn(
        "absolute z-70 comment-popover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[320px] max-w-sm",
        className
      )}
      style={{
        left: position.x + 20,
        top: position.y - 10,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: comment.userColor }}
          >
            {comment.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {comment.userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimestamp(comment.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {comment.content}
        </p>
      </div>

      {/* Reactions */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(comment.reactions || {}).map(([emoji, data]) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                data.users.includes(comment.userId)
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {emoji} {data.count}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Smile className="w-3 h-3" />
            </button>
            
            {showReactionPicker && (
              <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(emoji);
                      setShowReactionPicker(false);
                    }}
                    className="w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-sm transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="px-4 pb-3">
          <div className="space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: reply.userColor }}
                  >
                    {reply.userName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {reply.userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(reply.timestamp)}
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply Input */}
      {isReplying ? (
        <div className="p-4 pt-0 space-y-2">
          <Textarea
            ref={replyInputRef}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a reply..."
            className="resize-none"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsReplying(false);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitReply}
              disabled={!replyContent.trim()}
              className="flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Reply</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 pt-0">
          <button
            onClick={() => setIsReplying(true)}
            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onResolve}
          className={cn(
            "text-xs",
            comment.resolved
              ? "text-green-600 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400"
          )}
        >
          {comment.resolved ? 'Resolved' : 'Mark Resolved'}
        </Button>
        
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-xs text-red-500 hover:text-red-600"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};