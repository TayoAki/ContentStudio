# ContentStudio

Find a short-form format that's working in your niche, recreate it with Claude Code, then track every post from **view → comment → DM → click → sale**.

| Module | What it does | Data in |
|---|---|---|
| **Discover** | **Trend accounts** grouped by trend type (e.g. "AI models", "Colour & outfit guides") with followers, how fast they got there, their best videos as 9:16 tiles, and what they sell. Plus replicable **formats** and a top-videos wall ranked by reach multiple (views ÷ followers). | Scrape Creators (built in), Virlo (MCP via Claude Code) |
| **Recreate** | Ideas pipeline (one-click **Save to Ideas** on any video in Discover, keeping a link to the original), content calendar and asset library. "Copy Claude Code brief" packages a format + top examples; Claude pushes scripts and generated media back. | Claude Code → `/api/ingest/*` |
| **Track** | Per-post funnel and revenue, tracked links, ManyChat keywords, live event feed, $ per 1k views. | Post metrics, `/l/:slug`, ManyChat, Stripe |

## Run it

```bash
npm install
cp .env.example .env.local   # add SCRAPECREATORS_API_KEY to enable live research
npm run dev                  # http://localhost:3000
```

Requires Node 22.5+ (uses the built-in `node:sqlite`). Locally the database at `data/contentstudio.db` is seeded with a demo login, **demo@contentstudio.dev / demo-password**, holding a men's-fashion niche. Delete the file to reset.

## Multi-tenant

- Anyone can sign up at `/signup`; each account gets its own workspace. Every row is scoped by `workspace_id`, and writes reject ids from other workspaces.
- Each workspace has its own **API key** (Settings → Connect Claude) for MCP and `/api/ingest/*`, plus its own ManyChat and Stripe webhook URLs and secrets.
- The **Scrape Creators** key is a platform secret shared by every workspace, metered per workspace per day (`SCRAPECREATORS_DAILY_LIMIT_PER_WORKSPACE`, default 100).
- Instagram/TikTok thumbnails are fetched server-side and cached next to the database, because the CDN links can't be hotlinked and expire.

## Deploy (Railway)

`railway.json` configures the build (Railpack, Node from `engines`) and a single replica. The service needs:

1. A **volume** mounted at `/data`, plus `DATABASE_PATH=/data/contentstudio.db`. SQLite and the thumbnail cache live there, so keep it to **one replica**.
2. Variables: `APP_URL` (the public URL), `SCRAPECREATORS_API_KEY`, and optionally `SCRAPECREATORS_DAILY_LIMIT_PER_WORKSPACE`.

Moving to Postgres is the step that unlocks more than one replica; the schema is plain SQL to make that straightforward.

## Control it from Claude (MCP)

The app is an MCP server at `/api/mcp` (streamable HTTP), so Claude Code can run the whole loop: research a niche, define formats, write and schedule scripts, attach media, mark posts live, create tracked links/keywords and read back performance.

This repo ships a `.mcp.json`, so opening it in Claude Code picks the server up automatically (set `CONTENTSTUDIO_URL` and `CONTENTSTUDIO_API_KEY` to your app URL and workspace API key). To add it elsewhere:

```bash
claude mcp add --transport http contentstudio https://your-app.example.com/api/mcp \
  --header "Authorization: Bearer <workspace API key from Settings>"
```

| Stage | Tools |
|---|---|
| Discover | `list_niches`, `save_niche`, `get_discover_overview`, `list_trend_accounts`, `list_trending_posts`, `add_trending_posts`, `save_creators`, `list_creators`, `search_instagram_reels`, `sync_creators`, `get_usage`, `save_format`, `get_format_brief` |
| Recreate | `list_ideas`, `get_idea`, `save_videos_to_ideas`, `save_ideas`, `update_idea`, `add_assets`, `get_calendar` |
| Track | `mark_posted`, `record_metrics`, `create_tracked_link`, `record_events`, `get_performance`, `get_format_performance`, `list_links_and_keywords` |

