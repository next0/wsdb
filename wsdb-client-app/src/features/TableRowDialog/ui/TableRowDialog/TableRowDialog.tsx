import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ZodType } from 'zod';

import { postTableRow } from 'features/TableRowDialog/api/postTableRow/postTableRow';
import { updateTableRow } from 'features/TableRowDialog/api/updateTableRow/updateTableRow';
import { validatorRegistry } from 'features/TableRowDialog/helpers/validatorRegistry/validatorRegistry';
import { TableRowFieldRegistry } from 'features/TableRowDialog/ui/TableRowFieldRegistry/TableRowFieldRegistry';

import { parseTableFetchRequestError } from 'entities/table/helpers/parseTableFetchRequestError/parseTableFetchRequestError';
import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { FetchRequestError } from 'shared/helpers/fetchRequest/fetchRequest';
import { Button } from 'shared/libs/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from 'shared/libs/ui/dialog';
import { Form } from 'shared/libs/ui/form';
import { toast } from 'shared/libs/ui/use-toast';
import { FormError } from 'shared/ui/FormError/FormError';

export interface TableRowDialogProps {
    value?: Partial<TableRowValueSchema>;
    open: boolean;
    table: string;
    metadata: TableMetadataSchema;
    onOpenChange(open: boolean): void;
}

export function TableRowDialog({ value, open, table, metadata, onOpenChange }: TableRowDialogProps) {
    const postTableRowMutation = useMutation({
        mutationFn: postTableRow,
    });

    const updateTableRowMutation = useMutation({
        mutationFn: updateTableRow,
    });

    const isCreate = !value?._id;

    const FormSchema = z.object({
        ...Object.keys(metadata.columns).reduce((memo: Record<string, ZodType<unknown>>, colName) => {
            const column = metadata.columns[colName];

            memo[colName] = validatorRegistry[column.type](colName, column);

            return memo;
        }, {}),
        _id: z.string().optional(),
        _serverError: z.string().optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        values: value,
    });

    const onOpenChangeHandler = React.useCallback(
        (open: boolean) => {
            onOpenChange(open);

            form.reset(
                Object.keys(form.getValues()).reduce((memo: Record<string, string>, key) => {
                    memo[key] = '';
                    return memo;
                }, {}),
            );
        },
        [form, onOpenChange],
    );

    const onSubmit = React.useCallback(
        async function onSubmit(data: z.infer<typeof FormSchema>) {
            try {
                if (isCreate) {
                    // create
                    const res = await postTableRowMutation.mutateAsync({
                        table,
                        data: data as TableRowValueSchema,
                    });

                    toast({
                        title: 'Table row created:',
                        description: (
                            <pre className='mt-2 w-[340px] rounded-md bg-slate-700 p-4'>
                                <code className='text-white'>{JSON.stringify(res.payload, null, 2)}</code>
                            </pre>
                        ),
                    });
                } else {
                    const res = await updateTableRowMutation.mutateAsync({
                        table,
                        data: data as TableRowValueSchema,
                    });

                    toast({
                        title: 'Table row updated:',
                        description: (
                            <pre className='mt-2 w-[340px] rounded-md bg-slate-700 p-4'>
                                <code className='text-white'>{JSON.stringify(res.payload, null, 2)}</code>
                            </pre>
                        ),
                    });
                }

                onOpenChangeHandler(false);
            } catch (error) {
                if (error instanceof FetchRequestError) {
                    const serverErrorKey = '_serverError';
                    const errorMessages = parseTableFetchRequestError<string>(error, serverErrorKey);

                    if (errorMessages) {
                        for (const key of Object.keys(errorMessages)) {
                            form.setError(key as never, {
                                message: errorMessages[key]!.join('\n'),
                            });
                        }
                    }

                    return;
                }

                throw error;
            }
        },
        [form, isCreate, onOpenChangeHandler, postTableRowMutation, table, updateTableRowMutation],
    );

    return (
        <Dialog
            modal
            open={open}
            onOpenChange={onOpenChangeHandler}
        >
            <DialogContent className='sm:max-w-[450px]'>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-8'
                    >
                        <DialogHeader>
                            <DialogTitle>{isCreate ? 'Create row' : 'Edit row: ' + value?._id}</DialogTitle>
                            <DialogDescription>
                                {isCreate ? 'Create table row here.' : 'Make changes to table row here.'} Click save
                                when you're done.
                            </DialogDescription>
                        </DialogHeader>

                        <div className='grid gap-4'>
                            {Object.keys(metadata.columns).map((colName) => {
                                const column = metadata.columns[colName];

                                return (
                                    <React.Fragment key={colName}>
                                        {TableRowFieldRegistry[metadata.columns[colName].type](form, colName, column)}
                                    </React.Fragment>
                                );
                            })}

                            <FormError
                                control={form.control}
                                name='_serverError'
                            />
                        </div>

                        <DialogFooter>
                            <Button type='submit'>{isCreate ? 'Create' : 'Save changes'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
