import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { claudeBrief } from "@/lib/brief";
import {
  IngestError,
  addAsset,
  createTrackedLink,
  recordEvent,
  recordMetrics,
  recordPost,
  updateIdea,
  upsertCreator,
  upsertFormat,
  upsertIdea,
  upsertNiche,
  upsertTrendingPost,
  usageToday,
  saveVideoAsIdea,
  type EventInput,
  archiveFormat,
  mergeFormats,
} from "@/lib/ingest";
import { db } from "@/lib/db";
import { searchReels, syncCreators } from "@/lib/discovery";
import { SC_DAILY_LIMIT } from "@/lib/integrations/scrapecreators";
import {
  IDEA_STATUSES,
  getFormat,
  getIdea,
  getPostMetricsSeries,
  getTotals,
  listAssets,
  listCreators,
  listFormatPerformance,
  listFormats,
  listIdeas,
  listKeywords,
  listLinks,
  listNiches,
  listPostsWithFunnel,
  listRecentEvents,
  listTrendingPosts,
  groupByCategory,
  listTrendAccounts,
} from "@/lib/queries";

// The ContentStudio MCP server: every step of discover -> recreate -> track
// exposed as tools so Claude can run the whole loop and the app is the
// shared record of what it did.

const PLATFORM = z.enum(["instagram", "tiktok"]);
const STATUS = z.enum(IDEA_STATUSES);
const FORMAT_STATUS = z.enum(["watching", "testing", "winner", "retired"]);
const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

// Every tool returns JSON text; validation errors come back as tool errors
// Claude can read and correct rather than as transport failures.
function handle<A>(fn: (args: A) => unknown) {
  return async (args: A): Promise<ToolResult> => {
    try {
      const result = await fn(args);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      if (err instanceof IngestError || err instanceof z.ZodError) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
      }
      throw err;
    }
  };
}

const creatorShape = {
  platform: PLATFORM,
  handle: z.string().describe("Without the @"),
  display_name: z.string().optional(),
  niche_id: z.string().optional(),
  followers: z.number().int().optional(),
  followers_30d_ago: z.number().int().optional().describe("Follower count ~30 days ago; drives the breakout score"),
  first_post_at: z.string().optional().describe("ISO date of the account's first post (account age)"),
  source: z.string().optional().describe("virlo | scrapecreators | manual"),
  category: z.string().optional().describe('Trend type this account belongs to, e.g. "AI models", "Colour & outfit guides". Accounts are grouped by it in Discover.'),
  sells: z.string().optional().describe('What the account monetises, e.g. "Own clothing brand", "Digital style guide (Gumroad)", "Affiliate links (ShopMy)"'),
  sells_url: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
};

const trendingShape = {
  url: z.string().url(),
  platform: PLATFORM,
  niche_id: z.string().optional(),
  format_id: z.string().optional().describe("Set once you've classified the post into a format"),
  hook: z.string().optional().describe("The first line / on-screen text that stops the scroll"),
  caption: z.string().optional(),
  transcript: z.string().optional(),
  thumbnail_url: z.string().optional(),
  video_url: z.string().optional().describe("Direct video file URL (platform CDN); enables inline playback in Discover"),
  media_type: z.enum(["video", "carousel", "photo"]).optional().describe("carousel = Instagram carousel or TikTok photo slideshow"),
  slides: z
    .array(z.union([z.string(), z.object({ image: z.string(), video: z.string().optional() })]))
    .optional()
    .describe("Every slide of a carousel/slideshow, in order: image URLs, or {image, video} for video slides. Shown as a swipeable slideshow in Discover"),
  audio_url: z.string().optional().describe("A TikTok slideshow's music track"),
  views: z.number().int().optional(),
  likes: z.number().int().optional(),
  comments: z.number().int().optional(),
  shares: z.number().int().optional(),
  saves: z.number().int().optional(),
  posted_at: z.string().optional(),
  source: z.string().optional().describe("virlo | scrapecreators | manual"),
  creator: z.object(creatorShape).optional().describe("Creator is upserted and linked automatically"),
};

