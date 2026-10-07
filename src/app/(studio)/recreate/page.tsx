import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Bot, ChevronLeft, ChevronRight, FileText, Film, ImageIcon } from "lucide-react";
import { markPosted, moveIdea, saveIdea } from "@/app/actions";
import { Flash } from "@/components/flash";
import { Badge, Card, SectionTitle, SidebarLink, SidebarSection, Workspace } from "@/components/workspace";
import { requireSession } from "@/lib/auth";
import { compact, shortDate } from "@/lib/format";
import { thumbSrc } from "@/lib/thumbs";
import { VideoTile } from "@/components/video-tile";
import { IDEA_STATUSES, listAssets, listFormats, listIdeas, type Idea } from "@/lib/queries";

const TABS = ["board", "calendar", "library"] as const;
type TabKey = (typeof TABS)[number];

export default async function RecreatePage({ searchParams }: PageProps<"/recreate">) {
  await connection();
  const { workspaceId: ws } = await requireSession();
  const sp = await searchParams;
  const tab: TabKey = TABS.includes(sp.tab as TabKey) ? (sp.tab as TabKey) : "board";
  const ideas = listIdeas(ws);
  const selected = ideas.find((i) => i.id === sp.idea);
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : new Date().toISOString().slice(0, 7);
  const href = (q: Record<string, string | undefined>) =>
    `/recreate?${new URLSearchParams(Object.entries({ tab, idea: selected?.id, month, ...q }).filter((e): e is [string, string] => !!e[1]))}`;

  return (
    <Workspace
      activeTab={tab}
      tabs={[
        { key: "board", label: "Ideas pipeline", href: href({ tab: "board" }) },
        { key: "calendar", label: "Content calendar", href: href({ tab: "calendar" }) },
        { key: "library", label: "Asset library", href: href({ tab: "library" }) },
      ]}
      sidebar={
        <>
          <SidebarSection title="Pipeline">
            {IDEA_STATUSES.map((s) => (
              <div key={s} className="flex items-center justify-between px-2 py-1 text-sm capitalize">
                {s}
                <span className="tabular-nums text-muted">{ideas.filter((i) => i.status === s).length}</span>
              </div>
            ))}
          </SidebarSection>
          <SidebarSection title="Formats in play">
            {listFormats(ws)
              .filter((f) => f.status === "winner" || f.status === "testing")
              .map((f) => (
                <SidebarLink key={f.id} href={`/discover?niche=${f.niche_id}&format=${f.id}`}>
                  <span className="truncate">{f.name}</span>
                  <span className="ml-auto text-xs text-muted">{f.ideas}</span>
                </SidebarLink>
              ))}
          </SidebarSection>
        </>
      }
      right={selected ? <IdeaEditor ws={ws} idea={selected} /> : <ClaudeHandoff />}
    >
      <Flash />
      {tab === "board" && <Board ideas={ideas} href={href} selectedId={selected?.id} />}
      {tab === "calendar" && <Calendar ideas={ideas} month={month} href={href} />}
      {tab === "library" && <Library ws={ws} />}
    </Workspace>
  );
}

type Href = (q: Record<string, string | undefined>) => string;

