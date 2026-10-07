import Link from "next/link";
import { connection } from "next/server";
import { Bot, FileText, Film, ImageIcon } from "lucide-react";
import { attachAssetAction, deleteAssetAction, markPosted, moveIdea, saveIdea } from "@/app/actions";
import { ContentCalendar } from "@/components/content-calendar";
import { KanbanBoard, type BoardIdea } from "@/components/kanban-board";
import { Uploader } from "@/components/uploader";
import { Flash } from "@/components/flash";
import { Badge, EmptyState, SectionTitle, SidebarLink, SidebarSection, Workspace } from "@/components/workspace";
import { requireSession } from "@/lib/auth";
import { compact } from "@/lib/format";
import { thumbSrc } from "@/lib/thumbs";
import { VideoTile } from "@/components/video-tile";
import { IDEA_STATUSES, listAssets, listFormats, listIdeas, type Asset, type Idea } from "@/lib/queries";

const TABS = ["board", "calendar", "library"] as const;
type TabKey = (typeof TABS)[number];

export default async function RecreatePage({ searchParams }: PageProps<"/recreate">) {
  await connection();
  const { workspaceId: ws } = await requireSession();
  const sp = await searchParams;
  const tab: TabKey = TABS.includes(sp.tab as TabKey) ? (sp.tab as TabKey) : "board";
  const ideas = listIdeas(ws);
  const selected = ideas.find((i) => i.id === sp.idea);
  const href = (q: Record<string, string | undefined>) =>
    `/recreate?${new URLSearchParams(Object.entries({ tab, idea: selected?.id, ...q }).filter((e): e is [string, string] => !!e[1]))}`;

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
      right={selected ? <IdeaEditor ws={ws} idea={selected} /> : tab === "library" ? <ClaudeHandoff /> : null}
    >
      <Flash />
      {tab === "board" && <Board ideas={ideas} selectedId={selected?.id} />}
      {tab === "calendar" && <ContentCalendar ideas={ideas.map(toBoard)} />}
      {tab === "library" && <Library ws={ws} filter={typeof sp.filter === "string" ? sp.filter : "all"} href={href} />}
    </Workspace>
  );
}

type Href = (q: Record<string, string | undefined>) => string;

// Shape the board and calendar share: plus a thumbnail (attached media first,
// then the video being replicated).
function toBoard(i: Idea): BoardIdea {
  return {
    id: i.id,
    title: i.title,
    hook: i.hook,
    status: i.status,
    format_name: i.format_name,
    platform: i.platform,
    scheduled_for: i.scheduled_for,
    planned_for: i.planned_for,
    created_by: i.created_by,
    assets: i.assets,
    thumb: i.cover_url,
    thumb_is_video: !!i.cover_url && i.cover_kind === "video",
    ref_thumb: thumbSrc(i.source_thumbnail),
    source_handle: i.source_handle,
  };
}

function Board({ ideas, selectedId }: { ideas: Idea[]; selectedId?: string }) {
  return (
    <>
      <SectionTitle
        title="Ideas pipeline"
        subtitle="Drag cards right as they progress and up or down to set priority. The top of each column is what to work on next."
      />
      <KanbanBoard ideas={ideas.map(toBoard)} statuses={IDEA_STATUSES} selectedId={selectedId} />
    </>
  );
}

const KIND_ICON = { image: ImageIcon, video: Film } as Record<string, typeof FileText>;

function AssetPreview({ asset, className = "" }: { asset: Asset; className?: string }) {
  const Icon = KIND_ICON[asset.kind] ?? FileText;
  if (asset.kind === "video" && asset.url.startsWith("/api/uploads/")) {
    return <video src={asset.url} controls preload="metadata" playsInline className={`h-full w-full bg-media object-contain ${className}`} />;
  }
  if (asset.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element -- uploaded or external media
    return <img src={asset.url} alt={asset.label} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <span className={`grid h-full w-full place-items-center bg-sunken text-muted ${className}`}>
      <Icon size={28} />
    </span>
  );
}

