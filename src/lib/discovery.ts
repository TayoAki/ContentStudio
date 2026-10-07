import "server-only";
import { upsertCreator, upsertTrendingPost } from "./ingest";
import { warmThumbs } from "./thumbs";
import { fetchInstagramProfile, fetchTikTokProfileVideos, searchInstagramReels } from "./integrations/scrapecreators";

// Scrape Creators -> workspace data. Shared by the MCP tools and the Discover UI.

export async function syncCreators(ws: string, platform: "tiktok" | "instagram", handles: string[], nicheId?: string | null) {
  const results: Record<string, number | string> = {};
  for (const raw of handles) {
    const handle = raw.trim().replace(/^@/, "");
    if (!handle) continue;
    try {
      if (platform === "tiktok") {
        const posts = await fetchTikTokProfileVideos(ws, handle);
        posts.forEach((p) => upsertTrendingPost(ws, { ...p, niche_id: nicheId }));
        warmThumbs([...posts.map((p) => p.thumbnail_url), posts[0]?.creator.avatar_url]);
        results[handle] = posts.length;
      } else {
        const { creator, posts } = await fetchInstagramProfile(ws, handle);
        upsertCreator(ws, { ...creator, niche_id: nicheId, source: "scrapecreators", sells_is_guess: true });
        posts.forEach((p) => upsertTrendingPost(ws, { ...p, niche_id: nicheId }));
        warmThumbs([...posts.map((p) => p.thumbnail_url), creator.avatar_url as string | undefined]);
        results[handle] = posts.length;
      }
    } catch (err) {
      results[handle] = err instanceof Error ? err.message : "failed";
    }
  }
  return results;
}

export async function searchReels(ws: string, query: string, nicheId?: string | null) {
  const reels = await searchInstagramReels(ws, query);
  const ids = reels.map((r) => upsertTrendingPost(ws, { ...r, niche_id: nicheId }));
  warmThumbs(reels.map((r) => r.thumbnail_url));
  return { stored: ids.length, handles: [...new Set(reels.map((r) => r.creator.handle))] };
}
