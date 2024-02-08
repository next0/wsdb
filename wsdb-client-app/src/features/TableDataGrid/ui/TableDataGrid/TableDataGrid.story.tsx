import { PlusCircledIcon } from '@radix-ui/react-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, within } from '@storybook/test';

import { TableDataGrid } from 'features/TableDataGrid/ui/TableDataGrid/TableDataGrid';

import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { Button } from 'shared/libs/ui/button';

import { StoryPlayTest } from '@e2e/types/StoryPlayTest';

const meta = {
    component: TableDataGrid,
    tags: ['feature'],
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof TableDataGrid>;

export default meta;
type Story = StoryObj<typeof meta> & StoryPlayTest;

const metadata: TableMetadataSchema = {
    columns: {
        name: {
            type: 'string',
        },
        count: {
            type: 'number',
        },
    },
};

function buildData(n: number): TableRowValueSchema[] {
    return Array(n)
        .fill(undefined)
        .map((_, i) => {
            return {
                _id: String(i),
                name: 'Row Name ' + i,
                count: i,
            };
        });
}

const smallDataSet: TableRowValueSchema[] = buildData(3);
const mediumDataSet: TableRowValueSchema[] = buildData(500);

export const Normal: Story = {
    args: {
        metadata,
        data: smallDataSet,
    },
};

export const Scroll: Story = {
    args: {
        className: 'h-[400px]',
        metadata,
        data: mediumDataSet,
    },
    async play({ canvasElement }) {
        const canvas = within(canvasElement);

        const column = canvas.getByRole('button', { name: /name/i });
        await expect(column).toBeInTheDocument();
        await userEvent.click(column);

        const menu = screen.getByRole('menu');
        await expect(menu).toBeInTheDocument();

        const sortMenuItem = within(menu).getByRole('menuitem', { name: /desc/i });
        await userEvent.click(sortMenuItem);

        const text = canvas.getByText('Row Name 499');
        await expect(text).toBeInTheDocument();
    },
};

export const Empty: Story = {
    args: {
        className: 'h-[400px]',
        metadata,
        data: [],
    },
};

export const Toolbar: Story = {
    args: {
        className: 'h-[400px]',
        metadata,
        data: smallDataSet,
        toolbar: (
            <Button
                variant='outline'
                size='sm'
                className='h-8 lg:flex'
            >
                <PlusCircledIcon className='mr-2 h-4 w-4' />
                Create
            </Button>
        ),
    },
};
