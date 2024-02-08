import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { fetchRequest } from 'shared/helpers/fetchRequest/fetchRequest';

export interface PostTableRowOptions {
    table: string;
    data: TableRowValueSchema;
}

export interface PostTableRowResponse {
    status: number;
    payload: TableRowValueSchema;
}

export function postTableRow({ table, data }: PostTableRowOptions) {
    return fetchRequest<TableRowValueSchema, PostTableRowResponse>('/api/v1/table/' + encodeURIComponent(table), data, {
        method: 'POST',
    });
}
