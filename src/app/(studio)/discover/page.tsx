import Link from "next/link";
import { connection } from "next/server";
import { ExternalLink, Flame, Rocket, ShoppingBag, Sparkles } from "lucide-react";
import {
  createIdeaFromFormat,
  createNiche,
  runCreatorSync,
  runReelSearch,
  setFormatStatus,
  updateAccount,
} from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { Flash } from "@/components/flash";
import { SaveIdeaButton } from "@/components/save-idea-button";
import { VideoTile } from "@/components/video-tile";
import { Badge, Card, EmptyState, SectionTitle, SidebarLink, SidebarSection, Workspace } from "@/components/workspace";
import { requireSession } from "@/lib/auth";
import { claudeBrief } from "@/lib/brief";
import { thumbSrc } from "@/lib/thumbs";
import { compact, pct, shortDate } from "@/lib/format";
import {
  byReach,
  groupByCategory,
  listFormats,
  listNiches,
  listTrendAccounts,
  listTrendingPosts,
  savedVideoIdeas,
  type Format,
  type TrendAccount,
  type TrendingPost,
} from "@/lib/queries";

const TABS = ["accounts", "formats", "videos"] as const;
type TabKey = (typeof TABS)[number];

const input = "field";
const button = "btn btn-primary btn-block";

// "1.0M in ~5 months": the speed of growth is the signal that a format, not an
// existing audience, is doing the work.
function growthLine(a: TrendAccount): string {
  const parts = [`${compact(a.followers)} followers`];
  if (a.account_age_days > 0 && a.account_age_days < 730) {
    const months = Math.max(1, Math.round(a.account_age_days / 30));
    parts[0] = `${compact(a.followers)} in ~${months} month${months === 1 ? "" : "s"}`;
  }
  if (a.followers_30d_ago > 0 && a.growth_30d > 0) parts.push(`+${pct(a.growth_30d, 0)} in 30d`);
  return parts.join(" · ");
}

const isBreakout = (a: TrendAccount) => (a.account_age_days > 0 && a.account_age_days < 240) || a.growth_30d > 0.5;

