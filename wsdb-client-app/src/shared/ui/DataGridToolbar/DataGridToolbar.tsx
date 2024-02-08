import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import * as React from 'react';

import { Button } from 'shared/libs/ui/button';
import { Input } from 'shared/libs/ui/input';
import {
    DataGridViewOptions,
    DataGridViewOptionsCallbacksProps,
} from 'shared/ui/DataGridViewOptions/DataGridViewOptions';

export interface DataGridToolbarProps<TData> extends DataGridViewOptionsCallbacksProps, React.PropsWithChildren {
    table: Table<TData>;
}

export function DataGridToolbar<TData>({ table, children, onSettingsClick }: DataGridToolbarProps<TData>) {
    const state = table.getState();
    const isFiltered = Boolean(state.globalFilter || state.columnFilters.length > 0);

    return (
        <div className='flex items-center justify-between'>
            <div className='flex flex-1 items-center space-x-2'>
                {children}

                <Input
                    placeholder='Filter rows...'
                    value={state.globalFilter}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className='h-8 w-[150px] lg:w-[250px]'
                />

                {isFiltered && (
                    <Button
                        variant='ghost'
                        onClick={() => {
                            table.setGlobalFilter('');
                            table.resetColumnFilters();
                        }}
                        className='h-8 px-2 lg:px-3'
                    >
                        Reset
                        <Cross2Icon className='ml-2 h-4 w-4' />
                    </Button>
                )}
            </div>

            <DataGridViewOptions
                table={table}
                onSettingsClick={onSettingsClick}
            />
        </div>
    );
}
