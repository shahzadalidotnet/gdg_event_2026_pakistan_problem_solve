const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const { serializeGuide, validateGuide, JSON_FIELDS } = require('./validation');

const FALLBACK_GUIDE = {
  slug: 'sample-process',
  org: 'Sample Government Office',
  title: 'Sample Government Process',
  summary: 'Replace this placeholder with a verified process guide before launch.',
  last_verified: '2026-01-01',
  source_label: 'Official source',
  source_url: 'https://www.pakistan.gov.pk/',
  fee: 'Check with the relevant office',
  processing_time: 'Varies',
  documents: ['CNIC', 'Application form'],
  steps: [{ title: 'Prepare', detail: 'Collect the required documents.' }],
  offices: ['Relevant local government office'],
  hours: 'Confirm with the office before visiting',
  collection: 'Collect from the office when notified',
  tips: ['Bring original documents and photocopies'],
};

function timestamp() {
  return new Date().toISOString();
}

function parseGuide(row) {
  if (!row) return null;
  const guide = { ...row };
  for (const field of JSON_FIELDS) {
    try {
      guide[field] = JSON.parse(guide[field]);
    } catch {
      guide[field] = [];
    }
  }
  return guide;
}

function readSeed(seedPath) {
  if (!fs.existsSync(seedPath)) return [FALLBACK_GUIDE];
  try {
    const parsed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    return Array.isArray(parsed) && parsed.length ? parsed : [FALLBACK_GUIDE];
  } catch (error) {
    console.warn(`Could not read seed file (${error.message}); using the sample guide.`);
    return [FALLBACK_GUIDE];
  }
}

function initializeDatabase(dbPath, seedPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS guides (
      slug TEXT PRIMARY KEY,
      org TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      last_verified TEXT NOT NULL,
      source_label TEXT NOT NULL,
      source_url TEXT NOT NULL,
      fee TEXT NOT NULL,
      processing_time TEXT NOT NULL,
      documents TEXT NOT NULL,
      steps TEXT NOT NULL,
      offices TEXT NOT NULL,
      hours TEXT NOT NULL,
      collection TEXT NOT NULL,
      tips TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guide_slug TEXT NOT NULL,
      message TEXT NOT NULL,
      visited_on TEXT,
      city TEXT,
      reporter_email TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewing', 'fixed')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (guide_slug) REFERENCES guides(slug) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guide_slug TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (guide_slug) REFERENCES guides(slug) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_confirmations_guide_created ON confirmations(guide_slug, created_at);
  `);

  const guideCount = db.prepare('SELECT COUNT(*) AS count FROM guides').get().count;
  if (guideCount === 0) {
    const insert = db.prepare(`
      INSERT INTO guides (
        slug, org, title, summary, last_verified, source_label, source_url, fee,
        processing_time, documents, steps, offices, hours, collection, tips,
        created_at, updated_at
      ) VALUES (
        @slug, @org, @title, @summary, @last_verified, @source_label, @source_url, @fee,
        @processing_time, @documents, @steps, @offices, @hours, @collection, @tips,
        @created_at, @updated_at
      )
    `);
    const seed = db.transaction((rawGuides) => {
      for (const rawGuide of rawGuides) {
        const guide = serializeGuide(validateGuide(rawGuide));
        const now = timestamp();
        insert.run({ ...guide, created_at: now, updated_at: now });
      }
    });
    seed(readSeed(seedPath));
  }

  return db;
}

module.exports = { initializeDatabase, parseGuide, timestamp };
