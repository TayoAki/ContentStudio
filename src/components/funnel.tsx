import { compact, pct, rate } from "@/lib/format";

export type Step = { label: string; value: number };

// Single-series horizontal funnel. Bars are scaled per step against the first
// step on a sqrt scale so small late-funnel steps stay visible; the exact value
// and step-to-step conversion are always printed beside each bar.
export function FunnelChart({ steps }: { steps: Step[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <div className="space-y-2" role="table" aria-label="Conversion funnel">
      {steps.map((s, i) => {
        const prev = steps[i - 1];
        const width = Math.max(1.5, Math.sqrt(s.value / top) * 100);
        const conv = prev && prev.value > 0 ? rate(s.value, prev.value) : null;
        return (
          <div
            key={s.label}
            role="row"
            className="group grid grid-cols-[9rem_1fr_4.5rem] items-center gap-3 text-sm"
            title={`${s.label}: ${s.value.toLocaleString()}${conv !== null ? ` (${pct(conv)} of ${prev!.label.toLowerCase()})` : ""}`}
          >
            <span role="cell" className="truncate text-muted">{s.label}</span>
            <span role="cell" className="h-5 rounded-sm bg-sunken">
              <span
                className="block h-full rounded-r bg-accent opacity-85 transition-opacity group-hover:opacity-100"
                style={{ width: `${width}%` }}
              />
            </span>
            <span role="cell" className="text-right tabular-nums">
              <span className="font-semibold">{compact(s.value)}</span>
              {conv !== null && <span className="block text-[11px] text-muted">{pct(conv)}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Cumulative views over time for one post.
export function Sparkline({ points, label }: { points: { x: string; y: number }[]; label: string }) {
  if (points.length < 2) return null;
  const w = 260;
  const h = 64;
  const max = Math.max(...points.map((p) => p.y), 1);
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - 4 - (p.y / max) * (h - 8)] as const);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" role="img" aria-label={label}>
      <line x1="0" x2={w} y1={h - 4} y2={h - 4} stroke="var(--line)" strokeWidth="1" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill="transparent">
          <title>{`${new Date(points[i].x).toLocaleDateString("en", { month: "short", day: "numeric" })}: ${points[i].y.toLocaleString()}`}</title>
        </circle>
      ))}
    </svg>
  );
}
