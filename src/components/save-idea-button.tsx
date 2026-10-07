"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { BookmarkCheck, BookmarkPlus, Loader2 } from "lucide-react";
import { saveVideoToIdeas } from "@/app/actions";

function Submit({ compact }: { compact: boolean }) {
  const { pending } = useFormStatus();
  const Icon = pending ? Loader2 : BookmarkPlus;
  return (
    <button
      disabled={pending}
      title="Save to Ideas"
      aria-label="Save to Ideas"
      className={
        compact
          ? "grid size-7 place-items-center rounded-full bg-white/90 text-zinc-900 shadow hover:bg-white disabled:opacity-70"
          : "flex w-full items-center justify-center gap-1.5 rounded-md bg-accent px-2 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-70"
      }
    >
      <Icon size={compact ? 14 : 12} className={pending ? "animate-spin" : ""} />
      {!compact && (pending ? "Saving…" : "Save to Ideas")}
    </button>
  );
}

// Saves a trending video as an idea in the Recreate pipeline. Once saved it
// links to that idea instead.
export function SaveIdeaButton({ postId, ideaId, compact = false }: { postId: string; ideaId?: string; compact?: boolean }) {
  if (ideaId) {
    return (
      <Link
        href={`/recreate?idea=${ideaId}`}
        title="Saved: open in Ideas"
        aria-label="Saved: open in Ideas"
        className={
          compact
            ? "grid size-7 place-items-center rounded-full bg-emerald-500 text-white shadow"
            : "flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
        }
      >
        <BookmarkCheck size={compact ? 14 : 12} />
        {!compact && "Saved · open idea"}
      </Link>
    );
  }
  return (
    <form action={saveVideoToIdeas}>
      <input type="hidden" name="post_id" value={postId} />
      <Submit compact={compact} />
    </form>
  );
}
