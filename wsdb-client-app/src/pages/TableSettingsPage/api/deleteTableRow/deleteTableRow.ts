import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

import { fetchRequest } from 'shared/helpers/fetchRequest/fetchRequest';

export interface DeleteTableRowOptions {
    table: string;
    _id: string;
}

export interface DeleteTableRowResponse {
    status: number;
    payload: TableRowValueSchema;
}

export function deleteTableRow({ table, _id }: DeleteTableRowOptions) {
    return fetchRequest<unknown, DeleteTableRowResponse>(
        '/api/v1/table/' + encodeURIComponent(table) + '/' + encodeURIComponent(String(_id)),
        {},
        {
            method: 'DELETE',
        },
    );
}
