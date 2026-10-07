import { authenticateApiRequest } from "@/lib/auth";
import {
  IngestError,
  addAsset,
  recordEvent,
  recordMetrics,
  recordPost,
  upsertCreator,
  upsertFormat,
  upsertIdea,
  upsertNiche,
  upsertTrendingPost,
  type EventInput,
} from "@/lib/ingest";

// POST /api/ingest/:kind with a JSON object or array of objects, authenticated
// with the workspace API key. Plain-HTTP equivalent of the MCP write tools,
// for scripts, cron jobs and automations that don't speak MCP.
const handlers: Record<string, (ws: string, item: Record<string, unknown>) => unknown> = {
  niches: upsertNiche,
  creators: upsertCreator,
  trending: upsertTrendingPost,
  formats: upsertFormat,
  ideas: upsertIdea,
  assets: addAsset,
  posts: recordPost,
  metrics: (ws, item) => (recordMetrics(ws, item), item.post_id),
  events: (ws, item) => recordEvent(ws, { ...(item as unknown as EventInput), source: "api" }),
};

export async function POST(req: Request, ctx: RouteContext<"/api/ingest/[kind]">) {
  const auth = authenticateApiRequest(req);
  if (auth instanceof Response) return auth;

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
    const ids = items.map((item) => handler(auth.workspaceId, item as Record<string, unknown>));
    return Response.json({ ok: true, ids });
  } catch (err) {
    if (err instanceof IngestError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
