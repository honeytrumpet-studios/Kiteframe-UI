import type { Meta, StoryObj } from '@storybook/react';
import { ControlsToolbar } from './ControlsToolbar';

const meta: Meta<typeof ControlsToolbar> = {
  title: 'KiteFrame/ControlsToolbar',
  component: ControlsToolbar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    viewport: {
      control: 'object',
      description: 'Current viewport state',
    },
    onViewportChange: {
      action: 'viewport-changed',
      description: 'Called when viewport changes',
    },
    onFitView: {
      action: 'fit-view',
      description: 'Called when fit view is triggered',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    viewport: { x: 0, y: 0, zoom: 1 },
    onViewportChange: (viewport) => {
      console.log('Viewport changed:', viewport);
    },
    onFitView: () => {
      console.log('Fit view triggered');
    },
  },
};

export const Zoomed: Story = {
  args: {
    viewport: { x: 100, y: 50, zoom: 1.5 },
    onViewportChange: (viewport) => {
      console.log('Viewport changed:', viewport);
    },
    onFitView: () => {
      console.log('Fit view triggered');
    },
  },
};

export const ZoomedOut: Story = {
  args: {
    viewport: { x: -50, y: -25, zoom: 0.5 },
    onViewportChange: (viewport) => {
      console.log('Viewport changed:', viewport);
    },
    onFitView: () => {
      console.log('Fit view triggered');
    },
  },
};