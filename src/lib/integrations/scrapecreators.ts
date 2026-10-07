import "server-only";

// Thin client for https://api.scrapecreators.com (auth: x-api-key header).
// Endpoint reference: https://docs.scrapecreators.com
const BASE = "https://api.scrapecreators.com";

export async function scrapeCreators<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.SCRAPECREATORS_API_KEY;
  if (!key) throw new Error("SCRAPECREATORS_API_KEY is not configured");
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "x-api-key": key }, cache: "no-store" });
  if (!res.ok) throw new Error(`Scrape Creators ${path} failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

// TikTok returns the native "aweme" shape. Fields are read defensively since
// the payload is large and loosely typed.
type Aweme = {
  aweme_id?: string;
  desc?: string;
  create_time?: number;
  share_url?: string;
  statistics?: {
    play_count?: number;
    digg_count?: number;
    comment_count?: number;
    share_count?: number;
    collect_count?: number;
  };
  video?: { cover?: { url_list?: string[] } };
  author?: { unique_id?: string; nickname?: string; follower_count?: number };
};

export async function fetchTikTokProfileVideos(handle: string) {
  const data = await scrapeCreators<{ aweme_list?: Aweme[] }>("/v3/tiktok/profile-videos", {
    handle,
    trim: "true",
  });
  return (data.aweme_list ?? []).map((v) => ({
    platform: "tiktok",
    url: v.share_url ?? `https://www.tiktok.com/@${handle}/video/${v.aweme_id}`,
    caption: v.desc ?? "",
    hook: (v.desc ?? "").split(/[.!?\n]/)[0] ?? "",
    thumbnail_url: v.video?.cover?.url_list?.[0] ?? null,
    views: v.statistics?.play_count ?? 0,
    likes: v.statistics?.digg_count ?? 0,
    comments: v.statistics?.comment_count ?? 0,
    shares: v.statistics?.share_count ?? 0,
    saves: v.statistics?.collect_count ?? 0,
    posted_at: v.create_time ? new Date(v.create_time * 1000).toISOString() : null,
    source: "scrapecreators",
    creator: {
      platform: "tiktok",
      handle,
      display_name: v.author?.nickname,
      followers: v.author?.follower_count ?? 0,
    },
  }));
}
