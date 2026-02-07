module.exports = {
  proxyPort: 8080,

  servers: [
    { host: 'localhost', port: 3001 },
    { host: 'localhost', port: 3002 },
    { host: 'localhost', port: 3003 }
  ],

  timeout: 30000,
  logging: true
};
