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
CREATE TABLE IF NOT EXISTS niches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Accounts found by Scrape Creators / Virlo. "Breakout" = young account + fast growth.
CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,              -- instagram | tiktok
  handle TEXT NOT NULL,
  display_name TEXT,
  niche_id TEXT REFERENCES niches(id),
  followers INTEGER NOT NULL DEFAULT 0,
  followers_30d_ago INTEGER NOT NULL DEFAULT 0,
  first_post_at TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(platform, handle)
);

-- A replicable content format (the thing we actually want to find).
CREATE TABLE IF NOT EXISTS formats (
  id TEXT PRIMARY KEY,
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
  platform TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
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
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Our own content pipeline: idea -> script -> assets -> scheduled -> posted.
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
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
  idea_id TEXT REFERENCES ideas(id),
  kind TEXT NOT NULL, -- image | video | carousel | caption | script
  url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
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

-- Tracked short links: /l/:slug logs a click then redirects.
CREATE TABLE IF NOT EXISTS links (
  slug TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  post_id TEXT REFERENCES posts(id), -- NULL = bio link (attributed by recency)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ManyChat "comment KEYWORD" automations, mapped to the post that asked for it.
CREATE TABLE IF NOT EXISTS keywords (
  keyword TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id),
  link_slug TEXT REFERENCES links(slug)
);

-- Everything downstream of a view lands here so we can draw content -> conversion.
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
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
`;

const globalForDb = globalThis as unknown as { __csDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!globalForDb.__csDb) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const conn = new DatabaseSync(DB_PATH);
    conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    conn.exec(SCHEMA);
    const { n } = conn.prepare("SELECT COUNT(*) AS n FROM niches").get() as { n: number };
    if (n === 0 && process.env.SEED_DEMO_DATA !== "false") seed(conn);
    globalForDb.__csDb = conn;
  }
  return globalForDb.__csDb;
}

export function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}
