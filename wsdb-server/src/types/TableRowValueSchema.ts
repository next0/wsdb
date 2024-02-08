import { TableColumnValueSchema } from 'types/TableColumnValueSchema';

export type TableRowValueSchema = { _id: string } & Record<string, TableColumnValueSchema>;
