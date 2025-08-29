import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Eye, Edit, MessageSquare, Clock } from 'lucide-react';

export interface CollaboratorData {
  id: string;
  userName: string;
  userColor: string;
  status: 'active' | 'idle' | 'away';
  lastSeen: Date;
  currentAction?: 'viewing' | 'editing' | 'commenting';
  currentElement?: string;
  avatar?: string;
}

interface CollaborationPresenceProps {
  collaborators: CollaboratorData[];
  maxVisible?: number;
  showDetails?: boolean;
  onCollaboratorClick?: (collaborator: CollaboratorData) => void;
}

export const CollaborationPresence: React.FC<CollaborationPresenceProps> = ({
  collaborators,
  maxVisible = 5,
  showDetails = false,
  onCollaboratorClick
}) => {
  const activeCollaborators = collaborators.filter(c => c.status === 'active');
  const visibleCollaborators = activeCollaborators.slice(0, maxVisible);
  const hiddenCount = Math.max(0, activeCollaborators.length - maxVisible);

  const getStatusColor = (status: CollaboratorData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionIcon = (action?: CollaboratorData['currentAction']) => {
    switch (action) {
      case 'viewing': return <Eye className="w-3 h-3" />;
      case 'editing': return <Edit className="w-3 h-3" />;
      case 'commenting': return <MessageSquare className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (showDetails) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4" />
            <h3 className="font-semibold">Active Collaborators</h3>
            <Badge variant="secondary">{activeCollaborators.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {visibleCollaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onCollaboratorClick?.(collaborator)}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className="text-white text-xs font-medium"
                      style={{ backgroundColor: collaborator.userColor }}
                    >
                      {collaborator.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(collaborator.status)}`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {collaborator.userName}
                    </span>
                    {collaborator.currentAction && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getActionIcon(collaborator.currentAction)}
                        <span>{collaborator.currentAction}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatLastSeen(collaborator.lastSeen)}
                  </div>
                  
                  {collaborator.currentElement && (
                    <div className="text-xs text-gray-500 truncate">
                      on {collaborator.currentElement}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {hiddenCount > 0 && (
              <div className="text-xs text-gray-500 text-center py-2">
                +{hiddenCount} more collaborators
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact avatar stack view
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleCollaborators.map((collaborator, index) => (
          <div
            key={collaborator.id}
            className="relative cursor-pointer transition-transform hover:scale-110"
            style={{ zIndex: visibleCollaborators.length - index }}
            onClick={() => onCollaboratorClick?.(collaborator)}
            title={`${collaborator.userName} - ${collaborator.status}`}
          >
            <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-800">
              <AvatarFallback
                className="text-white text-xs font-medium"
                style={{ backgroundColor: collaborator.userColor }}
              >
                {collaborator.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white dark:border-gray-800 ${getStatusColor(collaborator.status)}`}
            />
          </div>
        ))}
      </div>
      
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{hiddenCount}
        </Badge>
      )}
      
      {activeCollaborators.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>No active collaborators</span>
        </div>
      )}
    </div>
  );
};

export default CollaborationPresence;