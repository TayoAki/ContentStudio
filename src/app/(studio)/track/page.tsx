import Link from "next/link";
import { connection } from "next/server";
import { Link2, MessageCircle, ShoppingBag } from "lucide-react";
import { createLink } from "@/app/actions";
import { FunnelChart, Sparkline, type Step } from "@/components/funnel";
import { Flash } from "@/components/flash";
import { Badge, Card, SectionTitle, SidebarLink, SidebarSection, Stat, Workspace } from "@/components/workspace";
import { requireSession } from "@/lib/auth";
import { ago, compact, money, pct, perThousand, rate, shortDate } from "@/lib/format";
import {
  getPostMetricsSeries,
  getTotals,
  listKeywords,
  listLinks,
  listPostsWithFunnel,
  listRecentEvents,
  type Funnel,
  type PostWithFunnel,
} from "@/lib/queries";

const TABS = ["overview", "posts", "links"] as const;
type TabKey = (typeof TABS)[number];

// Posts without a ManyChat keyword skip the comment/DM steps entirely.
const funnelSteps = (f: Funnel): Step[] =>
  [
    { label: "Views", value: f.views },
    { label: "Keyword comments", value: f.keyword_comments },
    { label: "DMs sent", value: f.dms },
    { label: "Link clicks", value: f.clicks },
    { label: "Opt-ins", value: f.optins },
    { label: "Purchases", value: f.purchases },
  ].filter((s) => s.value > 0 || (s.label !== "Keyword comments" && s.label !== "DMs sent"));

const EVENT_LABEL: Record<string, string> = {
  comment_keyword: "Keyword comment",
  dm_sent: "DM sent",
  link_click: "Link click",
  optin: "Opt-in",
  purchase: "Purchase",
};

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  await connection();
  const { workspaceId: ws } = await requireSession();
  const sp = await searchParams;
  const tab: TabKey = TABS.includes(sp.tab as TabKey) ? (sp.tab as TabKey) : "overview";
  const posts = listPostsWithFunnel(ws);
  const selected = posts.find((p) => p.id === sp.post) ?? posts[0];
  const href = (q: Record<string, string | undefined>) =>
    `/track?${new URLSearchParams(Object.entries({ tab, post: selected?.id, ...q }).filter((e): e is [string, string] => !!e[1]))}`;

  return (
    <Workspace
      activeTab={tab}
      tabs={[
        { key: "overview", label: "Overview", href: href({ tab: "overview" }) },
        { key: "posts", label: "Content → conversion", href: href({ tab: "posts" }) },
        { key: "links", label: "Links & keywords", href: href({ tab: "links" }) },
      ]}
      sidebar={
        <SidebarSection title="Published posts">
          {posts.map((p) => (
            <SidebarLink key={p.id} href={href({ post: p.id })} active={p.id === selected?.id}>
              <div className="min-w-0">
                <div className="truncate">{p.caption}</div>
                <div className="text-[11px] text-muted">
                  {p.platform} · {compact(p.views)} views · {money(p.revenue_cents)}
                </div>
              </div>
            </SidebarLink>
          ))}
          {posts.length === 0 && <p className="text-xs text-muted">Mark an idea as posted to start tracking.</p>}
        </SidebarSection>
      }
      right={selected ? <PostPanel ws={ws} post={selected} /> : null}
    >
      <Flash />
      {tab === "overview" && <Overview ws={ws} posts={posts} href={href} />}
      {tab === "posts" && <PostsTable posts={posts} href={href} />}
      {tab === "links" && <LinksAndKeywords ws={ws} posts={posts} />}
    </Workspace>
  );
}

type Href = (q: Record<string, string | undefined>) => string;

