import "server-only";
import { db, id } from "./db";
import { IDEA_STATUSES, type IdeaStatus } from "./queries";

// Write paths shared by the HTTP ingest API (used by Claude Code, scrapers,
// webhooks) and the in-app server actions.

type Primitive = string | number | null;
const run = (sql: string, ...args: Primitive[]) => db().prepare(sql).run(...args);

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : 0);
const optStr = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);

export class IngestError extends Error {}

function required(v: unknown, field: string): string {
  if (typeof v !== "string" || v.trim() === "") throw new IngestError(`"${field}" is required`);
  return v.trim();
}

export function upsertCreator(input: Record<string, unknown>): string {
  const platform = required(input.platform, "platform");
  const handle = required(input.handle, "handle").replace(/^@/, "");
  const existing = db()
    .prepare("SELECT id FROM creators WHERE platform = ? AND handle = ?")
    .get(platform, handle) as { id: string } | undefined;
  const creatorId = existing?.id ?? id("cr");
  run(
    `INSERT INTO creators (id, platform, handle, display_name, niche_id, followers, followers_30d_ago, first_post_at, source, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(platform, handle) DO UPDATE SET
       display_name = COALESCE(excluded.display_name, display_name),
       niche_id = COALESCE(excluded.niche_id, niche_id),
       followers = excluded.followers,
       followers_30d_ago = CASE WHEN excluded.followers_30d_ago > 0 THEN excluded.followers_30d_ago ELSE followers_30d_ago END,
       first_post_at = COALESCE(excluded.first_post_at, first_post_at),
       updated_at = datetime('now')`,
    creatorId, platform, handle, optStr(input.display_name), optStr(input.niche_id),
    num(input.followers), num(input.followers_30d_ago), optStr(input.first_post_at), str(input.source, "manual"),
  );
  return creatorId;
}

export function upsertTrendingPost(input: Record<string, unknown>): string {
  const url = required(input.url, "url");
  const creatorId =
    input.creator && typeof input.creator === "object"
      ? upsertCreator({ source: input.source, niche_id: input.niche_id, ...(input.creator as Record<string, unknown>) })
      : optStr(input.creator_id);
  const existing = db().prepare("SELECT id FROM trending_posts WHERE url = ?").get(url) as { id: string } | undefined;
  const postId = existing?.id ?? id("tp");
  run(
    `INSERT INTO trending_posts (id, platform, url, creator_id, niche_id, format_id, caption, hook, transcript, thumbnail_url,
       views, likes, comments, shares, saves, posted_at, source, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(url) DO UPDATE SET
       views = excluded.views, likes = excluded.likes, comments = excluded.comments,
       shares = excluded.shares, saves = excluded.saves,
       format_id = COALESCE(excluded.format_id, format_id),
       transcript = CASE WHEN excluded.transcript != '' THEN excluded.transcript ELSE transcript END,
       fetched_at = datetime('now')`,
    postId, required(input.platform, "platform"), url, creatorId, optStr(input.niche_id), optStr(input.format_id),
    str(input.caption), str(input.hook), str(input.transcript), optStr(input.thumbnail_url),
    num(input.views), num(input.likes), num(input.comments), num(input.shares), num(input.saves),
    optStr(input.posted_at), str(input.source, "manual"),
  );
  return postId;
}

export function upsertFormat(input: Record<string, unknown>): string {
  const formatId = optStr(input.id) ?? id("fmt");
  const structure = Array.isArray(input.structure) ? input.structure.map(String) : [];
  run(
    `INSERT INTO formats (id, niche_id, name, summary, structure, why_it_works, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, summary = excluded.summary,
       structure = excluded.structure, why_it_works = excluded.why_it_works, status = excluded.status`,
    formatId, optStr(input.niche_id), required(input.name, "name"), str(input.summary),
    JSON.stringify(structure), str(input.why_it_works), str(input.status, "watching"),
  );
  if (Array.isArray(input.example_urls)) {
    for (const url of input.example_urls) {
      run("UPDATE trending_posts SET format_id = ? WHERE url = ?", formatId, String(url));
    }
  }
  return formatId;
}

function asStatus(v: unknown, fallback: IdeaStatus): IdeaStatus {
  return IDEA_STATUSES.includes(v as IdeaStatus) ? (v as IdeaStatus) : fallback;
}

export function upsertIdea(input: Record<string, unknown>): string {
  const ideaId = optStr(input.id) ?? id("idea");
  run(
    `INSERT INTO ideas (id, format_id, title, hook, script, notes, status, platform, scheduled_for, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       format_id = COALESCE(excluded.format_id, format_id), title = excluded.title,
       hook = excluded.hook, script = excluded.script, notes = excluded.notes,
       status = excluded.status, platform = excluded.platform,
       scheduled_for = excluded.scheduled_for, updated_at = datetime('now')`,
    ideaId, optStr(input.format_id), required(input.title, "title"), str(input.hook), str(input.script),
    str(input.notes), asStatus(input.status, "idea"), str(input.platform, "instagram"),
    optStr(input.scheduled_for), str(input.created_by, "claude"),
  );
  return ideaId;
}

