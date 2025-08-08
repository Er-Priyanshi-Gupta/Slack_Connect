import Database, { Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

// Choose writable location for the database
// On Render, /tmp is writable (but not persistent)
const dataDir =
  process.env.NODE_ENV === "production"
    ? "/tmp"
    : path.join(__dirname, "../../data");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Full path to SQLite file
const dbPath = path.join(dataDir, "mydb.sqlite");

// Create the database connection
const db: DatabaseType = new Database(dbPath);

// Initialize required tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    team_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scheduled_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_time INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    error_message TEXT
  );
`);

export default db;
