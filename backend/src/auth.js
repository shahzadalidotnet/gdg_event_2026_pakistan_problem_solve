const crypto = require('node:crypto');
const { HttpError } = require('./http');

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createAuth(config) {
  const runtimeToken = config.adminToken || crypto.randomBytes(32).toString('hex');

  function requireAdmin(req, _res, next) {
    if (!config.adminToken && !config.adminPassword) {
      return next(new HttpError(503, 'Admin authentication is not configured'));
    }
    const header = req.get('authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match || !safeEqual(match[1], runtimeToken)) {
      return next(new HttpError(401, 'A valid admin bearer token is required'));
    }
    return next();
  }

  function login(password) {
    if (!config.adminPassword) throw new HttpError(503, 'ADMIN_PASSWORD is not configured');
    if (typeof password !== 'string' || !safeEqual(password, config.adminPassword)) {
      throw new HttpError(401, 'Invalid admin password');
    }
    return runtimeToken;
  }

  return { login, requireAdmin };
}

module.exports = { createAuth };
