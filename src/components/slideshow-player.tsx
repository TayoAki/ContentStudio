"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Images, Play, Volume2, VolumeX, X } from "lucide-react";
import { PLAY_EVENT } from "./tile-player";

export type PlayerSlide = { image: string; video: string | null };

const ADVANCE_MS = 3000;

// Click-to-open for an Instagram carousel or TikTok photo slideshow. Swipe,
// arrow keys or the chevrons move between slides. A TikTok slideshow plays its
// music and advances on its own, like in the app, until you take over.
export function SlideshowPlayer({
  slides,
  audio,
  originalUrl,
  label,
  children,
}: {
  slides: PlayerSlide[];
  audio?: string | null;
  originalUrl?: string;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const [muted, setMuted] = useState(false);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const scroller = useRef<HTMLDivElement>(null);
  const sound = useRef<HTMLAudioElement>(null);
  const token = useRef({});

  // Only one tile plays at a time, videos included.
  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      if ((e as CustomEvent).detail !== token.current) setOpen(false);
    };
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    return () => window.removeEventListener(PLAY_EVENT, onOtherPlay);
  }, []);

  useEffect(() => {
    if (!open || !auto) return;
    const t = setTimeout(() => go(index + 1 >= slides.length ? 0 : index + 1), ADVANCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go only reads the ref
  }, [open, auto, index, slides.length]);

  // Video slides play while they're on screen.
  useEffect(() => {
    scroller.current?.querySelectorAll("video").forEach((v) => {
      if (Number(v.dataset.index) === index) void v.play().catch(() => {});
      else v.pause();
    });
  }, [index, open]);

  function start() {
    setIndex(0);
    setAuto(!!audio && slides.length > 1);
    setOpen(true);
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: token.current }));
    requestAnimationFrame(() => scroller.current?.focus({ preventScroll: true }));
  }

  function go(i: number) {
    const el = scroller.current;
    if (!el) return;
    const next = Math.max(0, Math.min(slides.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  }

  // Any manual move stops the auto-advance.
  const takeOver = () => setAuto(false);

  function onKey(e: KeyboardEvent) {
    if (e.key === "ArrowRight") { takeOver(); go(index + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { takeOver(); go(index - 1); e.preventDefault(); }
    if (e.key === "Escape") setOpen(false);
  }

  if (!open) {
    return (
      <>
        {children}
        <button
          type="button"
          onClick={start}
          aria-label={`${audio ? "Play slideshow" : "View carousel"} (${slides.length} slide${slides.length === 1 ? "" : "s"}): ${label}`}
          className="group/play absolute inset-0 grid place-items-center"
        >
          <span className="grid size-10 place-items-center rounded-full bg-black/45 text-white opacity-90 backdrop-blur-sm transition group-hover/play:scale-105 group-hover/play:bg-black/60 group-hover/play:opacity-100">
            {audio ? <Play size={18} className="translate-x-px" fill="currentColor" /> : <Images size={18} />}
          </span>
        </button>
      </>
    );
  }

  return (
    <div className="absolute inset-0 bg-black" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={scroller}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={takeOver}
        onWheel={takeOver}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) setIndex(i);
        }}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <div key={i} className="relative grid h-full w-full shrink-0 snap-center place-items-center" aria-label={`Slide ${i + 1} of ${slides.length}`}>
            {broken.has(i) ? (
              <p className="p-3 text-center text-[11px] text-white/80">
                This slide&apos;s link has expired.{" "}
                {originalUrl && <a href={originalUrl} target="_blank" rel="noreferrer" className="font-medium text-white underline">Open the original</a>}
              </p>
            ) : s.video ? (
              <video data-index={i} src={s.video} poster={s.image} muted loop playsInline className="h-full w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- proxied platform image
              <img
                src={s.image}
                alt=""
                draggable={false}
                loading={i < 2 ? "eager" : "lazy"}
                referrerPolicy="no-referrer"
                onError={() => setBroken((b) => new Set(b).add(i))}
                className="h-full w-full object-contain"
              />
            )}
          </div>
        ))}
      </div>

      {audio && <audio ref={sound} src={audio} autoPlay loop muted={muted} />}

      <div className="pointer-events-none absolute left-1.5 top-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="pointer-events-auto grid size-6 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75"
        >
          <X size={12} />
        </button>
        {slides.length > 1 && (
          <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white" aria-live="polite">
            {index + 1} / {slides.length}
          </span>
        )}
      </div>

      {index > 0 && (
        <button
          type="button"
          onClick={() => { takeOver(); go(index - 1); }}
          aria-label="Previous slide"
          className="absolute left-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white hover:bg-black/70"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      {index < slides.length - 1 && (
        <button
          type="button"
          onClick={() => { takeOver(); go(index + 1); }}
          aria-label="Next slide"
          className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white hover:bg-black/70"
        >
          <ChevronRight size={16} />
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
        {slides.length > 1 && slides.length <= 12 &&
          slides.map((_, i) => (
            <span key={i} className={`size-1.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`} />
          ))}
      </div>

      {audio && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute bottom-1.5 left-1.5 grid size-6 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75"
        >
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      )}
    </div>
  );
}