function Overview({ ws, posts, href }: { ws: string; posts: PostWithFunnel[]; href: Href }) {
  const t = getTotals(ws);
  const events = listRecentEvents(ws);
  const best = [...posts].sort((a, b) => b.revenue_cents - a.revenue_cents)[0];
  return (
    <>
      <SectionTitle title="All content, last 30 days" subtitle="Every step from a view to a sale, joined back to the post that caused it." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Views" value={compact(t.views)} hint={`${compact(t.saves)} saves · ${pct(rate(t.saves, t.views))}`} />
        <Stat label="New followers" value={compact(t.follows)} hint={`${compact(t.profile_visits)} profile visits`} />
        <Stat label="Link clicks" value={compact(t.clicks)} hint={`${pct(rate(t.optins, t.clicks))} opt-in rate`} />
        <Stat label="Revenue" value={money(t.revenue_cents)} hint={`${t.purchases} purchases`} />
      </div>
      <div className="mt-6 grid gap-6 2xl:grid-cols-[1fr_22rem]">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Funnel — all posts</h3>
          <FunnelChart steps={funnelSteps(t)} />
          <p className="mt-3 text-xs text-muted">
            Includes {compact(t.clicks - posts.reduce((a, p) => a + p.clicks, 0))} link-in-bio clicks that can&apos;t be tied to a single post.
            Use a per-post keyword or link to attribute exactly.
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Live events</h3>
          <ul className="space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-2">
                <EventIcon type={e.type} />
                <div className="min-w-0 flex-1">
                  <div>
                    {EVENT_LABEL[e.type] ?? e.type}
                    {e.value_cents > 0 && <span className="font-semibold"> · {money(e.value_cents)}</span>}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {e.post_caption ?? (e.type === "link_click" ? "Link in bio" : "Unattributed")} · {e.source}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-muted">{ago(e.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {best && best.revenue_cents > 0 && (
        <Card className="mt-6 flex items-center gap-4 p-5">
          <ShoppingBag className="text-good" />
          <div className="flex-1 text-sm">
            <span className="font-semibold">{best.caption}</span> is your top earner:{" "}
            {money(best.revenue_cents)} from {compact(best.views)} views ({perThousand(best.revenue_cents, best.views)} per 1k views).
          </div>
          <Link href={href({ post: best.id, tab: "posts" })} className="text-sm text-accent underline">
            See funnel
          </Link>
        </Card>
      )}
    </>
  );
}

