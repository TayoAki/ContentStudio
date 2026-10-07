import { cookies } from "next/headers";
import { connection } from "next/server";
import { logout } from "@/app/(auth)/actions";
import { regenerateApiKey, renameWorkspace, saveStripeSecret } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { Flash } from "@/components/flash";
import { Card, SectionTitle } from "@/components/workspace";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { usageToday } from "@/lib/ingest";
import { SC_DAILY_LIMIT } from "@/lib/integrations/scrapecreators";

const input = "field";
const code = "block overflow-x-auto whitespace-pre rounded-lg bg-code-bg p-3 font-mono text-[11px] leading-relaxed text-code-fg";

export default async function SettingsPage() {
  await connection();
  const session = await requireSession();
  const ws = db()
    .prepare("SELECT id, name, api_key_prefix, manychat_secret, stripe_webhook_secret FROM workspaces WHERE id = ?")
    .get(session.workspaceId) as { id: string; name: string; api_key_prefix: string | null; manychat_secret: string; stripe_webhook_secret: string | null };
  const newKey = (await cookies()).get("cs_new_key")?.value;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const keyForSnippets = newKey ?? "<your API key>";
  const mcpCommand = `claude mcp add --transport http contentstudio ${appUrl}/api/mcp \\\n  --header "Authorization: Bearer ${keyForSnippets}"`;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <Flash />
        <section>
          <SectionTitle title="Workspace" subtitle={`Signed in as ${session.email}`} action={
            <form action={logout}><button className="btn btn-secondary">Log out</button></form>
          } />
          <Card className="p-4">
            <form action={renameWorkspace} className="flex gap-2">
              <input name="name" defaultValue={ws.name} className={input} />
              <button className="btn btn-secondary">Rename</button>
            </form>
          </Card>
        </section>

        <section>
          <SectionTitle title="Connect Claude (MCP)" subtitle="Lets Claude Code research, write scripts, schedule and read performance in this workspace." />
          <Card className="space-y-4 p-4 text-sm">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">API key</span>
                <form action={regenerateApiKey}>
                  <button className="btn btn-secondary btn-sm">
                    {ws.api_key_prefix ? "Regenerate (revokes the old key)" : "Generate key"}
                  </button>
                </form>
              </div>
              {newKey ? (
                <div className="space-y-2 rounded-lg bg-warn-soft p-3">
                  <p className="text-xs text-warn">Copy it now. It won&apos;t be shown again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate font-mono text-xs">{newKey}</code>
                    <CopyButton text={newKey} />
                  </div>
                </div>
              ) : (
                <p className="text-muted">
                  {ws.api_key_prefix ? <>Active key starts with <code className="font-mono">{ws.api_key_prefix}…</code></> : "No key yet. Generate one to connect Claude."}
                </p>
              )}
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">Add to Claude Code</span>
                <CopyButton text={mcpCommand} />
              </div>
              <code className={code}>{mcpCommand}</code>
              <p className="mt-2 text-xs text-muted">
                Then in Claude Code try <code>/mcp__contentstudio__find_and_recreate mens fashion</code>. Plain HTTP endpoints live under{" "}
                <code>{appUrl}/api/ingest/*</code> with the same key.
              </p>
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle title="Scrape Creators" subtitle="Instagram + TikTok research, included with your plan." />
          <Card className="p-4 text-sm">
            {process.env.SCRAPECREATORS_API_KEY ? (
              <p>
                Used <span className="font-semibold tabular-nums">{usageToday(ws.id, "scrapecreators")}</span> of {SC_DAILY_LIMIT} requests today.
              </p>
            ) : (
              <p className="text-muted">Not configured on this server.</p>
            )}
          </Card>
        </section>

        <section>
          <SectionTitle title="ManyChat" subtitle="Log comment-keyword and DM steps so they're attributed to the post." />
          <Card className="space-y-3 p-4 text-sm">
            <p className="text-muted">
              In each automation add an <b>External Request</b> step: POST, the URL below, header <code>x-contentstudio-secret</code>, and
              body <code>{`{"event":"comment_keyword","keyword":"BLAZER","subscriber_id":"{{user_id}}"}`}</code>. Repeat with{" "}
              <code>dm_sent</code> after the DM, and put <code>{appUrl}/l/&lt;slug&gt;?c={"{{user_id}}"}</code> in the message.
            </p>
            <Row label="Webhook URL" value={`${appUrl}/api/webhooks/manychat/${ws.id}`} />
            <Row label="Secret header" value={ws.manychat_secret} />
          </Card>
        </section>

        <section>
          <SectionTitle title="Stripe" subtitle="Turns checkouts into purchases attributed to the post that drove them." />
          <Card className="space-y-3 p-4 text-sm">
            <p className="text-muted">
              In Stripe → Developers → Webhooks, add the endpoint below for <code>checkout.session.completed</code>, then paste its signing
              secret. When creating Checkout sessions, pass the <code>cs_cid</code> query param from the landing URL as{" "}
              <code>client_reference_id</code>.
            </p>
            <Row label="Endpoint" value={`${appUrl}/api/webhooks/stripe/${ws.id}`} />
            <form action={saveStripeSecret} className="flex gap-2">
              <input
                name="stripe_webhook_secret"
                type="password"
                placeholder={ws.stripe_webhook_secret ? "•••••••• (saved, paste to replace)" : "whsec_…"}
                className={input}
              />
              <button className="btn btn-secondary">Save</button>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-muted">{label}</span>
      <code className="flex-1 truncate rounded bg-background px-2 py-1 font-mono text-xs">{value}</code>
      <CopyButton text={value} />
    </div>
  );
}
