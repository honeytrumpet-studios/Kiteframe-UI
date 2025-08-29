import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  GitBranch, 
  Clock, 
  User, 
  Calendar,
  ArrowLeft,
  Check,
  X,
  Layers,
  Play
} from 'lucide-react';

export interface VersionData {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  author: string;
  nodes: any[];
  edges: any[];
  metadata?: {
    nodeCount?: number;
    edgeCount?: number;
    tags?: string[];
  };
}

interface VersionPreviewProps {
  currentVersion: VersionData;
  previewVersion: VersionData;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onRollback: () => void;
  onCancel: () => void;
  ghostOpacity?: number;
}

interface GhostElementProps {
  element: any;
  type: 'node' | 'edge';
  opacity: number;
  isRemoved?: boolean;
  isAdded?: boolean;
  isModified?: boolean;
}

const GhostElement: React.FC<GhostElementProps> = ({
  element,
  type,
  opacity,
  isRemoved = false,
  isAdded = false,
  isModified = false
}) => {
  const getStatusColor = () => {
    if (isRemoved) return 'border-red-500 bg-red-50';
    if (isAdded) return 'border-green-500 bg-green-50';
    if (isModified) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getStatusIcon = () => {
    if (isRemoved) return <X className="w-3 h-3 text-red-500" />;
    if (isAdded) return <Check className="w-3 h-3 text-green-500" />;
    if (isModified) return <Clock className="w-3 h-3 text-yellow-500" />;
    return null;
  };

  if (type === 'node') {
    return (
      <div
        className={`absolute border-2 border-dashed rounded-lg p-2 ${getStatusColor()}`}
        style={{
          left: element.position?.x || 0,
          top: element.position?.y || 0,
          width: element.style?.width || 120,
          height: element.style?.height || 60,
          opacity: opacity,
          zIndex: 10
        }}
      >
        <div className="flex items-center gap-1 text-xs">
          {getStatusIcon()}
          <span className="truncate">{element.data?.label || element.id}</span>
        </div>
      </div>
    );
  }

  // Edge ghost preview (simplified as a dashed line)
  return (
    <div
      className="absolute border-t-2 border-dashed border-gray-400"
      style={{
        left: 0,
        top: 20,
        width: 100,
        opacity: opacity,
        zIndex: 5
      }}
    />
  );
};

interface VersionCompareProps {
  currentVersion: VersionData;
  previewVersion: VersionData;
  ghostOpacity: number;
}

const VersionCompare: React.FC<VersionCompareProps> = ({
  currentVersion,
  previewVersion,
  ghostOpacity
}) => {
  const [showNodes, setShowNodes] = useState(true);
  const [showEdges, setShowEdges] = useState(true);

  // Calculate differences
  const currentNodeIds = new Set(currentVersion.nodes.map(n => n.id));
  const previewNodeIds = new Set(previewVersion.nodes.map(n => n.id));
  
  const removedNodes = currentVersion.nodes.filter(n => !previewNodeIds.has(n.id));
  const addedNodes = previewVersion.nodes.filter(n => !currentNodeIds.has(n.id));
  const modifiedNodes = previewVersion.nodes.filter(n => {
    const currentNode = currentVersion.nodes.find(cn => cn.id === n.id);
    return currentNode && JSON.stringify(currentNode) !== JSON.stringify(n);
  });

  const currentEdgeIds = new Set(currentVersion.edges.map(e => e.id));
  const previewEdgeIds = new Set(previewVersion.edges.map(e => e.id));
  
  const removedEdges = currentVersion.edges.filter(e => !previewEdgeIds.has(e.id));
  const addedEdges = previewVersion.edges.filter(e => !currentEdgeIds.has(e.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNodes(!showNodes)}
            className="flex items-center gap-1"
          >
            {showNodes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Nodes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEdges(!showEdges)}
            className="flex items-center gap-1"
          >
            {showEdges ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Edges
          </Button>
        </div>
      </div>

      {/* Ghost Preview Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Version Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg h-96 overflow-hidden">
            {/* Base canvas with current version in background */}
            <div className="absolute inset-0">
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg border">
                {/* Current version elements (faded) */}
                {showNodes && currentVersion.nodes.map(node => (
                  <div
                    key={`current-${node.id}`}
                    className="absolute bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs text-gray-600 dark:text-gray-400"
                    style={{
                      left: node.position?.x || 0,
                      top: node.position?.y || 0,
                      width: node.style?.width || 120,
                      height: node.style?.height || 60,
                      opacity: 0.3,
                      zIndex: 1
                    }}
                  >
                    <div className="truncate">{node.data?.label || node.id}</div>
                  </div>
                ))}
                
                {/* Preview version changes */}
                {showNodes && (
                  <>
                    {removedNodes.map(node => (
                      <GhostElement
                        key={`removed-${node.id}`}
                        element={node}
                        type="node"
                        opacity={ghostOpacity}
                        isRemoved
                      />
                    ))}
                    {addedNodes.map(node => (
                      <GhostElement
                        key={`added-${node.id}`}
                        element={node}
                        type="node"
                        opacity={ghostOpacity}
                        isAdded
                      />
                    ))}
                    {modifiedNodes.map(node => (
                      <GhostElement
                        key={`modified-${node.id}`}
                        element={node}
                        type="node"
                        opacity={ghostOpacity}
                        isModified
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-50 border border-red-500 rounded"></div>
              <span>Removed ({removedNodes.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-50 border border-green-500 rounded"></div>
              <span>Added ({addedNodes.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-50 border border-yellow-500 rounded"></div>
              <span>Modified ({modifiedNodes.length})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const VersionPreview: React.FC<VersionPreviewProps> = ({
  currentVersion,
  previewVersion,
  isPreviewMode,
  onTogglePreview,
  onRollback,
  onCancel,
  ghostOpacity = 0.6
}) => {
  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <div className="space-y-6">
      {/* Version Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Current Version
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">{currentVersion.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentVersion.description}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{currentVersion.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTimestamp(currentVersion.timestamp)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {currentVersion.metadata?.nodeCount || currentVersion.nodes.length} nodes
              </Badge>
              <Badge variant="secondary">
                {currentVersion.metadata?.edgeCount || currentVersion.edges.length} edges
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Preview Version
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">{previewVersion.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {previewVersion.description}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{previewVersion.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTimestamp(previewVersion.timestamp)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {previewVersion.metadata?.nodeCount || previewVersion.nodes.length} nodes
              </Badge>
              <Badge variant="secondary">
                {previewVersion.metadata?.edgeCount || previewVersion.edges.length} edges
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={isPreviewMode ? "default" : "outline"}
              onClick={onTogglePreview}
              className="flex items-center gap-2"
            >
              {isPreviewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isPreviewMode ? "Hide Preview" : "Show Preview"}
            </Button>
            
            {isPreviewMode && (
              <>
                <Button
                  onClick={onRollback}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Rollback to This Version
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Version Comparison */}
      {isPreviewMode && (
        <VersionCompare
          currentVersion={currentVersion}
          previewVersion={previewVersion}
          ghostOpacity={ghostOpacity}
        />
      )}
    </div>
  );
};

export default VersionPreview;