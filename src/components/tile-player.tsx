"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play } from "lucide-react";

export const PLAY_EVENT = "cs:play";

// Click-to-play for a video tile. The poster and overlays render as children
// until playback starts; only one tile plays at a time.
export function TilePlayer({ src, originalUrl, label, children }: { src: string; originalUrl?: string; label: string; children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState<null | "expired" | "unsupported">(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      if ((e as CustomEvent).detail !== video.current) video.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    return () => window.removeEventListener(PLAY_EVENT, onOtherPlay);
  }, []);

  // A playback error is either a dead platform link (the proxy answers 410/502)
  // or a format this browser can't decode; check which before saying so.
  async function diagnose() {
    const res = await fetch(src, { headers: { range: "bytes=0-1" } }).catch(() => null);
    setFailed(res && (res.ok || res.status === 206) ? "unsupported" : "expired");
  }

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-media p-3 text-center text-[11px] text-white/85">
        <p>
          {failed === "expired" ? "This video link has expired." : "This browser can't play this video."}
          {originalUrl && (
            <>
              {" "}
              <a href={originalUrl} target="_blank" rel="noreferrer" className="font-medium text-white underline">Open the original</a>
            </>
          )}
        </p>
      </div>
    );
  }

  if (playing) {
    return (
      <video
        ref={video}
        src={src}
        autoPlay
        controls
        playsInline
        aria-label={label}
        onPlay={(e) => window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: e.currentTarget }))}
        onError={() => void diagnose()}
        className="absolute inset-0 h-full w-full bg-black object-cover"
      />
    );
  }

  return (
    <>
      {children}
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play: ${label}`}
        className="group/play absolute inset-0 grid place-items-center"
      >
        <span className="grid size-10 place-items-center rounded-full bg-black/45 text-white opacity-90 backdrop-blur-sm transition group-hover/play:scale-105 group-hover/play:bg-black/60 group-hover/play:opacity-100">
          <Play size={18} className="translate-x-px" fill="currentColor" />
        </span>
      </button>
    </>
  );
}
