import "server-only";
import { db, id } from "./db";
import { IDEA_STATUSES, type IdeaStatus } from "./queries";

// Write paths shared by the MCP server, the HTTP ingest API, webhooks and the
// in-app server actions. Every function takes the caller's workspace id and
// refuses to touch or reference rows belonging to another workspace.

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

type OwnedTable = "niches" | "creators" | "formats" | "trending_posts" | "ideas" | "posts";

// Returns the id if it is null or owned by ws; throws otherwise.
function owned(ws: string, table: OwnedTable, rowId: string | null): string | null {
  if (!rowId) return null;
  const row = db().prepare(`SELECT workspace_id FROM ${table} WHERE id = ?`).get(rowId) as { workspace_id: string } | undefined;
  if (!row || row.workspace_id !== ws) throw new IngestError(`${table.replace(/s$/, "")} "${rowId}" not found`);
  return rowId;
}

// For upserts with a caller-supplied id: fine if new, fine if ours, error if someone else's.
function claimId(ws: string, table: OwnedTable, rowId: string | null, prefix: string): string {
  if (!rowId) return id(prefix);
  const row = db().prepare(`SELECT workspace_id FROM ${table} WHERE id = ?`).get(rowId) as { workspace_id: string } | undefined;
  if (row && row.workspace_id !== ws) throw new IngestError(`id "${rowId}" is not available`);
  return rowId;
}

export function upsertNiche(ws: string, input: Record<string, unknown>): string {
  const name = required(input.name, "name");
  const nicheId = claimId(ws, "niches", optStr(input.id), "niche");
  run(
    `INSERT INTO niches (id, workspace_id, name, keywords) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, keywords = excluded.keywords`,
    nicheId, ws, name, str(input.keywords),
  );
  return nicheId;
}

export function upsertCreator(ws: string, input: Record<string, unknown>): string {
  const platform = required(input.platform, "platform");
  const handle = required(input.handle, "handle").replace(/^@/, "");
  const existing = db()
    .prepare("SELECT id FROM creators WHERE workspace_id = ? AND platform = ? AND handle = ?")
    .get(ws, platform, handle) as { id: string } | undefined;
  const creatorId = existing?.id ?? id("cr");
  run(
    `INSERT INTO creators (id, workspace_id, platform, handle, display_name, niche_id, followers, followers_30d_ago, first_post_at, source,
       category, sells, sells_url, bio, avatar_url, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(workspace_id, platform, handle) DO UPDATE SET
       display_name = COALESCE(excluded.display_name, display_name),
       niche_id = COALESCE(excluded.niche_id, niche_id),
       followers = CASE WHEN excluded.followers > 0 THEN excluded.followers ELSE followers END,
       followers_30d_ago = CASE WHEN excluded.followers_30d_ago > 0 THEN excluded.followers_30d_ago ELSE followers_30d_ago END,
       first_post_at = COALESCE(excluded.first_post_at, first_post_at),
       category = COALESCE(excluded.category, category),
       sells = CASE WHEN ? THEN COALESCE(sells, excluded.sells) ELSE COALESCE(excluded.sells, sells) END,
       sells_url = CASE WHEN ? THEN COALESCE(sells_url, excluded.sells_url) ELSE COALESCE(excluded.sells_url, sells_url) END,
       bio = COALESCE(excluded.bio, bio),
       avatar_url = COALESCE(excluded.avatar_url, avatar_url),
       updated_at = datetime('now')`,
    creatorId, ws, platform, handle, optStr(input.display_name), owned(ws, "niches", optStr(input.niche_id)),
    num(input.followers), num(input.followers_30d_ago), optStr(input.first_post_at), str(input.source, "manual"),
    optStr(input.category), optStr(input.sells), optStr(input.sells_url), optStr(input.bio), optStr(input.avatar_url),
    // Auto-detected labels from a sync never replace ones a person or Claude set.
    input.sells_is_guess ? 1 : 0, input.sells_is_guess ? 1 : 0,
  );
  return creatorId;
}

// Edits the research labels on an account (category, what it sells).
export function updateCreatorMeta(ws: string, creatorId: string, patch: { category?: string; sells?: string; sells_url?: string }) {
  owned(ws, "creators", creatorId);
  run(
    "UPDATE creators SET category = ?, sells = ?, sells_url = ? WHERE id = ? AND workspace_id = ?",
    optStr(patch.category), optStr(patch.sells), optStr(patch.sells_url), creatorId, ws,
  );
}

