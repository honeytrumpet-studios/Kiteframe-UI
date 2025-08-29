import type { Meta, StoryObj } from '@storybook/react';
import { DefaultNode } from './DefaultNode';
import { Node } from '../types';

const meta: Meta<typeof DefaultNode> = {
  title: 'KiteFrame/DefaultNode',
  component: DefaultNode,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    node: {
      control: 'object',
      description: 'Node configuration object',
    },
    onDrag: {
      action: 'dragged',
      description: 'Called when node is dragged',
    },
    onClick: {
      action: 'clicked',
      description: 'Called when node is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseNode: Node = {
  id: 'example-node',
  type: 'default',
  position: { x: 0, y: 0 },
  data: {
    label: 'Example Node',
    description: 'This is an example node',
    color: '#3b82f6',
    icon: '📦'
  }
};

export const Default: Story = {
  args: {
    node: baseNode,
    onDrag: (nodeId, position) => {
      console.log('Node dragged:', nodeId, position);
    },
    onClick: (event, node) => {
      console.log('Node clicked:', node);
    },
  },
};

export const StartNode: Story = {
  args: {
    node: {
      ...baseNode,
      id: 'start-node',
      data: {
        label: 'Start',
        description: 'Beginning of process',
        color: '#22c55e',
        icon: '🚀'
      }
    },
  },
};

export const ProcessNode: Story = {
  args: {
    node: {
      ...baseNode,
      id: 'process-node',
      data: {
        label: 'Process',
        description: 'Main processing step',
        color: '#3b82f6',
        icon: '⚡'
      }
    },
  },
};

export const EndNode: Story = {
  args: {
    node: {
      ...baseNode,
      id: 'end-node',
      data: {
        label: 'End',
        description: 'Final output',
        color: '#ef4444',
        icon: '🎯'
      }
    },
  },
};

export const CustomColors: Story = {
  args: {
    node: {
      ...baseNode,
      id: 'custom-node',
      data: {
        label: 'Custom Node',
        description: 'Node with custom styling',
        color: '#8b5cf6',
        icon: '🎨'
      }
    },
  },
};

export const LongLabel: Story = {
  args: {
    node: {
      ...baseNode,
      id: 'long-label-node',
      data: {
        label: 'This is a very long label that should wrap properly',
        description: 'Node with a very long label to test text wrapping',
        color: '#f59e0b',
        icon: '📝'
      }
    },
  },
};