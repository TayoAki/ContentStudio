"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type DragEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { setIdeaDate, setIdeaPlannedDate } from "@/app/actions";
import type { BoardIdea } from "./kanban-board";

type View = "month" | "week";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// Weeks start on Monday.
const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

const STATUS_STYLE: Record<string, string> = {
  posted: "border-good/40 bg-good-soft",
  scheduled: "border-info/40 bg-info-soft",
};
const PLANNED_STYLE = "border-dashed border-line-strong bg-surface text-muted";

// Ready and Scheduled ideas get a publish date; earlier stages only a planned date.
const publishable = (status: string) => status === "ready" || status === "scheduled";
type Entry = { idea: BoardIdea; planned: boolean };

export function ContentCalendar({ ideas }: { ideas: BoardIdea[] }) {
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [overrides, setOverrides] = useState<Record<string, string | null>>({});
  const [planOverrides, setPlanOverrides] = useState<Record<string, string | null>>({});
  const [showPlanned, setShowPlanned] = useState(true);
  const [source, setSource] = useState(ideas);
  if (source !== ideas) {
    setSource(ideas);
    setOverrides({});
    setPlanOverrides({});
  }
  const [dragId, setDragId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const items = useMemo(
    () =>
      ideas.map((i) => ({
        ...i,
        scheduled_for: i.id in overrides ? overrides[i.id] : i.scheduled_for,
        planned_for: i.id in planOverrides ? planOverrides[i.id] : i.planned_for,
      })),
    [ideas, overrides, planOverrides],
  );
  // Publish dates first on each day, then planned work.
  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    const add = (iso: string, entry: Entry) => {
      const k = dayKey(new Date(iso));
      map.set(k, [...(map.get(k) ?? []), entry]);
    };
    for (const i of items) if (i.scheduled_for) add(i.scheduled_for, { idea: i, planned: false });
    if (showPlanned) {
      for (const i of items) if (!i.scheduled_for && i.planned_for && i.status !== "posted") add(i.planned_for, { idea: i, planned: true });
    }
    return map;
  }, [items, showPlanned]);
  // Only finished work can be dated.
  const unscheduled = items.filter((i) => !i.scheduled_for && i.status === "ready");

  const days = useMemo(() => {
    if (view === "week") return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i));
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const start = startOfWeek(first);
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const weeks = Math.ceil(((last.getTime() - start.getTime()) / 86_400_000 + 1) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  }, [view, anchor]);

  const today = dayKey(new Date());
  const title =
    view === "month"
      ? anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  function move(delta: number) {
    setAnchor((a) => (view === "month" ? new Date(a.getFullYear(), a.getMonth() + delta, 1) : addDays(a, delta * 7)));
  }

  // Planned dates are whole days; noon UTC keeps them on the same day everywhere.
  function plan(ideaId: string, day: Date) {
    const when = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    setPlanOverrides((o) => ({ ...o, [ideaId]: `${when}T12:00:00.000Z` }));
    setError(null);
    startTransition(async () => {
      const res = await setIdeaPlannedDate(ideaId, when);
      if (res.error) {
        setError(res.error);
        setPlanOverrides((o) => {
          const rest = { ...o };
          delete rest[ideaId];
          return rest;
        });
      }
    });
  }

  function drop(ideaId: string, day: Date | null) {
    const idea = items.find((i) => i.id === ideaId);
    if (!idea) return;
    if (publishable(idea.status)) schedule(ideaId, day);
    else if (day) plan(ideaId, day);
  }

  function schedule(ideaId: string, day: Date | null) {
    const existing = items.find((i) => i.id === ideaId);
    // Keep the time of day when rescheduling; new dates default to 9am local.
    let when: string | null = null;
    if (day) {
      const prev = existing?.scheduled_for ? new Date(existing.scheduled_for) : null;
      when = new Date(day.getFullYear(), day.getMonth(), day.getDate(), prev?.getHours() ?? 9, prev?.getMinutes() ?? 0).toISOString();
    }
    setOverrides((o) => ({ ...o, [ideaId]: when }));
    setError(null);
    startTransition(async () => {
      const res = await setIdeaDate(ideaId, when);
      if (res.error) {
        setError(res.error);
        setOverrides((o) => {
          const rest = { ...o };
          delete rest[ideaId];
          return rest;
        });
      }
    });
  }

  const dragging = dragId ? items.find((i) => i.id === dragId) : undefined;
  const dropProps = (key: string, day: Date | null) => ({
    onDragOver: (e: DragEvent) => {
      if (!dragging) return;
      // The tray only takes publishable ideas; planned work stays on a day.
      if (!day && !publishable(dragging.status)) return;
      e.preventDefault();
      if (overKey !== key) setOverKey(key);
    },
    onDragLeave: () => setOverKey((k) => (k === key ? null : k)),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (dragId) drop(dragId, day);
      setDragId(null);
      setOverKey(null);
    },
  });

  const chip = (i: BoardIdea, large = false, planned = false) => (
    <CalendarItem key={i.id} idea={i} large={large} planned={planned} onDragStart={() => setDragId(i.id)} onDragEnd={() => { setDragId(null); setOverKey(null); }} />
  );

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-lg font-semibold tracking-tight">{title}</h2>
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted">
            <input type="checkbox" checked={showPlanned} onChange={(e) => setShowPlanned(e.target.checked)} className="accent-[var(--accent)]" />
            Show planned
          </label>
          <div className="flex rounded-lg border border-line-strong p-0.5" role="group" aria-label="Calendar view">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-sm capitalize transition-colors ${view === v ? "bg-accent text-accent-fg" : "text-muted hover:text-foreground"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setAnchor(new Date())} className="btn btn-secondary">Today</button>
          <button type="button" onClick={() => move(-1)} className="btn btn-secondary px-2" aria-label={`Previous ${view}`}><ChevronLeft size={16} /></button>
          <button type="button" onClick={() => move(1)} className="btn btn-secondary px-2" aria-label={`Next ${view}`}><ChevronRight size={16} /></button>
        </div>
        {error && <p className="mb-3 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">Couldn&apos;t reschedule: {error}</p>}

        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="grid grid-cols-7 border-b border-line bg-surface-2 text-xs text-muted">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className="px-2 py-2">
                {view === "week" ? `${d} ${days[i].getDate()}` : d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const k = dayKey(day);
              const inMonth = view === "week" || day.getMonth() === anchor.getMonth();
              const list = byDay.get(k) ?? [];
              return (
                <div
                  key={k}
                  {...dropProps(k, day)}
                  className={`border-b border-r border-line p-1.5 transition-colors [&:nth-child(7n)]:border-r-0 ${
                    view === "week" ? "min-h-[28rem]" : "min-h-28"
                  } ${inMonth ? "" : "bg-surface-2/60"} ${overKey === k ? "bg-accent-soft" : ""}`}
                >
                  {view === "month" && (
                    <div className={`mb-1 flex size-6 items-center justify-center rounded-full text-xs tabular-nums ${
                      k === today ? "bg-accent font-semibold text-accent-fg" : inMonth ? "text-foreground" : "text-muted"
                    }`}>
                      {day.getDate()}
                    </div>
                  )}
                  <div className="space-y-1">{list.map((e) => chip(e.idea, view === "week", e.planned))}</div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Only Ready ideas can be scheduled: drag one onto a day to schedule it (it moves to Scheduled), or between days to reschedule.
          Dashed chips are planned dates for ideas still in progress; drag them to change the plan.
        </p>
      </div>

      <aside
        {...dropProps("tray", null)}
        aria-label="Unscheduled"
        className={`w-full shrink-0 rounded-xl border border-line bg-surface-2 p-3 transition-colors xl:w-64 ${overKey === "tray" ? "bg-accent-soft" : ""}`}
      >
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Inbox size={14} /> Unscheduled <span className="ml-auto text-xs font-normal tabular-nums text-muted">{unscheduled.length}</span>
        </h3>
        <p className="mb-2 text-xs text-muted">Ready ideas waiting for a date. Drag onto a day; drop back here to unschedule.</p>
        <div className="space-y-1.5">
          {unscheduled.map((i) => chip(i, true))}
          {unscheduled.length === 0 && (
            <p className="py-4 text-center text-xs text-muted">
              Nothing is Ready. Finish an idea on the <Link href="/recreate" className="text-accent-ink underline">board</Link> and move it to Ready to schedule it.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function CalendarItem({ idea, large, planned, onDragStart, onDragEnd }: { idea: BoardIdea; large: boolean; planned: boolean; onDragStart: () => void; onDragEnd: () => void }) {
  const draggable = idea.status !== "posted";
  const time = idea.scheduled_for ? new Date(idea.scheduled_for).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;
  let thumb: ReactNode = null;
  if (idea.thumb && large) {
    thumb = idea.thumb_is_video ? (
      <video src={idea.thumb} muted preload="metadata" className="aspect-[9/16] w-8 shrink-0 rounded object-cover" />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- proxied or uploaded media
      <img src={idea.thumb} alt="" draggable={false} className="aspect-[9/16] w-8 shrink-0 rounded object-cover" />
    );
  }
  return (
    <Link
      href={`/recreate?tab=calendar&idea=${idea.id}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", idea.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      title={planned ? `Planned: ${idea.title} (${idea.status})` : idea.title}
      className={`flex items-center ${draggable ? "cursor-grab active:cursor-grabbing" : ""} gap-1.5 rounded-md border px-1.5 py-1 text-[11px] leading-tight ${
        planned ? PLANNED_STYLE : STATUS_STYLE[idea.status] ?? "border-line bg-surface"
      }`}
    >
      {thumb}
      <span className="min-w-0 flex-1">
        <span className={`block font-medium ${large ? "line-clamp-2" : "truncate"}`}>{idea.title}</span>
        <span className="block truncate text-muted">
          {planned ? <span className="font-medium">Planned · {idea.status} · </span> : null}
          {!planned && !idea.thumb && idea.status !== "posted" ? <span className="font-medium text-warn">Needs media · </span> : null}
          {idea.platform === "tiktok" ? "TikTok" : "Instagram"}
          {time && !planned && idea.status !== "posted" ? ` · ${time}` : ""}
          {idea.status === "posted" ? " · posted" : ""}
        </span>
      </span>
    </Link>
  );
}
