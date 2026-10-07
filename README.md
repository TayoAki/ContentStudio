# ContentStudio

Find a short-form format that's working in your niche, recreate it with Claude Code, then track every post from **view → comment → DM → click → sale**.

| Module | What it does | Data in |
|---|---|---|
| **Discover** | Groups trending IG Reels / TikToks into replicable **formats**, flags **breakout creators** (young accounts growing fast), ranks posts by reach multiple (views ÷ followers) and save rate. | Virlo (MCP via Claude Code), Scrape Creators |
| **Recreate** | Ideas pipeline, content calendar and asset library. "Copy Claude Code brief" packages a format + top examples; Claude pushes scripts and generated media back. | Claude Code → `/api/ingest/*` |
| **Track** | Per-post funnel and revenue, tracked links, ManyChat keywords, live event feed, $ per 1k views. | Post metrics, `/l/:slug`, ManyChat, Stripe |

## Run it

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional locally
npm run dev                  # http://localhost:3000
```

Requires Node 22+ (uses the built-in `node:sqlite`). The database is created at `data/contentstudio.db` and seeded with a demo men's-fashion niche; delete the file to reset.

## Control it from Claude (MCP)

The app is an MCP server at `/api/mcp` (streamable HTTP), so Claude Code can run the whole loop: research a niche, define formats, write and schedule scripts, attach media, mark posts live, create tracked links/keywords and read back performance.

This repo ships a `.mcp.json`, so opening it in Claude Code picks the server up automatically (it reads `CONTENTSTUDIO_URL` and `CONTENTSTUDIO_API_KEY` from your shell). To add it elsewhere:

```bash
claude mcp add --transport http contentstudio https://your-app.example.com/api/mcp \
  --header "Authorization: Bearer $CONTENTSTUDIO_API_KEY"
```

| Stage | Tools |
|---|---|
| Discover | `list_niches`, `save_niche`, `get_discover_overview`, `list_trending_posts`, `add_trending_posts`, `save_creators`, `list_creators`, `sync_scrapecreators`, `save_format`, `get_format_brief` |
| Recreate | `list_ideas`, `get_idea`, `save_ideas`, `update_idea`, `add_assets`, `get_calendar` |
| Track | `mark_posted`, `record_metrics`, `create_tracked_link`, `record_events`, `get_performance`, `get_format_performance`, `list_links_and_keywords` |

Two MCP prompts show up as slash commands in Claude Code: `/mcp__contentstudio__find_and_recreate <niche>` (full discover → scripts → calendar run) and `/mcp__contentstudio__performance_review`.

Pair it with Virlo's MCP server for trend data; Claude moves results from Virlo into ContentStudio with `add_trending_posts`.

## How attribution works

1. Each post gets a tracked link (`/l/<slug>`) and optionally a ManyChat keyword (e.g. comment **BLAZER**).
2. ManyChat's *External Request* step posts `comment_keyword` / `dm_sent` events to `/api/webhooks/manychat`; the keyword maps the event to the post.
3. The DM contains `/l/<slug>?c={{user_id}}`. The click is logged and the visitor is redirected with `cs_cid=<click id>` (+ UTM tags).
4. Your checkout passes `cs_cid` to Stripe as `client_reference_id` (or `metadata.cs_cid`). `/api/webhooks/stripe` turns `checkout.session.completed` into a purchase attributed to the same post.
5. Clicks on the plain link-in-bio (no post) are recorded as unattributed; use per-post keywords/links for exact attribution.

## API

All ingest endpoints take a JSON object or array, with `Authorization: Bearer $CONTENTSTUDIO_API_KEY`.

| Endpoint | Body (key fields) |
|---|---|
| `POST /api/ingest/trending` | `url, platform, niche_id, format_id?, hook, caption, transcript?, views, likes, comments, shares, saves, posted_at, source, creator:{handle, platform, followers, followers_30d_ago, first_post_at}` |
| `POST /api/ingest/creators` | `platform, handle, followers, followers_30d_ago, first_post_at, niche_id` |
| `POST /api/ingest/formats` | `name, niche_id, summary, structure[], why_it_works, status, example_urls[]` |
| `POST /api/ingest/ideas` | `title, format_id, hook, script, notes, status, platform, scheduled_for` (send `id` to update) |
| `POST /api/ingest/assets` | `idea_id, kind (image/video/carousel/caption), url, label` |
| `POST /api/ingest/posts` | `idea_id, platform, url, caption, published_at` |
| `POST /api/ingest/metrics` | `post_id, views, likes, comments, shares, saves, profile_visits, follows` |
| `POST /api/ingest/events` | `type, source, post_id? / keyword? / link_slug? / click_id?, value_cents` |
| `POST /api/sync/scrapecreators` | `handles[], niche_id` — pulls recent TikTok videos for each creator |
| `POST /api/webhooks/manychat` | header `x-contentstudio-secret`; `event, keyword, subscriber_id` |
| `POST /api/webhooks/stripe` | Stripe-signed `checkout.session.completed` |

## Not built yet

- Auth / multi-tenant workspaces (single-user MVP).
- Automatic post-metric pulls from the Instagram Graph API / TikTok — push them to `/api/ingest/metrics` for now.
- Instagram profile sync via Scrape Creators (TikTok is wired up).
- File uploads — assets are stored as URLs.
