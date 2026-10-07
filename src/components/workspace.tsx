import Link from "next/link";
import type { ReactNode } from "react";

export type Tab = { key: string; label: string; href: string };

// The three-column body of the wireframe: sidebar | tabs + main | right bar.
export function Workspace({
  sidebar,
  tabs,
  activeTab,
  right,
  children,
}: {
  sidebar: ReactNode;
  tabs: Tab[];
  activeTab: string;
  right: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-line bg-surface-2 md:block">{sidebar}</aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <nav aria-label="Views" className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-surface px-4">
          {tabs.map((t) => {
            const active = t.key === activeTab;
            return (
              <Link
                key={t.key}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors ${
                  active ? "border-accent font-semibold text-foreground" : "border-transparent text-muted hover:border-line-strong hover:text-foreground"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </main>
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-line bg-surface p-5 xl:block">{right}</aside>
    </div>
  );
}

export function SidebarSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-line px-4 py-4 last:border-b-0">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SidebarLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        active ? "bg-accent-soft font-medium text-accent-ink" : "text-foreground hover:bg-sunken"
      }`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface ${className}`}>{children}</div>;
}

// A single row of metrics with dividers, rather than a grid of stat cards.
export function StatStrip({ items }: { items: { label: string; value: string; hint?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 divide-line rounded-xl border border-line bg-surface lg:grid-cols-4 lg:divide-x">
      {items.map((s) => (
        <div key={s.label} className="px-5 py-4">
          <dt className="text-xs text-muted">{s.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{s.value}</dd>
          {s.hint && <dd className="mt-0.5 text-xs text-muted">{s.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

// Compact label/value pair for side panels.
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2.5">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

const BADGE: Record<string, string> = {
  winner: "bg-good-soft text-good",
  posted: "bg-good-soft text-good",
  testing: "bg-warn-soft text-warn",
  scheduled: "bg-info-soft text-info",
  claude: "bg-ai-soft text-ai",
  watching: "bg-sunken text-muted",
  retired: "bg-sunken text-muted line-through",
};

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE[tone ?? ""] ?? "bg-sunken text-muted"}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 max-w-[75ch] text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Empty states teach the next step instead of saying "nothing here".
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-8 text-center">
      <p className="font-medium">{title}</p>
      <div className="mx-auto mt-1 max-w-[60ch] text-sm text-muted">{children}</div>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
