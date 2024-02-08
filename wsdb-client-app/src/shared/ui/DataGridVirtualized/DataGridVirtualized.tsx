import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    Row,
    RowSelectionState,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import * as React from 'react';

import { cn } from 'shared/helpers/cn/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/libs/ui/table';
import { DataGridToolbar } from 'shared/ui/DataGridToolbar/DataGridToolbar';
import { DataGridViewOptionsCallbacksProps } from 'shared/ui/DataGridViewOptions/DataGridViewOptions';

export interface DataGridVirtualizedProps<TData, TValue> extends DataGridViewOptionsCallbacksProps {
    className?: string;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    rowSize?: number;
    toolbar?: React.ReactNode;
}

const ROW_SIZE_DEFAULT = 48;
const OVERSCAN_DEFAULT = 10;

export function DataGridVirtualized<TData, TValue>({
    className,
    columns,
    data,
    rowSize = ROW_SIZE_DEFAULT,
    toolbar,
    onSettingsClick,
}: DataGridVirtualizedProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = React.useState<string>('');
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            globalFilter,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        // globalFilterFn: fuzzyFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        // getFacetedRowModel: getFacetedRowModel(),
        // getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    const { rows } = table.getRowModel();

    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => rowSize,
        getScrollElement: () => tableContainerRef.current,
        overscan: OVERSCAN_DEFAULT,
    });

    return (
        <div className='space-y-4'>
            <DataGridToolbar
                table={table}
                onSettingsClick={onSettingsClick}
            >
                {toolbar}
            </DataGridToolbar>

            <div
                className={cn('rounded-md border overflow-auto relative', className)}
                ref={tableContainerRef}
            >
                <Table className='grid'>
                    <TableHeader className='grid sticky bg-background top-0 z-[1]'>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className='flex w-full'
                            >
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className='flex flex-col justify-center'
                                            style={{
                                                width: header.getSize(),
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody
                        className='grid relative'
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                        }}
                    >
                        {rows?.length ? (
                            rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const row = rows[virtualRow.index] as Row<TData>;

                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        data-index={virtualRow.index}
                                        ref={(node) => rowVirtualizer.measureElement(node)}
                                        className='flex absolute w-full'
                                        style={{
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    'flex flex-col justify-center',
                                                    cell.column.id === 'actions' ? 'ml-auto' : '',
                                                )}
                                                style={{
                                                    width: cell.column.getSize(),
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow className='flex absolute w-full'>
                                <TableCell
                                    colSpan={columns.length}
                                    className='flex w-full h-24 text-center flex-col justify-center'
                                >
                                    No data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
