import { PlusCircledIcon } from '@radix-ui/react-icons';
import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { deleteTableRow } from 'pages/TablePage/api/deleteTableRow/deleteTableRow';
import { useTableData } from 'pages/TablePage/api/useTableData/useTableData';

import { TableDataGrid } from 'features/TableDataGrid';
import { TableRowDialog } from 'features/TableRowDialog';

import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { FetchRequestError } from 'shared/helpers/fetchRequest/fetchRequest';
import { useBoolean } from 'shared/hooks/useBoolean/useBoolean';
import { Button } from 'shared/libs/ui/button';
import { toast } from 'shared/libs/ui/use-toast';
import { LoadingMessage } from 'shared/ui/LoadingMessage/LoadingMessage';

const DEFAULT_DATA: TableRowValueSchema[] = [];
const DEFAULT_METADATA: TableMetadataSchema = { columns: {} };

export interface TablePageProps {}

export const TablePage: React.FC<TablePageProps> = React.memo(function TablePage() {
    const routerParams = useParams();
    const navigate = useNavigate();
    const table = routerParams.name ?? '';

    const deleteTableRowMutation = useMutation({
        mutationFn: deleteTableRow,
    });

    const { state: isDialogOpen, on: setOpenDialog, set: onOpenDialogChange } = useBoolean();
    const [currentRowValue, setCurrentRowValue] = React.useState<Partial<TableRowValueSchema> | undefined>();

    const { isLoading, data, metadata } = useTableData(table);

    const onOpenDialogChangeHandler = React.useCallback(
        (open: boolean) => {
            onOpenDialogChange(open);

            if (!open) {
                setCurrentRowValue(undefined);
            }
        },
        [onOpenDialogChange],
    );

    const onRowEdit = React.useCallback(
        (row: TableRowValueSchema) => {
            setCurrentRowValue({ ...row });
            setOpenDialog();
        },
        [setOpenDialog],
    );

    const onRowCopy = React.useCallback(
        (row: TableRowValueSchema) => {
            setCurrentRowValue({ ...row, _id: undefined });
            setOpenDialog();
        },
        [setOpenDialog],
    );

    const onRowDelete = React.useCallback(
        async (row: TableRowValueSchema) => {
            if (!metadata) {
                return;
            }

            try {
                const res = await deleteTableRowMutation.mutateAsync({ table, _id: row._id });

                toast({
                    title: 'Table row deleted:',
                    description: (
                        <pre className='mt-2 w-[340px] rounded-md bg-slate-700 p-4'>
                            <code className='text-white'>{JSON.stringify(res.payload, null, 2)}</code>
                        </pre>
                    ),
                });
            } catch (error) {
                if (error instanceof FetchRequestError) {
                    toast({
                        variant: 'destructive',
                        title: 'Table row deleted error',
                        description: (
                            <pre className='mt-2 w-[340px] rounded-md bg-destructive-500 p-4'>
                                <code className='text-white'>{JSON.stringify(error.serialize(), null, 2)}</code>
                            </pre>
                        ),
                    });
                }
            }
        },
        [deleteTableRowMutation, metadata, table],
    );

    if (isLoading) {
        return <LoadingMessage message='Connecting to the DB...' />;
    }

    return (
        <>
            <TableDataGrid
                className='h-[calc(100vh-135px)] lg:max-w-[calc(100vw-250px-4rem)]'
                data={data ?? DEFAULT_DATA}
                metadata={metadata ?? DEFAULT_METADATA}
                toolbar={
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-8 lg:flex'
                        onClick={setOpenDialog}
                    >
                        <PlusCircledIcon className='mr-2 h-4 w-4' />
                        Create
                    </Button>
                }
                onSettingsClick={() => navigate('/table/' + table + '/settings')}
                onRowEdit={onRowEdit}
                onRowCopy={onRowCopy}
                onRowDelete={onRowDelete}
            />

            <TableRowDialog
                value={currentRowValue}
                open={isDialogOpen}
                table={table}
                metadata={metadata ?? DEFAULT_METADATA}
                onOpenChange={onOpenDialogChangeHandler}
            />
        </>
    );
});
