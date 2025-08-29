import type { Meta, StoryObj } from '@storybook/react';
import { FlowControls } from './FlowControls';

const meta: Meta<typeof FlowControls> = {
  title: 'KiteFrame/FlowControls',
  component: FlowControls,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onZoomIn: {
      action: 'zoom-in',
      description: 'Called when zoom in is triggered',
    },
    onZoomOut: {
      action: 'zoom-out',
      description: 'Called when zoom out is triggered',
    },
    onFitView: {
      action: 'fit-view',
      description: 'Called when fit view is triggered',
    },
    onReset: {
      action: 'reset',
      description: 'Called when reset is triggered',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onZoomIn: () => {
      console.log('Zoom in triggered');
    },
    onZoomOut: () => {
      console.log('Zoom out triggered');
    },
    onFitView: () => {
      console.log('Fit view triggered');
    },
    onReset: () => {
      console.log('Reset triggered');
    },
  },
};