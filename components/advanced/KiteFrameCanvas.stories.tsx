import type { Meta, StoryObj } from '@storybook/react';
import { KiteFrameCanvas } from './KiteFrameCanvas';
import { Node, Edge } from '../types';

const meta: Meta<typeof KiteFrameCanvas> = {
  title: 'KiteFrame/KiteFrameCanvas',
  component: KiteFrameCanvas,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    nodes: {
      control: 'object',
      description: 'Array of nodes to display in the canvas',
    },
    edges: {
      control: 'object',
      description: 'Array of edges connecting the nodes',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling',
    },
  },
};

export default meta;
type Story = StoryObj<typeof KiteFrameCanvas>;

const sampleNodes: Node[] = [
  {
    id: 'start',
    type: 'default',
    position: { x: 100, y: 100 },
    data: {
      label: 'Start',
      description: 'Beginning of process',
      color: '#22c55e',
      icon: '🚀'
    }
  },
  {
    id: 'process',
    type: 'default',
    position: { x: 350, y: 100 },
    data: {
      label: 'Process',
      description: 'Main processing step',
      color: '#3b82f6',
      icon: '⚡'
    }
  },
  {
    id: 'end',
    type: 'default',
    position: { x: 600, y: 100 },
    data: {
      label: 'End',
      description: 'Final output',
      color: '#ef4444',
      icon: '🎯'
    }
  }
];

const sampleEdges: Edge[] = [
  {
    id: 'start-process',
    source: 'start',
    target: 'process',
    type: 'smoothstep',
    data: {
      label: 'Begin',
      animated: true,
      color: '#6366f1'
    }
  },
  {
    id: 'process-end',
    source: 'process',
    target: 'end',
    type: 'smoothstep',
    data: {
      label: 'Complete',
      animated: true,
      color: '#8b5cf6'
    }
  }
];

export const Default: Story = {
  args: {
    nodes: sampleNodes,
    edges: sampleEdges,
    style: { width: '100%', height: '500px' },
    onNodeClick: (event, node) => {
      console.log('Node clicked:', node);
    },
    onEdgeClick: (event, edge) => {
      console.log('Edge clicked:', edge);
    },
  },
};

export const Empty: Story = {
  args: {
    nodes: [],
    edges: [],
    style: { width: '100%', height: '400px' },
  },
};

export const SingleNode: Story = {
  args: {
    nodes: [sampleNodes[0]],
    edges: [],
    style: { width: '100%', height: '300px' },
  },
};

export const ComplexFlow: Story = {
  args: {
    nodes: [
      ...sampleNodes,
      {
        id: 'branch1',
        type: 'default',
        position: { x: 200, y: 250 },
        data: {
          label: 'Branch A',
          description: 'Alternative path',
          color: '#f59e0b',
          icon: '🌿'
        }
      },
      {
        id: 'branch2',
        type: 'default',
        position: { x: 500, y: 250 },
        data: {
          label: 'Branch B',
          description: 'Another path',
          color: '#8b5cf6',
          icon: '🌺'
        }
      }
    ],
    edges: [
      ...sampleEdges,
      {
        id: 'start-branch1',
        source: 'start',
        target: 'branch1',
        type: 'smoothstep',
        data: {
          label: 'Alt Path',
          color: '#f59e0b'
        }
      },
      {
        id: 'branch1-branch2',
        source: 'branch1',
        target: 'branch2',
        type: 'smoothstep',
        data: {
          label: 'Connect',
          color: '#8b5cf6'
        }
      },
      {
        id: 'branch2-end',
        source: 'branch2',
        target: 'end',
        type: 'smoothstep',
        data: {
          label: 'Merge',
          color: '#ef4444'
        }
      }
    ],
    style: { width: '100%', height: '500px' },
  },
};