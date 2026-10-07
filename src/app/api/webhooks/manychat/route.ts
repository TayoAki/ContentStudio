import { safeEqual } from "@/lib/auth";
import { recordEvent, type EventInput } from "@/lib/ingest";

// ManyChat "External Request" action. Add one to each step of the comment ->
// DM flow with a JSON body like:
//   { "event": "comment_keyword", "keyword": "BLAZER", "subscriber_id": "{{user_id}}" }
// and the header  x-contentstudio-secret: <MANYCHAT_WEBHOOK_SECRET>
const EVENTS: EventInput["type"][] = ["comment_keyword", "dm_sent", "link_click", "optin", "purchase"];

export async function POST(req: Request) {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "MANYCHAT_WEBHOOK_SECRET is not configured" }, { status: 503 });
  if (!safeEqual(req.headers.get("x-contentstudio-secret") ?? "", secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const type = body?.event as EventInput["type"];
  if (!body || !EVENTS.includes(type)) {
    return Response.json({ error: `"event" must be one of ${EVENTS.join(", ")}` }, { status: 400 });
  }
  const eventId = recordEvent({
    type,
    source: "manychat",
    keyword: typeof body.keyword === "string" ? body.keyword : null,
    post_id: typeof body.post_id === "string" ? body.post_id : null,
    contact_ref: body.subscriber_id != null ? String(body.subscriber_id) : null,
    value_cents: typeof body.value_cents === "number" ? body.value_cents : 0,
  });
  return Response.json({ ok: true, id: eventId });
}
