import { expect } from 'vitest';
import { WS } from 'vitest-websocket-mock';

import { DBConnector } from 'entities/app/libs/DBConnector/DBConnector';
import { WebSocketServerEventSchema } from 'entities/app/types/WebSocketServerEventSchema';
import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';

const metadata: TableMetadataSchema = {
    columns: {
        name: {
            type: 'string',
        },
        count: {
            type: 'number',
        },
    },
};

const initEventShort: WebSocketServerEventSchema = {
    type: 'INIT',
    table: 'table_name',
    payload: {
        metadata,
        data: [
            {
                _id: '6598880083096578af010420',
                name: 'Bob',
                count: 1,
            },
        ],
    },
};

const initEventLong: WebSocketServerEventSchema = {
    type: 'INIT',
    table: 'table_name',
    payload: {
        metadata,
        data: [
            {
                _id: '6598880083096578af010420',
                name: 'Bob',
                count: 1,
            },
            {
                _id: '6598880083096578af010421',
                name: 'Alice',
                count: 3,
            },
            {
                _id: '6598880083096578af010422',
                name: 'Tom',
                count: 2,
            },
        ],
    },
};

describe('DBConnector', () => {
    let server: WS;
    let client: DBConnector;

    beforeEach(async () => {
        server = new WS('ws://localhost/api/v1/ws');
        client = new DBConnector({ origin: 'ws://localhost' });
    });

    afterEach(async () => {
        await client.destroy();
        WS.clean();
    });

    function serverSend(event: WebSocketServerEventSchema) {
        server.send(JSON.stringify(event));
    }

    it('subscribe', async () => {
        const callback = vi.fn();

        client.subscribe('table_name', callback);

        await server.connected;

        const serverMessage = await server.nextMessage;
        expect(serverMessage).toMatchInlineSnapshot(`"{"event":"SUBSCRIBE","table":"table_name"}"`);

        serverSend(initEventShort);

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toBeCalledWith({
            metadata,
            data: [
                {
                    _id: '6598880083096578af010420',
                    name: 'Bob',
                    count: 1,
                },
            ],
        });
    });

    it('unsubscribe', async () => {
        const callback = vi.fn();

        const off = client.subscribe('table_name', callback);

        await server.connected;

        const serverSubscribeMessage = await server.nextMessage;
        expect(serverSubscribeMessage).toMatchInlineSnapshot(`"{"event":"SUBSCRIBE","table":"table_name"}"`);

        serverSend(initEventShort);

        expect(callback).toHaveBeenCalledOnce();

        off();

        const serverUnsubscribeMessage = await server.nextMessage;
        expect(serverUnsubscribeMessage).toMatchInlineSnapshot(`"{"event":"UNSUBSCRIBE","table":"table_name"}"`);
    });

    it('reconnect', async () => {
        const callbackTable1 = vi.fn();
        const callbackTable2 = vi.fn();

        client.subscribe('table_name_1', callbackTable1);
        client.subscribe('table_name_2', callbackTable2);

        await server.connected;

        expect(await server.nextMessage).toMatchInlineSnapshot(`"{"event":"SUBSCRIBE","table":"table_name_1"}"`);
        expect(await server.nextMessage).toMatchInlineSnapshot(`"{"event":"SUBSCRIBE","table":"table_name_2"}"`);

        serverSend({ ...initEventShort, table: 'table_name_1' });
        serverSend({ ...initEventLong, table: 'table_name_2' });

        expect(callbackTable1).toHaveBeenCalledOnce();
        expect(callbackTable2).toHaveBeenCalledOnce();

        server.close();
        server = new WS('ws://localhost/api/v1/ws');
        await server.connected;

        expect(await server.nextMessage).toMatchInlineSnapshot(`"{"event":"SUBSCRIBE","table":"table_name_1"}"`);
        expect(await server.nextMessage).toMatchInlineSnapshot(`"{"event":"SUBSCRIBE","table":"table_name_2"}"`);

        serverSend({ ...initEventShort, table: 'table_name_1' });
        serverSend({ ...initEventLong, table: 'table_name_2' });

        expect(callbackTable1).toBeCalledTimes(2);
        expect(callbackTable1).toBeCalledWith({
            metadata,
            data: [
                {
                    _id: '6598880083096578af010420',
                    name: 'Bob',
                    count: 1,
                },
            ],
        });

        expect(callbackTable2).toBeCalledTimes(2);
        expect(callbackTable2).toBeCalledWith({
            metadata,
            data: [
                {
                    _id: '6598880083096578af010420',
                    name: 'Bob',
                    count: 1,
                },
                {
                    _id: '6598880083096578af010421',
                    name: 'Alice',
                    count: 3,
                },
                {
                    _id: '6598880083096578af010422',
                    name: 'Tom',
                    count: 2,
                },
            ],
        });
    });

    it('insert event', async () => {
        const callback = vi.fn();

        client.subscribe('table_name', callback);

        await server.connected;

        serverSend(initEventShort);
        serverSend({
            type: 'INSERT',
            table: 'table_name',
            payload: {
                _id: '6598880083096578af010421',
                name: 'Alice',
                count: 3,
            },
        });

        expect(callback).toBeCalledTimes(2);
        expect(callback).toBeCalledWith({
            metadata,
            data: [
                {
                    _id: '6598880083096578af010420',
                    name: 'Bob',
                    count: 1,
                },
                {
                    _id: '6598880083096578af010421',
                    name: 'Alice',
                    count: 3,
                },
            ],
        });
    });

    it('remove event', async () => {
        const callback = vi.fn();

        client.subscribe('table_name', callback);

        await server.connected;

        serverSend(initEventLong);
        serverSend({
            type: 'REMOVE',
            table: 'table_name',
            payload: {
                _id: '6598880083096578af010421',
            },
        });

        expect(callback).toBeCalledTimes(2);
        expect(callback).toBeCalledWith({
            metadata,
            data: [
                {
                    _id: '6598880083096578af010420',
                    name: 'Bob',
                    count: 1,
                },
                {
                    _id: '6598880083096578af010422',
                    name: 'Tom',
                    count: 2,
                },
            ],
        });
    });

    it('update event', async () => {
        const callback = vi.fn();

        client.subscribe('table_name', callback);

        await server.connected;

        serverSend(initEventLong);
        serverSend({
            type: 'UPDATE',
            table: 'table_name',
            payload: {
                _id: '6598880083096578af010421',
                name: 'Alice',
                count: 4,
            },
        });

        expect(callback).toBeCalledTimes(2);
        expect(callback).toBeCalledWith({
            metadata,
            data: [
                {
                    _id: '6598880083096578af010420',
                    name: 'Bob',
                    count: 1,
                },
                {
                    _id: '6598880083096578af010421',
                    name: 'Alice',
                    count: 4,
                },
                {
                    _id: '6598880083096578af010422',
                    name: 'Tom',
                    count: 2,
                },
            ],
        });
    });

    it('list of events', async () => {
        const callback = vi.fn();

        client.subscribe('table_name', callback);

        await server.connected;

        serverSend(initEventLong);
        serverSend({
            type: 'UPDATE',
            table: 'table_name',
            payload: {
                _id: '6598880083096578af010421',
                name: 'Alice',
                count: 4,
            },
        });
        serverSend({
            type: 'INSERT',
            table: 'table_name',
            payload: {
                _id: '6598880083096578af010423',
                name: 'Kate',
                count: 13,
            },
        });
        serverSend({
            type: 'REMOVE',
            table: 'table_name',
            payload: {
                _id: '6598880083096578af010420',
            },
        });

        expect(callback).toBeCalledTimes(4);
        expect(callback).toBeCalledWith({
            metadata,
            data: [
                {
                    _id: '6598880083096578af010421',
                    name: 'Alice',
                    count: 4,
                },
                {
                    _id: '6598880083096578af010422',
                    name: 'Tom',
                    count: 2,
                },
                {
                    _id: '6598880083096578af010423',
                    name: 'Kate',
                    count: 13,
                },
            ],
        });
    });

    it('parse date type', async () => {
        const callback = vi.fn();

        client.subscribe('table_name', callback);

        await server.connected;

        const serverMessage = await server.nextMessage;
        expect(serverMessage).toMatchInlineSnapshot(`"{"event":"SUBSCRIBE","table":"table_name"}"`);

        serverSend({
            type: 'INIT',
            table: 'table_name',
            payload: {
                metadata: {
                    columns: {
                        created_at: {
                            type: 'date',
                        },
                    },
                },
                data: [
                    {
                        _id: '6598880083096578af010420',
                        created_at: new Date('2024-01-09T10:54:32').toISOString(),
                    },
                ],
            },
        });

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toBeCalledWith({
            metadata: {
                columns: {
                    created_at: {
                        type: 'date',
                    },
                },
            },
            data: [
                {
                    _id: '6598880083096578af010420',
                    created_at: new Date('2024-01-09T10:54:32'),
                },
            ],
        });
    });
});
