import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { GearIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

import { Button } from 'shared/libs/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from 'shared/libs/ui/dropdown-menu';

export interface DataGridViewOptionsProps<TData> extends DataGridViewOptionsCallbacksProps {
    table: Table<TData>;
}

export interface DataGridViewOptionsCallbacksProps {
    onSettingsClick?(): void;
}

export function DataGridViewOptions<TData>({ table, onSettingsClick }: DataGridViewOptionsProps<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='outline'
                    size='sm'
                    className='ml-auto h-8'
                >
                    <MixerHorizontalIcon className='mr-2 h-4 w-4' />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align='end'
                className='w-[150px]'
            >
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                    .map((column) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className='capitalize'
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                            >
                                {column.id}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettingsClick}>
                    <GearIcon className='mr-2 h-4 w-4' /> Settings
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
