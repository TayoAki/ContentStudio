import { createHmac } from "node:crypto";
import { safeEqual } from "@/lib/auth";
import { db } from "@/lib/db";
import { IngestError, recordEvent } from "@/lib/ingest";

// Stripe -> purchase events, one endpoint per workspace, verified with that
// workspace's signing secret (Settings). Pass the click id from /l/:slug into
// Checkout as client_reference_id (or metadata.cs_cid) so revenue maps back
// to the post.
const TOLERANCE_SECONDS = 300;

function verify(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > TOLERANCE_SECONDS) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return header
    .split(",")
    .filter((kv) => kv.startsWith("v1="))
    .some((kv) => safeEqual(kv.slice(3), expected));
}

export async function POST(req: Request, ctx: RouteContext<"/api/webhooks/stripe/[workspace]">) {
  const { workspace } = await ctx.params;
  const row = db().prepare("SELECT stripe_webhook_secret FROM workspaces WHERE id = ?").get(workspace) as
    | { stripe_webhook_secret: string | null }
    | undefined;
  if (!row?.stripe_webhook_secret) {
    return Response.json({ error: "Stripe is not configured for this workspace" }, { status: 404 });
  }

  const payload = await req.text();
  if (!verify(payload, req.headers.get("stripe-signature") ?? "", row.stripe_webhook_secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      amount_total?: number;
      client_reference_id?: string | null;
      metadata?: Record<string, string>;
      customer_details?: { email?: string };
    };
    const base = {
      type: "purchase" as const,
      source: "stripe",
      click_id: session.metadata?.cs_cid ?? session.client_reference_id ?? null,
      contact_ref: session.customer_details?.email ?? null,
      value_cents: session.amount_total ?? 0,
      meta: { checkout_session: session.id },
    };
    try {
      recordEvent(workspace, { ...base, post_id: session.metadata?.cs_post_id ?? null });
    } catch (err) {
      // An unknown cs_post_id shouldn't lose the sale; fall back to click attribution.
      if (!(err instanceof IngestError)) throw err;
      recordEvent(workspace, base);
    }
  }
  return Response.json({ received: true });
}
