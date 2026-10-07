import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { usageToday } from "@/lib/ingest";
import { SC_DAILY_LIMIT } from "@/lib/integrations/scrapecreators";
import { getSyncStatus } from "@/lib/queries";
import { ago } from "@/lib/format";

export async function BottomBar() {
  await connection();
  const session = await getSession();
  if (!session) return null;
  const ws = session.workspaceId;
  const sync = getSyncStatus(ws);
  const used = usageToday(ws, "scrapecreators");
  const stripe = db().prepare("SELECT stripe_webhook_secret IS NOT NULL AS ok FROM workspaces WHERE id = ?").get(ws) as { ok: number };
  const keys = {
    [`Scrape Creators ${used}/${SC_DAILY_LIMIT} today`]: !!process.env.SCRAPECREATORS_API_KEY,
    Stripe: !!stripe.ok,
  };
  return (
    <footer className="flex h-8 shrink-0 items-center gap-5 border-t border-line bg-surface px-4 text-[11px] text-muted">
      <span className="font-medium text-foreground">{session.workspaceName}</span>
      {sync.map((s) => (
        <span key={s.source}>
          {s.source}: {s.n} posts · synced {ago(s.last.replace(" ", "T") + "Z")}
        </span>
      ))}
      <span className="flex-1" />
      {Object.entries(keys).map(([name, ok]) => (
        <span key={name} className="flex items-center gap-1">
          <span className={`size-1.5 rounded-full ${ok ? "bg-good" : "bg-zinc-300"}`} />
          {name}
        </span>
      ))}
    </footer>
  );
}
