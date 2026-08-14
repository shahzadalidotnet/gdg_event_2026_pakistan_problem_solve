const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');

module.exports = {
  backendRoot,
  port: Number.parseInt(process.env.PORT || '4000', 10),
  dbPath: process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(backendRoot, 'data', 'sahi.db'),
  seedPath: path.join(backendRoot, 'seed', 'guides.json'),
  adminToken: process.env.ADMIN_TOKEN || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Sahi Tareeqa <no-reply@sahitareeqa.local>',
  },
};
