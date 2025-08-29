import React, { useState } from 'react';
import { NodeData, EdgeData, GroupData } from './types/LayersPanel';
import { ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock, Edit2, Trash2, MoreHorizontal } from 'lucide-react';

interface LayersPanelProps {
  nodes: NodeData[];
  edges: EdgeData[];
  groups: GroupData[];
  selectedId: string | null;
  onSelect: (id: string, type: 'node' | 'edge' | 'group') => void;
  onToggleVisibility?: (id: string, type: 'node' | 'edge' | 'group') => void;
  onToggleLock?: (id: string, type: 'node' | 'edge' | 'group') => void;
  onRenameWorkflow?: (workflowId: string, newName: string) => void;
  onDeleteWorkflow?: (workflowId: string) => void;
  onToggleWorkflowVisibility?: (workflowId: string) => void;
}

interface LayerItemProps {
  id: string;
  type: 'node' | 'edge' | 'group';
  label: string;
  color?: string;
  isSelected: boolean;
  isVisible?: boolean;
  isLocked?: boolean;
  children?: string[];
  onSelect: (id: string, type: 'node' | 'edge' | 'group') => void;
  onToggleVisibility?: (id: string, type: 'node' | 'edge' | 'group') => void;
  onToggleLock?: (id: string, type: 'node' | 'edge' | 'group') => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  id,
  type,
  label,
  color,
  isSelected,
  isVisible = true,
  isLocked = false,
  children,
  onSelect,
  onToggleVisibility,
  onToggleLock,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'node':
        return (
          <div className="w-4 h-4 rounded border border-gray-400 dark:border-gray-600 flex items-center justify-center text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
        );
      case 'edge':
        return (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-3 h-0.5 bg-gray-600 dark:bg-gray-400 rounded" />
          </div>
        );
      case 'text':
        return (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">T</div>
          </div>
        );
      case 'group':
        return (
          <div className="w-4 h-4 rounded border border-gray-400 dark:border-gray-600 flex items-center justify-center">
            <div className="w-2 h-2 border border-gray-400 dark:border-gray-600 rounded" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="layers-panel-item">
      <div
        className={`layers-panel-item-row ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(id, type)}
      >
        <div className="layers-panel-item-content">
          {type === 'group' && children && children.length > 0 && (
            <button
              className="layers-panel-expand-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <div className="layers-panel-item-icon">
            {getIcon()}
          </div>
          <div className="layers-panel-item-label" style={{ color }}>
            {label}
          </div>
        </div>
        
        <div className="layers-panel-item-controls">
          {onToggleVisibility && (
            <button
              className="layers-panel-control-button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(id, type);
              }}
            >
              {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
          {onToggleLock && (
            <button
              className="layers-panel-control-button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(id, type);
              }}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          )}
        </div>
      </div>
      
      {type === 'group' && isExpanded && children && children.length > 0 && (
        <div className="layers-panel-children">
          {children.map((childId) => (
            <div key={childId} className="layers-panel-child-item">
              <div className="layers-panel-child-connector" />
              <div className="layers-panel-child-content">
                <div className="layers-panel-item-icon">
                  <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600" />
                </div>
                <div className="layers-panel-item-label text-sm text-gray-600 dark:text-gray-400">
                  {childId}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const LayersPanel: React.FC<LayersPanelProps> = ({
  nodes,
  edges,
  groups,
  selectedId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRenameWorkflow,
  onDeleteWorkflow,
  onToggleWorkflowVisibility,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    nodes: true,
    edges: true,
    groups: true,
  });
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [hiddenWorkflows, setHiddenWorkflows] = useState<Set<string>>(new Set());

  const toggleSection = (section: 'nodes' | 'edges' | 'groups') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRenameWorkflow = (workflowId: string, currentName: string) => {
    setEditingWorkflow(workflowId);
    setEditingName(currentName);
  };

  const handleSaveRename = (workflowId: string) => {
    if (editingName.trim() && onRenameWorkflow) {
      onRenameWorkflow(workflowId, editingName.trim());
    }
    setEditingWorkflow(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingWorkflow(null);
    setEditingName('');
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (onDeleteWorkflow) {
      onDeleteWorkflow(workflowId);
    }
  };

  const handleToggleWorkflowVisibility = (workflowId: string) => {
    setHiddenWorkflows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
      }
      return newSet;
    });
    
    if (onToggleWorkflowVisibility) {
      onToggleWorkflowVisibility(workflowId);
    }
  };

  return (
    <div className="layers-panel">
      <div className="layers-panel-header">
        <h3 className="layers-panel-title">Layers</h3>
      </div>
      
      <div className="layers-panel-content">
        {/* Groups Section */}
        {groups.length > 0 && (
          <div className="layers-panel-section">
            <button
              className="layers-panel-section-header"
              onClick={() => toggleSection('groups')}
            >
              {expandedSections.groups ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Groups ({groups.length})</span>
            </button>
            {expandedSections.groups && (
              <div className="layers-panel-section-content">
                {groups.map((group) => (
                  <LayerItem
                    key={group.id}
                    id={group.id}
                    type="group"
                    label={group.label}
                    color={group.color}
                    isSelected={selectedId === group.id}
                    isVisible={group.isVisible}
                    isLocked={group.isLocked}
                    children={group.children}
                    onSelect={onSelect}
                    onToggleVisibility={onToggleVisibility}
                    onToggleLock={onToggleLock}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Workflow Groups */}
        {(() => {
          // Smart workflow detection based on connected components
          const workflowGroups: { [key: string]: { nodes: NodeData[]; edges: EdgeData[]; name: string; order: number } } = {};
          const ungroupedNodes: NodeData[] = [];
          const visitedNodes = new Set<string>();

          // Helper function to find connected nodes (workflow detection)
          const findConnectedNodes = (startNodeId: string, visited = new Set<string>()): Set<string> => {
            if (visited.has(startNodeId)) return visited;
            visited.add(startNodeId);
            
            // Find all edges connected to this node
            edges.forEach(edge => {
              if (edge.source === startNodeId && !visited.has(edge.target)) {
                findConnectedNodes(edge.target, visited);
              }
              if (edge.target === startNodeId && !visited.has(edge.source)) {
                findConnectedNodes(edge.source, visited);
              }
            });
            
            return visited;
          };

          // Helper function to generate smart workflow name based on nodes
          const generateWorkflowName = (workflowNodes: NodeData[]): string => {
            // Priority: KFrame label > Most common node type > First node label
            const kframe = workflowNodes.find(n => n.type === 'kframe');
            if (kframe && kframe.label) {
              return kframe.label;
            }

            // Check for AI-generated workflow patterns
            const hasAINodes = workflowNodes.some(n => n.id.startsWith('node'));
            if (hasAINodes) {
              // Look for user nodes that often indicate the workflow purpose
              const userNode = workflowNodes.find(n => n.type === 'user');
              if (userNode && userNode.label) {
                return userNode.label;
              }
            }

            // Count node types to determine workflow type
            const typeCounts: { [key: string]: number } = {};
            workflowNodes.forEach(node => {
              const type = node.type || 'default';
              typeCounts[type] = (typeCounts[type] || 0) + 1;
            });

            // Generate name based on dominant node types
            const dominantType = Object.entries(typeCounts)
              .sort((a, b) => b[1] - a[1])[0]?.[0];

            const typeNames: { [key: string]: string } = {
              'api': 'API Integration',
              'database': 'Data Processing',
              'user': 'User Workflow',
              'process': 'Process Flow',
              'decision': 'Decision Flow',
              'data': 'Data Pipeline',
              'output': 'Output Process',
              'input': 'Input Handler'
            };

            // Use first meaningful node label if available
            const firstLabeledNode = workflowNodes.find(n => n.label && n.label.length > 2);
            if (firstLabeledNode && firstLabeledNode.label) {
              return firstLabeledNode.label;
            }

            return typeNames[dominantType] || 'Workflow';
          };

          // Detect workflows by finding connected components
          let workflowIndex = 0;
          nodes.forEach(node => {
            if (!visitedNodes.has(node.id)) {
              const connectedNodeIds = findConnectedNodes(node.id);
              
              // Only create a workflow group if there are at least 2 connected nodes
              if (connectedNodeIds.size >= 2) {
                const workflowNodes = nodes.filter(n => connectedNodeIds.has(n.id));
                const workflowEdges = edges.filter(e => 
                  connectedNodeIds.has(e.source) && connectedNodeIds.has(e.target)
                );
                
                const workflowId = `workflow-${workflowIndex}`;
                const workflowName = generateWorkflowName(workflowNodes);
                
                // Sort nodes by position for proper workflow structure
                workflowNodes.sort((a, b) => {
                  if (!a.position || !b.position) return 0;
                  const yDiff = a.position.y - b.position.y;
                  if (Math.abs(yDiff) > 50) return yDiff;
                  return a.position.x - b.position.x;
                });
                
                workflowGroups[workflowId] = {
                  nodes: workflowNodes,
                  edges: workflowEdges,
                  name: workflowName,
                  order: workflowIndex
                };
                
                connectedNodeIds.forEach(id => visitedNodes.add(id));
                workflowIndex++;
              } else {
                // Single unconnected node
                ungroupedNodes.push(node);
                visitedNodes.add(node.id);
              }
            }
          });

          return (
            <>
              {/* Workflow Groups - Sort by order */}
              {Object.entries(workflowGroups)
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([workflowId, workflow]) => (
                <div key={workflowId} className="layers-panel-section">
                  <div className="layers-panel-section-header-container">
                    <button
                      className="layers-panel-section-header flex-1"
                      onClick={() => toggleSection(workflowId as any)}
                    >
                      {(expandedSections as any)[workflowId] === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      {editingWorkflow === workflowId ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleSaveRename(workflowId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveRename(workflowId);
                            } else if (e.key === 'Escape') {
                              handleCancelRename();
                            }
                          }}
                          className="bg-transparent border-none outline-none text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span>{workflow.name} ({workflow.nodes.length + workflow.edges.length})</span>
                      )}
                    </button>
                    
                    {/* Workflow Actions */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWorkflowVisibility(workflowId);
                        }}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title={hiddenWorkflows.has(workflowId) ? "Show workflow" : "Hide workflow"}
                      >
                        {hiddenWorkflows.has(workflowId) ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameWorkflow(workflowId, workflow.name);
                        }}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Rename workflow"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${workflow.name}" workflow and all its nodes?`)) {
                            handleDeleteWorkflow(workflowId);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                        title="Delete workflow"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {(expandedSections as any)[workflowId] !== false && (
                    <div className="layers-panel-section-content">
                      {workflow.nodes.map((node) => (
                        <LayerItem
                          key={node.id}
                          id={node.id}
                          type="node"
                          label={node.label}
                          color={node.color}
                          isSelected={selectedId === node.id}
                          isVisible={node.isVisible}
                          isLocked={node.isLocked}
                          onSelect={onSelect}
                          onToggleVisibility={onToggleVisibility}
                          onToggleLock={onToggleLock}
                        />
                      ))}
                      {workflow.edges.map((edge) => (
                        <LayerItem
                          key={edge.id}
                          id={edge.id}
                          type="edge"
                          label={edge.label || `${edge.source} → ${edge.target}`}
                          isSelected={selectedId === edge.id}
                          isVisible={edge.isVisible}
                          isLocked={edge.isLocked}
                          onSelect={onSelect}
                          onToggleVisibility={onToggleVisibility}
                          onToggleLock={onToggleLock}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Ungrouped Nodes */}
              {ungroupedNodes.length > 0 && (
                <div className="layers-panel-section">
                  <button
                    className="layers-panel-section-header"
                    onClick={() => toggleSection('nodes')}
                  >
                    {expandedSections.nodes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>Ungrouped Nodes ({ungroupedNodes.length})</span>
                  </button>
                  {expandedSections.nodes && (
                    <div className="layers-panel-section-content">
                      {ungroupedNodes.map((node) => (
                        <LayerItem
                          key={node.id}
                          id={node.id}
                          type="node"
                          label={node.label}
                          color={node.color}
                          isSelected={selectedId === node.id}
                          isVisible={node.isVisible}
                          isLocked={node.isLocked}
                          onSelect={onSelect}
                          onToggleVisibility={onToggleVisibility}
                          onToggleLock={onToggleLock}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}

        {/* Ungrouped Edges */}
        {(() => {
          // Find edges that aren't part of any workflow group
          const groupedEdgeIds = new Set<string>();
          Object.values(workflowGroups).forEach(group => {
            group.edges.forEach(edge => groupedEdgeIds.add(edge.id));
          });
          
          const ungroupedEdges = edges.filter(edge => !groupedEdgeIds.has(edge.id));

          return ungroupedEdges.length > 0 ? (
            <div className="layers-panel-section">
              <button
                className="layers-panel-section-header"
                onClick={() => toggleSection('edges')}
              >
                {expandedSections.edges ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Ungrouped Edges ({ungroupedEdges.length})</span>
              </button>
              {expandedSections.edges && (
                <div className="layers-panel-section-content">
                  {ungroupedEdges.map((edge) => (
                    <LayerItem
                      key={edge.id}
                      id={edge.id}
                      type="edge"
                      label={edge.label || `${edge.source} → ${edge.target}`}
                      isSelected={selectedId === edge.id}
                      isVisible={edge.isVisible}
                      isLocked={edge.isLocked}
                      onSelect={onSelect}
                      onToggleVisibility={onToggleVisibility}
                      onToggleLock={onToggleLock}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
};