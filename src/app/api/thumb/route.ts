import { getSession } from "@/lib/auth";
import { getThumb } from "@/lib/thumbs";

// Signed-in users only, and only for Instagram/TikTok CDN hosts (isProxyable),
// so this can't be used as an open proxy.
export async function GET(req: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url).searchParams.get("u") ?? "";
  const thumb = await getThumb(url);
  if (!thumb) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(thumb.body), {
    headers: { "content-type": thumb.type, "cache-control": "private, max-age=604800, immutable" },
  });
}