const MEDIA_TYPES = ["video", "carousel", "photo"];

// Slides arrive as [{image, video?}] from the scraper or as plain image URLs from MCP callers.
function slidesJson(v: unknown): string | null {
  if (!Array.isArray(v)) return null;
  const slides = v
    .map((s) => (typeof s === "string" ? { image: s } : s && typeof s === "object" ? (s as Record<string, unknown>) : null))
    .filter((s): s is Record<string, unknown> => !!s && typeof s.image === "string" && s.image.length > 0)
    .slice(0, 35)
    .map((s) => (typeof s.video === "string" && s.video ? { image: s.image as string, video: s.video } : { image: s.image as string }));
  return slides.length > 0 ? JSON.stringify(slides) : null;
}

export function upsertTrendingPost(ws: string, input: Record<string, unknown>): string {
  const url = required(input.url, "url");
  const creatorId =
    input.creator && typeof input.creator === "object"
      ? upsertCreator(ws, { source: input.source, niche_id: input.niche_id, ...(input.creator as Record<string, unknown>) })
      : owned(ws, "creators", optStr(input.creator_id));
  const existing = db().prepare("SELECT id FROM trending_posts WHERE workspace_id = ? AND url = ?").get(ws, url) as
    | { id: string }
    | undefined;
  const postId = existing?.id ?? id("tp");
  const slides = slidesJson(input.slides);
  const mediaType = MEDIA_TYPES.includes(String(input.media_type)) ? String(input.media_type) : slides ? "carousel" : null;
  run(
    `INSERT INTO trending_posts (id, workspace_id, platform, url, creator_id, niche_id, format_id, caption, hook, transcript, thumbnail_url,
       views, likes, comments, shares, saves, posted_at, source, video_url, media_type, slides, audio_url, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(workspace_id, url) DO UPDATE SET
       views = excluded.views, likes = excluded.likes, comments = excluded.comments,
       shares = excluded.shares, saves = excluded.saves,
       niche_id = COALESCE(excluded.niche_id, niche_id),
       format_id = COALESCE(excluded.format_id, format_id),
       thumbnail_url = COALESCE(excluded.thumbnail_url, thumbnail_url),
       -- A slideshow never has a video of its own, so don't keep an old one.
       video_url = CASE WHEN excluded.media_type = 'carousel' THEN excluded.video_url ELSE COALESCE(excluded.video_url, video_url) END,
       media_type = COALESCE(excluded.media_type, media_type),
       slides = COALESCE(excluded.slides, slides),
       audio_url = COALESCE(excluded.audio_url, audio_url),
       transcript = CASE WHEN excluded.transcript != '' THEN excluded.transcript ELSE transcript END,
       fetched_at = datetime('now')`,
    postId, ws, required(input.platform, "platform"), url, creatorId,
    owned(ws, "niches", optStr(input.niche_id)), owned(ws, "formats", optStr(input.format_id)),
    str(input.caption), str(input.hook), str(input.transcript), optStr(input.thumbnail_url),
    num(input.views), num(input.likes), num(input.comments), num(input.shares), num(input.saves),
    optStr(input.posted_at), str(input.source, "manual"), optStr(input.video_url),
    mediaType, slides, optStr(input.audio_url),
  );
  return postId;
}

export function upsertFormat(ws: string, input: Record<string, unknown>): string {
  const formatId = claimId(ws, "formats", optStr(input.id), "fmt");
  const structure = Array.isArray(input.structure) ? input.structure.map(String) : [];
  run(
    `INSERT INTO formats (id, workspace_id, niche_id, name, summary, structure, why_it_works, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET niche_id = excluded.niche_id, name = excluded.name, summary = excluded.summary,
       structure = excluded.structure, why_it_works = excluded.why_it_works, status = excluded.status`,
    formatId, ws, owned(ws, "niches", optStr(input.niche_id)), required(input.name, "name"), str(input.summary),
    JSON.stringify(structure), str(input.why_it_works), str(input.status, "watching"),
  );
  if (Array.isArray(input.example_urls)) {
    for (const url of input.example_urls) {
      run("UPDATE trending_posts SET format_id = ? WHERE workspace_id = ? AND url = ?", formatId, ws, String(url));
    }
  }
  return formatId;
}

