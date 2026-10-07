import { checkApiKey } from "@/lib/auth";
import {
  IngestError,
  addAsset,
  recordEvent,
  recordMetrics,
  recordPost,
  upsertCreator,
  upsertFormat,
  upsertIdea,
  upsertTrendingPost,
  type EventInput,
} from "@/lib/ingest";

// POST /api/ingest/:kind with a JSON object or array of objects.
// This is the bridge for Claude Code (and Virlo / Scrape Creators jobs) to
// push research, formats, scripts, generated assets and stats into the app.
const handlers: Record<string, (item: Record<string, unknown>) => unknown> = {
  creators: upsertCreator,
  trending: upsertTrendingPost,
  formats: upsertFormat,
  ideas: upsertIdea,
  assets: addAsset,
  posts: recordPost,
  metrics: (item) => (recordMetrics(item), item.post_id),
  events: (item) => recordEvent(item as unknown as EventInput),
};

export async function POST(req: Request, ctx: RouteContext<"/api/ingest/[kind]">) {
  const denied = checkApiKey(req);
  if (denied) return denied;

  const { kind } = await ctx.params;
  const handler = handlers[kind];
  if (!handler) {
    return Response.json({ error: `Unknown kind "${kind}"`, kinds: Object.keys(handlers) }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const items = Array.isArray(body) ? body : [body];
  try {
    const ids = items.map((item) => handler(item as Record<string, unknown>));
    return Response.json({ ok: true, ids });
  } catch (err) {
    if (err instanceof IngestError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
