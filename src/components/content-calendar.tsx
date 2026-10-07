"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type DragEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { setIdeaDate } from "@/app/actions";
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

export function ContentCalendar({ ideas }: { ideas: BoardIdea[] }) {
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [overrides, setOverrides] = useState<Record<string, string | null>>({});
  const [source, setSource] = useState(ideas);
  if (source !== ideas) {
    setSource(ideas);
    setOverrides({});
  }
  const [dragId, setDragId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const items = useMemo(
    () => ideas.map((i) => (i.id in overrides ? { ...i, scheduled_for: overrides[i.id] } : i)),
    [ideas, overrides],
  );
  const byDay = useMemo(() => {
    const map = new Map<string, BoardIdea[]>();
    for (const i of items) {
      if (!i.scheduled_for) continue;
      const k = dayKey(new Date(i.scheduled_for));
      map.set(k, [...(map.get(k) ?? []), i]);
    }
    return map;
  }, [items]);
  const unscheduled = items.filter((i) => !i.scheduled_for && i.status !== "posted");

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

  const dropProps = (key: string, day: Date | null) => ({
    onDragOver: (e: DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      if (overKey !== key) setOverKey(key);
    },
    onDragLeave: () => setOverKey((k) => (k === key ? null : k)),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (dragId) schedule(dragId, day);
      setDragId(null);
      setOverKey(null);
    },
  });

  const chip = (i: BoardIdea, large = false) => (
    <CalendarItem key={i.id} idea={i} large={large} onDragStart={() => setDragId(i.id)} onDragEnd={() => { setDragId(null); setOverKey(null); }} />
  );

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-lg font-semibold tracking-tight">{title}</h2>
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
                  <div className="space-y-1">{list.map((i) => chip(i, view === "week"))}</div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Drag ideas onto a day to schedule them; drag between days to reschedule. Scheduling a Ready idea moves it to Scheduled.
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
        <p className="mb-2 text-xs text-muted">Drag onto the calendar. Drop here to unschedule.</p>
        <div className="space-y-1.5">
          {unscheduled.map((i) => chip(i, true))}
          {unscheduled.length === 0 && <p className="py-4 text-center text-xs text-muted">Everything in progress has a date.</p>}
        </div>
      </aside>
    </div>
  );
}

function CalendarItem({ idea, large, onDragStart, onDragEnd }: { idea: BoardIdea; large: boolean; onDragStart: () => void; onDragEnd: () => void }) {
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
      draggable={idea.status !== "posted"}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", idea.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      title={idea.title}
      className={`flex items-center ${idea.status === "posted" ? "" : "cursor-grab active:cursor-grabbing"} gap-1.5 rounded-md border px-1.5 py-1 text-[11px] leading-tight ${
        STATUS_STYLE[idea.status] ?? "border-line bg-surface"
      }`}
    >
      {thumb}
      <span className="min-w-0 flex-1">
        <span className={`block font-medium ${large ? "line-clamp-2" : "truncate"}`}>{idea.title}</span>
        <span className="block truncate text-muted">
          {idea.platform === "tiktok" ? "TikTok" : "Instagram"}
          {time && idea.status !== "posted" ? ` · ${time}` : ""}
          {idea.status === "posted" ? " · posted" : ""}
        </span>
      </span>
    </Link>
  );
}
