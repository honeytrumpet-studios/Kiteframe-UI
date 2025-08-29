import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Lock, 
  Unlock, 
  Shield, 
  Crown, 
  UserX, 
  RotateCcw, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Users,
  Share2,
  Mail,
  Globe,
  Building,
  Eye,
  EyeOff,
  Copy,
  X,
  Clock,
  UserPlus
} from 'lucide-react';

export interface FileAuthorData {
  id: string;
  name: string;
  email: string;
  color: string;
  isCurrentUser: boolean;
}

export interface FilePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canLock: boolean;
  canManageCollaborators: boolean;
  canRollback: boolean;
  canChangePermissions: boolean;
  canView: boolean;
  canShare: boolean;
  canInvite: boolean;
}

export type FileVisibility = 'private' | 'public' | 'organization';
export type FileAccess = 'read-only' | 'edit' | 'admin';

export interface ShareSettings {
  visibility: FileVisibility;
  allowPublicEdit: boolean;
  requireSignIn: boolean;
  expiresAt?: Date;
  shareLink?: string;
}

export interface FileState {
  id: string;
  name: string;
  isLocked: boolean;
  lockedBy?: FileAuthorData;
  lockedAt?: Date;
  author: FileAuthorData;
  collaborators: FileAuthorData[];
  permissions: Record<string, FilePermissions>;
  shareSettings: ShareSettings;
  isReadOnly: boolean;
  pendingInvites: PendingInvite[];
}

export interface PendingInvite {
  id: string;
  email: string;
  accessLevel: FileAccess;
  invitedBy: FileAuthorData;
  invitedAt: Date;
  expiresAt?: Date;
  message?: string;
}

interface FileAuthorControlsProps {
  fileState: FileState;
  currentUser: FileAuthorData;
  onLockFile: (fileId: string) => void;
  onUnlockFile: (fileId: string) => void;
  onRemoveCollaborator: (fileId: string, userId: string) => void;
  onRollback: (fileId: string, versionId: string) => void;
  onChangePermissions: (fileId: string, userId: string, permissions: FilePermissions) => void;
  onUpdateShareSettings: (fileId: string, settings: ShareSettings) => void;
  onInviteUser: (fileId: string, email: string, accessLevel: FileAccess, message?: string) => void;
  onCancelInvite: (fileId: string, inviteId: string) => void;
  onToggleReadOnly: (fileId: string) => void;
}

