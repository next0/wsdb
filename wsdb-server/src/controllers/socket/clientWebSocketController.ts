import WebSocket from 'ws';

import { WebSocketClientEventSchema } from 'types/WebSocketClientEventSchema';
import { WebSocketServerEventSchema } from 'types/WebSocketServerEventSchema';

import { uniqId } from 'libs/helpers/uniqId';
import { Database } from 'libs/storage/Database';

export function clientWebSocketController(database: Database) {
    return function clientWebSocketControllerHandler(clientWebSocket: WebSocket) {
        const clientId = uniqId();

        console.info(`#${clientId} Client connected`);

        const subscriptions = new Map<string, () => void>();

        clientWebSocket.on('message', (message: string) => {
            try {
                const payload: WebSocketClientEventSchema = JSON.parse(message);

                if (payload) {
                    const tableName = payload.table;

                    if (payload.event === 'SUBSCRIBE') {
                        const table = database.table(tableName);

                        if (!subscriptions.has(tableName) && table) {
                            const unsubscribe = table.subscribe((event, message) => {
                                if (clientWebSocket.readyState === WebSocket.OPEN) {
                                    clientWebSocket.send(message);
                                }
                            });

                            subscriptions.set(tableName, unsubscribe);

                            const initEvent: WebSocketServerEventSchema = {
                                type: 'INIT',
                                table: tableName,
                                payload: {
                                    metadata: table.metadata,
                                    data: table.list(),
                                },
                            };

                            clientWebSocket.send(JSON.stringify(initEvent));
                        }
                    } else if (payload.event === 'UNSUBSCRIBE') {
                        const unsubscribe = subscriptions.get(tableName);

                        if (unsubscribe) {
                            unsubscribe();
                            subscriptions.delete(tableName);
                        }
                    }
                }
            } catch (error) {
                console.error(`#${clientId} WebSocket parse error`, error);
            }
        });

        clientWebSocket.on('close', () => {
            console.info(`#${clientId} Client disconnected`);

            for (const unsubscribe of subscriptions.values()) {
                unsubscribe();
            }

            subscriptions.clear();
        });
    };
}
