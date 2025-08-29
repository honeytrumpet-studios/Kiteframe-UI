import React, { useState, useRef } from 'react';
import { X, MoreHorizontal, Check, Smile, AtSign, Image as ImageIcon, Edit2, Trash2, Link, Mail, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanvasComment, LinkPreview } from '../collaboration/CanvasCommentSystem';
import { ObjectUploader } from './ObjectUploader';
import { useCollaborationUsers } from '@/lib/collaboration/useCollaborationUsers';

interface CommentPopoverProps {
  comment: CanvasComment;
  position: { x: number; y: number };
  onClose: () => void;
  onReply: (data: { content: string; attachments?: { images?: string[]; links?: LinkPreview[] } }) => void;
  onReact: (emoji: string) => void;
  onResolve: () => void;
  onDelete: () => void;
  onEdit?: (commentId: string, newContent: string) => void;
  canDelete: boolean;
  currentUserId?: string;
  onPositionChange?: (newPosition: { x: number; y: number }) => void;
}

export const CommentPopover: React.FC<CommentPopoverProps> = ({
  comment,
  position,
  onClose,
  onReply,
  onReact,
  onResolve,
  onDelete,
  onEdit,
  canDelete,
  currentUserId = 'anonymous-user',
  onPositionChange
}) => {
  const [collaborationState, { getDisplayName, getAvatarContent }] = useCollaborationUsers();
  const { currentUser } = collaborationState;
  
  const [replyText, setReplyText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showResolveTooltip, setShowResolveTooltip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showEmojiButton, setShowEmojiButton] = useState(false);
  
  // Link and image functionality for replies
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<Array<{id: string; type: 'link' | 'image'; url: string; title?: string}>>([]);
  
  // Drag functionality for popover
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState(position);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calculate intelligent positioning next to marker based on viewport proximity
  const calculateOptimalPosition = (markerPos: { x: number; y: number }) => {
    const popoverWidth = 320; // Fixed width of popover
    const popoverHeight = 400; // Estimated height
    const margin = 20;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Calculate available space on each side of the marker
    const spaceLeft = markerPos.x;
    const spaceRight = viewport.width - markerPos.x;
    const spaceTop = markerPos.y;
    const spaceBottom = viewport.height - markerPos.y;

    // Determine horizontal placement (left or right of marker)
    let x, y;
    
    if (spaceRight >= popoverWidth + margin) {
      // Position to the right of marker
      x = markerPos.x + margin;
    } else if (spaceLeft >= popoverWidth + margin) {
      // Position to the left of marker
      x = markerPos.x - popoverWidth - margin;
    } else {
      // Center horizontally if no side has enough space
      x = Math.max(margin, Math.min(
        markerPos.x - popoverWidth / 2,
        viewport.width - popoverWidth - margin
      ));
    }

    // Determine vertical placement (prefer aligning with marker top, but adjust if needed)
    if (spaceBottom >= popoverHeight) {
      // Position below or aligned with marker
      y = markerPos.y;
    } else if (spaceTop >= popoverHeight) {
      // Position above marker
      y = markerPos.y - popoverHeight;
    } else {
      // Center vertically if no space above or below
      y = Math.max(margin, Math.min(
        markerPos.y - popoverHeight / 2,
        viewport.height - popoverHeight - margin
      ));
    }

    return { x, y };
  };

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      const replyData = {
        content: replyText.trim(),
        attachments: {
          images: replyAttachments.filter(att => att.type === 'image').map(att => att.url),
          links: replyAttachments.filter(att => att.type === 'link').map(att => ({
            url: att.url,
            title: att.title || att.url,
            description: '',
            domain: new URL(att.url).hostname
          }))
        }
      };
      
      onReply(replyData);
      setReplyText('');
      setReplyAttachments([]);
      setIsAddingLink(false);
      setLinkUrl('');
    }
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      const newAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'link' as const,
        url: linkUrl.trim(),
        title: linkUrl.trim()
      };
      setReplyAttachments(prev => [...prev, newAttachment]);
      setLinkUrl('');
      setIsAddingLink(false);
    }
  };

  const getUploadParameters = async () => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL
    };
  };

  const handleImageUpload = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const imageUrl = uploadedFile.uploadURL;
      
      const newAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'image' as const,
        url: imageUrl,
        title: uploadedFile.name || 'Image'
      };
      setReplyAttachments(prev => [...prev, newAttachment]);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setReplyAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(comment.id, editText.trim());
      setIsEditing(false);
    }
  };

  const isCommentAuthor = comment.userId === currentUserId;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Drag handlers for popover
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - popoverPosition.x,
        y: e.clientY - popoverPosition.y,
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPopoverPosition(newPosition);
      onPositionChange?.(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Set up global event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Update position when marker position changes (for intelligent positioning)
  React.useEffect(() => {
    if (!isDragging) {
      const optimalPosition = calculateOptimalPosition(position);
      setPopoverPosition(optimalPosition);
    }
  }, [position, isDragging]);

  return (
    <>
      {/* Modal positioned like Figma - NO BACKDROP */}
      <div
        ref={popoverRef}
        className="fixed z-[9999] w-80 bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 cursor-move comment-popover"
        style={{
          left: popoverPosition.x,
          top: popoverPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          // Prevent canvas drag when dragging popover
          e.stopPropagation();
          handleMouseDown(e);
        }}
      >
        {/* Header - matches Figma's "Comment" header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 drag-handle cursor-move">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Comment</h3>
          <div className="flex items-center space-x-2">
            {/* More options menu */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {/* Figma-style dropdown menu */}
              {showMoreMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px] z-10">
                  {isCommentAuthor ? (
                    <>
                      {/* Author options - matching Figma */}
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 rounded"
                      >
                        Edit
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <button
                        onClick={() => setShowMoreMenu(false)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Mark as unread
                      </button>
                      <button
                        onClick={() => {
                          onDelete();
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Delete thread...
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Non-author options */}
                      <button
                        onClick={() => setShowMoreMenu(false)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Mark as unread
                      </button>

                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Resolve button - separate from menu like Figma */}
            <div className="relative">
              <button
                onClick={onResolve}
                className={cn(
                  "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
                  comment.resolved && "text-green-600"
                )}
                onMouseEnter={() => setShowResolveTooltip(true)}
                onMouseLeave={() => setShowResolveTooltip(false)}
              >
                <Check className="w-4 h-4" />
              </button>
              
              {/* Tooltip like Figma */}
              {showResolveTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap">
                  {comment.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-4 space-y-3">
          {/* Original comment */}
          <div className="flex items-start space-x-3">
            {comment.userPhotoURL ? (
              <img
                src={comment.userPhotoURL}
                alt={comment.userName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: comment.userColor }}
              >
                {comment.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.userName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(comment.timestamp)}
                </span>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditText(comment.content);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEdit}
                      disabled={!editText.trim()}
                      className={cn(
                        "px-3 py-1 text-sm rounded transition-all",
                        editText.trim()
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                      )}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                  
                  {/* Attachments */}
                  {comment.attachments && (
                    <div className="mt-3 space-y-2">
                      {/* Images */}
                      {comment.attachments.images && comment.attachments.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {comment.attachments.images.map((imagePath, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={imagePath} 
                                alt="Attachment"
                                className="max-w-48 max-h-32 object-cover rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90"
                                onClick={() => window.open(imagePath, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Links */}
                      {comment.attachments.links && comment.attachments.links.length > 0 && (
                        <div className="space-y-2">
                          {comment.attachments.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                {link.image && (
                                  <img 
                                    src={link.image} 
                                    alt=""
                                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate">
                                    {link.title}
                                  </div>
                                  {link.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                      {link.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {link.domain}
                                  </div>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Reactions with hover-triggered emoji button */}
          <div 
            className="relative"
            onMouseEnter={() => setShowEmojiButton(true)}
            onMouseLeave={() => setShowEmojiButton(false)}
          >
            {/* Existing reactions */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(comment.reactions).map(([emoji, data]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {emoji} {data.count}
                </button>
              ))}
              
              {/* Hover-triggered emoji button */}
              {showEmojiButton && (
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-opacity"
                >
                  <Smile className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            
            {/* Emoji picker popup */}
            {showReactionPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-50">
                <div className="flex items-center gap-1">
                  {['👍', '❤️', '😄', '🎉', '🔥', '👏'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(emoji);
                        setShowReactionPicker(false);
                      }}
                      className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="space-y-3 pl-11">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start space-x-3">
                  {reply.userPhotoURL ? (
                    <img
                      src={reply.userPhotoURL}
                      alt={reply.userName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: reply.userColor }}
                    >
                      {reply.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {reply.userName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(reply.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply input - matches Figma's input design */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            {(() => {
              const avatarData = getAvatarContent(currentUser);
              
              if (avatarData.type === 'photo') {
                return (
                  <img
                    src={avatarData.content}
                    alt={getDisplayName(currentUser)}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                );
              } else if (avatarData.type === 'initials') {
                return (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: avatarData.bgColor }}
                  >
                    {avatarData.content}
                  </div>
                );
              } else {
                return (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm">
                    {avatarData.content}
                  </div>
                );
              }
            })()}
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={2}
              />
              
              {/* Reply attachments display */}
              {replyAttachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {replyAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                        {attachment.type === 'link' ? '🔗' : '🖼️'} {attachment.title}
                      </span>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Link input */}
              {isAddingLink && (
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Enter URL..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                  />
                  <button
                    onClick={handleAddLink}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {setIsAddingLink(false); setLinkUrl('');}}
                    className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Bottom toolbar like Figma */}
              <div className="flex items-center justify-between mt-2">
                {/* Only show link and image buttons for new comments, not replies */}
                {!comment.replies || comment.replies.length === 0 ? (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsAddingLink(true)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Add link"
                    >
                      <Link className="w-4 h-4 text-gray-500" />
                    </button>
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760} // 10MB
                      onGetUploadParameters={getUploadParameters}
                      onComplete={handleImageUpload}
                      buttonClassName="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-none bg-transparent shadow-none"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                    </ObjectUploader>
                  </div>
                ) : (
                  <div></div>
                )}
                
                {/* Purple submit button like Figma */}
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    replyText.trim()
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {/* Quick reaction picker */}
              {showReactionPicker && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg dark:bg-gray-700">
                  {['👍', '❤️', '😄', '🎉', '🔥', '👏'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(emoji);
                        setShowReactionPicker(false);
                      }}
                      className="text-lg hover:bg-gray-200 dark:hover:bg-gray-600 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};