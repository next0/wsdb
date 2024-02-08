import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import * as React from 'react';

import { useBoolean } from 'shared/hooks/useBoolean/useBoolean';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from 'shared/libs/ui/alert-dialog';
import { Button } from 'shared/libs/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from 'shared/libs/ui/dropdown-menu';

export interface TableDataGridRowActionsProps<TData> extends TableDataGridRowActionsCallbacksProps<TData> {
    row: Row<TData>;
}

export interface TableDataGridRowActionsCallbacksProps<TData> {
    onRowEdit?(row: TData): void;
    onRowCopy?(row: TData): void;
    onRowDelete?(row: TData): void;
}

export function TableDataGridRowActions<TData>({
    row,
    onRowEdit,
    onRowCopy,
    onRowDelete,
}: TableDataGridRowActionsProps<TData>) {
    const data = row.original;

    const { state: isOpen, on: setOpen, set: onOpenChange } = useBoolean();

    const onRowEditHandler = React.useCallback(() => {
        onRowEdit?.(data);
    }, [data, onRowEdit]);

    const onRowCopyHandler = React.useCallback(() => {
        onRowCopy?.(data);
    }, [data, onRowCopy]);

    const onRowDeleteHandler = React.useCallback(() => {
        onRowDelete?.(data);
    }, [data, onRowDelete]);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                    >
                        <DotsHorizontalIcon className='h-4 w-4' />
                        <span className='sr-only'>Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align='end'
                    className='w-[160px]'
                >
                    <DropdownMenuItem onClick={onRowEditHandler}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={onRowCopyHandler}>Make a copy</DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={setOpen}>
                        Delete
                        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={isOpen}
                onOpenChange={onOpenChange}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure to delete row?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete row from DB.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onRowDeleteHandler}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
