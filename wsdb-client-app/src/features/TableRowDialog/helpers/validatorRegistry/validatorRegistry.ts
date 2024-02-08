import * as z from 'zod';
import { ZodType } from 'zod';

import { TableColumnMetadataSchema } from 'entities/table/types/TableColumnMetadataSchema';

export const validatorRegistry: Record<
    TableColumnMetadataSchema['type'],
    (colName: string, column: TableColumnMetadataSchema) => ZodType<unknown>
> = {
    string: () =>
        z
            .string({
                required_error: 'A string is required.',
            })
            .optional(),

    number: () =>
        z
            .number({
                required_error: 'A number is required.',
            })
            .optional(),

    enum: (_, column) =>
        column.type === 'enum' && column.values.length
            ? z
                  .enum(column.values as [string, ...string[]], {
                      required_error: 'A enum is required.',
                  })
                  .optional()
            : z.string().optional(),

    date: () =>
        z
            .date({
                required_error: 'A date is required.',
            })
            .optional(),
};
