"use client";

import Link from "next/link";
import { useState, useTransition, type DragEvent } from "react";
import { CalendarDays, Paperclip, Plus, X } from "lucide-react";
import { quickAddIdeaAction, reorderIdeas } from "@/app/actions";

export type BoardIdea = {
  id: string;
  title: string;
  hook: string;
  status: string;
  format_name: string | null;
  platform: string;
  scheduled_for: string | null;
  created_by: string;
  assets: number;
  thumb: string | null; // your own attached media
  thumb_is_video: boolean;
  ref_thumb: string | null; // the reference video's thumbnail (never posted)
  source_handle: string | null;
};

// Each stage says what "in this column" means, so the board reads like a process.
const STAGES: Record<string, { label: string; hint: string; limit?: number }> = {
  idea: { label: "Ideas", hint: "Saved videos and raw ideas. Top = next up." },
  scripting: { label: "Scripting", hint: "Writing the hook and beats." },
  producing: { label: "Producing", hint: "Filming or generating. Finish before starting more.", limit: 3 },
  ready: { label: "Ready", hint: "Script done, new media made. Only Ready ideas can be scheduled." },
  scheduled: { label: "Scheduled", hint: "Dated on the calendar. Schedule from the Calendar tab." },
  posted: { label: "Posted", hint: "Live and tracked. Use Mark posted on the card." },
};

type Columns = Record<string, BoardIdea[]>;

// Scheduled needs a date (set on the calendar); Posted needs Mark posted.
function dropBlocked(status: string, idea: BoardIdea | undefined): string | null {
  if (!idea) return null;
  if (status === "scheduled" && !idea.scheduled_for) return "Move it to Ready, then drag it onto a day in the Calendar.";
  if (status === "posted" && idea.status !== "posted") return "Open the card and use Mark posted with the post's URL.";
  return null;
}

function group(ideas: BoardIdea[], statuses: readonly string[]): Columns {
  const cols: Columns = Object.fromEntries(statuses.map((s) => [s, []]));
  for (const idea of ideas) (cols[idea.status] ??= []).push(idea);
  return cols;
}

