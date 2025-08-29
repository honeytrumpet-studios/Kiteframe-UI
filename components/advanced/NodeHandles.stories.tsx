import type { Meta, StoryObj } from '@storybook/react';
import { NodeHandles } from './NodeHandles';
import { Node } from '../types';

const meta: Meta<typeof NodeHandles> = {
  title: 'KiteFrame/NodeHandles',
  component: NodeHandles,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '200px', height: '100px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    node: {
      control: 'object',
      description: 'Node object with handle configuration',
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
    description: 'Node with handles',
    color: '#3b82f6',
    icon: '📦'
  }
};

export const Default: Story = {
  args: {
    node: baseNode,
  },
};

export const WithCustomHandles: Story = {
  args: {
    node: {
      ...baseNode,
      id: 'custom-handles-node',
      data: {
        ...baseNode.data,
        label: 'Custom Handles',
        description: 'Node with multiple connection points',
      }
    },
  },
};