function IdeaCard({ idea, href, active }: { idea: Idea; href: Href; active?: boolean }) {
  return (
    <Link href={href({ idea: idea.id })}>
      <Card className={`p-3 transition-shadow hover:shadow-sm ${active ? "ring-2 ring-accent" : ""}`}>
        <div className="flex gap-2">
          {idea.source_post_id && (
            <div className="relative aspect-[9/16] w-10 shrink-0 overflow-hidden rounded-md bg-zinc-800" title={`Replicating @${idea.source_handle}`}>
              {thumbSrc(idea.source_thumbnail) && (
                // eslint-disable-next-line @next/next/no-img-element -- proxied platform thumbnail
                <img src={thumbSrc(idea.source_thumbnail)!} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium leading-snug [overflow-wrap:anywhere]">{idea.title}</div>
            {idea.source_handle && <div className="truncate text-[11px] text-muted">from @{idea.source_handle}</div>}
          </div>
        </div>
        {idea.hook && idea.hook !== idea.title && <p className="mt-1 line-clamp-2 text-xs text-muted">&ldquo;{idea.hook}&rdquo;</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {idea.format_name && <Badge>{idea.format_name}</Badge>}
          {idea.created_by === "claude" && <Badge tone="claude">claude</Badge>}
          <span className="ml-auto text-[11px] text-muted">{shortDate(idea.scheduled_for)}</span>
        </div>
      </Card>
    </Link>
  );
}

function Board({ ideas, href, selectedId }: { ideas: Idea[]; href: Href; selectedId?: string }) {
  return (
    <>
      <SectionTitle title="Ideas pipeline" subtitle="Videos you save in Discover and scripts from Claude land here. Move them to posted to start tracking." />
      <div className="grid gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        {IDEA_STATUSES.map((s) => (
          <div key={s} className="min-w-0 rounded-xl bg-zinc-100/70 p-2">
            <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{s}</div>
            <div className="space-y-2">
              {ideas
                .filter((i) => i.status === s)
                .map((i) => (
                  <IdeaCard key={i.id} idea={i} href={href} active={i.id === selectedId} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Calendar({ ideas, month, href }: { ideas: Idea[]; month: string; href: Href }) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const lead = first.getDay();
  const cells = Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, i) => i - lead + 1);
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const byDay = new Map<string, Idea[]>();
  for (const idea of ideas) {
    if (!idea.scheduled_for) continue;
    const k = key(new Date(idea.scheduled_for));
    byDay.set(k, [...(byDay.get(k) ?? []), idea]);
  }
  const shift = (delta: number) => {
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const today = key(new Date());
  const unscheduled = ideas.filter((i) => !i.scheduled_for && i.status !== "posted");

  return (
    <>
      <SectionTitle
        title={first.toLocaleDateString("en", { month: "long", year: "numeric" })}
        subtitle="Schedule ideas from the editor on the right."
        action={
          <div className="flex gap-1">
            <Link href={href({ month: shift(-1) })} className="rounded-lg border border-line bg-surface p-1.5" aria-label="Previous month">
              <ChevronLeft size={16} />
            </Link>
            <Link href={href({ month: shift(1) })} className="rounded-lg border border-line bg-surface p-1.5" aria-label="Next month">
              <ChevronRight size={16} />
            </Link>
          </div>
        }
      />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line text-center text-xs text-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const inMonth = day >= 1 && day <= daysInMonth;
            const k = key(new Date(y, m - 1, day));
            return (
              <div key={i} className={`min-h-24 border-b border-r border-line p-1.5 ${inMonth ? "" : "bg-zinc-50"}`}>
                {inMonth && (
                  <>
                    <div className={`mb-1 text-xs ${k === today ? "font-bold text-accent" : "text-muted"}`}>{day}</div>
                    {(byDay.get(k) ?? []).map((idea) => (
                      <Link
                        key={idea.id}
                        href={href({ idea: idea.id })}
                        className={`mb-1 block truncate rounded px-1.5 py-0.5 text-[11px] ${
                          idea.status === "posted" ? "bg-emerald-50 text-emerald-800" : "bg-accent-soft text-accent"
                        }`}
                      >
                        {idea.title}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      {unscheduled.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold">Unscheduled</h3>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {unscheduled.map((i) => (
              <IdeaCard key={i.id} idea={i} href={href} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const KIND_ICON = { image: ImageIcon, video: Film } as Record<string, typeof FileText>;

function Library({ ws }: { ws: string }) {
  const assets = listAssets(ws);
  return (
    <>
      <SectionTitle title="Asset library" subtitle="Images, videos and captions generated by Claude (or uploaded) and linked to ideas." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {assets.map((a) => {
          const Icon = KIND_ICON[a.kind] ?? FileText;
          return (
            <Card key={a.id} className="overflow-hidden">
              <div className="relative grid h-44 place-items-center bg-zinc-100">
                {a.kind === "image" && a.url.startsWith("/") ? (
                  <Image src={a.url} alt={a.label} fill className="object-cover object-top" sizes="300px" />
                ) : (
                  <Icon className="text-zinc-300" size={32} />
                )}
              </div>
              <div className="p-3 text-sm">
                <div className="font-medium">{a.label || a.kind}</div>
                <div className="text-xs text-muted">
                  {a.idea_title ?? "Unlinked"} · {a.created_by}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

const input = "w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm";

function IdeaEditor({ ws, idea }: { ws: string; idea: Idea }) {
  const assets = listAssets(ws, idea.id);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Edit idea</h3>
        {idea.created_by === "claude" && <Badge tone="claude">from claude</Badge>}
        <Link href="/recreate" className="ml-auto text-xs text-muted hover:underline">
          close
        </Link>
      </div>
      {idea.source_post_id && (
        <div className="flex gap-3 rounded-lg border border-line bg-background p-2">
          <div className="w-20 shrink-0">
            <VideoTile url={idea.source_url ?? undefined} thumbnail={idea.source_thumbnail} hook={idea.source_hook ?? ""} views={idea.source_views ?? 0} likes={idea.source_likes ?? 0} saves={idea.source_saves ?? 0} />
          </div>
          <div className="min-w-0 text-xs">
            <div className="font-semibold uppercase tracking-wide text-muted">Replicating</div>
            <div className="mt-0.5 font-medium">@{idea.source_handle}</div>
            <div className="mt-1 space-y-0.5 tabular-nums text-muted">
              {!!idea.source_views && <div>{compact(idea.source_views)} views</div>}
              {!!idea.source_likes && <div>{compact(idea.source_likes)} likes</div>}
              {!!idea.source_saves && <div>{compact(idea.source_saves)} saves</div>}
            </div>
            {idea.source_url && (
              <a href={idea.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-accent underline">Open original</a>
            )}
          </div>
        </div>
      )}
      <form action={saveIdea} className="space-y-3">
        <input type="hidden" name="id" value={idea.id} />
        <label className="block text-xs text-muted">
          Title
          <input name="title" defaultValue={idea.title} className={input} />
        </label>
        <label className="block text-xs text-muted">
          Hook
          <input name="hook" defaultValue={idea.hook} className={input} />
        </label>
        <label className="block text-xs text-muted">
          Script
          <textarea name="script" defaultValue={idea.script} rows={7} className={`${input} font-mono text-xs`} />
        </label>
        <label className="block text-xs text-muted">
          Research notes
          <textarea name="notes" defaultValue={idea.notes} rows={3} className={input} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-muted">
            Status
            <select name="status" defaultValue={idea.status} className={input}>
              {IDEA_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Platform
            <select name="platform" defaultValue={idea.platform} className={input}>
              <option>instagram</option>
              <option>tiktok</option>
            </select>
          </label>
        </div>
        <label className="block text-xs text-muted">
          Scheduled for
          <input type="date" name="scheduled_for" defaultValue={idea.scheduled_for?.slice(0, 10) ?? ""} className={input} />
        </label>
        <button className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90">Save</button>
      </form>

      {idea.status !== "posted" && (
        <div className="flex flex-wrap gap-1">
          {IDEA_STATUSES.filter((s) => s !== idea.status && s !== "posted").map((s) => (
            <form key={s} action={moveIdea}>
              <input type="hidden" name="id" value={idea.id} />
              <input type="hidden" name="status" value={s} />
              <button className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted hover:bg-background">→ {s}</button>
            </form>
          ))}
        </div>
      )}

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Assets ({assets.length})</h4>
        {assets.length === 0 && <p className="text-xs text-muted">None yet — Claude Code can attach them via the ingest API.</p>}
        <div className="grid grid-cols-3 gap-2">
          {assets.map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-lg bg-zinc-100">
              {a.kind === "image" && a.url.startsWith("/") ? (
                <Image src={a.url} alt={a.label} fill className="object-cover object-top" sizes="100px" />
              ) : (
                <span className="grid h-full place-items-center text-[10px] text-muted">{a.kind}</span>
              )}
            </a>
          ))}
        </div>
      </div>

      {idea.status !== "posted" && (
        <form action={markPosted} className="space-y-2 border-t border-line pt-4">
          <input type="hidden" name="id" value={idea.id} />
          <label className="block text-xs text-muted">
            Published? Paste the post URL to start tracking
            <input name="url" type="url" placeholder="https://www.instagram.com/reel/…" className={input} />
          </label>
          <button className="w-full rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-background">Mark posted → Track</button>
        </form>
      )}
    </div>
  );
}

function ClaudeHandoff() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <Bot size={16} className="text-orange-600" />
        <h3 className="font-semibold">Claude Code handoff</h3>
      </div>
      <p className="text-muted">
        Recreation happens in Claude Code. Copy a format brief from <Link href="/discover" className="text-accent underline">Discover</Link>,
        and Claude pushes scripts and generated media back here through the ingest API.
      </p>
      <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[11px] leading-relaxed text-zinc-100">{`POST /api/ingest/ideas
POST /api/ingest/assets
POST /api/ingest/posts
Authorization: Bearer $CONTENTSTUDIO_API_KEY`}</pre>
      <p className="text-xs text-muted">Select an idea to edit its script, attach assets, and schedule it.</p>
    </div>
  );
}