export const FileAuthorControls: React.FC<FileAuthorControlsProps> = ({
  fileState,
  currentUser,
  onLockFile,
  onUnlockFile,
  onRemoveCollaborator,
  onRollback,
  onChangePermissions,
  onUpdateShareSettings,
  onInviteUser,
  onCancelInvite,
  onToggleReadOnly
}) => {
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteAccessLevel, setInviteAccessLevel] = useState<FileAccess>('edit');
  const [inviteMessage, setInviteMessage] = useState('');

  const isAuthor = fileState.author.id === currentUser.id;
  const currentUserPermissions = fileState.permissions[currentUser.id] || {
    canEdit: false,
    canDelete: false,
    canLock: false,
    canManageCollaborators: false,
    canRollback: false,
    canChangePermissions: false,
    canView: true,
    canShare: false,
    canInvite: false
  };

  const canLockUnlock = isAuthor || currentUserPermissions.canLock;
  const canManageCollaborators = isAuthor || currentUserPermissions.canManageCollaborators;
  const canRollback = isAuthor || currentUserPermissions.canRollback;
  const canShare = isAuthor || currentUserPermissions.canShare;
  const canInvite = isAuthor || currentUserPermissions.canInvite;

  const handleLockToggle = () => {
    if (fileState.isLocked) {
      onUnlockFile(fileState.id);
    } else {
      onLockFile(fileState.id);
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    if (canManageCollaborators) {
      onRemoveCollaborator(fileState.id, userId);
    }
  };

  const handleRollback = (versionId: string) => {
    if (canRollback) {
      onRollback(fileState.id, versionId);
    }
  };

  const handleShareSettingsUpdate = (settings: Partial<ShareSettings>) => {
    if (canShare) {
      onUpdateShareSettings(fileState.id, { ...fileState.shareSettings, ...settings });
    }
  };

  const handleInviteUser = () => {
    if (canInvite && inviteEmail) {
      onInviteUser(fileState.id, inviteEmail, inviteAccessLevel, inviteMessage || undefined);
      setInviteEmail('');
      setInviteMessage('');
      setShowInviteModal(false);
    }
  };

  const handleCopyShareLink = () => {
    if (fileState.shareSettings.shareLink) {
      navigator.clipboard.writeText(fileState.shareSettings.shareLink);
      // In a real app, show toast notification
      console.log('Share link copied to clipboard');
    }
  };

  const getVisibilityIcon = (visibility: FileVisibility) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      default: return <EyeOff className="w-4 h-4" />;
    }
  };

  const getAccessLevelColor = (level: FileAccess) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'edit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPermissionLevel = (userId: string) => {
    if (fileState.author.id === userId) return 'Author';
    const permissions = fileState.permissions[userId];
    if (!permissions) return 'Viewer';
    
    const permCount = Object.values(permissions).filter(Boolean).length;
    if (permCount >= 4) return 'Admin';
    if (permCount >= 2) return 'Editor';
    return 'Viewer';
  };

  const getPermissionColor = (level: string) => {
    switch (level) {
      case 'Author': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            File Author Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className="text-white text-xs font-medium"
                    style={{ backgroundColor: fileState.author.color }}
                  >
                    {fileState.author.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{fileState.author.name}</span>
                    <Badge className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Author
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {fileState.name}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {fileState.isReadOnly && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Read-Only
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  {getVisibilityIcon(fileState.shareSettings.visibility)}
                  {fileState.shareSettings.visibility}
                </Badge>
                {fileState.isLocked && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </Badge>
                )}
              </div>
            </div>

            {/* Lock Status */}
            {fileState.isLocked && fileState.lockedBy && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">File is locked</span>
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Locked by {fileState.lockedBy.name} at {fileState.lockedAt?.toLocaleString()}
                </div>
              </div>
            )}

            {/* Author Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {isAuthor && (
                <Button
                  onClick={() => onToggleReadOnly(fileState.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {fileState.isReadOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {fileState.isReadOnly ? 'Enable Editing' : 'Make Read-Only'}
                </Button>
              )}
              
              {canLockUnlock && !fileState.isReadOnly && (
                <Button
                  onClick={handleLockToggle}
                  variant={fileState.isLocked ? "destructive" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {fileState.isLocked ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Lock
                    </>
                  )}
                </Button>
              )}
              
              {canShare && (
                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}
              
              {canInvite && (
                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </Button>
              )}
              
              {canRollback && (
                <Button
                  onClick={() => handleRollback('latest')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Rollback
                </Button>
              )}
              
              {isAuthor && (
                <Button
                  onClick={() => setShowPermissionsModal(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Permissions
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Settings Modal */}
      {showShareModal && (
        <Card className="fixed inset-4 z-50 bg-white dark:bg-gray-900 border shadow-lg max-w-lg mx-auto my-8 max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Settings
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowShareModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {(['private', 'organization', 'public'] as FileVisibility[]).map((visibility) => (
                    <Button
                      key={visibility}
                      variant={fileState.shareSettings.visibility === visibility ? "default" : "outline"}
                      onClick={() => handleShareSettingsUpdate({ visibility })}
                      className="flex items-center gap-2 justify-start"
                    >
                      {getVisibilityIcon(visibility)}
                      <div className="text-left">
                        <div className="font-medium capitalize">{visibility}</div>
                        <div className="text-xs opacity-70">
                          {visibility === 'private' && 'Only collaborators can access'}
                          {visibility === 'organization' && 'Anyone in your organization can access'}
                          {visibility === 'public' && 'Anyone with the link can access'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {fileState.shareSettings.visibility === 'public' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Allow public editing</label>
                    <input
                      type="checkbox"
                      checked={fileState.shareSettings.allowPublicEdit}
                      onChange={(e) => handleShareSettingsUpdate({ allowPublicEdit: e.target.checked })}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Require sign-in</label>
                    <input
                      type="checkbox"
                      checked={fileState.shareSettings.requireSignIn}
                      onChange={(e) => handleShareSettingsUpdate({ requireSignIn: e.target.checked })}
                      className="rounded"
                    />
                  </div>
                </div>
              )}
              
              {fileState.shareSettings.shareLink && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fileState.shareSettings.shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50 dark:bg-gray-800"
                    />
                    <Button onClick={handleCopyShareLink} size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Invite User Modal */}
      {showInviteModal && (
        <Card className="fixed inset-4 z-50 bg-white dark:bg-gray-900 border shadow-lg max-w-lg mx-auto my-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invite User
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Level</label>
              <div className="grid grid-cols-1 gap-2">
                {(['read-only', 'edit', 'admin'] as FileAccess[]).map((level) => (
                  <Button
                    key={level}
                    variant={inviteAccessLevel === level ? "default" : "outline"}
                    onClick={() => setInviteAccessLevel(level)}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Badge className={getAccessLevelColor(level)}>
                      {level}
                    </Badge>
                    <div className="text-left text-sm">
                      {level === 'read-only' && 'Can view only'}
                      {level === 'edit' && 'Can view and edit'}
                      {level === 'admin' && 'Can view, edit, and manage'}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Optional)</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-3 py-2 border rounded resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleInviteUser} disabled={!inviteEmail} className="flex-1">
                Send Invite
              </Button>
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites */}
      {fileState.pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fileState.pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div>
                    <div className="font-medium">{invite.email}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Invited as {invite.accessLevel} by {invite.invitedBy.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invite.invitedAt.toLocaleDateString()}
                    </div>
                  </div>
                  
                  {canInvite && (
                    <Button
                      onClick={() => onCancelInvite(fileState.id, invite.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaborator Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Collaborator Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fileState.collaborators.map((collaborator) => {
              const permissionLevel = getPermissionLevel(collaborator.id);
              const isCurrentUserCollaborator = collaborator.id === currentUser.id;
              
              return (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        className="text-white text-xs font-medium"
                        style={{ backgroundColor: collaborator.color }}
                      >
                        {collaborator.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{collaborator.name}</span>
                        {isCurrentUserCollaborator && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {collaborator.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getPermissionColor(permissionLevel)}>
                      {permissionLevel}
                    </Badge>
                    
                    {canManageCollaborators && !isCurrentUserCollaborator && permissionLevel !== 'Author' && (
                      <Button
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              {currentUserPermissions.canView ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">View File</span>
            </div>
            
            <div className="flex items-center gap-2">
              {currentUserPermissions.canEdit && !fileState.isReadOnly ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Edit File</span>
            </div>
            
            <div className="flex items-center gap-2">
              {canShare ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Share File</span>
            </div>
            
            <div className="flex items-center gap-2">
              {canInvite ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Invite Users</span>
            </div>
            
            <div className="flex items-center gap-2">
              {canLockUnlock ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Lock/Unlock</span>
            </div>
            
            <div className="flex items-center gap-2">
              {canRollback ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Rollback Changes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <Card className="fixed inset-4 z-50 bg-white dark:bg-gray-900 border shadow-lg max-w-2xl mx-auto my-8 max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Permissions
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPermissionsModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fileState.collaborators.map((collaborator) => {
                const permissions = fileState.permissions[collaborator.id] || {};
                const isAuthor = collaborator.id === fileState.author.id;
                const isCurrentUser = collaborator.id === currentUser.id;
                
                return (
                  <div key={collaborator.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className="text-white text-xs font-medium"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{collaborator.name}</span>
                          {isAuthor && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              <Crown className="w-3 h-3 mr-1" />
                              Author
                            </Badge>
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {collaborator.email}
                        </div>
                      </div>
                    </div>
                    
                    {!isAuthor && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can Edit</span>
                          <input
                            type="checkbox"
                            checked={permissions.canEdit || false}
                            onChange={(e) => onChangePermissions(fileState.id, collaborator.id, { ...permissions, canEdit: e.target.checked })}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can Delete</span>
                          <input
                            type="checkbox"
                            checked={permissions.canDelete || false}
                            onChange={(e) => onChangePermissions(fileState.id, collaborator.id, { ...permissions, canDelete: e.target.checked })}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can Share</span>
                          <input
                            type="checkbox"
                            checked={permissions.canShare || false}
                            onChange={(e) => onChangePermissions(fileState.id, collaborator.id, { ...permissions, canShare: e.target.checked })}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can Invite</span>
                          <input
                            type="checkbox"
                            checked={permissions.canInvite || false}
                            onChange={(e) => onChangePermissions(fileState.id, collaborator.id, { ...permissions, canInvite: e.target.checked })}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can Lock</span>
                          <input
                            type="checkbox"
                            checked={permissions.canLock || false}
                            onChange={(e) => onChangePermissions(fileState.id, collaborator.id, { ...permissions, canLock: e.target.checked })}
                            className="rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Can Rollback</span>
                          <input
                            type="checkbox"
                            checked={permissions.canRollback || false}
                            onChange={(e) => onChangePermissions(fileState.id, collaborator.id, { ...permissions, canRollback: e.target.checked })}
                            className="rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileAuthorControls;