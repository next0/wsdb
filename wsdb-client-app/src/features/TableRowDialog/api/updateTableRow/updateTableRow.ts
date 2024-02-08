import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { fetchRequest } from 'shared/helpers/fetchRequest/fetchRequest';

export interface UpdateTableRowOptions {
    table: string;
    data: TableRowValueSchema;
}

export interface UpdateTableRowResponse {
    status: number;
    payload: TableRowValueSchema;
}

export function updateTableRow({ table, data }: UpdateTableRowOptions) {
    return fetchRequest<TableRowValueSchema, UpdateTableRowResponse>(
        '/api/v1/table/' + encodeURIComponent(table) + '/' + encodeURIComponent(data._id),
        data,
        {
            method: 'PUT',
        },
    );
}
