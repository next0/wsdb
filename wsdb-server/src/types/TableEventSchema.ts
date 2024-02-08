import { TableRowValueSchema } from 'types/TableRowValueSchema';

export interface TableInsertEventSchema {
    type: 'INSERT';
    table: string;
    payload: TableRowValueSchema;
}

export interface TableUpdateEventSchema {
    type: 'UPDATE';
    table: string;
    payload: TableRowValueSchema;
}

export interface TableRemoveEventSchema {
    type: 'REMOVE';
    table: string;
    payload: TableRowValueSchema;
}

export type TableEventSchema = TableInsertEventSchema | TableUpdateEventSchema | TableRemoveEventSchema;
