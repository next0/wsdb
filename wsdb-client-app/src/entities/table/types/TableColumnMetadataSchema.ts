export interface TableColumnNumberMetadataSchema {
    type: 'number';
    defaults?: number;
}

export interface TableColumnStringMetadataSchema {
    type: 'string';
    defaults?: string;
}

export interface TableColumnDateMetadataSchema {
    type: 'date';
    defaults?: string;
}

export interface TableColumnEnumMetadataSchema {
    type: 'enum';
    values: string[];
    defaults: string;
}

export type TableColumnMetadataSchema =
    | TableColumnNumberMetadataSchema
    | TableColumnStringMetadataSchema
    | TableColumnDateMetadataSchema
    | TableColumnEnumMetadataSchema;