export default async function DiscoverPage({ searchParams }: PageProps<"/discover">) {
  await connection();
  const { workspaceId: ws } = await requireSession();
  const sp = await searchParams;
  const niches = listNiches(ws);
  const nicheId = typeof sp.niche === "string" && niches.some((n) => n.id === sp.niche) ? sp.niche : niches[0]?.id;
  const tab: TabKey = TABS.includes(sp.tab as TabKey) ? (sp.tab as TabKey) : "accounts";
  const accounts = nicheId ? listTrendAccounts(ws, nicheId, 12) : [];
  const groups = groupByCategory(accounts);
  const formats = nicheId ? listFormats(ws, nicheId) : [];
  const videos = nicheId ? listTrendingPosts(ws, { nicheId }) : [];
  const saved = savedVideoIdeas(ws);
  const filter = readFilter(sp);
  const counts = countKinds(videos);
  const shownVideos = applyFilter(videos, filter, saved);
  const account = accounts.find((a) => a.id === sp.account);
  const format = formats.find((f) => f.id === sp.format) ?? (tab === "formats" ? formats[0] : undefined);
  const href = (q: Record<string, string | undefined>) =>
    `/discover?${new URLSearchParams(
      Object.entries({ niche: nicheId, tab, account: account?.id, format: format?.id, ...(tab === "videos" ? filterParams(filter) : {}), ...q }).filter(
        (e): e is [string, string] => !!e[1],
      ),
    )}`;

  const right = account ? (
    <AccountPanel account={account} nicheId={nicheId} saved={saved} />
  ) : format ? (
    <FormatPanel ws={ws} format={format} saved={saved} />
  ) : accounts[0] ? (
    <AccountPanel account={accounts[0]} nicheId={nicheId} saved={saved} />
  ) : (
    <p className="text-sm text-muted">Pull in some accounts to see them here.</p>
  );

  return (
    <Workspace
      activeTab={tab}
      tabs={[
        { key: "accounts", label: "Trend accounts", href: href({ tab: "accounts", format: undefined }) },
        { key: "formats", label: "Winning formats", href: href({ tab: "formats", account: undefined }) },
        { key: "videos", label: "Top videos", href: href({ tab: "videos" }) },
      ]}
      sidebar={
        <>
          <SidebarSection title="Niches">
            {niches.map((n) => (
              <SidebarLink key={n.id} href={`/discover?niche=${n.id}&tab=${tab}`} active={n.id === nicheId}>
                {n.name}
              </SidebarLink>
            ))}
            {niches.length === 0 && <p className="text-xs text-muted">No niches yet.</p>}
          </SidebarSection>
          {groups.length > 0 && (
            <SidebarSection title="Trend types">
              {groups.map(([category, list]) => (
                <a key={category} href={`#${slug(category)}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-sunken">
                  <span className="truncate">{category}</span>
                  <span className="text-xs text-muted">{list.length}</span>
                </a>
              ))}
            </SidebarSection>
          )}
          {nicheId && (
            <SidebarSection title="Find accounts (Scrape Creators)">
              <form action={runReelSearch} className="space-y-2">
                <input type="hidden" name="niche_id" value={nicheId} />
                <input
                  name="query"
                  required
                  minLength={2}
                  defaultValue={niches.find((n) => n.id === nicheId)?.keywords.split(",")[0]?.trim()}
                  placeholder="Search Reels, e.g. colour combinations"
                  className={input}
                />
                <button className={button}>Search Instagram Reels</button>
              </form>
              <form action={runCreatorSync} className="mt-3 space-y-2">
                <input type="hidden" name="niche_id" value={nicheId} />
                <textarea name="handles" rows={2} placeholder="@handle1, @handle2" className={input} />
                <div className="grid grid-cols-2 gap-2">
                  <select name="platform" aria-label="Platform" className={input}>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <button className={button}>Sync</button>
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
      right={right}
    >
      <Flash />
      {niches.length === 0 && <Welcome />}

      {tab === "accounts" && nicheId && (
        <>
          <SectionTitle
            title="Trend accounts"
            subtitle="Accounts winning in this niche, grouped by the kind of content they make. Fast growth on a young account means the format is doing the work."
          />
          {groups.length === 0 && <EmptyHint />}
          <div className="space-y-8">
            {groups.map(([category, list]) => (
              <section key={category} id={slug(category)}>
                <h3 className="mb-3 flex items-baseline gap-2 text-base font-semibold">
                  {category}
                  <span className="text-xs font-normal text-muted">
                    {list.length} account{list.length === 1 ? "" : "s"} · {compact(list.reduce((s, a) => s + a.total_views, 0))} views
                  </span>
                </h3>
                <Card className="divide-y divide-line">
                  {list.map((a) => (
                    <AccountRow key={a.id} account={a} href={href({ account: a.id, format: undefined })} active={a.id === account?.id} saved={saved} />
                  ))}
                </Card>
              </section>
            ))}
          </div>
        </>
      )}

      {tab === "formats" && nicheId && (
        <>
          <SectionTitle title="Winning formats" subtitle="The repeatable pattern behind the top videos, shaped like the videos themselves." />
          {formats.length === 0 && (
            <EmptyState title="No formats yet">
              A format is the repeatable pattern behind several top videos. Ask Claude to group this niche&apos;s videos into
              formats, or run <code className="font-mono text-xs">/mcp__contentstudio__find_and_recreate</code> in Claude Code.
            </EmptyState>
          )}
          <div className="space-y-6">
            {formats.map((f) => {
              const examples = videos.filter((v) => v.format_id === f.id).slice(0, 6);
              return (
                <Card key={f.id} className={`p-4 ${f.id === format?.id ? "ring-2 ring-accent" : ""}`}>
                  <Link href={href({ format: f.id, account: undefined })} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{f.name}</span>
                        <Badge tone={f.status}>{f.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">{f.summary}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted">
                      <div><span className="font-semibold text-foreground">{compact(f.total_views)}</span> views</div>
                      <div>{pct(f.avg_save_rate)} save rate</div>
                    </div>
                  </Link>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {examples.map((v) => (
                      <SavableTile key={v.id} video={v} saved={saved} size="sm" platform={v.platform} label={`@${v.handle}`} />
                    ))}
                    {examples.length === 0 && <p className="text-xs text-muted">No example videos linked yet.</p>}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {tab === "videos" && nicheId && (
        <>
          <SectionTitle title="Top videos" subtitle="Every stored post in this niche, videos, carousels and slideshows. Filter by format and platform, then save the ones you want to replicate straight into Ideas. — means the platform doesn’t report that stat (Instagram hides saves and shares, and views on photo posts)." />
          {videos.length === 0 ? (
            <EmptyHint />
          ) : (
            <VideoFilters filter={filter} counts={counts} href={href} shown={shownVideos.length} total={videos.length} />
          )}
          {videos.length > 0 && shownVideos.length === 0 && (
            <p className="rounded-lg border border-dashed border-line-strong px-3 py-6 text-center text-sm text-muted">
              Nothing matches these filters. <Link href={href({ kind: undefined, platform: undefined, show: undefined, sort: undefined })} className="text-accent-ink underline">Clear filters</Link>
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {shownVideos.map((v) => (
              <div key={v.id}>
                <VideoTile url={v.url} thumbnail={v.thumbnail_url} videoUrl={v.video_url} slides={v.slides} audioUrl={v.audio_url} hook={v.hook} views={v.views} likes={v.likes} saves={v.saves} platform={v.platform}
                  label={v.reach_multiple >= 1 ? `${v.reach_multiple.toFixed(1)}x` : undefined} />
                <VideoStats video={v} ideaId={saved.get(v.id)} />
              </div>
            ))}
          </div>
        </>
      )}
    </Workspace>
  );
}

type Saved = Map<string, string>;

// ---------- Top posts filters (all in the URL, so a filtered view can be shared) ----------

const KINDS = [
  { key: "all", label: "All" },
  { key: "video", label: "Videos" },
  { key: "carousel", label: "Carousels & slideshows" },
  { key: "photo", label: "Photos" },
] as const;
const PLATFORMS = [
  { key: "all", label: "All platforms" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
] as const;
const SORTS = [
  { key: "views", label: "Most views" },
  { key: "reach", label: "Reach vs followers" },
  { key: "saves", label: "Most saves" },
  { key: "engagement", label: "Most engagement" },
  { key: "newest", label: "Newest" },
] as const;
const SHOWS = [
  { key: "all", label: "All" },
  { key: "unsaved", label: "Not saved yet" },
  { key: "saved", label: "Saved to Ideas" },
] as const;

type Filter = {
  kind: (typeof KINDS)[number]["key"];
  platform: (typeof PLATFORMS)[number]["key"];
  sort: (typeof SORTS)[number]["key"];
  show: (typeof SHOWS)[number]["key"];
};

function pick<T extends readonly { key: string }[]>(options: T, value: unknown): T[number]["key"] {
  return (options.find((o) => o.key === value) ?? options[0]).key;
}

function readFilter(sp: Record<string, string | string[] | undefined>): Filter {
  return { kind: pick(KINDS, sp.kind), platform: pick(PLATFORMS, sp.platform), sort: pick(SORTS, sp.sort), show: pick(SHOWS, sp.show) };
}

// Only non-default values go in the URL.
function filterParams(f: Filter): Record<string, string | undefined> {
  return {
    kind: f.kind === "all" ? undefined : f.kind,
    platform: f.platform === "all" ? undefined : f.platform,
    sort: f.sort === "views" ? undefined : f.sort,
    show: f.show === "all" ? undefined : f.show,
  };
}

// Posts synced before slides were stored have no media_type: a video URL or a
// view count means video, anything else is a photo post.
const kindOf = (v: TrendingPost) => v.media_type ?? (v.video_url || v.views > 0 ? "video" : "photo");

function countKinds(videos: TrendingPost[]): Record<string, number> {
  const counts: Record<string, number> = { all: videos.length };
  for (const v of videos) counts[kindOf(v)] = (counts[kindOf(v)] ?? 0) + 1;
  return counts;
}

const engagementOf = (v: TrendingPost) => v.likes + v.comments + v.shares + v.saves;
const SORT_FNS: Record<Filter["sort"], (a: TrendingPost, b: TrendingPost) => number> = {
  views: byReach,
  reach: (a, b) => b.reach_multiple - a.reach_multiple || byReach(a, b),
  saves: (a, b) => b.saves - a.saves || byReach(a, b),
  engagement: (a, b) => engagementOf(b) - engagementOf(a),
  newest: (a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""),
};

function applyFilter(videos: TrendingPost[], f: Filter, saved: Saved): TrendingPost[] {
  return videos
    .filter((v) => f.kind === "all" || kindOf(v) === f.kind)
    .filter((v) => f.platform === "all" || v.platform === f.platform)
    .filter((v) => f.show === "all" || (f.show === "saved") === saved.has(v.id))
    .sort(SORT_FNS[f.sort]);
}

function VideoFilters({ filter, counts, href, shown, total }: {
  filter: Filter;
  counts: Record<string, number>;
  href: (q: Record<string, string | undefined>) => string;
  shown: number;
  total: number;
}) {
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors ${
      active ? "border-accent bg-accent text-accent-fg" : "border-line-strong text-muted hover:border-foreground/40 hover:text-foreground"
    }`;
  const defaults = filterParams({ kind: "all", platform: "all", sort: "views", show: "all" });
  return (
    <div className="mb-4 space-y-2 rounded-xl border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Post type">
        {KINDS.filter((k) => k.key === "all" || filter.kind === k.key || (counts[k.key] ?? 0) > 0).map((k) => (
          <Link key={k.key} href={href({ kind: k.key === "all" ? undefined : k.key })} aria-current={filter.kind === k.key ? "true" : undefined} className={chip(filter.kind === k.key)}>
            {k.label} <span className="tabular-nums opacity-70">{counts[k.key] ?? 0}</span>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Platform and saved">
        {PLATFORMS.map((p) => (
          <Link key={p.key} href={href({ platform: p.key === "all" ? undefined : p.key })} aria-current={filter.platform === p.key ? "true" : undefined} className={chip(filter.platform === p.key)}>
            {p.label}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-line-strong" aria-hidden />
        {SHOWS.map((o) => (
          <Link key={o.key} href={href({ show: o.key === "all" ? undefined : o.key })} aria-current={filter.show === o.key ? "true" : undefined} className={chip(filter.show === o.key)}>
            {o.key === "all" ? "Saved or not" : o.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sort">
        <span className="mr-1 text-xs text-muted">Sort</span>
        {SORTS.map((o) => (
          <Link key={o.key} href={href({ sort: o.key === "views" ? undefined : o.key })} aria-current={filter.sort === o.key ? "true" : undefined} className={chip(filter.sort === o.key)}>
            {o.label}
          </Link>
        ))}
        <span className="ml-auto text-xs tabular-nums text-muted">
          {shown === total ? `${total} posts` : `${shown} of ${total} posts`}
          {shown !== total && (
            <>
              {" · "}
              <Link href={href(defaults)} className="text-accent-ink underline">Clear</Link>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

// A video tile with a one-click "Save to Ideas" button in the corner.
function SavableTile({ video: v, saved, size, platform, label }: {
  video: TrendingPost; saved: Saved; size?: "sm" | "md"; platform?: string; label?: string;
}) {
  return (
    <div className="relative shrink-0">
      <VideoTile size={size} url={v.url} thumbnail={v.thumbnail_url} videoUrl={v.video_url} slides={v.slides} audioUrl={v.audio_url} hook={v.hook} views={v.views} likes={v.likes} saves={v.saves} platform={platform} label={label} />
      <div className="absolute right-1.5 top-1.5 z-20">
        <SaveIdeaButton postId={v.id} ideaId={saved.get(v.id)} compact />
      </div>
    </div>
  );
}

// A zero we can't distinguish from "not reported" is shown as a dash.
const stat = (n: number) => (n > 0 ? compact(n) : "—");

function VideoStats({ video: v, ideaId }: { video: TrendingPost; ideaId?: string }) {
  const engagement = v.likes + v.comments + v.shares + v.saves;
  // Engagement against views when we have them, otherwise against followers.
  const base = v.views > 0 ? v.views : v.followers;
  const rows: [string, string, string?][] = [
    ["Views", stat(v.views)],
    ["Likes", stat(v.likes)],
    ["Comments", stat(v.comments)],
    ["Saves", stat(v.saves)],
    ["Shares", stat(v.shares)],
    ["Eng. rate", base > 0 && engagement > 0 ? pct(engagement / base) : "—", v.views > 0 ? "(likes + comments + shares + saves) ÷ views" : "(likes + comments + shares + saves) ÷ followers, since there is no view count"],
    ["Save rate", v.views > 0 && v.saves > 0 ? pct(v.save_rate) : "—", "saves ÷ views"],
    ["Reach", v.views > 0 && v.followers > 0 ? `${v.reach_multiple.toFixed(1)}x` : "—", "views ÷ followers"],
  ];
  return (
    <div className="mt-1.5 rounded-lg border border-line bg-surface p-2 text-[11px]">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">@{v.handle}</span>
        <span className="shrink-0 text-muted">{shortDate(v.posted_at)}</span>
      </div>
      {v.format_name && <div className="truncate text-muted">{v.format_name}</div>}
      <dl className="mt-1.5 space-y-0.5">
        {rows.map(([label, value, hint]) => (
          <div key={label} className="flex justify-between gap-2 border-b border-line/60 pb-0.5 last:border-0" title={hint}>
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2">
        <SaveIdeaButton postId={v.id} ideaId={ideaId} />
      </div>
    </div>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function Avatar({ account, size = 40 }: { account: TrendAccount; size?: number }) {
  return account.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element -- platform CDN avatars, often short-lived
    <img src={thumbSrc(account.avatar_url) ?? ""} alt="" width={size} height={size} referrerPolicy="no-referrer" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="grid shrink-0 place-items-center rounded-full bg-sunken text-sm font-semibold uppercase text-muted" style={{ width: size, height: size }}>
      {account.handle.slice(0, 1)}
    </span>
  );
}

function AccountRow({ account: a, href, active, saved }: { account: TrendAccount; href: string; active: boolean; saved: Saved }) {
  return (
    <div className={`p-4 ${active ? "bg-accent-soft/40" : ""}`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,14rem)]">
        <Link href={href} className="flex min-w-0 items-start gap-3">
          <Avatar account={a} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate font-semibold">@{a.handle}</span>
              {isBreakout(a) && (
                <Badge tone="winner"><Rocket size={10} className="mr-1" />breakout</Badge>
              )}
            </div>
            <div className="text-xs text-muted">{a.platform === "instagram" ? "Instagram" : "TikTok"}</div>
            <div className="mt-1 text-sm font-medium tabular-nums">{growthLine(a)}</div>
          </div>
        </Link>

        <div className="min-w-0 text-sm">
          <div className="mb-1 text-xs text-muted">Best video</div>
          {a.best ? (
            <p className="line-clamp-2">
              <span className="font-semibold tabular-nums">
                {a.best.views > 0 || !a.best.likes ? `${compact(a.best.views)} views` : `${compact(a.best.likes)} likes`}
              </span>
              {a.best.hook && <>, &ldquo;{a.best.hook}&rdquo;</>}
              {a.best.saves > 0 && <span className="text-muted"> ({compact(a.best.saves)} saves)</span>}
            </p>
          ) : (
            <p className="text-muted">No videos synced yet.</p>
          )}
        </div>

        <div className="text-sm">
          <div className="mb-1 text-xs text-muted">What it sells</div>
          {a.sells ? (
            <div className="flex items-start gap-1.5">
              <ShoppingBag size={14} className="mt-0.5 shrink-0 text-good" />
              {a.sells_url ? (
                <a href={a.sells_url.startsWith("http") ? a.sells_url : `https://${a.sells_url}`} target="_blank" rel="noreferrer" className="hover:underline">
                  {a.sells}
                </a>
              ) : (
                <span>{a.sells}</span>
              )}
            </div>
          ) : (
            <span className="text-muted">Unknown</span>
          )}
        </div>
      </div>

      {/* Full-width strip of the account's top content. */}
      {a.top_videos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {a.top_videos.map((v, i) => (
            <SavableTile key={v.id} video={v} saved={saved} size="sm" label={i === 0 ? "Best" : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

function AccountPanel({ account: a, nicheId, saved }: { account: TrendAccount; nicheId?: string; saved: Saved }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Avatar account={a} size={48} />
        <div className="min-w-0">
          <a
            href={a.platform === "instagram" ? `https://www.instagram.com/${a.handle}/` : `https://www.tiktok.com/@${a.handle}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-semibold hover:underline"
          >
            @{a.handle} <ExternalLink size={12} />
          </a>
          <div className="text-sm text-muted">{a.display_name}</div>
          <div className="mt-1 text-sm font-medium">{growthLine(a)}</div>
        </div>
      </div>
      {a.bio && <p className="whitespace-pre-line text-sm text-muted">{a.bio}</p>}

      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted">
          Top videos ({a.video_count} stored · {compact(a.total_views)} views)
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {a.top_videos.map((v) => (
            <SavableTile key={v.id} video={v} saved={saved} />
          ))}
        </div>
      </div>

      <form action={updateAccount} className="space-y-2 border-t border-line pt-4">
        <input type="hidden" name="id" value={a.id} />
        <label className="block text-xs text-muted">
          Trend type
          <input name="category" defaultValue={a.category ?? ""} placeholder="e.g. Colour & outfit guides" className={input} />
        </label>
        <label className="block text-xs text-muted">
          What it sells
          <input name="sells" defaultValue={a.sells ?? ""} placeholder="e.g. Digital style guide (Gumroad)" className={input} />
        </label>
        <label className="block text-xs text-muted">
          Shop link
          <input name="sells_url" defaultValue={a.sells_url ?? ""} className={input} />
        </label>
        <button className="btn btn-secondary btn-block">Save labels</button>
      </form>

      <form action={runCreatorSync}>
        <input type="hidden" name="niche_id" value={nicheId ?? ""} />
        <input type="hidden" name="platform" value={a.platform} />
        <input type="hidden" name="handles" value={a.handle} />
        <button className={button}>Refresh from {a.platform === "instagram" ? "Instagram" : "TikTok"}</button>
      </form>
    </div>
  );
}

function EmptyHint() {
  return (
    <EmptyState title="No accounts or videos in this niche yet">
      Use <b>Search Instagram Reels</b> in the sidebar with one of your niche keywords, or paste a few handles you admire into{" "}
      <b>Sync accounts</b>. Claude can also do this for you over MCP.
    </EmptyState>
  );
}

function Welcome() {
  return (
    <Card className="mb-6 p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-accent" />
        <h2 className="text-lg font-semibold">Welcome to ContentStudio</h2>
      </div>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
        <li>Add your niche (left sidebar) with a few search keywords.</li>
        <li>Search Instagram Reels or sync accounts you admire to pull in what&apos;s working.</li>
        <li>
          Connect Claude Code from <Link href="/settings" className="text-accent underline">Settings</Link> and run{" "}
          <code>/mcp__contentstudio__find_and_recreate</code> to group accounts, find formats and write scripts for you.
        </li>
      </ol>
    </Card>
  );
}

function FormatPanel({ ws, format, saved }: { ws: string; format: Format; saved: Saved }) {
  const examples = listTrendingPosts(ws, { formatId: format.id });
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-ai" />
          <h3 className="font-semibold">{format.name}</h3>
        </div>
        <p className="mt-1 text-sm text-muted">{format.summary}</p>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted">Structure</h4>
        <ol className="space-y-1.5 text-sm">
          {format.structure.map((beat, i) => (
            <li key={i} className="flex gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">{i + 1}</span>
              <span>{beat}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h4 className="mb-1 text-xs font-semibold text-muted">Why it works</h4>
        <p className="text-sm">{format.why_it_works}</p>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted">Examples</h4>
        <div className="grid grid-cols-3 gap-2">
          {examples.slice(0, 6).map((v) => (
            <SavableTile key={v.id} video={v} saved={saved} />
          ))}
        </div>
      </div>
      <div className="space-y-2 border-t border-line pt-4">
        <form action={createIdeaFromFormat}>
          <input type="hidden" name="format_id" value={format.id} />
          <button className="btn btn-primary btn-block">Recreate this format →</button>
        </form>
        <div className="flex items-center justify-between gap-2">
          <CopyButton text={claudeBrief(format, examples, appUrl)} label="Copy Claude brief" />
          <form action={setFormatStatus} className="flex items-center gap-1.5">
            <input type="hidden" name="id" value={format.id} />
            <select name="status" defaultValue={format.status} aria-label="Format status" className="field w-auto py-1">
              {["watching", "testing", "winner", "retired"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm">Set</button>
          </form>
        </div>
      </div>
    </div>
  );
}
