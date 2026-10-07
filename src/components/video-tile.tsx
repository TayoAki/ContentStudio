import Image from "next/image";
import { Bookmark, Eye, Heart, Play } from "lucide-react";
import { compact } from "@/lib/format";
import { thumbSrc } from "@/lib/thumbs";

// A vertical 9:16 card shaped like the Reel/TikTok it represents.
export function VideoTile({
  url,
  thumbnail,
  hook,
  views,
  likes,
  saves,
  platform,
  label,
  size = "md",
}: {
  url?: string;
  thumbnail: string | null;
  hook: string;
  views: number;
  likes?: number;
  saves?: number;
  platform?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const src = thumbSrc(thumbnail);
  const body = (
    <div
      className={`group relative aspect-[9/16] overflow-hidden rounded-xl bg-gradient-to-b from-zinc-700 to-zinc-900 ${
        size === "sm" ? "w-28" : "w-full"
      }`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized={!src.startsWith("/samples")}
          referrerPolicy="no-referrer"
          sizes="200px"
          className="object-cover transition-transform group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-3 text-center text-[11px] font-semibold leading-snug text-white/90">
          {hook || <Play size={20} />}
        </div>
      )}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1.5">
        {platform && (
          <span className="rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
            {platform === "instagram" ? "IG" : platform === "tiktok" ? "TT" : platform}
          </span>
        )}
        {label && <span className="rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-900">{label}</span>}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 pt-8 text-white">
        {thumbnail && hook && <p className="line-clamp-2 text-[11px] font-medium leading-snug">{hook}</p>}
        <div className="mt-1 flex items-center gap-2 text-[10px] tabular-nums text-white/85">
          {/* Photo/carousel posts have no view count; fall back to likes. */}
          {views > 0 || !likes ? (
            <span className="flex items-center gap-0.5"><Eye size={10} /> {compact(views)}</span>
          ) : (
            <span className="flex items-center gap-0.5"><Heart size={10} /> {compact(likes)}</span>
          )}
          {!!saves && <span className="flex items-center gap-0.5"><Bookmark size={10} /> {compact(saves)}</span>}
        </div>
      </div>
    </div>
  );
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" title={hook} className="block shrink-0">
      {body}
    </a>
  ) : (
    body
  );
}
