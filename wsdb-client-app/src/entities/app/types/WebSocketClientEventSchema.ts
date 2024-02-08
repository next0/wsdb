export interface WebSocketClientSubscribeEventSchema {
    event: 'SUBSCRIBE';
    table: string;
}

export interface WebSocketClientUnsubscribeEventSchema {
    event: 'UNSUBSCRIBE';
    table: string;
}

export type WebSocketClientEventSchema = WebSocketClientSubscribeEventSchema | WebSocketClientUnsubscribeEventSchema;
