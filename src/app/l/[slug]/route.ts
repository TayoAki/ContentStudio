import { db, id } from "@/lib/db";
import { recordEvent } from "@/lib/ingest";

// Tracked short link: log the click, then redirect with a click id that
// checkout (Stripe client_reference_id / metadata.cs_cid) carries back to us.
export async function GET(req: Request, ctx: RouteContext<"/l/[slug]">) {
  const { slug } = await ctx.params;
  const link = db().prepare("SELECT workspace_id, destination, post_id FROM links WHERE slug = ?").get(slug) as
    | { workspace_id: string; destination: string; post_id: string | null }
    | undefined;
  if (!link) return new Response("Link not found", { status: 404 });

  const incoming = new URL(req.url);
  const clickId = id("clk");
  recordEvent(link.workspace_id, {
    type: "link_click",
    source: "link",
    link_slug: slug,
    post_id: link.post_id,
    click_id: clickId,
    // ManyChat can pass the subscriber id through as ?c= for contact-level funnels.
    contact_ref: incoming.searchParams.get("c"),
    meta: { referer: req.headers.get("referer"), ua: req.headers.get("user-agent") },
  });

  const dest = new URL(link.destination);
  dest.searchParams.set("cs_cid", clickId);
  if (!dest.searchParams.has("utm_source")) dest.searchParams.set("utm_source", "contentstudio");
  if (!dest.searchParams.has("utm_content")) dest.searchParams.set("utm_content", link.post_id ?? slug);
  return Response.redirect(dest, 302);
}