Two MCP prompts show up as slash commands in Claude Code: `/mcp__contentstudio__find_and_recreate <niche>` (full discover → scripts → calendar run) and `/mcp__contentstudio__performance_review`.

Pair it with Virlo's MCP server for trend data; Claude moves results from Virlo into ContentStudio with `add_trending_posts`.

## Media uploads

Upload images and videos from the browser (Recreate → Asset library, or the Media section of an idea) or from scripts and Claude Code:

```bash
curl -X PUT "$APP_URL/api/uploads?filename=hook.mp4&idea_id=<idea id>" \
  -H "Authorization: Bearer <workspace API key>" -H "Content-Type: video/mp4" \
  --data-binary @hook.mp4
```

Files are stored on disk next to the database (the Railway volume), served only to members of the workspace, with seeking support for video. `UPLOAD_MAX_MB` caps the size (default 500).

## How attribution works

1. Each post gets a tracked link (`/l/<slug>`) and optionally a ManyChat keyword (e.g. comment **BLAZER**).
2. ManyChat's *External Request* step posts `comment_keyword` / `dm_sent` events to your workspace's `/api/webhooks/manychat/<workspace id>` URL; the keyword maps the event to the post.
3. The DM contains `/l/<slug>?c={{user_id}}`. The click is logged and the visitor is redirected with `cs_cid=<click id>` (+ UTM tags).
4. Your checkout passes `cs_cid` to Stripe as `client_reference_id` (or `metadata.cs_cid`). `/api/webhooks/stripe` turns `checkout.session.completed` into a purchase attributed to the same post.
5. Clicks on the plain link-in-bio (no post) are recorded as unattributed; use per-post keywords/links for exact attribution.

## API

All ingest endpoints take a JSON object or array, with `Authorization: Bearer <workspace API key>`.

| Endpoint | Body (key fields) |
|---|---|
| `POST /api/ingest/trending` | `url, platform, niche_id, format_id?, hook, caption, transcript?, views, likes, comments, shares, saves, posted_at, source, video_url?, media_type? (video/carousel/photo), slides?[] (image URLs or {image, video}), audio_url?, creator:{handle, platform, followers, followers_30d_ago, first_post_at}` |
| `POST /api/ingest/creators` | `platform, handle, followers, followers_30d_ago, first_post_at, niche_id` |
| `POST /api/ingest/formats` | `name, niche_id, summary, structure[], why_it_works, status, example_urls[]` |
| `POST /api/ingest/ideas` | `title, format_id, hook, script, notes, status, platform, planned_for, scheduled_for` (send `id` to update). `planned_for` is a target date any stage can keep; `scheduled_for` is the publish date and only sticks on Ready/Scheduled ideas (on earlier stages it's saved as `planned_for`). |
| `POST /api/ingest/assets` | `idea_id, kind (image/video/carousel/caption), url, label` |
| `POST /api/ingest/posts` | `idea_id, platform, url, caption, published_at` |
| `POST /api/ingest/metrics` | `post_id, views, likes, comments, shares, saves, profile_visits, follows` |
| `POST /api/ingest/events` | `type, source, post_id? / keyword? / link_slug? / click_id?, value_cents` |
| `POST /api/ingest/niches` | `name, keywords` |
| `POST /api/webhooks/manychat/<workspace id>` | header `x-contentstudio-secret` (per workspace, see Settings); `event, keyword, subscriber_id` |
| `POST /api/webhooks/stripe/<workspace id>` | Stripe-signed `checkout.session.completed` (signing secret saved in Settings) |

## Not built yet

- Team invites (one owner per workspace today) and billing/plans.
- Automatic post-metric pulls from the Instagram Graph API / TikTok — push them to `/api/ingest/metrics` for now.
- File uploads — assets are stored as URLs.
