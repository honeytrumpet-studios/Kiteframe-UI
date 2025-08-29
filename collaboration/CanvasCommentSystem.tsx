import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useYjs } from './YjsProvider';
import { MessageCircle, Send, X, Clock, Smile, Reply, Heart, ThumbsUp, Link, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';
import { cn } from '@/lib/utils';
import { CommentMarker } from '../components/CommentMarker';
import { CommentPopover } from '../components/CommentPopover';
import { ObjectUploader } from '../components/ObjectUploader';
import { useCollaborationUsers } from '@/lib/collaboration/useCollaborationUsers';

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image?: string;
  domain: string;
}

export interface CanvasComment {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  userPhotoURL?: string | null;
  content: string;
  timestamp: number;
  canvasPosition: { x: number; y: number }; // Position relative to canvas, not viewport
  nodeId?: string;
  resolved: boolean;
  replies: CanvasComment[];
  reactions: { [emoji: string]: { count: number; users: string[] } };
  attachments?: {
    images?: string[];
    links?: LinkPreview[];
  };
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
  // Remove verbose render logging

  const { doc: ydoc, userId, awareness } = useYjs();
  const [collaborationState, { getDisplayName, getAvatarContent }] = useCollaborationUsers();
  
  const [comments, setComments] = useState<CanvasComment[]>([]);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentInputPosition, setCommentInputPosition] = useState({ x: 0, y: 0 });
  const [newComment, setNewComment] = useState('');
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [dragTimer, setDragTimer] = useState<NodeJS.Timeout | null>(null);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedLinks, setAttachedLinks] = useState<LinkPreview[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  // Use unified collaboration user identity
  const { currentUser } = collaborationState;
  const currentUserId = currentUser.id;

  // Yjs integration with safety check
  const commentsArray = ydoc?.getArray<CanvasComment>('canvasComments');

  // Return early if Yjs is not initialized
  if (!ydoc || !commentsArray) {
    console.log('[CanvasCommentSystem] Yjs not ready, rendering empty state');
    return null;
  }

  useEffect(() => {
    if (!commentsArray) {
      console.log('[Comment System] Comments array not ready, skipping observer setup');
      return;
    }

    const handleChange = () => {
      const commentsData = commentsArray.toArray();

      setComments(commentsData);
    };

    commentsArray.observe(handleChange);
    handleChange(); // Initial load

    return () => {
      commentsArray.unobserve(handleChange);
    };
  }, [commentsArray]);

  // Dismiss new comment popover when exiting comment mode
  useEffect(() => {
    if (!isCommentMode && showCommentInput) {
      setShowCommentInput(false);
      setNewComment('');
    }
  }, [isCommentMode, showCommentInput]);

  // Click outside to close comment popover - ONLY when clicking canvas in comment mode to create new comment
  useEffect(() => {
    if (!selectedComment) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is on the comment popover or marker itself
      const isOnPopover = target.closest('.comment-popover');
      const isOnMarker = target.closest('[data-comment-marker="true"]');
      
      // Don't close if clicking on popover or its own marker
      if (isOnPopover || isOnMarker) {
        return;
      }
      
      // Only close if in comment mode and clicking canvas to create new comment
      // Otherwise, let the user drag the canvas without closing the comment
      if (isCommentMode) {
        console.log('[Comment System] Click in comment mode - closing popover to create new comment');
        setSelectedComment(null);
      }
      // Don't close when not in comment mode - allow canvas dragging
    };

    // Add event listener with a small delay to avoid immediate closure
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedComment, isCommentMode]);

  // Canvas coordinate transformation
  const canvasToScreen = useCallback((canvasPos: { x: number; y: number }) => {
    if (!canvasRef.current) return canvasPos;
    
    // Convert canvas coordinates to screen-relative coordinates
    // Don't add rect.left/top since we want coordinates relative to the canvas element
    return {
      x: (canvasPos.x * viewport.zoom) + viewport.x,
      y: (canvasPos.y * viewport.zoom) + viewport.y,
    };
  }, [viewport, canvasRef]);

  const screenToCanvas = useCallback((screenPos: { x: number; y: number }) => {
    if (!canvasRef.current) return screenPos;
    
    // Note: screenPos is already relative to canvas rect when passed from KiteFrameCanvas
    // So we don't need to subtract rect.left and rect.top
    return {
      x: (screenPos.x - viewport.x) / viewport.zoom,
      y: (screenPos.y - viewport.y) / viewport.zoom,
    };
  }, [viewport, canvasRef]);

  // Comment handling with drag delay
  const handleCanvasClick = useCallback((e: any, screenPos?: { x: number; y: number }) => {
    if (!isCommentMode) return false;
    
    const clickPosition = screenPos || {
      x: e.clientX,
      y: e.clientY
    };
    
    console.log('[Comment System] Canvas clicked in comment mode:', {
      screenPos: clickPosition,
      viewport,
      isCommentMode,
      isCanvasDragging
    });
    
    // If dragging is detected, don't show the popover
    if (isCanvasDragging) {
      console.log('[Comment System] Click blocked due to dragging');
      return false;
    }
    
    // Set a timer to show the popover after a delay
    if (dragTimer) clearTimeout(dragTimer);
    const timer = setTimeout(() => {
      if (!isCanvasDragging) {
        setCommentInputPosition(clickPosition);
        setShowCommentInput(true);
      }
    }, 150); // 150ms delay to detect dragging
    
    setDragTimer(timer);
    
    // Prevent event from bubbling to document click handler
    e.preventDefault?.();
    e.stopPropagation?.();
    if ('stopImmediatePropagation' in e) {
      (e as Event).stopImmediatePropagation();
    }
    
    return true; // Indicate we handled the click
  }, [isCommentMode, viewport, isCanvasDragging, dragTimer]);

  // Store the handler in a ref to avoid recreating it
  const clickHandlerRef = useRef(handleCanvasClick);
  clickHandlerRef.current = handleCanvasClick;

  // Expose click handler to parent
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = isCommentMode ? 'crosshair' : 'default';
    }

    if (onCanvasClickHandler) {
      // Create a stable handler that uses the ref
      const stableHandler = (e: any, screenPos?: { x: number; y: number }) => {
        return clickHandlerRef.current(e, screenPos);
      };
      onCanvasClickHandler(stableHandler);

    }
  }, [isCommentMode, onCanvasClickHandler]);

  // Handle image upload completion
  const handleImageUpload = async (result: any) => {
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const objectURL = uploadedFile.uploadURL;
        
        // Set ACL policy for the uploaded image
        const response = await fetch('/api/objects/acl', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objectURL }),
        });
        
        if (response.ok) {
          const { objectPath } = await response.json();
          setAttachedImages(prev => [...prev, objectPath]);
        }
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };

  // Handle image upload parameters
  const getUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const { uploadURL } = await response.json();
      return {
        method: 'PUT' as const,
        url: uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      throw error;
    }
  };

  // Handle link addition
  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;
    
    try {
      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl }),
      });
      
      if (response.ok) {
        const linkPreview = await response.json();
        setAttachedLinks(prev => [...prev, linkPreview]);
        setLinkUrl('');
        setIsAddingLink(false);
      }
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleSubmitComment = () => {
    if ((!newComment.trim() && attachedImages.length === 0 && attachedLinks.length === 0) || !commentsArray) return;
    
    const canvasPos = screenToCanvas(commentInputPosition);
    const comment: CanvasComment = {
      id: uuidv4(),
      userId: currentUserId,
      userName: getDisplayName(currentUser),
      userColor: currentUser.color,
      userPhotoURL: currentUser.photoURL,
      content: newComment.trim(),
      timestamp: Date.now(),
      canvasPosition: canvasPos,
      resolved: false,
      replies: [],
      reactions: {},
      attachments: {
        images: attachedImages.length > 0 ? attachedImages : undefined,
        links: attachedLinks.length > 0 ? attachedLinks : undefined,
      }
    };

    console.log('[Comment System] Adding comment:', comment);
    commentsArray.push([comment]);
    onCommentAdd?.(comment);
    
    // Reset state
    setNewComment('');
    setAttachedImages([]);
    setAttachedLinks([]);
    setShowCommentInput(false);
    setIsAddingLink(false);
    setLinkUrl('');
  };

  const handleCommentBubbleClick = (comment: CanvasComment) => {
    console.log('[Comment System] Comment bubble clicked:', comment.id);
    // Dismiss comment creation popover when clicking existing comments
    setShowCommentInput(false);
    
    // If clicking on a different comment, close the previous one and open the new one
    if (selectedComment !== comment.id) {
      setSelectedComment(comment.id);
    } else {
      // If clicking the same comment, toggle it (but X button should be used for closing)
      // Keep it open for now - only close via X button
      // setSelectedComment(null);
    }
    
    // Remove the onCommentFocus call that triggers pan-to behavior
    // onCommentFocus?.(comment);
  };

  // Handler functions for new components  
  const handleAddReply = (commentId: string, replyData: { content: string; attachments?: { images?: string[]; links?: LinkPreview[] } }) => {
    if (!commentsArray) return;
    
    const commentsData = commentsArray.toArray() as CanvasComment[];
    const commentIndex = commentsData.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      const comment = commentsData[commentIndex];
      const newReply: CanvasComment = {
        id: uuidv4(),
        userId: currentUserId,
        userName: currentUserName,
        userColor: currentUserColor,
        userPhotoURL: currentUserPhotoURL,
        content: replyData.content,
        timestamp: Date.now(),
        canvasPosition: comment.canvasPosition,
        resolved: false,
        replies: [],
        reactions: {},
        attachments: replyData.attachments && (replyData.attachments.images?.length || replyData.attachments.links?.length) 
          ? replyData.attachments 
          : undefined
      };
      
      const updatedComment = {
        ...comment,
        replies: [...comment.replies, newReply]
      };
      
      commentsArray.delete(commentIndex, 1);
      commentsArray.insert(commentIndex, [updatedComment]);
    }
  };

  const handleReaction = (commentId: string, emoji: string) => {
    if (!commentsArray) return;
    
    const commentsData = commentsArray.toArray() as CanvasComment[];
    const commentIndex = commentsData.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      const comment = commentsData[commentIndex];
      const reactions = { ...comment.reactions };
      
      if (reactions[emoji]) {
        if (reactions[emoji].users.includes(currentUserId)) {
          reactions[emoji].users = reactions[emoji].users.filter(uid => uid !== currentUserId);
          reactions[emoji].count--;
          if (reactions[emoji].count === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji].users.push(currentUserId);
          reactions[emoji].count++;
        }
      } else {
        reactions[emoji] = { count: 1, users: [currentUserId] };
      }
      
      const updatedComment = { ...comment, reactions };
      commentsArray.delete(commentIndex, 1);
      commentsArray.insert(commentIndex, [updatedComment]);
    }
  };

  const handleResolveComment = (commentId: string) => {
    if (!commentsArray) return;
    
    const commentsData = commentsArray.toArray() as CanvasComment[];
    const commentIndex = commentsData.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      const comment = commentsData[commentIndex];
      const updatedComment = { ...comment, resolved: !comment.resolved };
      commentsArray.delete(commentIndex, 1);
      commentsArray.insert(commentIndex, [updatedComment]);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!commentsArray) return;
    
    const commentsData = commentsArray.toArray() as CanvasComment[];
    const commentIndex = commentsData.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      commentsArray.delete(commentIndex, 1);
      onCommentDelete?.(commentId);
    }
    setSelectedComment(null);
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    if (!commentsArray) return;
    
    const commentsData = commentsArray.toArray() as CanvasComment[];
    const commentIndex = commentsData.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      const comment = commentsData[commentIndex];
      const updatedComment = { ...comment, content: newContent };
      commentsArray.delete(commentIndex, 1);
      commentsArray.insert(commentIndex, [updatedComment]);
      onCommentUpdate?.(updatedComment);
    }
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
        
        // Comment bubble rendering - removed verbose logging
        
        return (
          <div key={comment.id}>
            {/* Comment bubble using new CommentMarker */}
            <CommentMarker
              x={screenPos.x}
              y={screenPos.y}
              count={comment.replies ? comment.replies.length : 0}
              userColor={comment.userColor}
              userName={comment.userName}
              userPhotoURL={comment.userPhotoURL}
              isSelected={isSelected}
              isResolved={comment.resolved}
              onClick={() => handleCommentBubbleClick(comment)}
              comment={{
                content: comment.content,
                userName: comment.userName,
                timestamp: comment.timestamp
              }}
              onPositionChange={(newPosition) => {
                // Update comment position in Yjs
                if (!commentsArray) return;
                const commentsData = commentsArray.toArray() as CanvasComment[];
                const commentIndex = commentsData.findIndex(c => c.id === comment.id);
                if (commentIndex !== -1) {
                  const canvasPos = screenToCanvas(newPosition);
                  const updatedComment = { ...comment, canvasPosition: canvasPos };
                  commentsArray.delete(commentIndex, 1);
                  commentsArray.insert(commentIndex, [updatedComment]);
                }
              }}
              canvasRef={canvasRef}
            />

            {/* Comment popover using new CommentPopover - positioned next to bubble */}
            {isSelected && (
              <CommentPopover
                comment={comment}
                position={{ x: screenPos.x + 25, y: screenPos.y - 20 }} // Offset to the right of bubble
                onClose={() => setSelectedComment(null)}
                onReply={(replyData) => handleAddReply(comment.id, replyData)}
                onReact={(emoji) => handleReaction(comment.id, emoji)}
                onResolve={() => handleResolveComment(comment.id)}
                onDelete={() => handleDeleteComment(comment.id)}
                onEdit={(commentId, newContent) => handleEditComment(commentId, newContent)}
                canDelete={comment.userId === currentUserId}
                currentUserId={currentUserId}
                onPositionChange={(newPosition) => {
                  // Optional: Update popover position without affecting comment position
                  console.log('[Comment System] Popover position changed:', newPosition);
                }}
              />
            )}
          </div>
        );
      })}

      {/* Figma-style comment input */}
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
          onMouseDown={(e) => {
            console.log('[Comment System] Comment input mousedown - preventing canvas interaction');
            e.stopPropagation();
          }}
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[300px] max-w-[400px]">
            {/* Input area with avatar - matches Figma */}
            <div className="flex items-start space-x-3 p-4">
              {(() => {
                const avatarData = getAvatarContent(currentUser);
                
                if (avatarData.type === 'photo') {
                  return (
                    <img 
                      src={avatarData.content}
                      alt={getDisplayName(currentUser)}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  );
                } else if (avatarData.type === 'initials') {
                  return (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                      style={{ backgroundColor: avatarData.bgColor }}
                    >
                      {avatarData.content}
                    </div>
                  );
                } else {
                  return (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                      {avatarData.content}
                    </div>
                  );
                }
              })()}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                  }}
                  onFocus={() => {}}
                  onBlur={() => {}}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newComment.trim()) {
                        handleSubmitComment();
                      }
                    }
                  }}
                  placeholder="Give feedback, ask a question, or just leave a note of appreciation."
                  className="w-full px-0 py-0 text-sm border-none resize-none focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  rows={3}
                  autoFocus
                />
              </div>
            </div>

            {/* Attached content display */}
            {(attachedImages.length > 0 || attachedLinks.length > 0) && (
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                {/* Attached Images */}
                {attachedImages.map((imagePath, index) => (
                  <div key={index} className="relative inline-block mr-2 mb-2">
                    <img 
                      src={imagePath} 
                      alt="Attached"
                      className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Attached Links */}
                {attachedLinks.map((link, index) => (
                  <div key={index} className="relative border border-gray-200 dark:border-gray-600 rounded p-2 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-2">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{link.title}</div>
                        <div className="text-xs text-gray-500 truncate">{link.domain}</div>
                      </div>
                      <button
                        onClick={() => setAttachedLinks(prev => prev.filter((_, i) => i !== index))}
                        className="w-4 h-4 text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Link input */}
            {isAddingLink && (
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
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
              </div>
            )}

            {/* Bottom toolbar like Figma */}
            <div className="flex items-center justify-between px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
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
              
              {/* Purple submit button like Figma */}
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
                onMouseDown={(e) => {
                  console.log('[Comment System] Send button mousedown - preventing canvas interaction');
                  e.stopPropagation();
                }}
                disabled={!newComment.trim()}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  newComment.trim()
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* Trashcan button - positioned above upper right corner */}
            <button
              onClick={() => {
                setShowCommentInput(false);
                setNewComment('');
                setAttachedImages([]);
                setAttachedLinks([]);
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="Cancel comment"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}


    </>
  );
};