const ideaShape = {
  title: z.string(),
  format_id: z.string().optional(),
  hook: z.string().optional(),
  script: z.string().optional().describe("Beat-by-beat script"),
  notes: z.string().optional().describe("Research notes / references"),
  status: STATUS.optional(),
  platform: PLATFORM.optional(),
  scheduled_for: z.string().optional().describe("Publish date (ISO datetime). Only Ready/Scheduled ideas keep one; on an earlier stage it is saved as planned_for instead"),
  planned_for: z.string().optional().describe("Target date (YYYY-MM-DD) for when this should be ready to post. Any stage can keep one; shown as a planned chip on the calendar"),
};

export function createMcpServer(ws: string): McpServer {
  const server = new McpServer(
    { name: "contentstudio", version: "0.1.0" },
    {
      instructions: `ContentStudio finds replicable short-form formats, stores the content made from them, and tracks each post to revenue.
Workflow: (1) Discover - search_instagram_reels / sync_creators (Scrape Creators) or add_trending_posts (e.g. from Virlo), then cluster posts into formats with save_format; breakout creators are young accounts with fast 30-day growth. (2) Recreate - get_format_brief, write scripts with save_ideas, attach generated media with add_assets, set target dates with planned_for at any stage, and schedule Ready ideas via update_idea(scheduled_for). (3) Track - mark_posted, create_tracked_link (+ ManyChat keyword), record_metrics, then get_performance / get_format_performance to see which formats convert and feed that back into Discover.
Prefer educational, save-worthy formats. Always record what you produce in ContentStudio rather than only in chat.`,
    },
  );

  // ---------------- Discover ----------------

  server.registerTool(
    "list_niches",
    { title: "List niches", description: "Niches being researched, with their search keywords.", annotations: { readOnlyHint: true } },
    handle(() => listNiches(ws)),
  );

  server.registerTool(
    "save_niche",
    {
      title: "Create or update a niche",
      description: "Add a niche to research (e.g. 'Men's fashion'). Returns its id.",
      inputSchema: { name: z.string(), keywords: z.string().optional().describe("Comma-separated search keywords"), id: z.string().optional() },
    },
    handle((args) => ({ id: upsertNiche(ws, args) })),
  );

  server.registerTool(
    "get_discover_overview",
    {
      title: "Discover overview",
      description: "Formats (with example count, views, save rate, status), breakout creators, and top outlier posts for a niche. Archived formats are left out unless include_archived is set.",
      inputSchema: { niche_id: z.string(), limit: z.number().int().min(1).max(50).optional(), include_archived: z.boolean().optional() },
      annotations: { readOnlyHint: true },
    },
    handle(({ niche_id, limit = 10, include_archived }: { niche_id: string; limit?: number; include_archived?: boolean }) => ({
      formats: listFormats(ws, niche_id, { archived: include_archived ? "all" : "exclude" }),
      breakout_creators: listCreators(ws, niche_id)
        .filter((c) => c.account_age_days < 180 && c.growth_30d > 0.5)
        .slice(0, limit),
      top_posts: listTrendingPosts(ws, { nicheId: niche_id }).slice(0, limit),
    })),
  );

  server.registerTool(
    "list_trending_posts",
    {
      title: "List trending posts",
      description: "Trending posts sorted by reach multiple (views / creator followers). Filter by niche, format or media_type; set unclassified_only to find posts still needing a format. Carousels and TikTok slideshows include every slide's image URL in `slides`, so you can read the slides to recreate them.",
      inputSchema: {
        niche_id: z.string().optional(),
        format_id: z.string().optional(),
        media_type: z.enum(["video", "carousel", "photo"]).optional(),
        unclassified_only: z.boolean().optional(),
        limit: z.number().int().min(1).max(200).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    handle(({ niche_id, format_id, media_type, unclassified_only, limit = 25 }: { niche_id?: string; format_id?: string; media_type?: string; unclassified_only?: boolean; limit?: number }) =>
      listTrendingPosts(ws, { nicheId: niche_id, formatId: format_id })
        .filter((p) => !unclassified_only || !p.format_id)
        .filter((p) => !media_type || p.media_type === media_type)
        .slice(0, limit),
    ),
  );

  server.registerTool(
    "add_trending_posts",
    {
      title: "Add trending posts",
      description: "Store trending videos found via Virlo, Scrape Creators or browsing. Upserts by URL (re-sending updates the stats).",
      inputSchema: { posts: z.array(z.object(trendingShape)).min(1) },
    },
    handle(({ posts }: { posts: Record<string, unknown>[] }) => ({ ids: posts.map((x) => upsertTrendingPost(ws, x)) })),
  );

  server.registerTool(
    "save_creators",
    {
      title: "Add or update creators",
      description: "Upsert creator accounts (by platform + handle). Use this to label each account's trend type (category) and what it sells after researching it.",
      inputSchema: { creators: z.array(z.object(creatorShape)).min(1) },
    },
    handle(({ creators }: { creators: Record<string, unknown>[] }) => ({ ids: creators.map((x) => upsertCreator(ws, x)) })),
  );

  server.registerTool(
    "list_trend_accounts",
    {
      title: "List trend accounts",
      description: "Accounts in a niche grouped by trend type, each with followers, account age, 30-day growth, what it sells, and its top videos (views, saves, hooks). This is the main Discover view.",
      inputSchema: { niche_id: z.string(), videos_per_account: z.number().int().min(1).max(12).optional() },
      annotations: { readOnlyHint: true },
    },
    handle(({ niche_id, videos_per_account = 4 }: { niche_id: string; videos_per_account?: number }) =>
      groupByCategory(listTrendAccounts(ws, niche_id, videos_per_account)).map(([category, accounts]) => ({
        category,
        accounts: accounts.map((a) => ({
          id: a.id, handle: a.handle, platform: a.platform, followers: a.followers, account_age_days: a.account_age_days,
          growth_30d: a.growth_30d, sells: a.sells, sells_url: a.sells_url, bio: a.bio, total_views: a.total_views,
          top_videos: a.top_videos.map((v) => ({ url: v.url, hook: v.hook, views: v.views, saves: v.saves, format: v.format_name })),
        })),
      })),
    ),
  );

  server.registerTool(
    "list_creators",
    {
      title: "List creators",
      description: "Creators in a niche ranked by 30-day follower growth, with account age and their top format.",
      inputSchema: { niche_id: z.string().optional() },
      annotations: { readOnlyHint: true },
    },
    handle(({ niche_id }: { niche_id?: string }) => listCreators(ws, niche_id)),
  );

  server.registerTool(
    "sync_creators",
    {
      title: "Sync creators from Scrape Creators",
      description: `Pull a creator's profile and recent posts (TikTok or Instagram) and store them as trending posts, so their outliers and growth show up in Discover. Metered: ${SC_DAILY_LIMIT} Scrape Creators requests per workspace per day (1 per handle).`,
      inputSchema: { platform: PLATFORM, handles: z.array(z.string()).min(1).max(20), niche_id: z.string().optional() },
      annotations: { openWorldHint: true },
    },
    handle(({ platform, handles, niche_id }: { platform: "tiktok" | "instagram"; handles: string[]; niche_id?: string }) =>
      syncCreators(ws, platform, handles, niche_id),
    ),
  );

  server.registerTool(
    "search_instagram_reels",
    {
      title: "Search Instagram Reels",
      description: `Keyword search across Instagram Reels (e.g. "mens style tips"). Results are stored as trending posts and the creator handles are returned so you can sync_creators the promising ones for follower counts. Metered: 1 request.`,
      inputSchema: { query: z.string().min(2), niche_id: z.string().optional() },
      annotations: { openWorldHint: true },
    },
    handle(({ query, niche_id }: { query: string; niche_id?: string }) => searchReels(ws, query, niche_id)),
  );

  server.registerTool(
    "get_usage",
    {
      title: "Scrape Creators usage",
      description: "Scrape Creators requests used today by this workspace and the daily limit.",
      annotations: { readOnlyHint: true },
    },
    handle(() => ({ used_today: usageToday(ws, "scrapecreators"), daily_limit: SC_DAILY_LIMIT })),
  );

  server.registerTool(
    "save_format",
    {
      title: "Create or update a format",
      description: "Define a replicable content format (the pattern behind several trending posts) and link example posts to it by URL. Pass id to update, including changing status (watching -> testing -> winner).",
      inputSchema: {
        id: z.string().optional(),
        name: z.string(),
        niche_id: z.string().optional(),
        summary: z.string().optional(),
        structure: z.array(z.string()).optional().describe("Ordered beats, e.g. '0-2s: hook text on screen'"),
        why_it_works: z.string().optional(),
        status: FORMAT_STATUS.optional(),
        example_urls: z.array(z.string()).optional().describe("Trending post URLs that use this format"),
      },
    },
    handle((args: Record<string, unknown>) => {
      const existing = typeof args.id === "string" ? getFormat(ws, args.id) : undefined;
      return { id: upsertFormat(ws, { ...existing, ...Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined)) }) };
    }),
  );

  server.registerTool(
    "get_format_brief",
    {
      title: "Get a format brief",
      description: "Everything needed to recreate a format: structure, why it works, and the top examples with hooks/captions/transcripts.",
      inputSchema: { format_id: z.string() },
      annotations: { readOnlyHint: true },
    },
    handle(({ format_id }: { format_id: string }) => {
      const format = getFormat(ws, format_id);
      if (!format) throw new IngestError(`Format "${format_id}" not found`);
      return { format, brief: claudeBrief(format, listTrendingPosts(ws, { formatId: format_id }), appUrl()) };
    }),
  );

  // No hard delete over MCP: Claude can tidy up (archive, merge duplicates) but
  // permanent deletion stays a deliberate step in the app.
  server.registerTool(
    "archive_format",
    {
      title: "Archive or restore a format",
      description: "Hide a format that's clutter (a duplicate, a mistake, no longer relevant) while keeping its videos, ideas and stats. Pass restore: true to bring it back. For a format that was tested and failed, set status 'retired' with save_format instead, so it stays visible as a lesson. Duplicates are better merged with merge_formats.",
      inputSchema: { format_id: z.string(), restore: z.boolean().optional() },
    },
    handle(({ format_id, restore }: { format_id: string; restore?: boolean }) => {
      archiveFormat(ws, format_id, !restore);
      return { id: format_id, archived: !restore };
    }),
  );

  server.registerTool(
    "merge_formats",
    {
      title: "Merge duplicate formats",
      description: "Move every example video and idea from one format onto another, then remove the duplicate. Use when two formats describe the same pattern. The target must not be archived.",
      inputSchema: {
        from_format_id: z.string().describe("The duplicate, removed after the merge"),
        into_format_id: z.string().describe("The format to keep"),
      },
    },
    handle(({ from_format_id, into_format_id }: { from_format_id: string; into_format_id: string }) => ({
      into: into_format_id,
      ...mergeFormats(ws, from_format_id, into_format_id),
    })),
  );

  // ---------------- Recreate ----------------

  server.registerTool(
    "list_ideas",
    {
      title: "List ideas",
      description: "The content pipeline (idea -> scripting -> producing -> ready -> scheduled -> posted).",
      inputSchema: { status: STATUS.optional(), format_id: z.string().optional() },
      annotations: { readOnlyHint: true },
    },
    handle(({ status, format_id }: { status?: string; format_id?: string }) =>
      listIdeas(ws).filter((i) => (!status || i.status === status) && (!format_id || i.format_id === format_id)),
    ),
  );

  server.registerTool(
    "get_idea",
    {
      title: "Get an idea",
      description: "One idea with its full script and attached assets.",
      inputSchema: { idea_id: z.string() },
      annotations: { readOnlyHint: true },
    },
    handle(({ idea_id }: { idea_id: string }) => {
      const idea = getIdea(ws, idea_id);
      if (!idea) throw new IngestError(`Idea "${idea_id}" not found`);
      return { ...idea, assets: listAssets(ws, idea_id) };
    }),
  );

  server.registerTool(
    "save_ideas",
    {
      title: "Save new ideas / scripts",
      description: "Add one or more ideas (usually scripts written from a format brief). They appear on the Recreate board marked as from Claude.",
      inputSchema: { ideas: z.array(z.object(ideaShape)).min(1) },
    },
    handle(({ ideas }: { ideas: Record<string, unknown>[] }) => ({
      ids: ideas.map((i) => upsertIdea(ws, { status: "scripting", ...i, created_by: "claude" })),
    })),
  );

  server.registerTool(
    "save_videos_to_ideas",
    {
      title: "Save videos to the ideas pipeline",
      description: "Save trending videos to replicate as ideas (one idea per video). The video becomes the idea's REFERENCE: the idea is titled \"Recreate: …\", its hook is left empty, and the original hook, caption, stats and link go in the notes. Write a new script and generate new media for it; never repost the original. Pass trending post ids or URLs; saving the same video twice returns the existing idea.",
      inputSchema: {
        post_ids: z.array(z.string()).optional(),
        urls: z.array(z.string()).optional().describe("URLs of videos already stored as trending posts"),
      },
    },
    handle(({ post_ids = [], urls = [] }: { post_ids?: string[]; urls?: string[] }) => {
      const byUrl = urls.map((url) => {
        const row = db().prepare("SELECT id FROM trending_posts WHERE workspace_id = ? AND url = ?").get(ws, url) as { id: string } | undefined;
        if (!row) throw new IngestError(`No stored video with url ${url}; add it with add_trending_posts first`);
        return row.id;
      });
      return [...post_ids, ...byUrl].map((id) => ({ post_id: id, ...saveVideoAsIdea(ws, id, "claude") }));
    }),
  );

  server.registerTool(
    "update_idea",
    {
      title: "Update an idea",
      description: "Change any fields on an idea: rewrite the script, move its status, set a planned date (planned_for, any stage) or schedule it (scheduled_for). Only fields you pass change. Only ideas in Ready can get a publish date (setting one moves Ready to Scheduled); a scheduled_for sent for an earlier stage is kept as its planned_for, and moving an idea back to idea/scripting/producing turns its publish date into its planned date.",
      inputSchema: { idea_id: z.string(), ...Object.fromEntries(Object.entries(ideaShape).map(([k, v]) => [k, v.optional()])) },
    },
    handle(({ idea_id, ...patch }: { idea_id: string } & Record<string, unknown>) => ({ id: updateIdea(ws, idea_id, patch) })),
  );

  server.registerTool(
    "add_assets",
    {
      title: "Attach generated assets",
      description: "Register images, videos, carousels or captions you generated, linked to an idea, by URL. To upload a local file instead, PUT its bytes to <app>/api/uploads?filename=<name>&idea_id=<idea> with Content-Type set and Authorization: Bearer <workspace API key>; it is stored and attached in one step.",
      inputSchema: {
        assets: z
          .array(
            z.object({
              idea_id: z.string(),
              kind: z.enum(["image", "video", "carousel", "caption", "script"]),
              url: z.string(),
              label: z.string().optional(),
            }),
          )
          .min(1),
      },
    },
    handle(({ assets }: { assets: Record<string, unknown>[] }) => ({ ids: assets.map((a) => addAsset(ws, { ...a, created_by: "claude" })) })),
  );

  server.registerTool(
    "get_calendar",
    {
      title: "Content calendar",
      description: "Scheduled and posted ideas between two dates (defaults: today through +30 days), ideas still in progress that have a planned date in that range, and unscheduled ideas.",
      inputSchema: { from: z.string().optional(), to: z.string().optional() },
      annotations: { readOnlyHint: true },
    },
    handle(({ from, to }: { from?: string; to?: string }) => {
      const start = from ? new Date(from) : new Date(new Date().toDateString());
      const end = to ? new Date(to) : new Date(start.getTime() + 30 * 86_400_000);
      const ideas = listIdeas(ws);
      return {
        scheduled: ideas
          .filter((i) => i.scheduled_for && new Date(i.scheduled_for) >= start && new Date(i.scheduled_for) <= end)
          .map(({ id, title, status, platform, scheduled_for, format_name }) => ({ id, title, status, platform, scheduled_for, format_name })),
        planned: ideas
          .filter((i) => !i.scheduled_for && i.planned_for && i.status !== "posted" && new Date(i.planned_for) >= start && new Date(i.planned_for) <= end)
          .map(({ id, title, status, platform, planned_for, format_name }) => ({ id, title, status, platform, planned_for, format_name })),
        unscheduled: ideas
          .filter((i) => !i.scheduled_for && i.status !== "posted")
          .map(({ id, title, status, planned_for, format_name }) => ({ id, title, status, planned_for, format_name })),
      };
    }),
  );

  // ---------------- Track ----------------

  server.registerTool(
    "mark_posted",
    {
      title: "Mark an idea as posted",
      description: "Record that an idea was published so it starts being tracked. Returns the post_id used by metrics, links and events.",
      inputSchema: {
        idea_id: z.string(),
        url: z.string().optional(),
        platform: PLATFORM.optional(),
        published_at: z.string().optional(),
      },
    },
    handle(({ idea_id, url, platform, published_at }: { idea_id: string; url?: string; platform?: string; published_at?: string }) => {
      const idea = getIdea(ws, idea_id);
      if (!idea) throw new IngestError(`Idea "${idea_id}" not found`);
      return { post_id: recordPost(ws, { idea_id, url, caption: idea.title, platform: platform ?? idea.platform, published_at }) };
    }),
  );

  server.registerTool(
    "record_metrics",
    {
      title: "Record post metrics",
      description: "Snapshot a post's stats (from Instagram Insights, TikTok analytics, etc.). Send periodically; the latest snapshot is used.",
      inputSchema: {
        metrics: z
          .array(
            z.object({
              post_id: z.string(),
              captured_at: z.string().optional(),
              views: z.number().int().optional(),
              likes: z.number().int().optional(),
              comments: z.number().int().optional(),
              shares: z.number().int().optional(),
              saves: z.number().int().optional(),
              profile_visits: z.number().int().optional(),
              follows: z.number().int().optional(),
            }),
          )
          .min(1),
      },
    },
    handle(({ metrics }: { metrics: Record<string, unknown>[] }) => {
      metrics.forEach((x) => recordMetrics(ws, x));
      return { recorded: metrics.length };
    }),
  );

  server.registerTool(
    "create_tracked_link",
    {
      title: "Create a tracked link",
      description: `Create ${appUrl()}/l/<slug>, which logs clicks and forwards a cs_cid click id to checkout. Optionally register a ManyChat comment keyword for the same post. Omit post_id for the link-in-bio.`,
      inputSchema: {
        slug: z.string(),
        destination: z.string().url(),
        post_id: z.string().optional(),
        keyword: z.string().optional().describe("ManyChat comment keyword, e.g. BLAZER"),
        label: z.string().optional(),
      },
    },
    handle((args: Record<string, unknown>) => {
      const { slug, keyword } = createTrackedLink(ws, args);
      return { url: `${appUrl()}/l/${slug}`, keyword };
    }),
  );

  server.registerTool(
    "record_events",
    {
      title: "Record funnel events",
      description: "Log funnel events manually (comment_keyword, dm_sent, link_click, optin, purchase). Attribution falls back from post_id -> click_id -> keyword -> link_slug. ManyChat and Stripe normally send these via webhooks.",
      inputSchema: {
        events: z
          .array(
            z.object({
              type: z.enum(["comment_keyword", "dm_sent", "link_click", "optin", "purchase"]),
              post_id: z.string().optional(),
              keyword: z.string().optional(),
              link_slug: z.string().optional(),
              click_id: z.string().optional(),
              contact_ref: z.string().optional(),
              value_cents: z.number().int().optional(),
            }),
          )
          .min(1),
      },
    },
    handle(({ events }: { events: Record<string, unknown>[] }) => ({
      ids: events.map((e) => recordEvent(ws, { ...(e as unknown as EventInput), source: "manual" })),
    })),
  );

  server.registerTool(
    "get_performance",
    {
      title: "Content performance",
      description: "Per-post funnel (views, saves, follows, keyword comments, DMs, clicks, opt-ins, purchases, revenue) plus account totals. Pass post_id for one post with its views-over-time series.",
      inputSchema: { post_id: z.string().optional() },
      annotations: { readOnlyHint: true },
    },
    handle(({ post_id }: { post_id?: string }) => {
      const posts = listPostsWithFunnel(ws);
      if (post_id) {
        const post = posts.find((p) => p.id === post_id);
        if (!post) throw new IngestError(`Post "${post_id}" not found`);
        return { ...post, series: getPostMetricsSeries(ws, post_id) };
      }
      return { totals: getTotals(ws), posts };
    }),
  );

  server.registerTool(
    "get_format_performance",
    {
      title: "Performance by format",
      description: "Views, saves, follows, clicks, purchases and revenue rolled up per format, sorted by revenue. Use this to decide which formats to make more of.",
      annotations: { readOnlyHint: true },
    },
    handle(() => listFormatPerformance(ws)),
  );

  server.registerTool(
    "list_links_and_keywords",
    {
      title: "Tracked links and keywords",
      description: "All tracked links with clicks/sales/revenue, ManyChat keywords with comment counts, and the latest funnel events.",
      annotations: { readOnlyHint: true },
    },
    handle(() => ({ links: listLinks(ws), keywords: listKeywords(ws), recent_events: listRecentEvents(ws, 25) })),
  );

  // ---------------- Prompts (slash commands in Claude Code) ----------------

  server.registerPrompt(
    "find_and_recreate",
    {
      title: "Find a winning format and recreate it",
      description: "Run the full discover -> recreate loop for a niche.",
      argsSchema: { niche: z.string().describe("Niche name or id, e.g. 'mens fashion'"), count: z.string().optional() },
    },
    ({ niche, count }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Run the ContentStudio loop for the "${niche}" niche:
1. list_niches; create it with save_niche if missing.
2. Find what's trending: search_instagram_reels with the niche keywords, then sync_creators for the most promising handles (TikTok and Instagram); use the Virlo tools too if available. Store everything with add_trending_posts (include creator follower counts and 30-day growth).
3. Review list_trend_accounts. Label every account with a trend type (e.g. "AI models", "Colour & outfit guides") and what it sells via save_creators. Favour accounts that are new and grew fast, and educational, save-worthy videos.
4. Cluster the outlier videos into replicable formats with save_format (structure as timed beats, why_it_works, example_urls).
5. Check get_format_performance so formats that already converted for us get priority.
6. Save the specific videos worth replicating with save_videos_to_ideas.
7. Pick the strongest format, call get_format_brief, and write ${count ?? "5"} scripts: fill in the saved ideas with update_idea, or add new ones with save_ideas.
8. Schedule them on open days with update_idea(scheduled_for) using get_calendar.
Summarise what you found and what you queued.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "performance_review",
    {
      title: "Weekly performance review",
      description: "Review what converted and feed it back into the plan.",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Review ContentStudio performance: call get_performance and get_format_performance. Identify which posts and formats drove follows, clicks and revenue (not just views), where the funnel leaks (comment -> DM -> click -> opt-in -> purchase), and whether any format should move to winner or retired via save_format. Then propose next week's ideas with save_ideas.`,
          },
        },
      ],
    }),
  );

  return server;
}

