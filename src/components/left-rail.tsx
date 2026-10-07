"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Lightbulb, Search, Settings, Sparkles } from "lucide-react";

const ITEMS = [
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/recreate", label: "Recreate", icon: Lightbulb },
  { href: "/recreate?tab=calendar", label: "Calendar", icon: CalendarDays },
  { href: "/track", label: "Track", icon: BarChart3 },
];

export function LeftRail() {
  const pathname = usePathname();
  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-3">
      <Link href="/discover" className="mb-3 grid size-9 place-items-center rounded-lg bg-accent text-white" title="ContentStudio">
        <Sparkles size={18} />
      </Link>
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href.split("?")[0] === pathname && !href.includes("?");
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-label={label}
            className={`grid size-10 place-items-center rounded-lg transition-colors ${
              active ? "bg-accent-soft text-accent" : "text-muted hover:bg-background hover:text-foreground"
            }`}
          >
            <Icon size={20} />
          </Link>
        );
      })}
      <div className="flex-1" />
      <Link
        href="/settings"
        title="Settings & integrations"
        aria-label="Settings"
        className={`grid size-10 place-items-center rounded-lg ${
          pathname === "/settings" ? "bg-accent-soft text-accent" : "text-muted hover:bg-background"
        }`}
      >
        <Settings size={20} />
      </Link>
      <div className="mt-2 grid size-8 place-items-center rounded-full bg-zinc-200 text-xs font-semibold">TA</div>
    </nav>
  );
}
