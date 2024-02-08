import * as React from 'react';

import { useTableColumns } from 'features/TableDataGrid/hooks/useTableColumns/useTableColumns';
import { TableDataGridRowActionsCallbacksProps } from 'features/TableDataGrid/ui/TableDataGridRowActions/TableDataGridRowActions';

import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { DataGridViewOptionsCallbacksProps } from 'shared/ui/DataGridViewOptions/DataGridViewOptions';
// import { DataGrid } from 'shared/ui/DataGrid/DataGrid';
import { DataGridVirtualized } from 'shared/ui/DataGridVirtualized/DataGridVirtualized';

interface TableDataGrid
    extends TableDataGridRowActionsCallbacksProps<TableRowValueSchema>,
        DataGridViewOptionsCallbacksProps {
    className?: string;
    data: TableRowValueSchema[];
    metadata: TableMetadataSchema;
    selectable?: boolean;
    toolbar?: React.ReactNode;
}

export function TableDataGrid({
    className,
    data,
    metadata,
    selectable,
    toolbar,
    onRowEdit,
    onRowCopy,
    onRowDelete,
    onSettingsClick,
}: TableDataGrid) {
    const columns = useTableColumns({ selectable, metadata, onRowEdit, onRowCopy, onRowDelete });

    return (
        // <DataGrid
        <DataGridVirtualized
            className={className}
            columns={columns}
            data={data}
            toolbar={toolbar}
            onSettingsClick={onSettingsClick}
        />
    );
}
