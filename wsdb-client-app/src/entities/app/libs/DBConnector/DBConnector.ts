import { WebSocketClientEventSchema } from 'entities/app/types/WebSocketClientEventSchema';
import { WebSocketServerEventSchema } from 'entities/app/types/WebSocketServerEventSchema';
import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

export interface DBConnectorOptions {
    origin?: string;
    immutable?: boolean;
}

export interface DBConnectorTableState {
    metadata: TableMetadataSchema;
    data: TableRowValueSchema[];
}

interface DBConnectorTableCache {
    parser: (row: TableRowValueSchema) => TableRowValueSchema;
}

const READY_STATUS_CLOSING = 2;
const READY_STATUS_CLOSED = 3;

function buildParserTableRow(metadata: TableMetadataSchema) {
    return function parser(row: TableRowValueSchema): TableRowValueSchema {
        const dateColumns = Object.keys(metadata.columns).filter((name) => {
            return metadata.columns[name].type === 'date';
        });

        if (dateColumns.length === 0) {
            return row;
        }

        const dateRowPart = dateColumns.reduce((memo: Record<string, Date>, name) => {
            if (Object.prototype.hasOwnProperty.call(row, name)) {
                memo[name] = new Date(row[name]);
            }

            return memo;
        }, {});

        return {
            ...row,
            ...dateRowPart,
        };
    };
}

type DBConnectorEventActions<Events extends { type: string }> = {
    [E in Events as E['type']]: (event: E) => void;
};

/**
 * TODO: move DBConnector to SharedWorker
 */
export class DBConnector {
    protected readonly _immutable: boolean;
    protected readonly _origin: string;

    protected _connection: Promise<WebSocket> | undefined;

    protected _subscriptions: Map<string, Set<(state: DBConnectorTableState) => void>> = new Map();
    protected _state: Map<string, DBConnectorTableState> = new Map();
    protected _cache: Map<string, DBConnectorTableCache> = new Map();

    constructor(options: DBConnectorOptions = {}) {
        this._origin = options.origin ?? (location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.host;
        this._immutable = Boolean(options.immutable);
    }

    public destroy() {
        this._subscriptions.clear();
        this._state.clear();
        this._cache.clear();

        return this.disconnect();
    }

    protected connect(): Promise<WebSocket> {
        if (this._connection) {
            return this._connection;
        }

        this._connection = new Promise((resolve) => {
            const socket = new WebSocket(this._origin + '/api/v1/ws');

            socket.addEventListener('open', () => {
                resolve(socket);
            });

            socket.addEventListener('error', (event) => {
                console.error('WebSocket Error', event);
            });

            socket.addEventListener('close', () => {
                this._connection = undefined;

                // TODO: retry/reconnect with exponential backoff
                this.reconnect();
            });

            socket.addEventListener('message', (message) => {
                try {
                    const event: WebSocketServerEventSchema = JSON.parse(message.data);

                    if (event && event.type) {
                        this.processServerMessage(event);
                    }
                } catch (error) {
                    console.error('WebSocket Message Parsing Error', error);
                }
            });
        });

        return this._connection;
    }

    protected reconnect() {
        if (!this._connection) {
            for (const table of this._subscriptions.keys()) {
                this.postServerMessage({ event: 'SUBSCRIBE', table });
            }
        }
    }

    protected disconnect(): Promise<void> {
        if (this._connection) {
            return this._connection.then((socket) => {
                if (socket.readyState !== READY_STATUS_CLOSING && socket.readyState === READY_STATUS_CLOSED) {
                    socket.close();
                }
            });
        }

        return Promise.resolve();
    }

    protected postServerMessage(event: WebSocketClientEventSchema): Promise<void> {
        return this.connect().then((socket) => {
            socket.send(JSON.stringify(event));
        });
    }

    protected processServerMessage(event: WebSocketServerEventSchema) {
        const actions: DBConnectorEventActions<WebSocketServerEventSchema> = {
            /**
             * Init message
             */
            INIT: (event) => {
                const table = event.table;
                const parser = buildParserTableRow(event.payload.metadata);

                this._cache.set(table, { parser });

                this._state.set(table, {
                    metadata: event.payload.metadata,
                    data: event.payload.data.map(parser),
                });

                this.publishState(table);
            },

            /**
             * Insert message
             */
            INSERT: (event) => {
                const table = event.table;
                const tableState = this._state.get(table);
                const tableCache = this._cache.get(table);

                if (tableState && tableCache) {
                    const row = tableCache.parser(event.payload);

                    if (this._immutable) {
                        this._state.set(table, {
                            ...tableState,
                            data: [...tableState.data, row],
                        });
                    } else {
                        tableState.data.push(row);
                    }

                    this.publishState(table);
                }
            },

            /**
             * Update message
             */
            UPDATE: (event) => {
                const table = event.table;
                const tableState = this._state.get(table);
                const tableCache = this._cache.get(table);

                if (tableState && tableCache) {
                    const row = tableCache.parser(event.payload);
                    const value = row._id;

                    if (this._immutable) {
                        const nextTableState = {
                            ...tableState,
                            data: [...tableState.data],
                        };

                        const index = nextTableState.data.findIndex(({ _id }) => _id === value);
                        nextTableState.data[index] = row;

                        this._state.set(table, nextTableState);
                    } else {
                        const index = tableState.data.findIndex(({ _id }) => _id === value);
                        tableState.data[index] = row;
                    }

                    this.publishState(table);
                }
            },

            /**
             * Remove message
             */
            REMOVE: (event) => {
                const table = event.table;
                const tableState = this._state.get(table);

                if (tableState) {
                    const value = event.payload._id;

                    if (this._immutable) {
                        this._state.set(table, {
                            ...tableState,
                            data: tableState.data.filter(({ _id }) => _id !== value),
                        });
                    } else {
                        const index = tableState.data.findIndex(({ _id }) => _id === value);

                        tableState.data.splice(index, 1);
                    }

                    this.publishState(table);
                }
            },
        };

        // TODO: write type guard
        return actions[event.type](event as never);
    }

    protected publishState(table: string): void {
        const subset = this._subscriptions.get(table);
        const state = this._state.get(table);

        if (subset && state) {
            for (const callback of subset.values()) {
                callback(state);
            }
        }
    }

    public subscribe(table: string, callback: (state: DBConnectorTableState) => void): () => void {
        if (!this._subscriptions.has(table)) {
            this._subscriptions.set(table, new Set());
        }

        const subset = this._subscriptions.get(table)!;
        const postSubscribe = !subset.size;

        subset.add(callback);

        if (postSubscribe) {
            this.postServerMessage({ event: 'SUBSCRIBE', table });
        } else {
            const state = this._state.get(table);

            if (state) {
                callback(state);
            }
        }

        return () => {
            this.unsubscribe(table, callback);
        };
    }

    public unsubscribe(table: string, callback: (state: DBConnectorTableState) => void): void {
        if (!this._subscriptions.has(table)) {
            return;
        }

        const subset = this._subscriptions.get(table)!;

        if (!subset.has(callback)) {
            return;
        }

        subset.delete(callback);

        if (!subset.size) {
            this._subscriptions.delete(table);
            this._state.delete(table);
            this._cache.delete(table);

            this.postServerMessage({ event: 'UNSUBSCRIBE', table });
        }
    }

    protected static _instance: DBConnector;
    public static getInstance(options: DBConnectorOptions = {}): DBConnector {
        if (!DBConnector._instance) {
            DBConnector._instance = new DBConnector(options);
        }

        return DBConnector._instance;
    }
}
