import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seed } from "./seed";

// Single SQLite file for the MVP. Every table is plain SQL so the schema
// ports directly to Postgres when we outgrow a single box.
const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "contentstudio.db");

const SCHEMA = `
-- ---------- Tenancy ----------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_hash TEXT,          -- sha256 of the workspace API key (MCP + ingest)
  api_key_prefix TEXT,        -- first chars, shown in settings
  manychat_secret TEXT NOT NULL,
  stripe_webhook_secret TEXT, -- whsec_... pasted by the user
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memberships (
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  role TEXT NOT NULL DEFAULT 'owner',
  PRIMARY KEY (user_id, workspace_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  expires_at TEXT NOT NULL
);

-- Metered third-party calls (Scrape Creators credits are shared across tenants).
CREATE TABLE IF NOT EXISTS usage (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  provider TEXT NOT NULL,
  day TEXT NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (workspace_id, provider, day)
);

-- ---------- Discover ----------
CREATE TABLE IF NOT EXISTS niches (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Accounts found by Scrape Creators / Virlo. "Breakout" = young account + fast growth.
CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  platform TEXT NOT NULL,              -- instagram | tiktok
  handle TEXT NOT NULL,
  display_name TEXT,
  niche_id TEXT REFERENCES niches(id),
  followers INTEGER NOT NULL DEFAULT 0,
  followers_30d_ago INTEGER NOT NULL DEFAULT 0,
  first_post_at TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(workspace_id, platform, handle)
);

-- A replicable content format (the thing we actually want to find).
CREATE TABLE IF NOT EXISTS formats (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  niche_id TEXT REFERENCES niches(id),
  name TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  structure TEXT NOT NULL DEFAULT '[]', -- JSON array of beats
  why_it_works TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'watching', -- watching | testing | winner | retired
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trending_posts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  creator_id TEXT REFERENCES creators(id),
  niche_id TEXT REFERENCES niches(id),
  format_id TEXT REFERENCES formats(id),
  caption TEXT NOT NULL DEFAULT '',
  hook TEXT NOT NULL DEFAULT '',
  transcript TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  posted_at TEXT,
  source TEXT NOT NULL DEFAULT 'manual', -- virlo | scrapecreators | manual
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(workspace_id, url)
);

-- ---------- Recreate ----------
-- Our own content pipeline: idea -> script -> assets -> scheduled -> posted.
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  format_id TEXT REFERENCES formats(id),
  title TEXT NOT NULL,
  hook TEXT NOT NULL DEFAULT '',
  script TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'idea', -- idea | scripting | producing | ready | scheduled | posted
  platform TEXT NOT NULL DEFAULT 'instagram',
  scheduled_for TEXT,
  created_by TEXT NOT NULL DEFAULT 'user', -- user | claude
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  idea_id TEXT REFERENCES ideas(id),
  kind TEXT NOT NULL, -- image | video | carousel | caption | script
  url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- Track ----------
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  idea_id TEXT REFERENCES ideas(id),
  platform TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  published_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_metrics (
  post_id TEXT NOT NULL REFERENCES posts(id),
  captured_at TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  profile_visits INTEGER NOT NULL DEFAULT 0,
  follows INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, captured_at)
);

-- Tracked short links: /l/:slug logs a click then redirects. Slugs are
-- global because the URL is public; the row says which workspace owns it.
CREATE TABLE IF NOT EXISTS links (
  slug TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  destination TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  post_id TEXT REFERENCES posts(id), -- NULL = bio link
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ManyChat "comment KEYWORD" automations, mapped to the post that asked for it.
CREATE TABLE IF NOT EXISTS keywords (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  keyword TEXT NOT NULL,
  post_id TEXT REFERENCES posts(id),
  link_slug TEXT REFERENCES links(slug),
  PRIMARY KEY (workspace_id, keyword)
);

-- Everything downstream of a view lands here so we can draw content -> conversion.
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  type TEXT NOT NULL, -- comment_keyword | dm_sent | link_click | optin | purchase
  post_id TEXT REFERENCES posts(id),
  link_slug TEXT,
  keyword TEXT,
  click_id TEXT,
  contact_ref TEXT,
  value_cents INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL, -- link | manychat | stripe | manual
  meta TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS events_post ON events(post_id, type);
CREATE INDEX IF NOT EXISTS events_click ON events(click_id);
CREATE INDEX IF NOT EXISTS events_ws ON events(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS ideas_ws ON ideas(workspace_id);
CREATE INDEX IF NOT EXISTS trending_ws ON trending_posts(workspace_id, niche_id);
`;

// Additive migrations for databases created by an earlier schema.
const COLUMNS: [table: string, column: string, definition: string][] = [
  ["creators", "category", "TEXT"], // trend archetype, e.g. "Colour & outfit guides"
  ["creators", "sells", "TEXT"], // what the account monetises, e.g. "Digital style guide (Gumroad)"
  ["creators", "sells_url", "TEXT"],
  ["creators", "bio", "TEXT"],
  ["creators", "avatar_url", "TEXT"],
  ["ideas", "source_post_id", "TEXT"], // the trending video this idea replicates
  ["ideas", "position", "REAL"], // order within its board column (lower = higher priority)
  ["trending_posts", "video_url", "TEXT"], // platform CDN video, played inline via /api/media
  ["assets", "mime", "TEXT"], // uploaded files only
  ["assets", "size", "INTEGER"],
  ["assets", "filename", "TEXT"],
];

function migrate(conn: DatabaseSync) {
  for (const [table, column, definition] of COLUMNS) {
    const exists = conn.prepare(`SELECT 1 FROM pragma_table_info('${table}') WHERE name = ?`).get(column);
    if (!exists) conn.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
  // Only Ready work can carry a publish date; clear dates left on earlier stages.
  if (conn.prepare("SELECT 1 FROM pragma_table_info('ideas') WHERE name = 'scheduled_for'").get()) {
    conn.exec("UPDATE ideas SET scheduled_for = NULL WHERE status IN ('idea', 'scripting', 'producing') AND scheduled_for IS NOT NULL");
  }
}

const globalForDb = globalThis as unknown as { __csDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!globalForDb.__csDb) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const conn = new DatabaseSync(DB_PATH);
    conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    const legacy = conn.prepare("SELECT 1 FROM pragma_table_info('niches') WHERE name = 'id'").get() &&
      !conn.prepare("SELECT 1 FROM pragma_table_info('niches') WHERE name = 'workspace_id'").get();
    if (legacy) {
      throw new Error(`${DB_PATH} predates multi-tenancy. Delete it (it only held demo data) and restart.`);
    }
    conn.exec(SCHEMA);
    migrate(conn);
    // Local dev gets a demo login (demo@contentstudio.dev / demo-password) with sample data.
    const { n } = conn.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    const wantSeed = process.env.SEED_DEMO_DATA ? process.env.SEED_DEMO_DATA === "true" : process.env.NODE_ENV !== "production";
    if (n === 0 && wantSeed) seed(conn);
    globalForDb.__csDb = conn;
  }
  return globalForDb.__csDb;
}

export function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}
