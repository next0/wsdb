import { TableEventSchema } from 'types/TableEventSchema';
import { TableMetadataSchema } from 'types/TableMetadataSchema';
import { TableRowValueSchema } from 'types/TableRowValueSchema';

export interface WebSocketServerInitEventSchema {
    type: 'INIT';
    table: string;
    payload: {
        metadata: TableMetadataSchema;
        data: TableRowValueSchema[];
    };
}

export type WebSocketServerEventSchema = WebSocketServerInitEventSchema | TableEventSchema;
