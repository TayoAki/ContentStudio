import { connection } from "next/server";
import { getSyncStatus } from "@/lib/queries";
import { ago } from "@/lib/format";

export async function BottomBar() {
  await connection();
  const sync = getSyncStatus();
  const keys = {
    "Scrape Creators": !!process.env.SCRAPECREATORS_API_KEY,
    Stripe: !!process.env.STRIPE_WEBHOOK_SECRET,
    ManyChat: !!process.env.MANYCHAT_WEBHOOK_SECRET,
  };
  return (
    <footer className="flex h-8 shrink-0 items-center gap-5 border-t border-line bg-surface px-4 text-[11px] text-muted">
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
