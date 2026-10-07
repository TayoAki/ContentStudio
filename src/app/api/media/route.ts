import { getSession } from "@/lib/auth";
import { isProxyableVideo } from "@/lib/thumbs";

// Streams a platform video for inline playback. The CDNs block hotlinking, so
// the browser plays it through us. Signed-in users only, allowlisted hosts
// only, Range passed through so the player can seek. Nothing is cached: the
// links are signed and expire after a few days, after which the tile falls
// back to opening the original post.
export async function GET(req: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url).searchParams.get("u") ?? "";
  if (!isProxyableVideo(url)) return new Response("Not found", { status: 404 });

  const range = req.headers.get("range");
  const upstream = await fetch(url, {
    headers: { ...(range ? { range } : {}), "user-agent": "Mozilla/5.0 (compatible; ContentStudio)" },
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);
  // Redirects must stay on platform hosts.
  if (!upstream || !isProxyableVideo(upstream.url)) return new Response("Upstream unavailable", { status: 502 });
  if (!upstream.ok && upstream.status !== 206) return new Response("Video link expired", { status: upstream.status === 403 ? 410 : 502 });
  const type = upstream.headers.get("content-type") ?? "video/mp4";
  if (!type.startsWith("video/") && type !== "application/octet-stream") return new Response("Not a video", { status: 502 });

  const headers = new Headers({ "content-type": type.startsWith("video/") ? type : "video/mp4", "cache-control": "private, no-store", "accept-ranges": "bytes" });
  for (const h of ["content-length", "content-range"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
