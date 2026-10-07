import { checkApiKey } from "@/lib/auth";
import { upsertTrendingPost } from "@/lib/ingest";
import { fetchTikTokProfileVideos } from "@/lib/integrations/scrapecreators";

// POST { "handles": ["blazerseason"], "niche_id": "fashion" }
// Pulls recent videos for each creator so their outliers show up in Discover.
export async function POST(req: Request) {
  const denied = checkApiKey(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { handles?: string[]; niche_id?: string };
  if (!Array.isArray(body.handles) || body.handles.length === 0) {
    return Response.json({ error: '"handles" must be a non-empty array' }, { status: 400 });
  }
  const results: Record<string, number | string> = {};
  for (const handle of body.handles) {
    try {
      const videos = await fetchTikTokProfileVideos(handle.replace(/^@/, ""));
      videos.forEach((v) => upsertTrendingPost({ ...v, niche_id: body.niche_id }));
      results[handle] = videos.length;
    } catch (err) {
      results[handle] = err instanceof Error ? err.message : "failed";
    }
  }
  return Response.json({ ok: true, results });
}
