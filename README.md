
---

# Nginz – Custom Reverse Proxy

A reverse proxy built from scratch in Node.js to understand how NGINX handles request forwarding, featuring round-robin load balancing.

## How It Works

```
┌─────────┐     ┌─────────────────┐     ┌────────────────────┐
│ Client  │────▶│  Reverse Proxy  │────▶│  Backend Servers   │
│         │◀────│   (Port 8080)   │◀────│ (3001 / 3002 /     │
└─────────┘     └─────────────────┘     │  3003)             │
                                        └────────────────────┘
```

Request flow:

1. Listens on port 8080 for incoming HTTP requests
2. Selects the next backend server using round-robin
3. Forwards the request to the selected backend
4. Pipes the response back to the original client

## Quick Start

### 1. Start Backend Servers (separate terminals)

```bash
node backends/server.js 3001
node backends/server.js 3002
node backends/server.js 3003
```

### 2. Start the Proxy

```bash
node proxy.js
```

### 3. Test Round-Robin Load Balancing

```bash
curl http://localhost:8080
curl http://localhost:8080
curl http://localhost:8080
curl http://localhost:8080
```

Responses should cycle through:

```
3001 → 3002 → 3003 → 3001 → ...
```

## Configuration

Edit `config.js` to customize behavior.

```js
module.exports = {
  proxyPort: 8080,          // Port proxy listens on
  servers: [                // Backend servers
    { host: 'localhost', port: 3001 },
    { host: 'localhost', port: 3002 },
    { host: 'localhost', port: 3003 }
  ],
  timeout: 30000,           // Request timeout (ms)
  logging: true             // Enable / disable logging
};
```

## Key Concepts Demonstrated

| Concept             | Description                                           |
| ------------------- | ----------------------------------------------------- |
| Reverse Proxy       | Sits between clients and servers, forwarding requests |
| Round-Robin         | Distributes requests evenly across backend servers    |
| Request Piping      | Streams data between client and backend efficiently   |
| X-Forwarded Headers | Preserves original client request information         |
| Error Handling      | Returns 502 / 504 when backends fail or timeout       |

## Project Structure

```
Nginz/
├── proxy.js            # Main reverse proxy server
├── config.js           # Configuration settings
├── package.json        # Project metadata
├── backends/
│   └── server.js       # Test backend server
└── README.md           # Documentation
```

## License

MIT

---

