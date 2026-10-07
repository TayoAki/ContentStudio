import { createHmac } from "node:crypto";
import { safeEqual } from "@/lib/auth";
import { recordEvent } from "@/lib/ingest";

// Stripe -> purchase events. Pass the click id from /l/:slug into Checkout as
// client_reference_id (or metadata.cs_cid) so revenue maps back to the post.
const TOLERANCE_SECONDS = 300;

function verify(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > TOLERANCE_SECONDS) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return header
    .split(",")
    .filter((kv) => kv.startsWith("v1="))
    .some((kv) => safeEqual(kv.slice(3), expected));
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 503 });

  const payload = await req.text();
  if (!verify(payload, req.headers.get("stripe-signature") ?? "", secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data: { object: Record<string, unknown> };
  };
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      amount_total?: number;
      client_reference_id?: string | null;
      metadata?: Record<string, string>;
      customer_details?: { email?: string };
    };
    recordEvent({
      type: "purchase",
      source: "stripe",
      click_id: session.metadata?.cs_cid ?? session.client_reference_id ?? null,
      post_id: session.metadata?.cs_post_id ?? null,
      contact_ref: session.customer_details?.email ?? null,
      value_cents: session.amount_total ?? 0,
      meta: { checkout_session: session.id },
    });
  }
  return Response.json({ received: true });
}
