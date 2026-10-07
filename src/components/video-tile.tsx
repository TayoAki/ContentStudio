import Image from "next/image";
import { Bookmark, ExternalLink, Eye, Heart, Play } from "lucide-react";
import { compact } from "@/lib/format";
import { mediaSrc, thumbSrc } from "@/lib/thumbs";
import { TilePlayer } from "./tile-player";

// A vertical 9:16 card shaped like the Reel/TikTok it represents. With a
// videoUrl it plays inline; otherwise it links to the original post.
// The top-right corner is left free for actions (e.g. Save to Ideas).
export function VideoTile({
  url,
  thumbnail,
  videoUrl,
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
  videoUrl?: string | null;
  hook: string;
  views: number;
  likes?: number;
  saves?: number;
  platform?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const src = thumbSrc(thumbnail);
  const playable = mediaSrc(videoUrl);

  const poster = (
    <>
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
      {(platform || label) && (
        <div className="pointer-events-none absolute left-1.5 top-1.5 flex items-center gap-1">
          {platform && (
            <span className="rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
              {platform === "instagram" ? "IG" : platform === "tiktok" ? "TT" : platform}
            </span>
          )}
          {label && <span className="rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-black">{label}</span>}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 pt-8 text-white">
        {src && hook && <p className="line-clamp-2 text-[11px] font-medium leading-snug">{hook}</p>}
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
    </>
  );

  const frame = `group relative aspect-[9/16] shrink-0 overflow-hidden rounded-xl bg-media ${size === "sm" ? "w-28" : "w-full"}`;

  if (playable) {
    return (
      <div className={frame}>
        <TilePlayer src={playable} originalUrl={url} label={hook || "video"}>
          {poster}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              title="Open original"
              aria-label="Open original post"
              className="absolute bottom-1.5 right-1.5 z-10 grid size-6 place-items-center rounded-full bg-black/45 text-white hover:bg-black/70"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </TilePlayer>
      </div>
    );
  }
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" title={hook} className={`block ${frame}`}>
      {poster}
    </a>
  ) : (
    <div className={frame}>{poster}</div>
  );
}
