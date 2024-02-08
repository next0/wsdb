import http from 'http';

import express, { Application } from 'express';
import WebSocket, { Server as WebSocketServer } from 'ws';

import { Database } from 'libs/storage/Database';

import { listDbController } from 'controllers/db/listDbController';
import { clientWebSocketController } from 'controllers/socket/clientWebSocketController';
import { versionController } from 'controllers/system/versionController';
import { deleteTableController } from 'controllers/table/deleteTableController';
import { insertTableController } from 'controllers/table/insertTableController';
import { listTableController } from 'controllers/table/listTableController';
import { updateTableController } from 'controllers/table/updateTableController';

const WSDB_PORT: number = Number(process.env.WSDB_PORT || '8001');

const database = new Database({
    activity_records: {
        columns: {
            uid: {
                type: 'number',
            },
            name: {
                type: 'string',
            },
            type: {
                type: 'enum',
                values: ['TEXT', 'IMAGE', 'VIDEO'],
                defaults: 'TEXT',
            },
            userId: {
                type: 'string',
            },
            eventTime: {
                type: 'date',
            },
        },
    },
});

const app: Application = express();
const server: http.Server = http.createServer(app);
const clientsWebSocketServer: WebSocketServer = new WebSocketServer({ noServer: true });
const internalSyncWebSocketServer: WebSocketServer = new WebSocketServer({ noServer: true });

app.use(express.json());

// healthcheck api
app.get('/version.json', versionController());

// db tables api
app.get('/api/v1/table', listDbController(database));

// table rows api
app.get('/api/v1/table/:name', listTableController(database));
app.post('/api/v1/table/:name', insertTableController(database));
app.put('/api/v1/table/:name/:_id', updateTableController(database));
app.delete('/api/v1/table/:name/:_id', deleteTableController(database));

// web socket subscription api
clientsWebSocketServer.on('connection', clientWebSocketController(database));

// db replication api
internalSyncWebSocketServer.on('connection', (syncWebSocket: WebSocket) => {
    // TODO: replication synchronization logic
});

// websocket handshakes
server.on('upgrade', function upgrade(request, socket, head) {
    const host = request.headers.host;
    const { pathname } = new URL(request.url ?? '', 'http://' + host + '/');

    if (pathname === '/api/v1/ws') {
        clientsWebSocketServer.handleUpgrade(request, socket, head, function done(ws) {
            clientsWebSocketServer.emit('connection', ws, request);
        });
    } else if (pathname === '/api/internal-sync/v1/') {
        internalSyncWebSocketServer.handleUpgrade(request, socket, head, function done(ws) {
            internalSyncWebSocketServer.emit('connection', ws, request);
        });
    }
});

server.listen(WSDB_PORT, () => {
    console.info(`Server is running on port ${WSDB_PORT}`);
});

function gracefulShutdown() {
    process.exit();
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);
