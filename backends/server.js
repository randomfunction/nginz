const http = require('http');

const PORT = parseInt(process.argv[2]) || 3001;

const server = http.createServer((req, res) => {
    console.log(`[Server:${PORT}] ${req.method} ${req.url}`);

    const responseData = {
        message: `Hello from Server on port ${PORT}`,
        port: PORT,
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'] || 'direct',
            'x-forwarded-host': req.headers['x-forwarded-host'] || 'none',
            'user-agent': req.headers['user-agent']
        }
    };

    const delay = Math.floor(Math.random() * 40) + 10;

    setTimeout(() => {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Served-By': `backend-${PORT}`
        });
        res.end(JSON.stringify(responseData, null, 2));
    }, delay);
});

server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log(`Shutting down server on port ${PORT}...`);
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});


