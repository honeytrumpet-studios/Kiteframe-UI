import React, { useState, useRef, useCallback } from 'react';
import { FlowGenerator } from '../../../components/FlowGenerator';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp,
  Layers,
  History,
  File,
  FolderOpen,
  Plus,
  Database,
  Users,
  Settings,
  Network,
  Workflow,
  GitBranch,
  Target,
  Zap,
  Eye,
  Trash2,
  BarChart3,
  Lock,
  Unlock,
  EyeOff,
  Sparkles,
  Code,
  Edit,
  Save,
  DollarSign,
  Headphones,
  Search,
  Filter,
  ArrowUpDown,
  LogIn,
  User,
  CheckCircle,
  MoreVertical,
  FileText,
  Link2,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { NestedLayersPanel } from './layers/NestedLayersPanel';
import { buildLayerStructure } from './layers/layerBuilder';
import { findNonOverlappingPosition } from '../../../utils/layout';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useDeleteProject, useRenameProject } from '@/hooks/useProjects';
import type { Node, Edge } from '../types';

// Color mapping function for template node types (matching AI workflow system)
function getTemplateNodeColors(nodeType: string) {
  const colorMap: Record<string, { backgroundColor: string; borderColor: string }> = {
    // Input nodes - Green theme
    'input': { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
    'start': { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
    'submit': { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
    'source': { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
    'trigger': { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
    
    // Process nodes - Blue theme  
    'process': { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
    'parse': { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
    'aggregate': { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
    'condition': { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
    'review': { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
    
    // Decision nodes - Yellow theme
    'decision': { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
    
    // Output nodes - Pink theme
    'output': { backgroundColor: '#fce7f3', borderColor: '#ec4899' },
    'approved': { backgroundColor: '#fce7f3', borderColor: '#ec4899' },
    'visualization': { backgroundColor: '#fce7f3', borderColor: '#ec4899' },
    'execute': { backgroundColor: '#fce7f3', borderColor: '#ec4899' },
    
    // Data nodes - Purple theme
    'store': { backgroundColor: '#ede9fe', borderColor: '#8b5cf6' },
    
    // API nodes - Red theme
    'api': { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
    'rejected': { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
    
    // User nodes - Teal theme
    'actionA': { backgroundColor: '#ccfbf1', borderColor: '#14b8a6' },
    'actionB': { backgroundColor: '#ccfbf1', borderColor: '#14b8a6' },
    
    // System nodes - Gray theme (default)
    'default': { backgroundColor: '#f1f5f9', borderColor: '#64748b' }
  };
  
  return colorMap[nodeType.toLowerCase()] || colorMap['default'];
}

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  nodes: Node[];
  edges: Omit<Edge, 'id'>[];
}

interface FlowSidePanelProps {
  // State
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  
  // Canvas data
  nodes: Node[];
  edges: Edge[];
  canvasTexts?: any[];
  selectedNodes: string[];
  selectedEdges: string[];
  
  // Flow templates
  onAddFlow: (template: FlowTemplate) => void;
  onAddNodes?: (nodes: Node[]) => void;
  onAddEdges?: (edges: Edge[]) => void;
  
  // AI workflow generation
  onGenerateWorkflow?: (nodes: Node[], edges: Edge[]) => void;
  
  // Layers panel
  onSelectNode: (nodeId: string) => void;
  onToggleNodeVisibility?: (nodeId: string) => void;
  onToggleNodeLock?: (nodeId: string) => void;
  
  // Version history
  history: Array<{
    id: string;
    label: string;
    timestamp: number;
    nodes: Node[];
    edges: Edge[];
  }>;
  currentHistoryIndex: number;
  onRestoreVersion: (index: number) => void;
  onDeleteVersion: (index: number) => void;
  onPreviewVersion: (version: any) => void;
  onSaveSnapshot?: () => void;
  onDeleteHistory?: () => void;
  
  // Saved projects (placeholder)
  savedProjects: Array<{
    id: string;
    name: string;
    thumbnail: string;
    lastModified: Date;
  }>;
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  
  // Workflow names management
  workflowNames?: Record<string, string>;
  onRenameWorkflow?: (workflowId: string, newName: string) => void;
  
  // Project management
  projectTitle?: string;
  onUpdateProjectTitle?: (title: string) => void;
  onNewProject?: () => void;
  onCopyLink?: () => void;
  onInvite?: () => void;
}

const flowTemplates: FlowTemplate[] = [
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Input → Transform → Output pipeline',
    icon: Database,
    color: '#3b82f6',
    nodes: [
      {
        id: 'input',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Input Data', 
          description: 'Data collection step', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'process',
        type: 'default',
        position: { x: 350, y: 100 },
        data: { 
          label: 'Process Data', 
          description: 'Transform and validate', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'output',
        type: 'default',
        position: { x: 600, y: 100 },
        data: { 
          label: 'Output Result', 
          description: 'Final processed data', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'input', target: 'process', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'process', target: 'output', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  {
    id: 'user-workflow',
    name: 'User Workflow',
    description: 'Multi-step user interaction flow',
    icon: Users,
    color: '#10b981',
    nodes: [
      {
        id: 'start',
        type: 'default',
        position: { x: 100, y: 200 },
        data: { 
          label: 'Start', 
          description: 'User begins process', 
          ...getTemplateNodeColors('start'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'decision',
        type: 'default',
        position: { x: 300, y: 150 },
        data: { 
          label: 'Decision', 
          description: 'User makes choice', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'actionA',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Action A', 
          description: 'Path A execution', 
          ...getTemplateNodeColors('actionA'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'actionB',
        type: 'default',
        position: { x: 500, y: 250 },
        data: { 
          label: 'Action B', 
          description: 'Path B execution', 
          ...getTemplateNodeColors('actionB'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'start', target: 'decision', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'decision', target: 'actionA', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'decision', target: 'actionB', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'External API data flow',
    icon: Network,
    color: '#f59e0b',
    nodes: [
      {
        id: 'api',
        type: 'default',
        position: { x: 100, y: 300 },
        data: { 
          label: 'API Call', 
          description: 'External request', 
          ...getTemplateNodeColors('api'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'parse',
        type: 'default',
        position: { x: 350, y: 300 },
        data: { 
          label: 'Parse Response', 
          description: 'Process API data', 
          ...getTemplateNodeColors('parse'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'store',
        type: 'default',
        position: { x: 600, y: 300 },
        data: { 
          label: 'Store Data', 
          description: 'Save to database', 
          ...getTemplateNodeColors('store'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'api', target: 'parse', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'parse', target: 'store', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Data visualization pipeline',
    icon: BarChart3,
    color: '#8b5cf6',
    nodes: [
      {
        id: 'source',
        type: 'default',
        position: { x: 100, y: 400 },
        data: { 
          label: 'Data Source', 
          description: 'Raw analytics data', 
          ...getTemplateNodeColors('source'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'aggregate',
        type: 'default',
        position: { x: 350, y: 400 },
        data: { 
          label: 'Aggregate Data', 
          description: 'Combine and summarize', 
          ...getTemplateNodeColors('aggregate'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'visualization',
        type: 'default',
        position: { x: 600, y: 400 },
        data: { 
          label: 'Visualization', 
          description: 'Chart display', 
          ...getTemplateNodeColors('visualization'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'source', target: 'aggregate', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'aggregate', target: 'visualization', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  {
    id: 'approval-workflow',
    name: 'Approval Workflow',
    description: 'Multi-stage approval process',
    icon: GitBranch,
    color: '#06b6d4',
    nodes: [
      {
        id: 'submit',
        type: 'default',
        position: { x: 100, y: 500 },
        data: { 
          label: 'Submit', 
          description: 'Initial request', 
          ...getTemplateNodeColors('submit'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'review',
        type: 'default',
        position: { x: 300, y: 500 },
        data: { 
          label: 'Review', 
          description: 'Manager approval', 
          ...getTemplateNodeColors('review'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'approved',
        type: 'default',
        position: { x: 500, y: 450 },
        data: { 
          label: 'Approved', 
          description: 'Request approved', 
          ...getTemplateNodeColors('approved'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'rejected',
        type: 'default',
        position: { x: 500, y: 550 },
        data: { 
          label: 'Rejected', 
          description: 'Request denied', 
          ...getTemplateNodeColors('rejected'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'submit', target: 'review', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'review', target: 'approved', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'review', target: 'rejected', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  {
    id: 'automation-pipeline',
    name: 'Automation Pipeline',
    description: 'Automated task execution',
    icon: Zap,
    color: '#eab308',
    nodes: [
      {
        id: 'trigger',
        type: 'default',
        position: { x: 100, y: 600 },
        data: { 
          label: 'Trigger', 
          description: 'Event trigger', 
          ...getTemplateNodeColors('trigger'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'condition',
        type: 'default',
        position: { x: 300, y: 600 },
        data: { 
          label: 'Condition', 
          description: 'Check criteria', 
          ...getTemplateNodeColors('condition'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'execute',
        type: 'default',
        position: { x: 500, y: 600 },
        data: { 
          label: 'Execute', 
          description: 'Run automation', 
          ...getTemplateNodeColors('execute'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'trigger', target: 'condition', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'condition', target: 'execute', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  {
    id: 'moodboard',
    name: 'Moodboard',
    description: 'Visual inspiration board with image collections',
    icon: Target,
    color: '#ec4899',
    nodes: [
      // First KFrame
      {
        id: 'kframe1',
        type: 'kframe',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Inspiration A',
          description: 'First collection',
          style: {
            backgroundColor: '#fce7f3',
            borderColor: '#ec4899',
            borderWidth: 2,
            borderStyle: 'dashed'
          }
        },
        style: { width: 380, height: 288 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      // Second KFrame
      {
        id: 'kframe2',
        type: 'kframe',
        position: { x: 520, y: 100 },
        data: { 
          label: 'Inspiration B',
          description: 'Second collection',
          style: {
            backgroundColor: '#fce7f3',
            borderColor: '#ec4899',
            borderWidth: 2,
            borderStyle: 'dashed'
          }
        },
        style: { width: 380, height: 288 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      // First KFrame images (2x3 grid) - shifted down 48px for label/description space
      {
        id: 'image1-1',
        type: 'image',
        position: { x: 120, y: 188 },
        data: { 
          label: 'Image 1',
          src: '',
          parentFrameId: 'kframe1'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image1-2',
        type: 'image',
        position: { x: 240, y: 188 },
        data: { 
          label: 'Image 2',
          src: '',
          parentFrameId: 'kframe1'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image1-3',
        type: 'image',
        position: { x: 360, y: 188 },
        data: { 
          label: 'Image 3',
          src: '',
          parentFrameId: 'kframe1'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image1-4',
        type: 'image',
        position: { x: 120, y: 288 },
        data: { 
          label: 'Image 4',
          src: '',
          parentFrameId: 'kframe1'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image1-5',
        type: 'image',
        position: { x: 240, y: 288 },
        data: { 
          label: 'Image 5',
          src: '',
          parentFrameId: 'kframe1'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image1-6',
        type: 'image',
        position: { x: 360, y: 288 },
        data: { 
          label: 'Image 6',
          src: '',
          parentFrameId: 'kframe1'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      // Second KFrame images (2x3 grid) - shifted down 48px for label/description space
      {
        id: 'image2-1',
        type: 'image',
        position: { x: 540, y: 188 },
        data: { 
          label: 'Image 1',
          src: '',
          parentFrameId: 'kframe2'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image2-2',
        type: 'image',
        position: { x: 660, y: 188 },
        data: { 
          label: 'Image 2',
          src: '',
          parentFrameId: 'kframe2'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image2-3',
        type: 'image',
        position: { x: 780, y: 188 },
        data: { 
          label: 'Image 3',
          src: '',
          parentFrameId: 'kframe2'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image2-4',
        type: 'image',
        position: { x: 540, y: 288 },
        data: { 
          label: 'Image 4',
          src: '',
          parentFrameId: 'kframe2'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image2-5',
        type: 'image',
        position: { x: 660, y: 288 },
        data: { 
          label: 'Image 5',
          src: '',
          parentFrameId: 'kframe2'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      },
      {
        id: 'image2-6',
        type: 'image',
        position: { x: 780, y: 288 },
        data: { 
          label: 'Image 6',
          src: '',
          parentFrameId: 'kframe2'
        },
        style: { width: 100, height: 80 },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true
      }
    ],
    edges: []
  },
  
  // Software Development Templates
  {
    id: 'ci-cd-pipeline',
    name: 'CI/CD Pipeline',
    description: 'Continuous Integration & Deployment workflow',
    icon: Code,
    color: '#059669',
    nodes: [
      {
        id: 'commit',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Code Commit', 
          description: 'Developer pushes code to repository', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'build',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Build & Test', 
          description: 'Automated testing and compilation', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'security-scan',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Security Scan', 
          description: 'Vulnerability and dependency check', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'staging-deploy',
        type: 'default',
        position: { x: 300, y: 250 },
        data: { 
          label: 'Deploy to Staging', 
          description: 'Deploy to staging environment', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'production-deploy',
        type: 'default',
        position: { x: 500, y: 250 },
        data: { 
          label: 'Deploy to Production', 
          description: 'Release to production environment', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'commit', target: 'build', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'build', target: 'security-scan', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'build', target: 'staging-deploy', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'security-scan', target: 'production-deploy', type: 'smoothstep', data: { color: '#22c55e' } },
      { source: 'staging-deploy', target: 'production-deploy', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  
  {
    id: 'code-review-process',
    name: 'Code Review Process',
    description: 'Collaborative code review workflow',
    icon: Code,
    color: '#7c3aed',
    nodes: [
      {
        id: 'pull-request',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Create PR', 
          description: 'Developer creates pull request', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'auto-checks',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Auto Checks', 
          description: 'Automated linting and testing', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'peer-review',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Peer Review', 
          description: 'Team member code review', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'approve-merge',
        type: 'default',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Approve & Merge', 
          description: 'Code approved and merged', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'pull-request', target: 'auto-checks', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'auto-checks', target: 'peer-review', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'peer-review', target: 'approve-merge', type: 'smoothstep', data: { color: '#22c55e' } }
    ]
  },
  
  // Marketing Templates
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'End-to-end campaign management workflow',
    icon: Target,
    color: '#ec4899',
    nodes: [
      {
        id: 'strategy',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Campaign Strategy', 
          description: 'Define goals and target audience', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'content-creation',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Content Creation', 
          description: 'Design assets and copy', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'launch',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Campaign Launch', 
          description: 'Deploy across channels', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'monitor',
        type: 'default',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Monitor & Optimize', 
          description: 'Track performance and adjust', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'strategy', target: 'content-creation', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'content-creation', target: 'launch', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'launch', target: 'monitor', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'Editorial workflow for content production',
    icon: Edit,
    color: '#f59e0b',
    nodes: [
      {
        id: 'brief',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Content Brief', 
          description: 'Define requirements and goals', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'draft',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Create Draft', 
          description: 'Write initial content', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'review',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Editorial Review', 
          description: 'Content review and feedback', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'approve',
        type: 'default',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Approve & Publish', 
          description: 'Final approval and publishing', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'brief', target: 'draft', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'draft', target: 'review', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'review', target: 'approve', type: 'smoothstep', data: { color: '#22c55e' } }
    ]
  },
  
  // Business Operations Templates
  {
    id: 'hr-hiring-process',
    name: 'HR Hiring Process',
    description: 'Complete recruitment and onboarding workflow',
    icon: Users,
    color: '#0ea5e9',
    nodes: [
      {
        id: 'job-posting',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Job Posting', 
          description: 'Create and publish job listing', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'screening',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Resume Screening', 
          description: 'Initial candidate evaluation', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'interview',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Interview Process', 
          description: 'Multiple interview rounds', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'offer',
        type: 'default',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Job Offer', 
          description: 'Extend offer to candidate', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'onboarding',
        type: 'default',
        position: { x: 500, y: 250 },
        data: { 
          label: 'Onboarding', 
          description: 'New employee orientation', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'job-posting', target: 'screening', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'screening', target: 'interview', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'interview', target: 'offer', type: 'smoothstep', data: { color: '#22c55e' } },
      { source: 'offer', target: 'onboarding', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  },
  
  {
    id: 'finance-approval',
    name: 'Finance Approval',
    description: 'Expense and budget approval workflow',
    icon: DollarSign,
    color: '#10b981',
    nodes: [
      {
        id: 'request',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Expense Request', 
          description: 'Submit expense or budget request', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'manager-review',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Manager Review', 
          description: 'Direct manager approval', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'finance-review',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Finance Review', 
          description: 'Finance team verification', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'payment',
        type: 'default',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Process Payment', 
          description: 'Approve and process payment', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'request', target: 'manager-review', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'manager-review', target: 'finance-review', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'finance-review', target: 'payment', type: 'smoothstep', data: { color: '#22c55e' } }
    ]
  },
  
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Ticket handling and escalation workflow',
    icon: Headphones,
    color: '#8b5cf6',
    nodes: [
      {
        id: 'ticket-create',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Create Ticket', 
          description: 'Customer submits support request', 
          ...getTemplateNodeColors('input'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'initial-response',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Initial Response', 
          description: 'Agent acknowledges ticket', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'investigate',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Investigate Issue', 
          description: 'Research and troubleshoot', 
          ...getTemplateNodeColors('process'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'escalate',
        type: 'default',
        position: { x: 500, y: 250 },
        data: { 
          label: 'Escalate to Specialist', 
          description: 'Complex issue escalation', 
          ...getTemplateNodeColors('decision'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      },
      {
        id: 'resolve',
        type: 'default',
        position: { x: 700, y: 100 },
        data: { 
          label: 'Resolve & Close', 
          description: 'Provide solution and close ticket', 
          ...getTemplateNodeColors('output'),
          enableGhostPreview: true 
        },
        draggable: true,
        selectable: true,
        doubleClickable: true,
        resizable: true,
        showHandles: true,
        smartConnect: { enabled: true, threshold: 50 }
      }
    ],
    edges: [
      { source: 'ticket-create', target: 'initial-response', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'initial-response', target: 'investigate', type: 'smoothstep', data: { color: '#64748b' } },
      { source: 'investigate', target: 'escalate', type: 'smoothstep', data: { color: '#f59e0b' } },
      { source: 'investigate', target: 'resolve', type: 'smoothstep', data: { color: '#22c55e' } },
      { source: 'escalate', target: 'resolve', type: 'smoothstep', data: { color: '#64748b' } }
    ]
  }
];

export function FlowSidePanel({
  isCollapsed,
  onToggleCollapse,
  nodes,
  edges,
  canvasTexts = [],
  selectedNodes,
  selectedEdges,
  onAddFlow,
  onAddNodes,
  onAddEdges,
  onGenerateWorkflow,
  onSelectNode,
  onToggleNodeVisibility,
  onToggleNodeLock,
  history,
  currentHistoryIndex,
  onRestoreVersion,
  onDeleteVersion,
  onPreviewVersion,
  onSaveSnapshot,
  onDeleteHistory,
  savedProjects,
  onLoadProject,
  onDeleteProject,
  workflowNames = {},
  onRenameWorkflow,
  projectTitle = 'My Project',
  onUpdateProjectTitle,
  onNewProject,
  onCopyLink,
  onInvite
}: FlowSidePanelProps) {
  const [activeTab, setActiveTab] = useState<'sparkle' | 'flows' | 'layers' | 'projects' | 'history'>('sparkle');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'data-workflows': true,
    'user-interactions': true,
    'integrations': true,
    'software-development': true,
    'marketing': true,
    'business-operations': true
  });



  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };





  const templatesByCategory = {
    'data-workflows': [
      flowTemplates.find(t => t.id === 'data-processing')!,
      flowTemplates.find(t => t.id === 'analytics-dashboard')!
    ],
    'user-interactions': [
      flowTemplates.find(t => t.id === 'user-workflow')!,
      flowTemplates.find(t => t.id === 'approval-workflow')!
      // Temporarily hidden: flowTemplates.find(t => t.id === 'moodboard')!
    ],
    'integrations': [
      flowTemplates.find(t => t.id === 'api-integration')!,
      flowTemplates.find(t => t.id === 'automation-pipeline')!
    ],
    'software-development': [
      flowTemplates.find(t => t.id === 'ci-cd-pipeline')!,
      flowTemplates.find(t => t.id === 'code-review-process')!
    ],
    'marketing': [
      flowTemplates.find(t => t.id === 'marketing-campaign')!,
      flowTemplates.find(t => t.id === 'content-creation')!
    ],
    'business-operations': [
      flowTemplates.find(t => t.id === 'hr-hiring-process')!,
      flowTemplates.find(t => t.id === 'finance-approval')!,
      flowTemplates.find(t => t.id === 'customer-support')!
    ]
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300",
      isCollapsed ? "w-12" : "w-80"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={onNewProject} className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopyLink} className="cursor-pointer">
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onInvite} className="cursor-pointer">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              value={projectTitle === 'My Project' ? '' : projectTitle}
              placeholder="My Project"
              onChange={(e) => onUpdateProjectTitle?.(e.target.value || 'My Project')}
              className="text-sm font-semibold bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 flex-1"
              onBlur={(e) => {
                if (!e.target.value.trim()) {
                  onUpdateProjectTitle?.('My Project');
                }
              }}
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-1 h-8 w-8"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('sparkle')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center justify-center",
                activeTab === 'sparkle'
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab('flows')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === 'flows'
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              Flows
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === 'layers'
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              Layers
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === 'projects'
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === 'history'
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              History
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'sparkle' && (
              <div className="p-4">
                <FlowGenerator 
                  onGenerateWorkflow={onGenerateWorkflow}
                  className="w-full"
                />
              </div>
            )}
            
            {activeTab === 'flows' && (
              <div className="p-2">
                {Object.entries(templatesByCategory).map(([categoryId, templates]) => (
                  <div key={categoryId} className="mb-4">
                    <button
                      onClick={() => toggleSection(categoryId)}
                      className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {categoryId.replace('-', ' ')}
                      </span>
                      {expandedSections[categoryId] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </button>
                    {expandedSections[categoryId] && (
                      <div className="mt-2 space-y-2">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={(e) => {
                              console.log('[DEBUG FlowSidePanel] CLICK EVENT:', {
                                templateId: template.id,
                                timestamp: Date.now(),
                                event: 'template_clicked'
                              });
                              console.log('[DEBUG FlowSidePanel] Template clicked:', {
                                templateId: template.id,
                                templateName: template.name,
                                hasOnAddNodes: !!onAddNodes,
                                hasOnAddEdges: !!onAddEdges,
                                nodeCount: template.nodes?.length || 0
                              });
                              
                              // Use smart positioning if onAddNodes/onAddEdges are available
                              if (onAddNodes && onAddEdges) {
                                const workflowId = crypto.randomUUID();
                                const workflowNodes = template.nodes.map(node => ({
                                  ...node,
                                  id: `${node.id}-${crypto.randomUUID()}`,
                                  workflowId: workflowId,
                                  workflowName: template.name
                                }));

                                // Create mapping from old to new node IDs
                                const nodeIdMapping = {};
                                workflowNodes.forEach((node, index) => {
                                  const originalId = template.nodes[index].id;
                                  nodeIdMapping[originalId] = node.id;
                                });

                                const workflowEdges = template.edges.map((edge, index) => ({
                                  ...edge,
                                  id: `${template.id}-edge-${index + 1}-${crypto.randomUUID()}`,
                                  source: nodeIdMapping[edge.source] || edge.source,
                                  target: nodeIdMapping[edge.target] || edge.target,
                                  workflowId: workflowId,
                                  workflowName: template.name
                                }));

                                // Use smart positioning to prevent overlaps
                                const existingNodes = [...(nodes || [])];
                                const { nodes: positionedNodes, edges: positionedEdges } = findNonOverlappingPosition(
                                  existingNodes,
                                  workflowNodes,
                                  workflowEdges
                                );

                                console.log('[FlowSidePanel] Adding template workflow with smart positioning:', {
                                  templateName: template.name,
                                  nodeCount: positionedNodes.length,
                                  edgeCount: positionedEdges.length,
                                  firstNodePosition: positionedNodes[0]?.position
                                });

                                // Special logging for mood board template to track positioning and parent-child relationships
                                if (template.id === 'moodboard') {
                                  console.log('[Moodboard Template] Creating mood board with detailed positioning analysis');
                                  
                                  // Extract KFrames and their children
                                  const kframes = positionedNodes.filter(node => node.type === 'kframe');
                                  const imageNodes = positionedNodes.filter(node => node.type === 'image');
                                  
                                  console.log('[Moodboard KFrames] KFrame boundaries and children:', {
                                    totalKFrames: kframes.length,
                                    totalImageNodes: imageNodes.length
                                  });
                                  
                                  kframes.forEach(kframe => {
                                    const frameX = kframe.position.x;
                                    const frameY = kframe.position.y;
                                    const frameWidth = kframe.style?.width || 400;
                                    const frameHeight = kframe.style?.height || 300;
                                    
                                    // Find child nodes for this KFrame
                                    const childNodes = imageNodes.filter(node => 
                                      node.data?.parentFrameId?.replace(`-${timestamp}`, '') === kframe.id.replace(`-${timestamp}`, '')
                                    );
                                    
                                    console.log('[Moodboard KFrame] KFrame positioning and boundaries:', {
                                      frameId: kframe.id,
                                      frameLabel: kframe.data?.label,
                                      framePosition: { x: frameX, y: frameY },
                                      frameDimensions: { width: frameWidth, height: frameHeight },
                                      frameBounds: {
                                        left: frameX,
                                        top: frameY,
                                        right: frameX + frameWidth,
                                        bottom: frameY + frameHeight
                                      },
                                      childCount: childNodes.length,
                                      childIds: childNodes.map(c => c.id)
                                    });
                                    
                                    // Log each child node's position and validate containment
                                    childNodes.forEach(child => {
                                      const childX = child.position.x;
                                      const childY = child.position.y;
                                      const childWidth = child.style?.width || 100;
                                      const childHeight = child.style?.height || 80;
                                      const childRight = childX + childWidth;
                                      const childBottom = childY + childHeight;
                                      const frameRight = frameX + frameWidth;
                                      const frameBottom = frameY + frameHeight;
                                      
                                      const isWithinBounds = 
                                        childX >= frameX && 
                                        childY >= frameY && 
                                        childRight <= frameRight && 
                                        childBottom <= frameBottom;
                                      
                                      console.log('[Moodboard Child] Image node positioning analysis:', {
                                        childId: child.id,
                                        childLabel: child.data?.label,
                                        parentFrameId: child.data?.parentFrameId,
                                        childPosition: { x: childX, y: childY },
                                        childDimensions: { width: childWidth, height: childHeight },
                                        childBounds: {
                                          left: childX,
                                          top: childY,
                                          right: childRight,
                                          bottom: childBottom
                                        },
                                        relativeToParent: {
                                          offsetX: childX - frameX,
                                          offsetY: childY - frameY,
                                          centerX: (childX + childWidth/2) - (frameX + frameWidth/2),
                                          centerY: (childY + childHeight/2) - (frameY + frameHeight/2)
                                        },
                                        boundaryValidation: {
                                          withinLeftEdge: childX >= frameX,
                                          withinTopEdge: childY >= frameY,
                                          withinRightEdge: childRight <= frameRight,
                                          withinBottomEdge: childBottom <= frameBottom,
                                          isFullyContained: isWithinBounds
                                        },
                                        margins: {
                                          left: childX - frameX,
                                          top: childY - frameY,
                                          right: frameRight - childRight,
                                          bottom: frameBottom - childBottom
                                        }
                                      });
                                      
                                      if (isWithinBounds) {
                                        console.log(`[Moodboard Validation] ✅ Child ${child.id} is properly contained within parent ${kframe.id}`);
                                      } else {
                                        console.warn(`[Moodboard Validation] ❌ Child ${child.id} extends outside parent ${kframe.id} boundaries!`);
                                      }
                                    });
                                    
                                    console.log('[Moodboard KFrame Summary] Containment summary for', kframe.id, ':', {
                                      totalChildren: childNodes.length,
                                      containedChildren: childNodes.filter(child => {
                                        const childX = child.position.x;
                                        const childY = child.position.y;
                                        const childWidth = child.style?.width || 100;
                                        const childHeight = child.style?.height || 80;
                                        return childX >= frameX && 
                                               childY >= frameY && 
                                               (childX + childWidth) <= (frameX + frameWidth) && 
                                               (childY + childHeight) <= (frameY + frameHeight);
                                      }).length
                                    });
                                  });
                                }

                                onAddNodes(positionedNodes);
                                onAddEdges(positionedEdges);
                              } else {
                                // Fallback to original method
                                onAddFlow(template);
                              }
                            }}
                            className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="p-2 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: `${template.color}20` }}
                              >
                                <template.icon 
                                  className="h-4 w-4" 
                                  style={{ color: template.color }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {template.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {template.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="p-2">
                <NestedLayersPanel
                  workflows={buildLayerStructure(nodes, edges, canvasTexts)}
                  onSelect={(id: string, type: string) => {
                    console.log('[NestedLayersPanel] Selected:', { id, type });
                    onSelectNode(id);
                  }}
                  onToggleVisibility={onToggleNodeVisibility ? (id: string, type: string) => {
                    console.log('[NestedLayersPanel] Toggle visibility:', { id, type });
                    onToggleNodeVisibility(id);
                  } : undefined}
                  onRenameWorkflow={(id: string, newName: string) => {
                    console.log(`[FlowSidePanel] Workflow rename request: ${id} -> ${newName}`);
                    onRenameWorkflow?.(id, newName);
                  }}
                  workflowNames={workflowNames}
                />
              </div>
            )}

            {activeTab === 'projects' && <ProjectsTab onLoadProject={onLoadProject} />}

            {activeTab === 'history' && (
              <div className="p-2">
                {/* Action Bar */}
                <div className="flex items-center justify-end mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSaveSnapshot}
                      className="text-xs"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save Snapshot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure? This will delete all history snapshots and can't be undone.")) {
                          onDeleteHistory?.();
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                      disabled={!history || history.length === 0}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete History
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {history.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "group p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors",
                        index === currentHistoryIndex
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="group/edit relative">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.isContentEditable) return;
                                  target.contentEditable = "true";
                                  target.focus();
                                  // Select all text
                                  const range = document.createRange();
                                  range.selectNodeContents(target);
                                  const sel = window.getSelection();
                                  sel?.removeAllRanges();
                                  sel?.addRange(range);
                                }}
                                onBlur={(e) => {
                                  const target = e.target as HTMLElement;
                                  target.contentEditable = "false";
                                  const newLabel = target.textContent || entry.label;
                                  if (newLabel !== entry.label) {
                                    // TODO: Add callback to update version label
                                    console.log('Update version label:', entry.id, newLabel);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    (e.target as HTMLElement).blur();
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault();
                                    (e.target as HTMLElement).textContent = entry.label;
                                    (e.target as HTMLElement).blur();
                                  }
                                }}
                                suppressContentEditableWarning={true}
                            >
                              {entry.label}
                            </h4>
                            <Edit className="h-3 w-3 absolute -right-4 top-0.5 opacity-0 group-hover/edit:opacity-50 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {entry.nodes.length} nodes, {entry.edges.length} edges
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Don't show preview button for current version */}
                          {index !== currentHistoryIndex && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onPreviewVersion(entry)}
                              className="h-6 w-6 p-0"
                              title="Preview"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRestoreVersion(index)}
                            className="h-6 w-6 p-0"
                            title="Restore"
                          >
                            <FolderOpen className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteVersion(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Delete"
                            disabled={index === 0 || history.length <= 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Enhanced Projects Tab Component
const ProjectsTab: React.FC<{ onLoadProject: (projectId: string) => void }> = ({ onLoadProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { data: projects, isLoading: projectsLoading, error } = useProjects(searchQuery, sortBy);
  const deleteProjectMutation = useDeleteProject();
  const renameProjectMutation = useRenameProject();

  const handleRename = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setNewName(currentName);
  };

  const confirmRename = () => {
    if (editingProject && newName.trim()) {
      renameProjectMutation.mutate(
        { projectId: editingProject, title: newName.trim() },
        {
          onSuccess: () => {
            setEditingProject(null);
            setNewName('');
          }
        }
      );
    }
  };

  const cancelRename = () => {
    setEditingProject(null);
    setNewName('');
  };

  if (authLoading) {
    return (
      <div className="p-2">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <LogIn className="h-8 w-8 mx-auto mb-3" />
          <h3 className="text-sm font-medium mb-2">Sign in to access your projects</h3>
          <p className="text-xs mb-4">Save and manage your workflow projects</p>
          <Button
            onClick={() => window.location.href = '/api/login'}
            size="sm"
            className="text-xs"
          >
            <User className="h-3 w-3 mr-1" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">


      {/* Search and Filter Controls */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-3 w-3 absolute left-2 top-2.5 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'title' ? 'updatedAt' : 'title')}
            className="text-xs h-8"
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            {sortBy === 'title' ? 'Name' : 'Modified'}
          </Button>
        </div>

      </div>

      {/* Project List */}
      <div className="space-y-2">
        {projectsLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            <FolderOpen className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Failed to load projects</p>
            <p className="text-xs mt-1">Please try again later</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FolderOpen className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">
              {searchQuery ? 'No projects match your search' : 'No saved projects'}
            </p>
            <p className="text-xs mt-1">
              {searchQuery ? 'Try a different search term' : 'Your saved workflows will appear here'}
            </p>
          </div>
        ) : (
          projects.map((project: any) => (
            <div
              key={project.id}
              className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {editingProject === project.id ? (
                    <div className="space-y-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename();
                          if (e.key === 'Escape') cancelRename();
                        }}
                        className="h-6 text-xs"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={confirmRename}
                          disabled={renameProjectMutation.isPending || !newName.trim()}
                          className="h-5 px-2 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelRename}
                          className="h-5 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {project.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Modified: {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                      {project.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {project.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
                
                {editingProject !== project.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLoadProject(project.id)}
                      className="h-6 w-6 p-0"
                      title="Load Project"
                    >
                      <File className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRename(project.id, project.title)}
                      className="h-6 w-6 p-0"
                      title="Rename Project"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this project?')) {
                          deleteProjectMutation.mutate(project.id);
                        }
                      }}
                      disabled={deleteProjectMutation.isPending}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      title="Delete Project"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};