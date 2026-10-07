import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Flame, Rocket, Sparkles } from "lucide-react";
import { createIdeaFromFormat, createNiche, runCreatorSync, runReelSearch, setFormatStatus } from "@/app/actions";
import { Flash } from "@/components/flash";
import { CopyButton } from "@/components/copy-button";
import { Badge, Card, SectionTitle, SidebarLink, SidebarSection, Workspace } from "@/components/workspace";
import { requireSession } from "@/lib/auth";
import { claudeBrief } from "@/lib/brief";
import { compact, pct, shortDate } from "@/lib/format";
import { listCreators, listFormats, listNiches, listTrendingPosts, type Format } from "@/lib/queries";

const TABS = ["formats", "creators", "posts"] as const;
type TabKey = (typeof TABS)[number];

export default async function DiscoverPage({ searchParams }: PageProps<"/discover">) {
  await connection();
  const { workspaceId: ws } = await requireSession();
  const sp = await searchParams;
  const niches = listNiches(ws);
  const nicheId = typeof sp.niche === "string" && niches.some((n) => n.id === sp.niche) ? sp.niche : niches[0]?.id;
  const tab: TabKey = TABS.includes(sp.tab as TabKey) ? (sp.tab as TabKey) : "formats";
  const formats = listFormats(ws, nicheId);
  const selected = formats.find((f) => f.id === sp.format) ?? formats[0];
  const posts = listTrendingPosts(ws, { nicheId });
  const href = (q: Record<string, string | undefined>) =>
    `/discover?${new URLSearchParams(Object.entries({ niche: nicheId, tab, format: selected?.id, ...q }).filter((e): e is [string, string] => !!e[1]))}`;

  return (
    <Workspace
      activeTab={tab}
      tabs={[
        { key: "formats", label: "Winning formats", href: href({ tab: "formats" }) },
        { key: "creators", label: "Breakout creators", href: href({ tab: "creators" }) },
        { key: "posts", label: "Trending posts", href: href({ tab: "posts" }) },
      ]}
      sidebar={
        <>
          <SidebarSection title="Niches">
            {niches.map((n) => (
              <SidebarLink key={n.id} href={`/discover?niche=${n.id}&tab=${tab}`} active={n.id === nicheId}>
                {n.name}
              </SidebarLink>
            ))}
          </SidebarSection>
          <SidebarSection title="Formats in niche">
            {formats.map((f) => (
              <SidebarLink key={f.id} href={href({ format: f.id, tab: "formats" })} active={f.id === selected?.id}>
                <StatusDot status={f.status} />
                <span className="truncate">{f.name}</span>
              </SidebarLink>
            ))}
          </SidebarSection>
          {nicheId && (
            <SidebarSection title="Find content (Scrape Creators)">
              <form action={runReelSearch} className="space-y-2">
                <input type="hidden" name="niche_id" value={nicheId} />
                <input
                  name="query"
                  required
                  minLength={2}
                  defaultValue={niches.find((n) => n.id === nicheId)?.keywords.split(",")[0]?.trim()}
                  placeholder="Search Reels, e.g. mens style tips"
                  className={input}
                />
                <button className={button}>Search Instagram Reels</button>
              </form>
              <form action={runCreatorSync} className="mt-3 space-y-2">
                <input type="hidden" name="niche_id" value={nicheId} />
                <textarea name="handles" rows={2} placeholder="@handle1, @handle2" className={input} />
                <div className="flex gap-2">
                  <select name="platform" className={`${input} w-auto`}>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <button className={`${button} flex-1`}>Sync creators</button>
                </div>
              </form>
              <p className="mt-2 text-[11px] text-muted">Each search or handle uses 1 request of your daily allowance.</p>
            </SidebarSection>
          )}
          <SidebarSection title="New niche">
            <form action={createNiche} className="space-y-2">
              <input name="name" required placeholder="e.g. Men's fashion" className={input} />
              <input name="keywords" placeholder="keywords, comma separated" className={input} />
              <button className={button}>Add niche</button>
            </form>
          </SidebarSection>
        </>
      }
      right={selected ? <FormatPanel ws={ws} format={selected} /> : <p className="text-sm text-muted">No formats yet.</p>}
    >
      <Flash />
      {niches.length === 0 && <Welcome />}
      {tab === "formats" && nicheId && (
        <>
          <SectionTitle
            title="Replicable formats"
            subtitle="Grouped from trending posts. Ranked by status, then total views across examples."
          />
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {formats.map((f) => {
              const cover = posts.find((p) => p.format_id === f.id && p.thumbnail_url)?.thumbnail_url;
              return (
                <Link key={f.id} href={href({ format: f.id })}>
                  <Card className={`overflow-hidden transition-shadow hover:shadow-md ${f.id === selected?.id ? "ring-2 ring-accent" : ""}`}>
                    <div className="relative grid h-36 place-items-center bg-zinc-100">
                      {cover ? (
                        <Image src={cover} alt="" fill unoptimized={!cover.startsWith("/")} className="object-cover object-top" sizes="400px" />
                      ) : (
                        <Sparkles className="text-zinc-300" size={32} />
                      )}
                      <div className="absolute left-2 top-2">
                        <Badge tone={f.status}>{f.status}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-semibold">{f.name}</div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{f.summary}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <Metric label="Examples" value={String(f.examples)} />
                        <Metric label="Views" value={compact(f.total_views)} />
                        <Metric label="Save rate" value={pct(f.avg_save_rate)} />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {tab === "formats" && nicheId && formats.length === 0 && (
        <Card className="p-6 text-sm text-muted">
          No formats yet. Search Reels or sync creators (left), then ask Claude to cluster the outliers into formats with the{" "}
          <code>save_format</code> tool, or run <code>/mcp__contentstudio__find_and_recreate</code> in Claude Code.
        </Card>
      )}
      {tab === "creators" && <CreatorsTable ws={ws} nicheId={nicheId} />}

      {tab === "posts" && (
        <>
          <SectionTitle title="Trending posts" subtitle="Sorted by reach multiple (views ÷ creator followers) — the outlier signal." />
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {posts.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>@{p.handle} · {p.platform}</span>
                  <span>{shortDate(p.posted_at)}</span>
                </div>
                <div className="mt-2 font-medium">&ldquo;{p.hook}&rdquo;</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{p.caption}</p>
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <Metric label="Views" value={compact(p.views)} />
                  <Metric label="Reach" value={`${p.reach_multiple.toFixed(1)}x`} />
                  <Metric label="Saves" value={pct(p.save_rate)} />
                  <Metric label="Shares" value={compact(p.shares)} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {p.format_name ? <Badge>{p.format_name}</Badge> : <Badge tone="testing">unclassified</Badge>}
                  <span className="text-[11px] text-muted">via {p.source}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Workspace>
  );
}

const input = "w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm";
const button = "w-full rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90";

function Welcome() {
  return (
    <Card className="mb-6 p-6">
      <h2 className="text-lg font-semibold">Welcome to ContentStudio</h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
        <li>Add your niche (left sidebar) with a few search keywords.</li>
        <li>Search Instagram Reels or sync creators you admire to pull in what&apos;s working.</li>
        <li>
          Connect Claude Code from <Link href="/settings" className="text-accent underline">Settings</Link> and run{" "}
          <code>/mcp__contentstudio__find_and_recreate</code> to cluster formats and write scripts for you.
        </li>
      </ol>
    </Card>
  );
}

function CreatorsTable({ ws, nicheId }: { ws: string; nicheId?: string }) {
  const creators = listCreators(ws, nicheId);
  return (
    <>
      <SectionTitle
        title="Breakout creators"
        subtitle="New accounts that grew fast — the clearest signal that a format (not an audience) is doing the work."
      />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="p-3">Creator</th>
              <th className="p-3">Followers</th>
              <th className="p-3">30d growth</th>
              <th className="p-3">Account age</th>
              <th className="p-3">Top format</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((c) => {
              const breakout = c.account_age_days < 180 && c.growth_30d > 0.5;
              return (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-medium">
                      @{c.handle}
                      {breakout && (
                        <Badge tone="winner">
                          <Rocket size={10} className="mr-1" /> breakout
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted">{c.platform} · via {c.source}</div>
                  </td>
                  <td className="p-3 tabular-nums">{compact(c.followers)}</td>
                  <td className={`p-3 tabular-nums ${c.growth_30d > 0.5 ? "font-semibold text-good" : ""}`}>+{pct(c.growth_30d, 0)}</td>
                  <td className="p-3 tabular-nums">{c.account_age_days}d</td>
                  <td className="p-3">{c.top_format ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function FormatPanel({ ws, format }: { ws: string; format: Format }) {
  const examples = listTrendingPosts(ws, { formatId: format.id });
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <h3 className="font-semibold">{format.name}</h3>
        </div>
        <p className="mt-1 text-sm text-muted">{format.summary}</p>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Structure</h4>
        <ol className="space-y-1.5 text-sm">
          {format.structure.map((beat, i) => (
            <li key={i} className="flex gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
                {i + 1}
              </span>
              <span>{beat}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Why it works</h4>
        <p className="text-sm">{format.why_it_works}</p>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Top examples</h4>
        <ul className="space-y-2 text-sm">
          {examples.slice(0, 4).map((p) => (
            <li key={p.id} className="rounded-lg border border-line p-2">
              <div className="line-clamp-1">&ldquo;{p.hook}&rdquo;</div>
              <div className="text-xs text-muted">
                @{p.handle} · {compact(p.views)} views · {pct(p.save_rate)} saves
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2 border-t border-line pt-4">
        <form action={createIdeaFromFormat}>
          <input type="hidden" name="format_id" value={format.id} />
          <button className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90">
            Recreate this format →
          </button>
        </form>
        <div className="flex items-center justify-between gap-2">
          <CopyButton text={claudeBrief(format, examples, appUrl)} label="Copy Claude Code brief" />
          <form action={setFormatStatus} className="flex">
            <input type="hidden" name="id" value={format.id} />
            <select
              name="status"
              defaultValue={format.status}
              className="rounded-l-lg border border-line bg-surface px-2 py-1.5 text-sm"
            >
              {["watching", "testing", "winner", "retired"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="rounded-r-lg border border-l-0 border-line px-2 text-sm hover:bg-background">Set</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = { winner: "bg-emerald-500", testing: "bg-amber-500", watching: "bg-zinc-300" }[status] ?? "bg-zinc-200";
  return <span className={`size-2 shrink-0 rounded-full ${color}`} />;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background px-2 py-1.5">
      <div className="text-muted">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
