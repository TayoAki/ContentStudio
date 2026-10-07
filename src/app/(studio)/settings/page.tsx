import { connection } from "next/server";
import { Card, SectionTitle } from "@/components/workspace";

const INTEGRATIONS = [
  {
    name: "Virlo",
    env: null,
    role: "Discover",
    how: "Trend + outlier data for TikTok, Reels and Shorts. Connect Virlo's MCP server to Claude Code, have Claude pull trending videos for your niche, then POST them to /api/ingest/trending (and group them into /api/ingest/formats).",
  },
  {
    name: "Scrape Creators",
    env: "SCRAPECREATORS_API_KEY",
    role: "Discover",
    how: "Pulls creator profiles and recent videos. POST /api/sync/scrapecreators with {\"handles\":[...],\"niche_id\":\"fashion\"} to refresh breakout creators and their outliers.",
  },
  {
    name: "Claude Code",
    env: "CONTENTSTUDIO_API_KEY",
    role: "Recreate",
    how: "Copy a format brief from Discover. Claude writes scripts/media and pushes them back via /api/ingest/ideas and /api/ingest/assets using this bearer token.",
  },
  {
    name: "ManyChat",
    env: "MANYCHAT_WEBHOOK_SECRET",
    role: "Track",
    how: "In each comment-keyword automation add an External Request → POST /api/webhooks/manychat with header x-contentstudio-secret and body {\"event\":\"comment_keyword\",\"keyword\":\"BLAZER\",\"subscriber_id\":\"{{user_id}}\"}. Repeat with \"dm_sent\" after the DM. Put a /l/<slug>?c={{user_id}} link in the DM.",
  },
  {
    name: "Stripe",
    env: "STRIPE_WEBHOOK_SECRET",
    role: "Track",
    how: "Point a webhook at /api/webhooks/stripe for checkout.session.completed. When creating Checkout, set client_reference_id (or metadata.cs_cid) to the cs_cid query param that /l/<slug> appends.",
  },
];

export default async function SettingsPage() {
  await connection();
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <SectionTitle title="Integrations" subtitle="Set these as environment variables (see .env.example)." />
        <div className="space-y-3">
          {INTEGRATIONS.map((i) => {
            const ok = i.env ? !!process.env[i.env] : null;
            return (
              <Card key={i.name} className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{i.name}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted">{i.role}</span>
                  <span className="ml-auto text-xs">
                    {ok === null ? (
                      <span className="text-muted">via Claude Code MCP</span>
                    ) : ok ? (
                      <span className="text-good">● connected</span>
                    ) : (
                      <span className="text-muted">○ {i.env} not set</span>
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{i.how}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
