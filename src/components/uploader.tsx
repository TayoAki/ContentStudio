"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/quicktime,video/webm";

type Job = { name: string; progress: number; error?: string };

// Drop or pick images/videos; each streams to /api/uploads with a progress bar.
export function Uploader({ ideaId, compact = false }: { ideaId?: string; compact?: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [over, setOver] = useState(false);

  function upload(file: File, index: number) {
    return new Promise<void>((resolve) => {
      const params = new URLSearchParams({ filename: file.name });
      if (ideaId) params.set("idea_id", ideaId);
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `/api/uploads?${params}`);
      xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
      const update = (patch: Partial<Job>) => setJobs((js) => js.map((j, i) => (i === index ? { ...j, ...patch } : j)));
      xhr.upload.onprogress = (e) => e.lengthComputable && update({ progress: e.loaded / e.total });
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) update({ progress: 1 });
        else {
          let message = `Upload failed (${xhr.status})`;
          try {
            message = JSON.parse(xhr.responseText).error ?? message;
          } catch {}
          update({ error: message });
        }
        resolve();
      };
      xhr.onerror = () => {
        update({ error: "Network error" });
        resolve();
      };
      xhr.send(file);
    });
  }

  async function start(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files];
    const offset = jobs.length;
    setJobs((js) => [...js, ...list.map((f) => ({ name: f.name, progress: 0 }))]);
    await Promise.all(list.map((f, i) => upload(f, offset + i)));
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          start(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center transition-colors ${
          over ? "border-accent bg-accent-soft" : "border-line-strong bg-surface hover:bg-surface-2"
        } ${compact ? "px-3 py-3" : "px-6 py-8"}`}
      >
        <UploadCloud size={compact ? 18 : 24} className="text-muted" />
        <span className="text-sm font-medium">{compact ? "Upload media" : "Drop images or videos here, or click to choose"}</span>
        {!compact && <span className="text-xs text-muted">JPG, PNG, WebP, GIF, MP4, MOV or WebM. Large videos are fine.</span>}
      </button>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { start(e.target.files); e.target.value = ""; }} />
      {jobs.length > 0 && (
        <ul className="mt-2 space-y-1.5" aria-live="polite">
          {jobs.map((j, i) => (
            <li key={i} className="text-xs">
              <div className="flex justify-between gap-2">
                <span className="truncate">{j.name}</span>
                <span className={j.error ? "text-bad" : "tabular-nums text-muted"}>{j.error ?? (j.progress >= 1 ? "Done" : `${Math.round(j.progress * 100)}%`)}</span>
              </div>
              {!j.error && (
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-sunken">
                  <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${Math.round(j.progress * 100)}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
