import { TableColumnValueSchema } from 'entities/table/types/TableColumnValueSchema';

export type TableRowValueSchema = { _id: string } & Record<string, TableColumnValueSchema>;
