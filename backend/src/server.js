require('dotenv').config({ quiet: true });

const config = require('./config');
const { createApp } = require('./app');

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('PORT must be a valid port number');
}

const { app, db } = createApp(config);
const server = app.listen(config.port, (error) => {
  if (error) {
    console.error(`Could not start the API: ${error.message}`);
    db.close();
    process.exitCode = 1;
    return;
  }
  console.log(`Sahi Tareeqa API listening on http://localhost:${config.port}`);
  console.log(`SQLite database: ${config.dbPath}`);
  if (!config.adminToken && !config.adminPassword) {
    console.warn('Admin endpoints are disabled until ADMIN_TOKEN or ADMIN_PASSWORD is configured.');
  }
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down.`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
