import Link from "next/link";
import { BarChart3, Lightbulb, Search, Sparkles } from "lucide-react";

const STEPS = [
  { icon: Search, title: "Discover", body: "See which Reels and TikToks are breaking out in your niche, which new accounts grew fastest, and the repeatable format behind them." },
  { icon: Lightbulb, title: "Recreate", body: "Turn a winning format into scripts and media with Claude, then plan it on your content calendar." },
  { icon: BarChart3, title: "Track", body: "Follow every post from views to comments, DMs, link clicks and sales, so you know which formats actually make money." },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-fg"><Sparkles size={16} /></span>
          ContentStudio
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/login" className="btn btn-ghost">Log in</Link>
          <Link href="/signup" className="btn btn-primary">Start free</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Find the format that&apos;s working in your niche. Make it yours. See what it sells.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Short-form research, creation and attribution in one place, built to be driven by Claude.
        </p>
        <Link href="/signup" className="btn btn-primary mt-8 px-5 py-2.5 text-base">
          Create your studio →
        </Link>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-line bg-surface p-5">
              <Icon size={20} className="text-accent" />
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