export function KanbanBoard({ ideas, statuses, selectedId }: { ideas: BoardIdea[]; statuses: readonly string[]; selectedId?: string }) {
  // Local copy for instant feedback while the server saves; resets when the server sends new data.
  const [state, setState] = useState(() => ({ source: ideas, cols: group(ideas, statuses) }));
  if (state.source !== ideas) setState({ source: ideas, cols: group(ideas, statuses) });
  const cols = state.cols;

  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ status: string; index: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const dragging = dragId ? Object.values(cols).flat().find((i) => i.id === dragId) : undefined;

  function onDragOverColumn(e: DragEvent, status: string) {
    if (!dragId || dropBlocked(status, dragging)) return;
    e.preventDefault();
    // Insert before the first card whose midpoint is below the pointer.
    const cards = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>("[data-card]")];
    const index = cards.findIndex((c) => e.clientY < c.getBoundingClientRect().top + c.offsetHeight / 2);
    const next = { status, index: index === -1 ? cards.length : index };
    if (drop?.status !== next.status || drop.index !== next.index) setDrop(next);
  }

  function onDrop(e: DragEvent, status: string) {
    e.preventDefault();
    if (!dragId || !drop) return;
    const moving = Object.values(cols).flat().find((i) => i.id === dragId);
    if (!moving) return;
    const previous = cols;
    const without = Object.fromEntries(Object.entries(cols).map(([s, list]) => [s, list.filter((i) => i.id !== dragId)]));
    // Indexes were measured with the dragged card still in place.
    const original = cols[status] ?? [];
    const from = original.findIndex((i) => i.id === dragId);
    const at = from !== -1 && from < drop.index ? drop.index - 1 : drop.index;
    const target = [...(without[status] ?? [])];
    target.splice(at, 0, { ...moving, status });
    const nextCols = { ...without, [status]: target };
    setState((s) => ({ ...s, cols: nextCols }));
    setDragId(null);
    setDrop(null);
    setError(null);
    startTransition(async () => {
      const res = await reorderIdeas(status, target.map((i) => i.id));
      if (res.error) {
        setError(res.error);
        setState((s) => ({ ...s, cols: previous }));
      }
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {error && <p className="mb-3 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">Couldn&apos;t move that card: {error}</p>}
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
        {statuses.map((status) => {
          const stage = STAGES[status] ?? { label: status, hint: "" };
          const list = cols[status] ?? [];
          const over = stage.limit !== undefined && list.length > stage.limit;
          const blocked = dropBlocked(status, dragging);
          return (
            <section
              key={status}
              aria-label={stage.label}
              onDragOver={(e) => onDragOverColumn(e, status)}
              onDrop={(e) => onDrop(e, status)}
              className={`relative flex w-64 shrink-0 flex-col rounded-xl bg-surface-2 transition-colors ${
                drop?.status === status ? "ring-2 ring-accent/40" : ""
              } ${blocked ? "opacity-60" : ""}`}
            >
              {blocked && (
                <p className="absolute inset-x-2 top-24 z-10 rounded-lg bg-surface px-3 py-2 text-center text-xs text-muted shadow-panel">{blocked}</p>
              )}
              <header className="px-3 pb-2 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{stage.label}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${over ? "bg-warn-soft text-warn" : "bg-sunken text-muted"}`}
                    title={stage.limit ? `Limit ${stage.limit} at a time` : undefined}
                  >
                    {stage.limit ? `${list.length} / ${stage.limit}` : list.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{stage.hint}</p>
              </header>

              <div className="min-h-16 flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                {list.map((idea, i) => (
                  <div key={idea.id}>
                    {drop?.status === status && drop.index === i && <DropLine />}
                    <IdeaCard idea={idea} selected={idea.id === selectedId} dragging={idea.id === dragId} onDragStart={() => setDragId(idea.id)} onDragEnd={() => { setDragId(null); setDrop(null); }} />
                  </div>
                ))}
                {drop?.status === status && drop.index === list.length && <DropLine />}
                {list.length === 0 && drop?.status !== status && (
                  <p className="rounded-lg border border-dashed border-line-strong px-2 py-4 text-center text-xs text-muted">
                    {status === "idea" ? (
                      <>Save videos from <Link href="/discover?tab=videos" className="text-accent-ink underline">Discover</Link> or add one below</>
                    ) : (
                      "Drag cards here"
                    )}
                  </p>
                )}
              </div>

              {status !== "scheduled" && status !== "posted" && <QuickAdd status={status} />}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DropLine() {
  return <div className="my-1 h-0.5 rounded-full bg-accent" aria-hidden />;
}

function IdeaCard({
  idea,
  selected,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  idea: BoardIdea;
  selected: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <Link
      href={`/recreate?tab=board&idea=${idea.id}`}
      data-card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", idea.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`block cursor-grab rounded-lg border bg-surface p-2.5 shadow-panel transition active:cursor-grabbing ${
        selected ? "border-accent ring-1 ring-accent" : "border-line hover:border-line-strong"
      } ${dragging ? "opacity-40" : ""}`}
    >
      <div className="flex gap-2.5">
        {idea.thumb ? (
          <div className="relative aspect-[9/16] w-11 shrink-0 overflow-hidden rounded-md bg-media" title="Your media">
            {idea.thumb_is_video ? (
              <video src={idea.thumb} muted preload="metadata" className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded media
              <img src={idea.thumb} alt="" draggable={false} className="h-full w-full object-cover" />
            )}
          </div>
        ) : idea.ref_thumb ? (
          <div className="relative aspect-[9/16] w-11 shrink-0 overflow-hidden rounded-md bg-media" title="Reference video: recreate it, don't repost it">
            {/* eslint-disable-next-line @next/next/no-img-element -- proxied platform thumbnail */}
            <img src={idea.ref_thumb} alt="" draggable={false} className="h-full w-full object-cover opacity-60 grayscale" />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 py-px text-center text-[9px] font-semibold uppercase tracking-wide text-white">Ref</span>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug [overflow-wrap:anywhere]">{idea.title}</p>
          {idea.source_handle && <p className="truncate text-[11px] text-muted">Reference: @{idea.source_handle}</p>}
          {idea.hook && idea.hook !== idea.title && <p className="mt-1 line-clamp-2 text-xs text-muted">&ldquo;{idea.hook}&rdquo;</p>}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
        {idea.format_name && <span className="max-w-full truncate rounded-full bg-sunken px-2 py-0.5">{idea.format_name}</span>}
        {idea.created_by === "claude" && <span className="rounded-full bg-ai-soft px-2 py-0.5 font-medium text-ai">claude</span>}
        {!idea.thumb && (idea.status === "producing" || idea.status === "ready" || idea.status === "scheduled") && (
          <span className="rounded-full bg-warn-soft px-2 py-0.5 font-medium text-warn" title="Attach your own image or video before posting">Needs media</span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <span className="font-medium uppercase">{idea.platform === "tiktok" ? "TT" : "IG"}</span>
          {idea.assets > 0 && (
            <span className="flex items-center gap-0.5" title={`${idea.assets} attached`}>
              <Paperclip size={11} /> {idea.assets}
            </span>
          )}
          {idea.scheduled_for && (
            <span className="flex items-center gap-0.5">
              <CalendarDays size={11} />
              {new Date(idea.scheduled_for).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}

function QuickAdd({ status }: { status: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm mx-2 mb-2 justify-start">
        <Plus size={14} /> Add a card
      </button>
    );
  }
  return (
    <form
      action={async (form) => {
        await quickAddIdeaAction(form);
        setOpen(false);
      }}
      className="mx-2 mb-2 space-y-1.5"
    >
      <input type="hidden" name="status" value={status} />
      <input name="title" required autoFocus placeholder="What's the idea?" aria-label="New card title" className="field" />
      <div className="flex gap-1.5">
        <button className="btn btn-primary btn-sm">Add</button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm" aria-label="Cancel">
          <X size={14} />
        </button>
      </div>
    </form>
  );
}
