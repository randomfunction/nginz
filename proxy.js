const http = require('http');
const config = require('./config');

let currentServerIndex = 0;

function getNextServer() {
    const server = config.servers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % config.servers.length;
    return server;
}

function log(message) {
    if (config.logging) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }
}

const proxyServer = http.createServer((clientReq, clientRes) => {
    const target = getNextServer();

    log(`→ ${clientReq.method} ${clientReq.url} => ${target.host}:${target.port}`);

    const proxyOptions = {
        hostname: target.host,
        port: target.port,
        path: clientReq.url,
        method: clientReq.method,
        headers: {
            ...clientReq.headers,
            'X-Forwarded-For': clientReq.socket.remoteAddress,
            'X-Forwarded-Host': clientReq.headers.host,
            'X-Forwarded-Proto': 'http'
        },
        timeout: config.timeout
    };

    const proxyReq = http.request(proxyOptions, (proxyRes) => {
        log(`← ${proxyRes.statusCode} from ${target.host}:${target.port}`);
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(clientRes);
    });

    proxyReq.on('error', (err) => {
        log(`✗ Error connecting to ${target.host}:${target.port} - ${err.message}`);
        clientRes.writeHead(502, { 'Content-Type': 'application/json' });
        clientRes.end(JSON.stringify({
            error: 'Bad Gateway',
            message: `Unable to connect to backend server at ${target.host}:${target.port}`,
            details: err.message
        }));
    });

    proxyReq.on('timeout', () => {
        log(`✗ Timeout connecting to ${target.host}:${target.port}`);
        proxyReq.destroy();

        clientRes.writeHead(504, { 'Content-Type': 'application/json' });
        clientRes.end(JSON.stringify({
            error: 'Gateway Timeout',
            message: `Backend server at ${target.host}:${target.port} did not respond in time`
        }));
    });

    clientReq.pipe(proxyReq);
});


proxyServer.listen(config.proxyPort, () => {
    console.log('NGINZ - Custom Reverse Proxy');
    console.log('---------------------------');
    console.log(`Proxy listening on: http://localhost:${config.proxyPort}`);
    console.log('');
    console.log('Backend servers (Round-Robin):');

    config.servers.forEach((server, i) => {
        console.log(`  ${i + 1}. ${server.host}:${server.port}`);
    });

    console.log('');
});

process.on('SIGTERM', () => {
    log('Shutting down proxy server...');
    proxyServer.close(() => {
        log('Proxy server closed');
        process.exit(0);
    });
});