function PostsTable({ posts, href }: { posts: PostWithFunnel[]; href: Href }) {
  const cols: [string, (p: PostWithFunnel) => string][] = [
    ["Views", (p) => compact(p.views)],
    ["Saves", (p) => pct(rate(p.saves, p.views))],
    ["Follows", (p) => compact(p.follows)],
    ["Keyword", (p) => compact(p.keyword_comments)],
    ["Clicks", (p) => compact(p.clicks)],
    ["Opt-ins", (p) => compact(p.optins)],
    ["Sales", (p) => String(p.purchases)],
    ["Revenue", (p) => money(p.revenue_cents)],
    ["$/1k views", (p) => perThousand(p.revenue_cents, p.views)],
  ];
  return (
    <>
      <SectionTitle title="Content → conversion" subtitle="Which posts (and which formats) actually make money, not just views." />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="p-3">Post</th>
              {cols.map(([label]) => (
                <th key={label} className="p-3 text-right">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-background">
                <td className="p-3">
                  <Link href={href({ post: p.id })} className="font-medium hover:underline">{p.caption}</Link>
                  <div className="text-xs text-muted">
                    {p.platform} · {shortDate(p.published_at)} {p.format_name && `· ${p.format_name}`}
                  </div>
                </td>
                {cols.map(([label, get]) => (
                  <td key={label} className="p-3 text-right tabular-nums">{get(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

const input = "w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm";

function LinksAndKeywords({ ws, posts }: { ws: string; posts: PostWithFunnel[] }) {
  const links = listLinks(ws);
  const keywords = listKeywords(ws);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return (
    <>
      <SectionTitle title="Tracked links" subtitle={`Every /l/ link logs the click and passes a click id (cs_cid) to checkout.`} />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="p-3">Link</th>
              <th className="p-3">Attributed to</th>
              <th className="p-3 text-right">Clicks</th>
              <th className="p-3 text-right">Sales</th>
              <th className="p-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.slug} className="border-b border-line last:border-0">
                <td className="p-3">
                  <div className="font-mono text-xs">{appUrl}/l/{l.slug}</div>
                  <div className="truncate text-xs text-muted">→ {l.destination}</div>
                </td>
                <td className="p-3">{l.post_caption ?? <Badge>bio · by recency</Badge>}</td>
                <td className="p-3 text-right tabular-nums">{compact(l.clicks)}</td>
                <td className="p-3 text-right tabular-nums">{l.purchases}</td>
                <td className="p-3 text-right tabular-nums">{money(l.revenue_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h3 className="mb-2 mt-8 text-lg font-semibold">ManyChat keywords</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <Card key={k.keyword} className="px-3 py-2 text-sm">
            <span className="font-mono font-semibold">{k.keyword}</span>
            <span className="ml-2 text-muted">{compact(k.hits)} comments · {k.post_caption ?? "no post"}</span>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-5">
        <h3 className="mb-3 text-sm font-semibold">New tracked link / keyword</h3>
        <form action={createLink} className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted">
            Slug
            <input name="slug" required placeholder="blazer-guide" className={input} />
          </label>
          <label className="text-xs text-muted">
            Destination URL
            <input name="destination" type="url" required placeholder="https://yourstore.com/guide" className={input} />
          </label>
          <label className="text-xs text-muted">
            Post (leave empty for link in bio)
            <select name="post_id" className={input}>
              <option value="">— Link in bio —</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>{p.caption}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            ManyChat keyword (optional)
            <input name="keyword" placeholder="GUIDE" className={`${input} uppercase`} />
          </label>
          <label className="text-xs text-muted sm:col-span-2">
            Label
            <input name="label" placeholder="Blazer guide DM link" className={input} />
          </label>
          <button className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white sm:col-span-2">Create</button>
        </form>
      </Card>
    </>
  );
}

function PostPanel({ ws, post }: { ws: string; post: PostWithFunnel }) {
  const series = getPostMetricsSeries(ws, post.id);
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs text-muted">
          {post.platform} · posted {shortDate(post.published_at)}
        </div>
        <h3 className="font-semibold">{post.caption}</h3>
        {post.format_name && <div className="mt-1"><Badge>{post.format_name}</Badge></div>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Revenue" value={money(post.revenue_cents)} />
        <Stat label="$ / 1k views" value={perThousand(post.revenue_cents, post.views)} />
      </div>
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Views over time</h4>
        <Sparkline label={`Cumulative views for ${post.caption}`} points={series.map((s) => ({ x: s.captured_at, y: s.views }))} />
      </div>
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Funnel</h4>
        <FunnelChart steps={funnelSteps(post)} />
      </div>
      <div className="space-y-1 border-t border-line pt-4 text-xs text-muted">
        {post.keyword && (
          <div className="flex items-center gap-1.5">
            <MessageCircle size={12} /> Keyword <span className="font-mono font-semibold text-foreground">{post.keyword}</span>
          </div>
        )}
        {post.link_slug && (
          <div className="flex items-center gap-1.5">
            <Link2 size={12} /> /l/{post.link_slug}
          </div>
        )}
        {post.url && (
          <a href={post.url} target="_blank" rel="noreferrer" className="block text-accent underline">
            Open post
          </a>
        )}
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  const Icon = type === "purchase" ? ShoppingBag : type === "link_click" ? Link2 : MessageCircle;
  return (
    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${type === "purchase" ? "bg-emerald-50 text-good" : "bg-background text-muted"}`}>
      <Icon size={12} />
    </span>
  );
}
