const http = require('node:http');

const WSDB_PORT = Number(process.env.WSDB_PORT || '8001');
const ONE_SECOND = 1000;
const HTTP_STATUS_OK = 200;

http.request({
    method: 'GET',
    hostname: 'localhost',
    port: WSDB_PORT,
    path: '/version.json',
    timeout: ONE_SECOND,
})
    .on('response', (res) => {
        console.info(`HealthCheck Status Code: ${res.statusCode}`);
        process.exit(res.statusCode === HTTP_STATUS_OK ? 0 : 1);
    })
    .on('error', (error) => {
        console.error(`Error:`, error);
        process.exit(1);
    })
    .end();
