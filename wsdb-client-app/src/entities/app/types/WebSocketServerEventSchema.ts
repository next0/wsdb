import { TableEventSchema } from 'entities/table/types/TableEventSchema';
import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

export interface WebSocketServerInitEventSchema {
    type: 'INIT';
    table: string;
    payload: {
        metadata: TableMetadataSchema;
        data: TableRowValueSchema[];
    };
}

export type WebSocketServerEventSchema = WebSocketServerInitEventSchema | TableEventSchema;
