const Database = require("better-sqlite3");

const db = new Database("internships.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Remote', 'Hybrid', 'On-site')),
    stipend TEXT NOT NULL DEFAULT 'Not specified',
    duration TEXT NOT NULL,
    apply_url TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
