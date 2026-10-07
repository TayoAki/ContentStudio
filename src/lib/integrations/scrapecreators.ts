import "server-only";
import { IngestError, consumeQuota } from "@/lib/ingest";
import { classifySells } from "@/lib/monetization";

// Client for https://api.scrapecreators.com (auth: x-api-key). One platform
// key is shared by every workspace, so each call is metered per workspace.
// Endpoint reference: https://docs.scrapecreators.com/llms.txt
const BASE = "https://api.scrapecreators.com";
export const SC_DAILY_LIMIT = Number(process.env.SCRAPECREATORS_DAILY_LIMIT_PER_WORKSPACE ?? 100);

async function call<T>(ws: string, path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.SCRAPECREATORS_API_KEY;
  if (!key) throw new IngestError("Scrape Creators is not configured on this server (SCRAPECREATORS_API_KEY)");
  if (!consumeQuota(ws, "scrapecreators", SC_DAILY_LIMIT)) {
    throw new IngestError(`Daily Scrape Creators limit reached (${SC_DAILY_LIMIT} requests per workspace). Try again tomorrow.`);
  }
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "x-api-key": key }, cache: "no-store", signal: AbortSignal.timeout(90_000) });
  if (!res.ok) throw new IngestError(`Scrape Creators ${path} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

export type ScrapedPost = {
  platform: "tiktok" | "instagram";
  url: string;
  caption: string;
  hook: string;
  thumbnail_url: string | null;
  video_url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posted_at: string | null;
  source: "scrapecreators";
  creator: { platform: "tiktok" | "instagram"; handle: string; display_name?: string; followers?: number; bio?: string; avatar_url?: string };
};

const firstLine = (s: string) => s.split(/[.!?\n]/)[0]?.trim() ?? "";

// ---------- TikTok ----------

type Aweme = {
  aweme_id?: string;
  desc?: string;
  url?: string;
  create_time_utc?: string;
  statistics?: { play_count?: number; digg_count?: number; comment_count?: number; share_count?: number; collect_count?: number };
  video?: { cover?: { url_list?: string[] }; play_addr?: { url_list?: string[] } };
  author?: { unique_id?: string; nickname?: string; follower_count?: number; signature?: string; avatar_thumb?: { url_list?: string[] } };
};

function fromAweme(v: Aweme, fallbackHandle: string): ScrapedPost {
  const handle = v.author?.unique_id ?? fallbackHandle;
  return {
    platform: "tiktok",
    url: v.url ?? `https://www.tiktok.com/@${handle}/video/${v.aweme_id}`,
    caption: v.desc ?? "",
    hook: firstLine(v.desc ?? ""),
    thumbnail_url: v.video?.cover?.url_list?.[0] ?? null,
    video_url: v.video?.play_addr?.url_list?.[0] ?? null,
    views: v.statistics?.play_count ?? 0,
    likes: v.statistics?.digg_count ?? 0,
    comments: v.statistics?.comment_count ?? 0,
    shares: v.statistics?.share_count ?? 0,
    saves: v.statistics?.collect_count ?? 0,
    posted_at: v.create_time_utc ?? null,
    source: "scrapecreators",
    creator: {
      platform: "tiktok",
      handle,
      display_name: v.author?.nickname,
      followers: v.author?.follower_count,
      bio: v.author?.signature,
      avatar_url: v.author?.avatar_thumb?.url_list?.[0],
    },
  };
}

export async function fetchTikTokProfileVideos(ws: string, handle: string): Promise<ScrapedPost[]> {
  const clean = handle.replace(/^@/, "");
  const data = await call<{ aweme_list?: Aweme[] }>(ws, "/v3/tiktok/profile/videos", { handle: clean, trim: "true" });
  return (data.aweme_list ?? []).map((v) => fromAweme(v, clean));
}

// ---------- Instagram ----------

type IgNode = {
  shortcode?: string;
  url?: string;
  is_video?: boolean;
  video_view_count?: number | null;
  taken_at_timestamp?: number;
  display_url?: string;
  thumbnail_src?: string;
  video_url?: string | null;
  edge_media_preview_like?: { count?: number };
  edge_media_to_comment?: { count?: number };
  edge_media_to_caption?: { edges?: { node?: { text?: string } }[] };
};

export async function fetchInstagramProfile(ws: string, handle: string): Promise<{ creator: ScrapedPost["creator"] & Record<string, unknown>; posts: ScrapedPost[] }> {
  const clean = handle.replace(/^@/, "");
  const data = await call<{
    data?: {
      user?: {
        username?: string;
        full_name?: string;
        biography?: string;
        external_url?: string | null;
        bio_links?: { url?: string }[];
        profile_pic_url?: string;
        profile_pic_url_hd?: string;
        edge_followed_by?: { count?: number };
        edge_owner_to_timeline_media?: { edges?: { node: IgNode }[] };
      };
    };
  }>(ws, "/v1/instagram/profile", { handle: clean });
  const user = data.data?.user;
  const sells = classifySells([user?.external_url, ...(user?.bio_links ?? []).map((l) => l.url)]);
  const creator = {
    platform: "instagram" as const,
    handle: user?.username ?? clean,
    display_name: user?.full_name,
    followers: user?.edge_followed_by?.count,
    bio: user?.biography,
    avatar_url: user?.profile_pic_url_hd ?? user?.profile_pic_url,
    sells: sells?.sells,
    sells_url: sells?.url,
  };
  const posts = (user?.edge_owner_to_timeline_media?.edges ?? []).map(({ node }): ScrapedPost => {
    const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";
    return {
      platform: "instagram",
      url: node.url ?? `https://www.instagram.com/p/${node.shortcode}/`,
      caption,
      hook: firstLine(caption),
      thumbnail_url: node.thumbnail_src ?? node.display_url ?? null,
      video_url: node.is_video ? node.video_url ?? null : null,
      views: node.video_view_count ?? 0,
      likes: node.edge_media_preview_like?.count ?? 0,
      comments: node.edge_media_to_comment?.count ?? 0,
      shares: 0,
      saves: 0,
      posted_at: node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : null,
      source: "scrapecreators",
      creator,
    };
  });
  return { creator, posts };
}

type IgReel = {
  url?: string;
  shortcode?: string;
  caption?: string;
  thumbnail_src?: string;
  display_url?: string;
  video_url?: string;
  video_view_count?: number;
  like_count?: number;
  comment_count?: number;
  taken_at?: string;
  owner?: { username?: string; full_name?: string };
};

// Keyword search across Reels: the main way to find new accounts in a niche.
export async function searchInstagramReels(ws: string, query: string): Promise<ScrapedPost[]> {
  const data = await call<{ reels?: IgReel[] }>(ws, "/v2/instagram/reels/search", { query });
  return (data.reels ?? []).map((r) => ({
    platform: "instagram",
    url: r.url ?? `https://www.instagram.com/reel/${r.shortcode}/`,
    caption: r.caption ?? "",
    hook: firstLine(r.caption ?? ""),
    thumbnail_url: r.thumbnail_src ?? r.display_url ?? null,
    video_url: r.video_url ?? null,
    views: r.video_view_count ?? 0,
    likes: r.like_count ?? 0,
    comments: r.comment_count ?? 0,
    shares: 0,
    saves: 0,
    posted_at: r.taken_at ?? null,
    source: "scrapecreators",
    creator: { platform: "instagram", handle: r.owner?.username ?? "unknown", display_name: r.owner?.full_name },
  }));
}
