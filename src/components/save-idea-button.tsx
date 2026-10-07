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
          ? "grid size-7 place-items-center rounded-full bg-white/90 text-black shadow transition-colors hover:bg-white disabled:opacity-70"
          : "btn btn-primary btn-sm btn-block"
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
            ? "grid size-7 place-items-center rounded-full bg-good text-accent-fg shadow"
            : "btn btn-sm btn-block bg-good-soft text-good hover:bg-good hover:text-accent-fg"
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
