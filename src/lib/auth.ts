import "server-only";
import { timingSafeEqual } from "node:crypto";

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// Bearer-token auth for the ingest API (Claude Code, scrapers, cron jobs).
// Without CONTENTSTUDIO_API_KEY set, only local dev requests are allowed.
export function checkApiKey(req: Request): Response | null {
  const key = process.env.CONTENTSTUDIO_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      return Response.json({ error: "CONTENTSTUDIO_API_KEY is not configured" }, { status: 503 });
    }
    return null;
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return safeEqual(token, key) ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
}
