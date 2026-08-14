const path = require('node:path');
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { createAuth } = require('./auth');
const { initializeDatabase, parseGuide, timestamp } = require('./db');
const { HttpError, asyncHandler } = require('./http');
const { createMailer } = require('./mailer');
const {
  cleanString,
  requireObject,
  serializeGuide,
  validateConfirmation,
  validateGuide,
  validateReport,
  validateSlug,
} = require('./validation');

const GUIDE_COLUMNS = `
  slug, org, title, summary, last_verified, source_label, source_url, fee,
  processing_time, documents, steps, offices, hours, collection, tips,
  created_at, updated_at
`;

function createApp(config) {
  const app = express();
  const db = initializeDatabase(config.dbPath, config.seedPath);
  const mailer = createMailer(config);
  const auth = createAuth(config);

  app.disable('x-powered-by');
  app.use(cors({
    origin(origin, callback) {
      const allowed = !origin
        || origin === 'https://shahzadalidotnet.github.io'
        || /^http:\/\/localhost(?::\d+)?$/.test(origin);
      callback(null, allowed);
    },
  }));
  app.use(express.json({ limit: '100kb' }));

  const allPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests; please try again later' },
  });
  const reportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many reports; please try again later' },
  });
  const confirmationLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many confirmations; please try again later' },
  });
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many login attempts; please try again later' },
  });

  app.use('/api', (req, res, next) => req.method === 'POST' ? allPostLimiter(req, res, next) : next());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/guides', (_req, res) => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const rows = db.prepare(`
      SELECT g.*,
        (SELECT COUNT(*) FROM confirmations c
         WHERE c.guide_slug = g.slug AND c.created_at >= ?) AS confirmations_30d
      FROM guides g
      ORDER BY g.title COLLATE NOCASE
    `).all(cutoff);
    res.json(rows.map(parseGuide));
  });

  app.get('/api/guides/:slug', (req, res) => {
    const slug = validateSlug(req.params.slug);
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const row = db.prepare(`
      SELECT g.*,
        (SELECT COUNT(*) FROM confirmations c
         WHERE c.guide_slug = g.slug AND c.created_at >= ?) AS confirmations_30d
      FROM guides g WHERE g.slug = ?
    `).get(cutoff, slug);
    if (!row) throw new HttpError(404, 'Guide not found');
    res.json(parseGuide(row));
  });

  app.post('/api/reports', reportLimiter, asyncHandler(async (req, res) => {
    const report = validateReport(req.body);
    if (!db.prepare('SELECT 1 FROM guides WHERE slug = ?').get(report.guideSlug)) {
      throw new HttpError(404, 'Guide not found');
    }
    const result = db.prepare(`
      INSERT INTO reports (guide_slug, message, visited_on, city, reporter_email, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'new', ?)
    `).run(
      report.guideSlug,
      report.message,
      report.visitedOn,
      report.city,
      report.reporterEmail,
      timestamp(),
    );
    try {
      await mailer.sendReportAlert(report);
    } catch (error) {
      console.error('Report saved, but the email alert failed:', error.message);
    }
    res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
  }));

  app.post('/api/confirmations', confirmationLimiter, (req, res) => {
    const { guideSlug } = validateConfirmation(req.body);
    if (!db.prepare('SELECT 1 FROM guides WHERE slug = ?').get(guideSlug)) {
      throw new HttpError(404, 'Guide not found');
    }
    const now = timestamp();
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const confirm = db.transaction(() => {
      db.prepare('INSERT INTO confirmations (guide_slug, created_at) VALUES (?, ?)').run(guideSlug, now);
      const count30d = db.prepare(`
        SELECT COUNT(*) AS count FROM confirmations
        WHERE guide_slug = ? AND created_at >= ?
      `).get(guideSlug, cutoff).count;
      if (count30d >= 5) {
        db.prepare('UPDATE guides SET last_verified = ?, updated_at = ? WHERE slug = ?')
          .run(now.slice(0, 10), now, guideSlug);
      }
      return count30d;
    });
    res.status(201).json({ ok: true, count30d: confirm() });
  });

  app.post('/api/admin/login', loginLimiter, (req, res) => {
    requireObject(req.body);
    const password = cleanString(req.body.password, 'password', { required: true, max: 500 });
    res.json({ token: auth.login(password) });
  });

  app.use('/api/admin', auth.requireAdmin);

  app.get('/api/admin/reports', (req, res) => {
    const status = req.query.status === undefined
      ? undefined
      : cleanString(req.query.status, 'status', { required: true, max: 20 });
    if (status !== undefined && !['new', 'reviewing', 'fixed'].includes(status)) {
      throw new HttpError(400, 'status must be new, reviewing, or fixed');
    }
    const reports = status
      ? db.prepare('SELECT * FROM reports WHERE status = ? ORDER BY created_at DESC').all(status)
      : db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
    res.json(reports);
  });

  app.patch('/api/admin/reports/:id', (req, res) => {
    requireObject(req.body);
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(400, 'id must be a positive integer');
    const status = cleanString(req.body.status, 'status', { required: true, max: 20 });
    if (!['new', 'reviewing', 'fixed'].includes(status)) {
      throw new HttpError(400, 'status must be new, reviewing, or fixed');
    }
    const result = db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, id);
    if (!result.changes) throw new HttpError(404, 'Report not found');
    res.json({ ok: true });
  });

  app.post('/api/admin/guides', (req, res) => {
    const guide = serializeGuide(validateGuide(req.body));
    const now = timestamp();
    try {
      db.prepare(`
        INSERT INTO guides (${GUIDE_COLUMNS})
        VALUES (
          @slug, @org, @title, @summary, @last_verified, @source_label, @source_url, @fee,
          @processing_time, @documents, @steps, @offices, @hours, @collection, @tips,
          @created_at, @updated_at
        )
      `).run({ ...guide, created_at: now, updated_at: now });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') throw new HttpError(409, 'A guide with that slug already exists');
      throw error;
    }
    res.status(201).json(parseGuide(db.prepare('SELECT * FROM guides WHERE slug = ?').get(guide.slug)));
  });

  app.put('/api/admin/guides/:slug', (req, res) => {
    const slug = validateSlug(req.params.slug);
    if (!db.prepare('SELECT 1 FROM guides WHERE slug = ?').get(slug)) {
      throw new HttpError(404, 'Guide not found');
    }
    const guide = serializeGuide(validateGuide(req.body, { slug }));
    const now = timestamp();
    db.prepare(`
      UPDATE guides SET
        org = @org, title = @title, summary = @summary, last_verified = @last_verified,
        source_label = @source_label, source_url = @source_url, fee = @fee,
        processing_time = @processing_time, documents = @documents, steps = @steps,
        offices = @offices, hours = @hours, collection = @collection, tips = @tips,
        updated_at = @updated_at
      WHERE slug = @slug
    `).run({ ...guide, updated_at: now });
    res.json(parseGuide(db.prepare('SELECT * FROM guides WHERE slug = ?').get(slug)));
  });

  app.delete('/api/admin/guides/:slug', (req, res) => {
    const slug = validateSlug(req.params.slug);
    const result = db.prepare('DELETE FROM guides WHERE slug = ?').run(slug);
    if (!result.changes) throw new HttpError(404, 'Guide not found');
    res.json({ ok: true });
  });

  app.use('/admin', express.static(path.join(config.backendRoot, 'admin'), { extensions: ['html'] }));

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'API endpoint not found')));

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'Malformed JSON request body' });
    }
    const status = error.status || 500;
    if (status >= 500) console.error(error);
    const payload = { error: status >= 500 ? 'Internal server error' : error.message };
    if (error.details) payload.details = error.details;
    return res.status(status).json(payload);
  });

  return { app, db };
}

module.exports = { createApp };
