import { CellContext, ColumnDef, ColumnDefTemplate } from '@tanstack/react-table';
import { format } from 'date-fns';

import {
    TableDataGridRowActions,
    TableDataGridRowActionsCallbacksProps,
} from 'features/TableDataGrid/ui/TableDataGridRowActions/TableDataGridRowActions';

import { TableColumnMetadataSchema } from 'entities/table/types/TableColumnMetadataSchema';
import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { Badge } from 'shared/libs/ui/badge';
import { Checkbox } from 'shared/libs/ui/checkbox';
import { DataGridColumnHeader } from 'shared/ui/DataGridColumnHeader/DataGridColumnHeader';

export interface UseTableColumnsOptions extends TableDataGridRowActionsCallbacksProps<TableRowValueSchema> {
    selectable?: boolean;
    metadata: TableMetadataSchema;
}

const CELL_REGISTRY: Record<
    TableColumnMetadataSchema['type'],
    (colName: string) => ColumnDefTemplate<CellContext<TableRowValueSchema, unknown>>
> = {
    string:
        (colName: string) =>
        ({ row }) => <div className='max-w-[250px] truncate'>{row.getValue(colName)}</div>,

    number:
        (colName: string) =>
        ({ row }) => <div className='w-[120px]'>{row.getValue(colName)}</div>,

    date:
        (colName: string) =>
        ({ row }) => {
            const value = row.getValue(colName);

            let formattedValue: string = String(value);
            if (value instanceof Date) {
                formattedValue = format(value, 'PPP');
            }

            return <div className='w-[150px] truncate'>{formattedValue}</div>;
        },

    enum:
        (colName: string) =>
        ({ row }) => (
            <div className='w-[150px]'>
                <Badge variant='outline'>{row.getValue(colName)}</Badge>
            </div>
        ),
};

const CELL_SIZE_REGISTRY: Record<TableColumnMetadataSchema['type'], number> = {
    string: 250,
    number: 120,
    date: 150,
    enum: 150,
};

export function useTableColumns(options: UseTableColumnsOptions): ColumnDef<TableRowValueSchema>[] {
    const columns: ColumnDef<TableRowValueSchema>[] = [];

    if (options.selectable) {
        columns.push({
            id: '__select__',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
                    aria-label='Select all'
                    className='translate-y-[2px]'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
                    aria-label='Select row'
                    className='translate-y-[2px]'
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        });
    }

    const metadata = options.metadata;
    const columnsSchema: Record<string, TableColumnMetadataSchema> = {
        _id: { type: 'string' },
        ...metadata.columns,
    };

    for (const columnName of Object.keys(columnsSchema)) {
        const columnMetadata = columnsSchema[columnName];
        const enableHiding = columnName !== '_id';

        columns.push({
            accessorKey: columnName,
            header: ({ column }) => (
                <DataGridColumnHeader
                    column={column}
                    title={columnName}
                    enableHiding={enableHiding}
                />
            ),
            cell: CELL_REGISTRY[columnMetadata.type](columnName),
            enableSorting: true,
            enableHiding,
            size: columnName === '_id' ? 230 : CELL_SIZE_REGISTRY[columnMetadata.type],
        });
    }

    // actions column
    columns.push({
        id: 'actions',
        cell: ({ row }) => (
            <TableDataGridRowActions
                row={row}
                onRowEdit={options.onRowEdit}
                onRowCopy={options.onRowCopy}
                onRowDelete={options.onRowDelete}
            />
        ),
        size: 50,
    });

    return columns;
}
