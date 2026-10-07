import "server-only";
import { db } from "./db";

export type Niche = { id: string; name: string; keywords: string };

export type Format = {
  id: string;
  niche_id: string;
  name: string;
  summary: string;
  structure: string[];
  why_it_works: string;
  status: "watching" | "testing" | "winner" | "retired";
  examples: number;
  total_views: number;
  avg_save_rate: number;
  ideas: number;
};

export type TrendingPost = {
  id: string;
  platform: string;
  url: string;
  hook: string;
  caption: string;
  transcript: string;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posted_at: string;
  source: string;
  format_id: string | null;
  format_name: string | null;
  creator_id: string | null;
  handle: string;
  followers: number;
  save_rate: number;
  reach_multiple: number;
};

export type Creator = {
  id: string;
  platform: string;
  handle: string;
  display_name: string;
  followers: number;
  followers_30d_ago: number;
  growth_30d: number;
  account_age_days: number;
  source: string;
  top_format: string | null;
  category: string | null;
  sells: string | null;
  sells_url: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export type Idea = {
  id: string;
  format_id: string | null;
  format_name: string | null;
  title: string;
  hook: string;
  script: string;
  notes: string;
  status: IdeaStatus;
  platform: string;
  scheduled_for: string | null;
  created_by: string;
  assets: number;
  // The trending video this idea replicates, if it was saved from Discover.
  source_post_id: string | null;
  source_url: string | null;
  source_thumbnail: string | null;
  source_hook: string | null;
  source_handle: string | null;
  source_views: number | null;
  source_likes: number | null;
  source_saves: number | null;
};

export const IDEA_STATUSES = ["idea", "scripting", "producing", "ready", "scheduled", "posted"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export type Asset = {
  id: string;
  idea_id: string | null;
  idea_title: string | null;
  kind: string;
  url: string;
  label: string;
  created_by: string;
  created_at: string;
};

export type Funnel = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  follows: number;
  keyword_comments: number;
  dms: number;
  clicks: number;
  optins: number;
  purchases: number;
  revenue_cents: number;
};

export type PostWithFunnel = Funnel & {
  id: string;
  idea_id: string | null;
  platform: string;
  url: string;
  caption: string;
  thumbnail_url: string | null;
  published_at: string;
  format_name: string | null;
  keyword: string | null;
  link_slug: string | null;
};

const all = <T>(sql: string, ...args: (string | number | null)[]) =>
  db().prepare(sql).all(...args) as T[];
const one = <T>(sql: string, ...args: (string | number | null)[]) =>
  db().prepare(sql).get(...args) as T | undefined;

// ---------- Discover ----------

export function listNiches(ws: string): Niche[] {
  // Busiest niche first so it's the default view.
  return all<Niche>(
    `SELECT n.id, n.name, n.keywords FROM niches n WHERE n.workspace_id = ?
     ORDER BY (SELECT COUNT(*) FROM trending_posts t WHERE t.niche_id = n.id) DESC, n.created_at DESC`,
    ws,
  );
}

export function listFormats(ws: string, nicheId?: string): Format[] {
  const rows = all<Omit<Format, "structure"> & { structure: string }>(
    `SELECT f.*,
       (SELECT COUNT(*) FROM trending_posts t WHERE t.format_id = f.id) AS examples,
       (SELECT COALESCE(SUM(views), 0) FROM trending_posts t WHERE t.format_id = f.id) AS total_views,
       (SELECT COALESCE(SUM(saves) * 1.0 / NULLIF(SUM(views), 0), 0) FROM trending_posts t WHERE t.format_id = f.id) AS avg_save_rate,
       (SELECT COUNT(*) FROM ideas i WHERE i.format_id = f.id) AS ideas
     FROM formats f
     WHERE f.workspace_id = ?2 AND (?1 IS NULL OR f.niche_id = ?1)
     ORDER BY CASE f.status WHEN 'winner' THEN 0 WHEN 'testing' THEN 1 WHEN 'watching' THEN 2 ELSE 3 END, total_views DESC`,
    nicheId ?? null,
    ws,
  );
  return rows.map((r) => ({ ...r, structure: JSON.parse(r.structure) as string[] }));
}

export function getFormat(ws: string, formatId: string): Format | undefined {
  return listFormats(ws).find((f) => f.id === formatId);
}

export function listTrendingPosts(ws: string, opts: { nicheId?: string; formatId?: string } = {}): TrendingPost[] {
  return all<TrendingPost>(
    `SELECT t.*, f.name AS format_name, c.handle, c.followers,
       COALESCE(t.saves * 1.0 / NULLIF(t.views, 0), 0) AS save_rate,
       COALESCE(t.views * 1.0 / NULLIF(c.followers, 0), 0) AS reach_multiple
     FROM trending_posts t
     LEFT JOIN creators c ON c.id = t.creator_id
     LEFT JOIN formats f ON f.id = t.format_id
     WHERE t.workspace_id = ?3 AND (?1 IS NULL OR t.niche_id = ?1) AND (?2 IS NULL OR t.format_id = ?2)
     ORDER BY reach_multiple DESC`,
    opts.nicheId ?? null,
    opts.formatId ?? null,
    ws,
  );
}

// Breakout = account is young and grew fast in the last 30 days.
export function listCreators(ws: string, nicheId?: string): Creator[] {
  return all<Creator>(
    `SELECT c.id, c.platform, c.handle, COALESCE(c.display_name, c.handle) AS display_name, c.followers, c.followers_30d_ago,
       COALESCE((c.followers - c.followers_30d_ago) * 1.0 / NULLIF(c.followers_30d_ago, 0), 0) AS growth_30d,
       CAST(julianday('now') - julianday(COALESCE(c.first_post_at, c.updated_at)) AS INTEGER) AS account_age_days,
       c.source, c.category, c.sells, c.sells_url, c.bio, c.avatar_url,
       (SELECT f.name FROM trending_posts t JOIN formats f ON f.id = t.format_id
         WHERE t.creator_id = c.id GROUP BY f.id ORDER BY SUM(t.views) DESC LIMIT 1) AS top_format
     FROM creators c
     WHERE c.workspace_id = ?2 AND (?1 IS NULL OR c.niche_id = ?1)
     ORDER BY growth_30d DESC`,
    nicheId ?? null,
    ws,
  );
}

// ---------- Recreate ----------

export function listIdeas(ws: string): Idea[] {
  return all<Idea>(
    `SELECT i.*, f.name AS format_name, (SELECT COUNT(*) FROM assets a WHERE a.idea_id = i.id) AS assets,
       t.url AS source_url, t.thumbnail_url AS source_thumbnail, t.hook AS source_hook, c.handle AS source_handle,
       t.views AS source_views, t.likes AS source_likes, t.saves AS source_saves
     FROM ideas i
     LEFT JOIN formats f ON f.id = i.format_id
     LEFT JOIN trending_posts t ON t.id = i.source_post_id
     LEFT JOIN creators c ON c.id = t.creator_id
     WHERE i.workspace_id = ?
     ORDER BY COALESCE(i.scheduled_for, i.created_at) ASC`,
    ws,
  );
}

// trending post id -> idea id, for showing "Saved" on videos in Discover.
export function savedVideoIdeas(ws: string): Map<string, string> {
  return new Map(
    all<{ source_post_id: string; id: string }>(
      "SELECT source_post_id, id FROM ideas WHERE workspace_id = ? AND source_post_id IS NOT NULL",
      ws,
    ).map((r) => [r.source_post_id, r.id]),
  );
}

export function getIdea(ws: string, ideaId: string): Idea | undefined {
  return listIdeas(ws).find((i) => i.id === ideaId);
}

export function listAssets(ws: string, ideaId?: string): Asset[] {
  return all<Asset>(
    `SELECT a.*, i.title AS idea_title FROM assets a LEFT JOIN ideas i ON i.id = a.idea_id
     WHERE a.workspace_id = ?2 AND (?1 IS NULL OR a.idea_id = ?1) ORDER BY a.created_at DESC`,
    ideaId ?? null,
    ws,
  );
}

// ---------- Track ----------

const FUNNEL_SELECT = `
  COALESCE(m.views, 0) AS views, COALESCE(m.likes, 0) AS likes, COALESCE(m.comments, 0) AS comments,
  COALESCE(m.shares, 0) AS shares, COALESCE(m.saves, 0) AS saves,
  COALESCE(m.profile_visits, 0) AS profile_visits, COALESCE(m.follows, 0) AS follows,
  (SELECT COUNT(*) FROM events e WHERE e.post_id = p.id AND e.type = 'comment_keyword') AS keyword_comments,
  (SELECT COUNT(*) FROM events e WHERE e.post_id = p.id AND e.type = 'dm_sent') AS dms,
  (SELECT COUNT(*) FROM events e WHERE e.post_id = p.id AND e.type = 'link_click') AS clicks,
  (SELECT COUNT(*) FROM events e WHERE e.post_id = p.id AND e.type = 'optin') AS optins,
  (SELECT COUNT(*) FROM events e WHERE e.post_id = p.id AND e.type = 'purchase') AS purchases,
  (SELECT COALESCE(SUM(value_cents), 0) FROM events e WHERE e.post_id = p.id AND e.type = 'purchase') AS revenue_cents`;

export function listPostsWithFunnel(ws: string): PostWithFunnel[] {
  return all<PostWithFunnel>(
    `SELECT p.*, f.name AS format_name,
       (SELECT keyword FROM keywords k WHERE k.post_id = p.id LIMIT 1) AS keyword,
       (SELECT slug FROM links l WHERE l.post_id = p.id LIMIT 1) AS link_slug,
       ${FUNNEL_SELECT}
     FROM posts p
     LEFT JOIN ideas i ON i.id = p.idea_id
     LEFT JOIN formats f ON f.id = i.format_id
     LEFT JOIN post_metrics m ON m.post_id = p.id
       AND m.captured_at = (SELECT MAX(captured_at) FROM post_metrics WHERE post_id = p.id)
     WHERE p.workspace_id = ?
     ORDER BY p.published_at DESC`,
    ws,
  );
}

export function getPostMetricsSeries(ws: string, postId: string) {
  return all<{ captured_at: string; views: number; follows: number }>(
    `SELECT m.captured_at, m.views, m.follows FROM post_metrics m JOIN posts p ON p.id = m.post_id
     WHERE m.post_id = ? AND p.workspace_id = ? ORDER BY m.captured_at`,
    postId,
    ws,
  );
}

export function getTotals(ws: string): Funnel {
  const posts = listPostsWithFunnel(ws);
  const sum = (k: keyof Funnel) => posts.reduce((acc, p) => acc + p[k], 0);
  const bio = one<{ clicks: number }>(
    "SELECT COUNT(*) AS clicks FROM events WHERE workspace_id = ? AND post_id IS NULL AND type = 'link_click'",
    ws,
  );
  return {
    views: sum("views"),
    likes: sum("likes"),
    comments: sum("comments"),
    shares: sum("shares"),
    saves: sum("saves"),
    profile_visits: sum("profile_visits"),
    follows: sum("follows"),
    keyword_comments: sum("keyword_comments"),
    dms: sum("dms"),
    clicks: sum("clicks") + (bio?.clicks ?? 0),
    optins: sum("optins"),
    purchases: sum("purchases"),
    revenue_cents: sum("revenue_cents"),
  };
}

export type LinkRow = {
  slug: string;
  destination: string;
  label: string;
  post_id: string | null;
  post_caption: string | null;
  clicks: number;
  purchases: number;
  revenue_cents: number;
};

export function listLinks(ws: string): LinkRow[] {
  return all<LinkRow>(
    `SELECT l.*, p.caption AS post_caption,
       (SELECT COUNT(*) FROM events e WHERE e.link_slug = l.slug AND e.type = 'link_click') AS clicks,
       (SELECT COUNT(*) FROM events e WHERE e.link_slug = l.slug AND e.type = 'purchase') AS purchases,
       (SELECT COALESCE(SUM(value_cents), 0) FROM events e WHERE e.link_slug = l.slug AND e.type = 'purchase') AS revenue_cents
     FROM links l LEFT JOIN posts p ON p.id = l.post_id WHERE l.workspace_id = ? ORDER BY clicks DESC`,
    ws,
  );
}

export type KeywordRow = { keyword: string; post_id: string | null; link_slug: string | null; post_caption: string | null; hits: number };

export function listKeywords(ws: string): KeywordRow[] {
  return all<KeywordRow>(
    `SELECT k.*, p.caption AS post_caption,
       (SELECT COUNT(*) FROM events e WHERE e.workspace_id = k.workspace_id AND e.keyword = k.keyword AND e.type = 'comment_keyword') AS hits
     FROM keywords k LEFT JOIN posts p ON p.id = k.post_id WHERE k.workspace_id = ? ORDER BY hits DESC`,
    ws,
  );
}

export function listRecentEvents(ws: string, limit = 12) {
  return all<{ id: string; type: string; source: string; value_cents: number; created_at: string; post_caption: string | null; keyword: string | null; link_slug: string | null }>(
    `SELECT e.id, e.type, e.source, e.value_cents, e.created_at, e.keyword, e.link_slug, p.caption AS post_caption
     FROM events e LEFT JOIN posts p ON p.id = e.post_id WHERE e.workspace_id = ? ORDER BY e.created_at DESC LIMIT ?`,
    ws,
    limit,
  );
}

export function getSyncStatus(ws: string) {
  return all<{ source: string; last: string; n: number }>(
    "SELECT source, MAX(fetched_at) AS last, COUNT(*) AS n FROM trending_posts WHERE workspace_id = ? GROUP BY source",
    ws,
  );
}

// Closes the loop: which formats actually convert, not just which get views.
export type FormatPerformance = {
  format_id: string | null;
  format_name: string | null;
  posts: number;
  views: number;
  saves: number;
  follows: number;
  clicks: number;
  purchases: number;
  revenue_cents: number;
};

export function listFormatPerformance(ws: string): FormatPerformance[] {
  const byFormat = new Map<string, FormatPerformance>();
  const formatIds = new Map(
    all<{ id: string; format_id: string | null }>("SELECT id, format_id FROM ideas WHERE workspace_id = ?", ws).map((i) => [i.id, i.format_id]),
  );
  for (const p of listPostsWithFunnel(ws)) {
    const formatId = p.idea_id ? formatIds.get(p.idea_id) ?? null : null;
    const key = formatId ?? "none";
    const row = byFormat.get(key) ?? {
      format_id: formatId, format_name: p.format_name, posts: 0, views: 0, saves: 0,
      follows: 0, clicks: 0, purchases: 0, revenue_cents: 0,
    };
    row.posts += 1;
    row.views += p.views;
    row.saves += p.saves;
    row.follows += p.follows;
    row.clicks += p.clicks;
    row.purchases += p.purchases;
    row.revenue_cents += p.revenue_cents;
    byFormat.set(key, row);
  }
  return [...byFormat.values()].sort((a, b) => b.revenue_cents - a.revenue_cents);
}

// Discover's main view: each account with its best videos, grouped by the
// trend category it belongs to ("AI models", "Colour & outfit guides", ...).
export type TrendAccount = Creator & {
  total_views: number;
  video_count: number;
  best: TrendingPost | null;
  top_videos: TrendingPost[];
};

// Views first; Instagram photo/carousel posts report no views, so likes break ties.
export const byReach = (a: TrendingPost, b: TrendingPost) => b.views - a.views || b.likes - a.likes;

export function listTrendAccounts(ws: string, nicheId?: string, videosPerAccount = 6): TrendAccount[] {
  const posts = listTrendingPosts(ws, { nicheId });
  const byCreator = new Map<string, TrendingPost[]>();
  for (const p of posts) {
    if (!p.creator_id) continue;
    byCreator.set(p.creator_id, [...(byCreator.get(p.creator_id) ?? []), p]);
  }
  // An account belongs to a niche if it was filed there or has videos there.
  const filed = nicheId ? listCreatorIdsInNiche(ws, nicheId) : null;
  return listCreators(ws)
    .filter((c) => !filed || byCreator.has(c.id) || filed.has(c.id))
    .map((c) => {
      const videos = (byCreator.get(c.id) ?? []).sort(byReach);
      return {
        ...c,
        total_views: videos.reduce((sum, v) => sum + v.views, 0),
        video_count: videos.length,
        best: videos[0] ?? null,
        top_videos: videos.slice(0, videosPerAccount),
      };
    })
    .sort((a, b) => (b.best?.views ?? 0) - (a.best?.views ?? 0) || (b.best?.likes ?? 0) - (a.best?.likes ?? 0));
}

function listCreatorIdsInNiche(ws: string, nicheId: string): Set<string> {
  return new Set(all<{ id: string }>("SELECT id FROM creators WHERE workspace_id = ? AND niche_id = ?", ws, nicheId).map((r) => r.id));
}

export function groupByCategory(accounts: TrendAccount[]): [string, TrendAccount[]][] {
  const groups = new Map<string, TrendAccount[]>();
  for (const a of accounts) {
    const key = a.category?.trim() || "Uncategorised";
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  // Biggest category first, "Uncategorised" last.
  return [...groups.entries()].sort(([ka, a], [kb, b]) =>
    ka === "Uncategorised" ? 1 : kb === "Uncategorised" ? -1 : b.reduce((s, x) => s + x.total_views, 0) - a.reduce((s, x) => s + x.total_views, 0),
  );
}
