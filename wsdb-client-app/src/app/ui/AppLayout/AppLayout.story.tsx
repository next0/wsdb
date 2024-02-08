import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { AppLayout } from 'app/ui/AppLayout/AppLayout';

import { StoryPlayTest } from '@e2e/types/StoryPlayTest';

const meta = {
    component: AppLayout,
    render(props) {
        return (
            <MemoryRouter>
                <AppLayout {...props} />
            </MemoryRouter>
        );
    },
    tags: ['app'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta> & StoryPlayTest;

export const Normal: Story = {
    args: {
        sidebar: 'sidebar',
        children: 'content',
    },
    async play({ canvasElement }) {
        const canvas = within(canvasElement);

        const headElement = canvas.getByText(/WSDB Client/i);
        await expect(headElement).toBeInTheDocument();
    },
    async playTest({ root, expect }) {
        await expect(root).toHaveText(/WSDB Client/i);
        await expect(root.getByTestId('aside')).toHaveScreenshot();
    },
};