const fileSize = (n: number | null) => (n ? (n > 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`) : null);

function Library({ ws, filter, href }: { ws: string; filter: string; href: Href }) {
  const all = listAssets(ws);
  const assets = filter === "unlinked" ? all.filter((a) => !a.idea_id) : all;
  const ideas = listIdeas(ws).filter((i) => i.status !== "posted");
  return (
    <>
      <SectionTitle
        title="Asset library"
        subtitle="Everything you upload or Claude generates. Link media to an idea and it shows on the board and calendar."
        action={
          <div className="flex rounded-lg border border-line-strong p-0.5 text-sm" role="group" aria-label="Filter">
            {[["all", `All ${all.length}`], ["unlinked", `Unlinked ${all.filter((a) => !a.idea_id).length}`]].map(([key, label]) => (
              <Link key={key} href={href({ tab: "library", filter: key === "all" ? undefined : key })}
                className={`rounded-md px-3 py-1 ${filter === key || (key === "all" && filter !== "unlinked") ? "bg-accent text-accent-fg" : "text-muted hover:text-foreground"}`}>
                {label}
              </Link>
            ))}
          </div>
        }
      />
      <Uploader />
      {assets.length === 0 && (
        <div className="mt-4">
          <EmptyState title={filter === "unlinked" ? "Nothing unlinked" : "No media yet"}>
            Upload your own footage and images above. When Claude generates media it can upload it too (PUT to{" "}
            <code className="font-mono text-xs">/api/uploads</code> with your API key) or attach links with <code className="font-mono text-xs">add_assets</code>.
          </EmptyState>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-5">
        {assets.map((a) => (
          <div key={a.id} className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="aspect-[9/16] overflow-hidden bg-media">
              <AssetPreview asset={a} />
            </div>
            <div className="space-y-2 p-2.5 text-xs">
              <div>
                <p className="truncate text-sm font-medium" title={a.filename ?? a.label}>{a.label || a.kind}</p>
                <p className="text-muted">{[a.kind, fileSize(a.size), a.created_by === "claude" ? "by Claude" : null].filter(Boolean).join(" · ")}</p>
              </div>
              <form action={attachAssetAction} className="flex gap-1.5">
                <input type="hidden" name="asset_id" value={a.id} />
                <select name="idea_id" defaultValue={a.idea_id ?? ""} aria-label="Linked idea" className="field min-w-0 py-1 text-xs">
                  <option value="">Not linked</option>
                  {ideas.map((i) => (
                    <option key={i.id} value={i.id}>{i.title.slice(0, 60)}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-sm">Link</button>
              </form>
              <form action={deleteAssetAction}>
                <input type="hidden" name="asset_id" value={a.id} />
                <button className="btn btn-ghost btn-sm text-bad">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const input = "field";

function IdeaEditor({ ws, idea }: { ws: string; idea: Idea }) {
  const assets = listAssets(ws, idea.id);
  const library = listAssets(ws).filter((a) => !a.idea_id);
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
        <div className="rounded-lg border border-line bg-background p-2">
          <p className="mb-2 rounded-md bg-warn-soft px-2 py-1.5 text-xs text-warn">
            <b>Reference, not content.</b> Recreate the format with your own script and new media. Don&apos;t repost the original.
          </p>
          <div className="flex gap-3">
          <div className="w-20 shrink-0">
            <VideoTile url={idea.source_url ?? undefined} thumbnail={idea.source_thumbnail} videoUrl={idea.source_video_url} slides={idea.source_slides} audioUrl={idea.source_audio_url} platform={idea.source_platform ?? undefined} hook={idea.source_hook ?? ""} views={idea.source_views ?? 0} likes={idea.source_likes ?? 0} saves={idea.source_saves ?? 0} />
          </div>
          <div className="min-w-0 text-xs">
            <div className="font-semibold text-muted">Reference video</div>
            <div className="mt-0.5 font-medium">@{idea.source_handle}</div>
            <div className="mt-1 space-y-0.5 tabular-nums text-muted">
              {!!idea.source_views && <div>{compact(idea.source_views)} views</div>}
              {!!idea.source_likes && <div>{compact(idea.source_likes)} likes</div>}
              {!!idea.source_saves && <div>{compact(idea.source_saves)} saves</div>}
            </div>
            {idea.source_url && (
              <a href={idea.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-accent underline">Watch reference</a>
            )}
          </div>
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
              {IDEA_STATUSES.filter(
                (s) => s === idea.status || (s !== "posted" && (s !== "scheduled" || idea.status === "ready")),
              ).map((s) => (
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
        {idea.status !== "posted" && (
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs text-muted">
              Planned date
              <input type="date" name="planned_for" defaultValue={idea.planned_for?.slice(0, 10) ?? ""} className={input} />
              <span className="mt-0.5 block text-[11px]">Your target. Any stage.</span>
            </label>
            {idea.status === "ready" || idea.status === "scheduled" ? (
              <label className="block text-xs text-muted">
                Publish date
                <input type="date" name="scheduled_for" defaultValue={idea.scheduled_for?.slice(0, 10) ?? ""} className={input} />
                <span className="mt-0.5 block text-[11px]">Puts it on the calendar.</span>
              </label>
            ) : (
              <p className="self-start rounded-lg bg-surface-2 px-3 py-2 text-[11px] text-muted">
                Publish dates unlock in <b>Ready</b>, once the script and your own media are done.
              </p>
            )}
          </div>
        )}
        <button className="btn btn-primary btn-block">Save</button>
      </form>

      {idea.status !== "posted" && (
        <div className="flex flex-wrap gap-1">
          {IDEA_STATUSES.filter((s) => s !== idea.status && s !== "posted" && s !== "scheduled").map((s) => (
            <form key={s} action={moveIdea}>
              <input type="hidden" name="id" value={idea.id} />
              <input type="hidden" name="status" value={s} />
              <button className="btn btn-secondary btn-sm">→ {s}</button>
            </form>
          ))}
        </div>
      )}

      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted">Media ({assets.length})</h4>
        {assets.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2">
            {assets.map((a) => (
              <div key={a.id} className="group relative aspect-[9/16] overflow-hidden rounded-lg bg-media">
                <AssetPreview asset={a} />
                <form action={attachAssetAction} className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <input type="hidden" name="asset_id" value={a.id} />
                  <input type="hidden" name="idea_id" value="" />
                  <button className="rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white" title="Unlink from this idea">Unlink</button>
                </form>
              </div>
            ))}
          </div>
        )}
        <Uploader ideaId={idea.id} compact />
        {library.length > 0 && (
          <form action={attachAssetAction} className="mt-2 flex gap-1.5">
            <input type="hidden" name="idea_id" value={idea.id} />
            <select name="asset_id" aria-label="Pick from library" className="field min-w-0 py-1 text-xs" defaultValue="">
              <option value="" disabled>Pick from library…</option>
              {library.map((a) => (
                <option key={a.id} value={a.id}>{`${a.label || a.kind} (${a.kind})`}</option>
              ))}
            </select>
            <button className="btn btn-secondary btn-sm">Attach</button>
          </form>
        )}
      </div>

      {idea.status !== "posted" && (
        <form action={markPosted} className="space-y-2 border-t border-line pt-4">
          <input type="hidden" name="id" value={idea.id} />
          <label className="block text-xs text-muted">
            Published? Paste the post URL to start tracking
            <input name="url" type="url" placeholder="https://www.instagram.com/reel/…" className={input} />
          </label>
          <button className="btn btn-secondary btn-block">Mark posted → Track</button>
        </form>
      )}
    </div>
  );
}

function ClaudeHandoff() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <Bot size={16} className="text-ai" />
        <h3 className="font-semibold">Claude Code handoff</h3>
      </div>
      <p className="text-muted">
        Recreation happens in Claude Code. Copy a format brief from <Link href="/discover" className="text-accent underline">Discover</Link>,
        and Claude pushes scripts and generated media back here through the ingest API.
      </p>
      <pre className="overflow-x-auto rounded-lg bg-code-bg p-3 text-[11px] leading-relaxed text-code-fg">{`POST /api/ingest/ideas
POST /api/ingest/assets
POST /api/ingest/posts
Authorization: Bearer $CONTENTSTUDIO_API_KEY`}</pre>
      <p className="text-xs text-muted">Select an idea to edit its script, attach assets, and schedule it.</p>
    </div>
  );
}
