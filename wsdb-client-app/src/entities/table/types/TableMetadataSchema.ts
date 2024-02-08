import { TableColumnMetadataSchema } from 'entities/table/types/TableColumnMetadataSchema';

export interface TableMetadataSchema {
    columns: Record<string, TableColumnMetadataSchema>;
}
