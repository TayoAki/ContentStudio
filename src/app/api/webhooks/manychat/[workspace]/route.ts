import { safeEqual } from "@/lib/auth";
import { db } from "@/lib/db";
import { IngestError, recordEvent, type EventInput } from "@/lib/ingest";

// ManyChat "External Request" action. Add one to each step of the comment ->
// DM flow, POSTing to this workspace's URL (Settings) with a JSON body like:
//   { "event": "comment_keyword", "keyword": "BLAZER", "subscriber_id": "{{user_id}}" }
// and the header  x-contentstudio-secret: <workspace ManyChat secret>
const EVENTS: EventInput["type"][] = ["comment_keyword", "dm_sent", "link_click", "optin", "purchase"];

export async function POST(req: Request, ctx: RouteContext<"/api/webhooks/manychat/[workspace]">) {
  const { workspace } = await ctx.params;
  const row = db().prepare("SELECT manychat_secret FROM workspaces WHERE id = ?").get(workspace) as
    | { manychat_secret: string }
    | undefined;
  if (!row || !safeEqual(req.headers.get("x-contentstudio-secret") ?? "", row.manychat_secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const type = body?.event as EventInput["type"];
  if (!body || !EVENTS.includes(type)) {
    return Response.json({ error: `"event" must be one of ${EVENTS.join(", ")}` }, { status: 400 });
  }
  try {
    const eventId = recordEvent(workspace, {
      type,
      source: "manychat",
      keyword: typeof body.keyword === "string" ? body.keyword : null,
      post_id: typeof body.post_id === "string" ? body.post_id : null,
      contact_ref: body.subscriber_id != null ? String(body.subscriber_id) : null,
      value_cents: typeof body.value_cents === "number" ? body.value_cents : 0,
    });
    return Response.json({ ok: true, id: eventId });
  } catch (err) {
    if (err instanceof IngestError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