export function setFormatStatus(ws: string, formatId: string, status: string) {
  if (!["watching", "testing", "winner", "retired"].includes(status)) throw new IngestError("Bad status");
  run("UPDATE formats SET status = ? WHERE id = ? AND workspace_id = ?", status, formatId, ws);
}

// ---------- Format lifecycle ----------
// Archive hides a format but keeps everything linked to it. Delete is only
// offered once archived, and unlinks (never deletes) its videos and ideas.
// Merge moves everything onto another format, then removes the duplicate.

function formatRow(ws: string, formatId: string) {
  const row = db().prepare("SELECT id, name, archived_at FROM formats WHERE id = ? AND workspace_id = ?").get(formatId, ws) as
    | { id: string; name: string; archived_at: string | null }
    | undefined;
  if (!row) throw new IngestError(`Format "${formatId}" not found`);
  return row;
}

export function archiveFormat(ws: string, formatId: string, archived = true) {
  formatRow(ws, formatId);
  run(
    "UPDATE formats SET archived_at = CASE WHEN ? THEN COALESCE(archived_at, datetime('now')) ELSE NULL END WHERE id = ? AND workspace_id = ?",
    archived ? 1 : 0, formatId, ws,
  );
}

function inTransaction(fn: () => void) {
  const conn = db();
  conn.exec("BEGIN");
  try {
    fn();
    conn.exec("COMMIT");
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
}

export function deleteFormat(ws: string, formatId: string) {
  const row = formatRow(ws, formatId);
  if (!row.archived_at) throw new IngestError("Archive the format first; only archived formats can be deleted.");
  inTransaction(() => {
    run("UPDATE trending_posts SET format_id = NULL WHERE format_id = ? AND workspace_id = ?", formatId, ws);
    run("UPDATE ideas SET format_id = NULL WHERE format_id = ? AND workspace_id = ?", formatId, ws);
    run("DELETE FROM formats WHERE id = ? AND workspace_id = ?", formatId, ws);
  });
}

export function mergeFormats(ws: string, fromId: string, intoId: string): { moved_videos: number; moved_ideas: number } {
  if (fromId === intoId) throw new IngestError("Pick a different format to merge into.");
  formatRow(ws, fromId);
  const into = formatRow(ws, intoId);
  if (into.archived_at) throw new IngestError(`"${into.name}" is archived. Restore it before merging into it.`);
  let moved = { moved_videos: 0, moved_ideas: 0 };
  inTransaction(() => {
    const videos = db().prepare("UPDATE trending_posts SET format_id = ? WHERE format_id = ? AND workspace_id = ?").run(intoId, fromId, ws);
    const ideas = db().prepare("UPDATE ideas SET format_id = ? WHERE format_id = ? AND workspace_id = ?").run(intoId, fromId, ws);
    run("DELETE FROM formats WHERE id = ? AND workspace_id = ?", fromId, ws);
    moved = { moved_videos: Number(videos.changes), moved_ideas: Number(ideas.changes) };
  });
  return moved;
}

function asStatus(v: unknown, fallback: IdeaStatus): IdeaStatus {
  return IDEA_STATUSES.includes(v as IdeaStatus) ? (v as IdeaStatus) : fallback;
}

// A bare day ("2026-10-12") is stored at noon UTC so it lands on the same
// calendar day in every timezone the app is used in.
function asDate(v: unknown): string | null {
  const raw = optStr(v);
  if (!raw) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00.000Z` : raw;
  if (Number.isNaN(Date.parse(iso))) throw new IngestError(`Bad date: ${raw}`);
  return new Date(iso).toISOString();
}

// The two dates on an idea:
// - scheduled_for: when it publishes. Only Ready/Scheduled ideas carry one.
// - planned_for: the date you're aiming for. Any stage can keep one.
// A publish date given to an idea that isn't Ready yet becomes its planned
// date, so dates are never silently dropped. Applied on every write path.
function settleDates(next: Record<string, unknown>, opts: { plannedGiven: boolean; previousScheduled: unknown }) {
  const status = asStatus(next.status, "idea");
  let scheduled = asDate(next.scheduled_for);
  let planned = asDate(next.planned_for);
  if (EARLY_STAGES.includes(status)) {
    if (scheduled && !opts.plannedGiven) planned = scheduled;
    scheduled = null;
  }
  const dateChanged = scheduled !== (asDate(opts.previousScheduled) ?? null);
  let nextStatus: string = status;
  if (status === "scheduled" && !scheduled) throw new IngestError("Pick a publish date to schedule it.");
  if (status === "ready" && scheduled && dateChanged) nextStatus = "scheduled";
  return { status: nextStatus, scheduled_for: scheduled, planned_for: planned };
}

export function upsertIdea(ws: string, input: Record<string, unknown>): string {
  const ideaId = claimId(ws, "ideas", optStr(input.id), "idea");
  const previous = db().prepare("SELECT scheduled_for FROM ideas WHERE id = ?").get(ideaId) as { scheduled_for: string | null } | undefined;
  const dates = settleDates(input, { plannedGiven: input.planned_for !== undefined, previousScheduled: previous?.scheduled_for });
  run(
    `INSERT INTO ideas (id, workspace_id, format_id, title, hook, script, notes, status, platform, scheduled_for, planned_for, created_by, source_post_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       format_id = excluded.format_id, title = excluded.title,
       hook = excluded.hook, script = excluded.script, notes = excluded.notes,
       status = excluded.status, platform = excluded.platform,
       scheduled_for = excluded.scheduled_for, planned_for = excluded.planned_for, source_post_id = excluded.source_post_id,
       updated_at = datetime('now')`,
    ideaId, ws, owned(ws, "formats", optStr(input.format_id)), required(input.title, "title"), str(input.hook),
    str(input.script), str(input.notes), dates.status, str(input.platform, "instagram"),
    dates.scheduled_for, dates.planned_for, str(input.created_by, "claude"),
    owned(ws, "trending_posts", optStr(input.source_post_id)),
  );
  return ideaId;
}

// "Save to Ideas" on a video: one idea per source video, pre-filled from it.
export function saveVideoAsIdea(ws: string, postId: string, createdBy = "user"): { id: string; created: boolean } {
  owned(ws, "trending_posts", postId);
  const existing = db()
    .prepare("SELECT id FROM ideas WHERE workspace_id = ? AND source_post_id = ?")
    .get(ws, postId) as { id: string } | undefined;
  if (existing) return { id: existing.id, created: false };

  const v = db()
    .prepare(
      `SELECT t.*, c.handle, c.followers, f.name AS format_name FROM trending_posts t
       LEFT JOIN creators c ON c.id = t.creator_id LEFT JOIN formats f ON f.id = t.format_id
       WHERE t.id = ?`,
    )
    .get(postId) as Record<string, string | number | null>;
  const hook = String(v.hook || "").trim();
  const handle = v.handle ? `@${v.handle}` : "a creator";
  const statsLine = [
    Number(v.views) > 0 && `${Number(v.views).toLocaleString()} views`,
    Number(v.likes) > 0 && `${Number(v.likes).toLocaleString()} likes`,
    Number(v.saves) > 0 && `${Number(v.saves).toLocaleString()} saves`,
    Number(v.comments) > 0 && `${Number(v.comments).toLocaleString()} comments`,
  ].filter(Boolean).join(" · ");
  const slideCount = (() => {
    try {
      return v.slides ? (JSON.parse(String(v.slides)) as unknown[]).length : 0;
    } catch {
      return 0;
    }
  })();
  const kind = slideCount > 0 ? (v.platform === "tiktok" ? `${slideCount}-slide slideshow` : `${slideCount}-slide carousel`) : "video";
  const notes = [
    slideCount > 0
      ? `REFERENCE ONLY: don't repost these slides. Recreate the format with your own copy and new images, slide for slide.`
      : `REFERENCE ONLY: don't repost this. Recreate the format with your own script and new media.`,
    `Reference ${kind} by ${handle}: ${v.url}`,
    statsLine && `Stats when saved: ${statsLine}${Number(v.followers) > 0 ? ` (account: ${Number(v.followers).toLocaleString()} followers)` : ""}`,
    v.format_name && `Format: ${v.format_name}`,
    hook && `Original hook: ${hook}`,
    v.caption && `Original caption: ${String(v.caption).slice(0, 500)}`,
    v.transcript && `Transcript: ${String(v.transcript).slice(0, 2000)}`,
  ].filter(Boolean).join("\n");

  const id = upsertIdea(ws, {
    title: hook ? `Recreate: ${hook.length > 70 ? `${hook.slice(0, 67)}…` : hook}` : `Recreate ${handle}'s format`,
    hook: "", // yours to write; the original is in the notes
    notes,
    format_id: v.format_id,
    platform: v.platform,
    status: "idea",
    created_by: createdBy,
    source_post_id: postId,
  });
  return { id, created: true };
}

// Scheduling rules: only finished (Ready) work gets a publish date. Earlier
// stages carry no date, and the Scheduled column always has one.
const EARLY_STAGES = ["idea", "scripting", "producing"];
export const NOT_READY_TO_SCHEDULE = "Only ideas in Ready can be scheduled. Finish it and move it to Ready first.";

// Merge-update: only the fields provided change. Date rules live in settleDates.
export function updateIdea(ws: string, ideaId: string, patch: Record<string, unknown>): string {
  const existing = db().prepare("SELECT * FROM ideas WHERE id = ? AND workspace_id = ?").get(ideaId, ws) as
    | Record<string, unknown>
    | undefined;
  if (!existing) throw new IngestError(`Idea "${ideaId}" not found`);
  const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  // Moving back to an earlier stage turns the publish date into the planned date,
  // unless a planned date was given explicitly.
  const plannedGiven = "planned_for" in defined;
  const next: Record<string, unknown> = { ...existing, ...defined, id: ideaId };
  const settled = settleDates(next, { plannedGiven: plannedGiven && !!next.planned_for, previousScheduled: existing.scheduled_for });
  return upsertIdea(ws, { ...next, ...settled, planned_for: settled.planned_for });
}

export function addAsset(ws: string, input: Record<string, unknown>): string {
  const assetId = id("as");
  run(
    "INSERT INTO assets (id, workspace_id, idea_id, kind, url, label, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
    assetId, ws, owned(ws, "ideas", optStr(input.idea_id)), required(input.kind, "kind"), required(input.url, "url"),
    str(input.label), str(input.created_by, "claude"),
  );
  return assetId;
}

// Kanban: persist a column's order (and move cards into it). ids are the
// column's full top-to-bottom order after the drop.
export function reorderColumn(ws: string, status: string, ids: string[]) {
  if (!IDEA_STATUSES.includes(status as IdeaStatus)) throw new IngestError("Bad status");
  const conn = db();
  conn.exec("BEGIN");
  try {
    ids.forEach((ideaId, i) => {
      owned(ws, "ideas", ideaId);
      const row = conn.prepare("SELECT status, scheduled_for FROM ideas WHERE id = ?").get(ideaId) as { status: string; scheduled_for: string | null };
      if (status === "scheduled" && !row.scheduled_for) {
        throw new IngestError("To schedule an idea, drag it from Ready onto a day in the calendar.");
      }
      if (status === "posted" && row.status !== "posted") {
        throw new IngestError("Use Mark posted (with the post's URL) so it can be tracked.");
      }
      // Moving back to an earlier stage keeps the publish date as the planned date.
      // (SQLite evaluates every SET expression against the row before the update.)
      conn
        .prepare(
          `UPDATE ideas SET status = ?, position = ?, updated_at = datetime('now'),
             planned_for = CASE WHEN ?3 AND scheduled_for IS NOT NULL THEN scheduled_for ELSE planned_for END,
             scheduled_for = CASE WHEN ?3 THEN NULL ELSE scheduled_for END
           WHERE id = ?4 AND workspace_id = ?5`,
        )
        .run(status, i, EARLY_STAGES.includes(status) ? 1 : 0, ideaId, ws);
    });
    conn.exec("COMMIT");
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
}

// Calendar: set or clear the date. Scheduling a ready idea marks it scheduled;
// unscheduling a scheduled one puts it back to ready.
export function scheduleIdea(ws: string, ideaId: string, when: string | null) {
  const idea = db().prepare("SELECT status FROM ideas WHERE id = ? AND workspace_id = ?").get(ideaId, ws) as
    | { status: string }
    | undefined;
  if (!idea) throw new IngestError(`Idea "${ideaId}" not found`);
  if (idea.status === "posted") throw new IngestError("It's already posted.");
  if (idea.status !== "ready" && idea.status !== "scheduled") throw new IngestError(NOT_READY_TO_SCHEDULE);
  if (when && Number.isNaN(Date.parse(when))) throw new IngestError("Bad date");
  const status = when && idea.status === "ready" ? "scheduled" : !when && idea.status === "scheduled" ? "ready" : idea.status;
  run(
    "UPDATE ideas SET scheduled_for = ?, status = ?, updated_at = datetime('now') WHERE id = ? AND workspace_id = ?",
    when ? new Date(when).toISOString() : null, status, ideaId, ws,
  );
}

// Calendar: set or clear the planned date. Any stage except Posted can have one.
export function planIdea(ws: string, ideaId: string, when: string | null) {
  const idea = db().prepare("SELECT status FROM ideas WHERE id = ? AND workspace_id = ?").get(ideaId, ws) as
    | { status: string }
    | undefined;
  if (!idea) throw new IngestError(`Idea "${ideaId}" not found`);
  if (idea.status === "posted") throw new IngestError("It's already posted.");
  run(
    "UPDATE ideas SET planned_for = ?, updated_at = datetime('now') WHERE id = ? AND workspace_id = ?",
    asDate(when), ideaId, ws,
  );
}

export function quickAddIdea(ws: string, title: string, status: string): string {
  if (!IDEA_STATUSES.includes(status as IdeaStatus) || status === "scheduled" || status === "posted") throw new IngestError("Bad status");
  const top = db().prepare("SELECT MIN(position) AS p FROM ideas WHERE workspace_id = ? AND status = ?").get(ws, status) as { p: number | null };
  const ideaId = upsertIdea(ws, { title: required(title, "title"), status, created_by: "user" });
  run("UPDATE ideas SET position = ? WHERE id = ?", (top.p ?? 0) - 1, ideaId);
  return ideaId;
}

// Uploaded files: the bytes live on disk (lib/uploads.ts); this is the row.
export function addUploadedAsset(
  ws: string,
  input: { id: string; ideaId: string | null; kind: "image" | "video"; mime: string; size: number; filename: string; createdBy: string },
): string {
  run(
    `INSERT INTO assets (id, workspace_id, idea_id, kind, url, label, created_by, mime, size, filename)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.id, ws, owned(ws, "ideas", input.ideaId), input.kind, `/api/uploads/${input.id}`,
    input.filename.replace(/\.[^.]+$/, "").slice(0, 120), input.createdBy, input.mime, input.size, input.filename.slice(0, 255),
  );
  return input.id;
}

export function attachAsset(ws: string, assetId: string, ideaId: string | null) {
  const row = db().prepare("SELECT workspace_id FROM assets WHERE id = ?").get(assetId) as { workspace_id: string } | undefined;
  if (!row || row.workspace_id !== ws) throw new IngestError("Asset not found");
  run("UPDATE assets SET idea_id = ? WHERE id = ? AND workspace_id = ?", owned(ws, "ideas", ideaId), assetId, ws);
}

export function deleteAssetRow(ws: string, assetId: string): { url: string } | null {
  const row = db().prepare("SELECT url FROM assets WHERE id = ? AND workspace_id = ?").get(assetId, ws) as { url: string } | undefined;
  if (!row) return null;
  run("DELETE FROM assets WHERE id = ? AND workspace_id = ?", assetId, ws);
  return row;
}

// Marks an idea as posted and starts tracking it.
export function recordPost(ws: string, input: Record<string, unknown>): string {
  const postId = claimId(ws, "posts", optStr(input.id), "post");
  const ideaId = owned(ws, "ideas", optStr(input.idea_id));
  run(
    `INSERT INTO posts (id, workspace_id, idea_id, platform, url, caption, thumbnail_url, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET url = excluded.url, caption = excluded.caption`,
    postId, ws, ideaId, required(input.platform, "platform"), str(input.url), str(input.caption),
    optStr(input.thumbnail_url), str(input.published_at, new Date().toISOString()),
  );
  if (ideaId) run("UPDATE ideas SET status = 'posted', updated_at = datetime('now') WHERE id = ?", ideaId);
  return postId;
}

export function recordMetrics(ws: string, input: Record<string, unknown>) {
  run(
    `INSERT OR REPLACE INTO post_metrics (post_id, captured_at, views, likes, comments, shares, saves, profile_visits, follows)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    owned(ws, "posts", required(input.post_id, "post_id")), str(input.captured_at, new Date().toISOString()),
    num(input.views), num(input.likes), num(input.comments), num(input.shares), num(input.saves),
    num(input.profile_visits), num(input.follows),
  );
}

export function createTrackedLink(ws: string, input: Record<string, unknown>): { slug: string; keyword: string | null } {
  const slug = required(input.slug, "slug").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const destination = required(input.destination, "destination");
  if (!slug || !URL.canParse(destination) || !/^https?:/.test(destination)) {
    throw new IngestError("A slug and a valid http(s) destination URL are required");
  }
  const taken = db().prepare("SELECT workspace_id FROM links WHERE slug = ?").get(slug) as { workspace_id: string } | undefined;
  if (taken && taken.workspace_id !== ws) throw new IngestError(`Slug "${slug}" is taken; pick another`);
  const postId = owned(ws, "posts", optStr(input.post_id));
  run(
    "INSERT OR REPLACE INTO links (slug, workspace_id, destination, label, post_id) VALUES (?, ?, ?, ?, ?)",
    slug, ws, destination, str(input.label), postId,
  );
  const keyword = optStr(input.keyword)?.toUpperCase() ?? null;
  if (keyword) {
    run("INSERT OR REPLACE INTO keywords (workspace_id, keyword, post_id, link_slug) VALUES (?, ?, ?, ?)", ws, keyword, postId, slug);
  }
  return { slug, keyword };
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
export function recordEvent(ws: string, e: EventInput): string {
  let postId = owned(ws, "posts", e.post_id ?? null);
  let linkSlug = e.link_slug ?? null;
  const conn = db();
  if (!postId && e.click_id) {
    const click = conn
      .prepare("SELECT post_id, link_slug FROM events WHERE workspace_id = ? AND click_id = ? AND type = 'link_click' LIMIT 1")
      .get(ws, e.click_id) as { post_id: string | null; link_slug: string | null } | undefined;
    postId = click?.post_id ?? null;
    linkSlug = linkSlug ?? click?.link_slug ?? null;
  }
  if (!postId && e.keyword) {
    const kw = conn
      .prepare("SELECT post_id FROM keywords WHERE workspace_id = ? AND keyword = ? COLLATE NOCASE")
      .get(ws, e.keyword) as { post_id: string | null } | undefined;
    postId = kw?.post_id ?? null;
  }
  if (!postId && linkSlug) {
    const link = conn.prepare("SELECT post_id FROM links WHERE workspace_id = ? AND slug = ?").get(ws, linkSlug) as
      | { post_id: string | null }
      | undefined;
    postId = link?.post_id ?? null;
  }
  const eventId = id("ev");
  run(
    `INSERT INTO events (id, workspace_id, type, post_id, link_slug, keyword, click_id, contact_ref, value_cents, source, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    eventId, ws, e.type, postId, linkSlug, e.keyword?.toUpperCase() ?? null, e.click_id ?? null,
    e.contact_ref ?? null, e.value_cents ?? 0, e.source, JSON.stringify(e.meta ?? {}), new Date().toISOString(),
  );
  return eventId;
}

// ---------- Metered provider usage ----------

// Returns false (and records nothing) once the workspace hits today's limit.
export function consumeQuota(ws: string, provider: string, limit: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const result = db()
    .prepare(
      `INSERT INTO usage (workspace_id, provider, day, calls) VALUES (?, ?, ?, 1)
       ON CONFLICT(workspace_id, provider, day) DO UPDATE SET calls = calls + 1 WHERE calls < ?`,
    )
    .run(ws, provider, day, limit);
  return Number(result.changes) > 0;
}

export function usageToday(ws: string, provider: string): number {
  const row = db()
    .prepare("SELECT calls FROM usage WHERE workspace_id = ? AND provider = ? AND day = ?")
    .get(ws, provider, new Date().toISOString().slice(0, 10)) as { calls: number } | undefined;
  return row?.calls ?? 0;
}
