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
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-line bg-surface md:block">{sidebar}</aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 border-b border-line bg-surface">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`flex-1 border-r border-line px-4 py-3 text-center text-sm last:border-r-0 ${
                t.key === activeTab ? "bg-background font-semibold text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
      </main>
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-line bg-surface p-5 xl:block">{right}</aside>
    </div>
  );
}

export function SidebarSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-line p-4 last:border-b-0">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
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
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
        active ? "bg-accent-soft font-medium text-accent" : "text-foreground hover:bg-background"
      }`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface ${className}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

const BADGE: Record<string, string> = {
  winner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  testing: "bg-amber-50 text-amber-700 border-amber-200",
  watching: "bg-zinc-50 text-zinc-600 border-zinc-200",
  retired: "bg-zinc-50 text-zinc-400 border-zinc-200",
  posted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  claude: "bg-orange-50 text-orange-700 border-orange-200",
};

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${BADGE[tone ?? ""] ?? "border-line bg-background text-muted"}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
