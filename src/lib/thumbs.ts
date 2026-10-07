import "server-only";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

// Instagram/TikTok CDN images can't be hotlinked and their signed URLs expire
// within days, so we fetch them server-side once and keep a copy on disk next
// to the database (a Railway volume in production).
const DIR = path.join(path.dirname(process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "contentstudio.db")), "thumbs");
const ALLOWED = /(^|\.)(cdninstagram\.com|fbcdn\.net|tiktokcdn\.com|tiktokcdn-us\.com|tiktokcdn-eu\.com|ibyteimg\.com|byteimg\.com|muscdn\.com)$/i;
const MAX_BYTES = 5 * 1024 * 1024;

export function isProxyable(url: string): boolean {
  if (!URL.canParse(url)) return false;
  const u = new URL(url);
  return u.protocol === "https:" && ALLOWED.test(u.hostname);
}

export function thumbSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  return isProxyable(url) ? `/api/thumb?u=${encodeURIComponent(url)}` : url;
}

const fileFor = (url: string) => path.join(DIR, createHash("sha256").update(url).digest("hex"));

export async function getThumb(url: string): Promise<{ body: Buffer; type: string } | null> {
  if (!isProxyable(url)) return null;
  const file = fileFor(url);
  try {
    const [body, type] = await Promise.all([fs.readFile(file), fs.readFile(`${file}.type`, "utf8")]);
    return { body, type };
  } catch {
    // not cached yet
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), redirect: "error" }).catch(() => null);
  const type = res?.headers.get("content-type") ?? "";
  if (!res?.ok || !type.startsWith("image/")) return null;
  const body = Buffer.from(await res.arrayBuffer());
  if (body.length > MAX_BYTES) return null;
  await fs.mkdir(DIR, { recursive: true });
  await Promise.all([fs.writeFile(file, body), fs.writeFile(`${file}.type`, type)]);
  return { body, type };
}

// Called after a sync so thumbnails are saved before the CDN links expire.
export function warmThumbs(urls: (string | null | undefined)[]) {
  void Promise.allSettled(urls.filter((u): u is string => !!u && isProxyable(u)).map(getThumb));
}
