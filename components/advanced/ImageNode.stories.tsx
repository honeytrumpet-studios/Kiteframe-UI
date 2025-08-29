import type { Meta, StoryObj } from '@storybook/react';
import { ImageNode } from './ImageNode';

const meta: Meta<typeof ImageNode> = {
  title: 'KiteFrame/ImageNode',
  component: ImageNode,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    node: {
      control: 'object',
      description: 'Node data with image-specific properties',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    node: {
      id: 'image-node-1',
      type: 'image',
      position: { x: 0, y: 0 },
      style: { width: 200, height: 150 },
      data: {
        label: 'Sample Image',
        src: 'https://via.placeholder.com/200x150/6366f1/ffffff?text=KiteFrame',
        labelPosition: 'outside-bottom',
      },
    },
  },
};

export const WithInsideLabel: Story = {
  args: {
    node: {
      id: 'image-node-2',
      type: 'image',
      position: { x: 0, y: 0 },
      style: { width: 250, height: 180 },
      data: {
        label: 'Inside Label',
        src: 'https://via.placeholder.com/250x180/8b5cf6/ffffff?text=Image+Node',
        labelPosition: 'inside-top-left',
      },
    },
  },
};

export const WithOutsideTopLabel: Story = {
  args: {
    node: {
      id: 'image-node-3',
      type: 'image',
      position: { x: 0, y: 0 },
      style: { width: 180, height: 120 },
      data: {
        label: 'Outside Top',
        src: 'https://via.placeholder.com/180x120/22c55e/ffffff?text=Flow+Chart',
        labelPosition: 'outside-top',
      },
    },
  },
};

export const SmallImage: Story = {
  args: {
    node: {
      id: 'image-node-4',
      type: 'image',
      position: { x: 0, y: 0 },
      style: { width: 100, height: 100 },
      data: {
        label: 'Small',
        src: 'https://via.placeholder.com/100x100/f59e0b/ffffff?text=Small',
        labelPosition: 'inside-bottom-right',
      },
    },
  },
};

export const LargeImage: Story = {
  args: {
    node: {
      id: 'image-node-5',
      type: 'image',
      position: { x: 0, y: 0 },
      style: { width: 300, height: 200 },
      data: {
        label: 'Large Node',
        src: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=Large+Image+Node',
        labelPosition: 'outside-bottom',
      },
    },
  },
};