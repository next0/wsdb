import { TableColumnMetadataSchema } from 'types/TableColumnMetadataSchema';

export interface TableMetadataSchema {
    columns: Record<string, TableColumnMetadataSchema>;
}