export function addAsset(input: Record<string, unknown>): string {
  const assetId = id("as");
  run(
    "INSERT INTO assets (id, idea_id, kind, url, label, created_by) VALUES (?, ?, ?, ?, ?, ?)",
    assetId, optStr(input.idea_id), required(input.kind, "kind"), required(input.url, "url"),
    str(input.label), str(input.created_by, "claude"),
  );
  return assetId;
}

// Marks an idea as posted and starts tracking it.
export function recordPost(input: Record<string, unknown>): string {
  const postId = optStr(input.id) ?? id("post");
  const ideaId = optStr(input.idea_id);
  run(
    `INSERT INTO posts (id, idea_id, platform, url, caption, thumbnail_url, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET url = excluded.url, caption = excluded.caption`,
    postId, ideaId, required(input.platform, "platform"), str(input.url), str(input.caption),
    optStr(input.thumbnail_url), str(input.published_at, new Date().toISOString()),
  );
  if (ideaId) run("UPDATE ideas SET status = 'posted', updated_at = datetime('now') WHERE id = ?", ideaId);
  return postId;
}

export function recordMetrics(input: Record<string, unknown>) {
  run(
    `INSERT OR REPLACE INTO post_metrics (post_id, captured_at, views, likes, comments, shares, saves, profile_visits, follows)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    required(input.post_id, "post_id"), str(input.captured_at, new Date().toISOString()),
    num(input.views), num(input.likes), num(input.comments), num(input.shares), num(input.saves),
    num(input.profile_visits), num(input.follows),
  );
}

export type EventInput = {
  type: "comment_keyword" | "dm_sent" | "link_click" | "optin" | "purchase";
  source: string;
  post_id?: string | null;
  link_slug?: string | null;
  keyword?: string | null;
  click_id?: string | null;
  contact_ref?: string | null;
  value_cents?: number;
  meta?: Record<string, unknown>;
};

// Attribution: an explicit post_id wins; otherwise inherit from the click
// (purchase/opt-in carrying cs_cid), the keyword, or the link.
export function recordEvent(e: EventInput): string {
  let postId = e.post_id ?? null;
  let linkSlug = e.link_slug ?? null;
  const conn = db();
  if (!postId && e.click_id) {
    const click = conn
      .prepare("SELECT post_id, link_slug FROM events WHERE click_id = ? AND type = 'link_click' LIMIT 1")
      .get(e.click_id) as { post_id: string | null; link_slug: string | null } | undefined;
    postId = click?.post_id ?? null;
    linkSlug = linkSlug ?? click?.link_slug ?? null;
  }
  if (!postId && e.keyword) {
    const kw = conn.prepare("SELECT post_id FROM keywords WHERE keyword = ? COLLATE NOCASE").get(e.keyword) as
      | { post_id: string | null }
      | undefined;
    postId = kw?.post_id ?? null;
  }
  if (!postId && linkSlug) {
    const link = conn.prepare("SELECT post_id FROM links WHERE slug = ?").get(linkSlug) as
      | { post_id: string | null }
      | undefined;
    postId = link?.post_id ?? null;
  }
  const eventId = id("ev");
  run(
    `INSERT INTO events (id, type, post_id, link_slug, keyword, click_id, contact_ref, value_cents, source, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    eventId, e.type, postId, linkSlug, e.keyword?.toUpperCase() ?? null, e.click_id ?? null,
    e.contact_ref ?? null, e.value_cents ?? 0, e.source, JSON.stringify(e.meta ?? {}), new Date().toISOString(),
  );
  return eventId;
}

export function upsertNiche(input: Record<string, unknown>): string {
  const name = required(input.name, "name");
  const nicheId = optStr(input.id) ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  run(
    `INSERT INTO niches (id, name, keywords) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, keywords = excluded.keywords`,
    nicheId, name, str(input.keywords),
  );
  return nicheId;
}

// Merge-update: only the fields provided change.
export function updateIdea(ideaId: string, patch: Record<string, unknown>): string {
  const existing = db().prepare("SELECT * FROM ideas WHERE id = ?").get(ideaId) as Record<string, unknown> | undefined;
  if (!existing) throw new IngestError(`Idea "${ideaId}" not found`);
  const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  return upsertIdea({ ...existing, ...defined, id: ideaId });
}

export function createTrackedLink(input: Record<string, unknown>): { slug: string; keyword: string | null } {
  const slug = required(input.slug, "slug").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const destination = required(input.destination, "destination");
  if (!slug || !URL.canParse(destination)) throw new IngestError("A slug and a valid destination URL are required");
  const postId = optStr(input.post_id);
  run(
    "INSERT OR REPLACE INTO links (slug, destination, label, post_id) VALUES (?, ?, ?, ?)",
    slug, destination, str(input.label), postId,
  );
  const keyword = optStr(input.keyword)?.toUpperCase() ?? null;
  if (keyword) {
    run("INSERT OR REPLACE INTO keywords (keyword, post_id, link_slug) VALUES (?, ?, ?)", keyword, postId, slug);
  }
  return { slug, keyword };
}
