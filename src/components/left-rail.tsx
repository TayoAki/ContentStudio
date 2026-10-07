"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Lightbulb, Search, Settings, Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const ITEMS = [
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/recreate", label: "Recreate", icon: Lightbulb },
  { href: "/recreate?tab=calendar", label: "Calendar", icon: CalendarDays },
  { href: "/track", label: "Track", icon: BarChart3 },
];

function RailLink({ href, label, active, children }: { href: string; label: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`grid size-10 place-items-center rounded-lg transition-colors ${
        active ? "bg-accent-soft text-accent-ink-ink" : "text-muted hover:bg-sunken hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export function LeftRail() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface-2 py-3">
      <Link href="/discover" className="mb-3 grid size-9 place-items-center rounded-lg bg-accent text-accent-fg" title="ContentStudio">
        <Sparkles size={18} />
      </Link>
      {ITEMS.map(({ href, label, icon: Icon }) => (
        <RailLink key={href} href={href} label={label} active={href.split("?")[0] === pathname && !href.includes("?")}>
          <Icon size={20} />
        </RailLink>
      ))}
      <div className="flex-1" />
      <ThemeToggle />
      <RailLink href="/settings" label="Settings & integrations" active={pathname === "/settings"}>
        <Settings size={20} />
      </RailLink>
    </nav>
  );
}
