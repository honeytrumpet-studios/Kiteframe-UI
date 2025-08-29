import type { Meta, StoryObj } from '@storybook/react';
import { ConnectionEdge } from './ConnectionEdge';
import { Edge, Node } from '../types';

const meta: Meta<typeof ConnectionEdge> = {
  title: 'KiteFrame/ConnectionEdge',
  component: ConnectionEdge,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '400px', height: '300px' }}>
        <svg width="100%" height="100%">
          <Story />
        </svg>
      </div>
    ),
  ],
  argTypes: {
    edge: {
      control: 'object',
      description: 'Edge configuration object',
    },
    sourceNode: {
      control: 'object',
      description: 'Source node object',
    },
    targetNode: {
      control: 'object',
      description: 'Target node object',
    },
    onClick: {
      action: 'clicked',
      description: 'Called when edge is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sourceNode: Node = {
  id: 'source',
  type: 'default',
  position: { x: 50, y: 50 },
  data: {
    label: 'Source',
    color: '#22c55e',
    icon: '🚀'
  }
};

const targetNode: Node = {
  id: 'target',
  type: 'default',
  position: { x: 250, y: 150 },
  data: {
    label: 'Target',
    color: '#ef4444',
    icon: '🎯'
  }
};

const baseEdge: Edge = {
  id: 'example-edge',
  source: 'source',
  target: 'target',
  type: 'smoothstep',
  data: {
    label: 'Connection',
    color: 'hsl(var(--foreground))'
  }
};

export const Default: Story = {
  args: {
    edge: baseEdge,
    sourceNode: sourceNode,
    targetNode: targetNode,
    onClick: (event, edge) => {
      console.log('Edge clicked:', edge);
    },
  },
};

export const Animated: Story = {
  args: {
    edge: {
      ...baseEdge,
      id: 'animated-edge',
      data: {
        label: 'Animated',
        animated: false,
        color: 'hsl(var(--foreground))'
      }
    },
    sourceNode: sourceNode,
    targetNode: targetNode,
  },
};

export const WithLabel: Story = {
  args: {
    edge: {
      ...baseEdge,
      id: 'labeled-edge',
      data: {
        label: 'Process Flow',
        color: 'hsl(var(--foreground))'
      }
    },
    sourceNode: sourceNode,
    targetNode: targetNode,
  },
};

export const CustomColor: Story = {
  args: {
    edge: {
      ...baseEdge,
      id: 'custom-edge',
      data: {
        label: 'Custom',
        color: 'hsl(var(--foreground))'
      }
    },
    sourceNode: sourceNode,
    targetNode: targetNode,
  },
};

export const StraightLine: Story = {
  args: {
    edge: {
      ...baseEdge,
      id: 'straight-edge',
      type: 'straight',
      data: {
        label: 'Direct',
        color: 'hsl(var(--foreground))'
      }
    },
    sourceNode: sourceNode,
    targetNode: targetNode,
  },
};