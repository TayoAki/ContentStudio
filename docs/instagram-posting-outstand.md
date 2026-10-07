# Instagram posting with Outstand

Research notes and a build plan for auto-publishing scheduled ideas to Instagram through [Outstand](https://www.outstand.so). Researched 2026-10-07 against Outstand's docs (last updated 2026-10-05). Sources are at the bottom.

## TL;DR

- **What it is.** Outstand is a unified social posting REST API covering 12 networks, Instagram and TikTok included.
  - Base URL `https://api.outstand.so`, auth `Authorization: Bearer <key>`.
  - **Managed Keys** covers Instagram, so we don't need our own Meta app or a 2+ week Meta App Review to start.
- **Multi-tenancy.** One Outstand organization (one API key, server-side only) serves every ContentStudio workspace.
  - Pass `tenant_id = workspace.id` when connecting an account.
  - Filter `GET /v1/social-accounts?tenantId=…` on every read.
  - The webhook endpoint is org-wide, so route events back to a workspace through our own id mapping.
- **Media must be a public HTTPS URL that Outstand fetches at publish time.** Our `/api/uploads/:id` is session-gated, so it can't be used directly.
  - Copy each asset into Outstand's media store (presigned PUT, then confirm, giving a public URL that lasts 60 days) when the idea is scheduled.
- **Scheduling.** `POST /v1/posts` with `scheduledAt` (at most **30 days** ahead, ±30s accuracy).
  - Reschedule with `PATCH /v1/posts/:id`; unschedule with `DELETE /v1/posts/:id`.
  - This maps one-to-one onto calendar drag, drop and tray.
- **Status.** Arrives by webhook: `post.published` (with `platformPostUrl`), `post.error`, `account.token_expired`. Signed with HMAC-SHA256 in `X-Outstand-Signature`.
  - `post.published` is where we call `recordPost()` and move the idea to Posted automatically. Today that's the manual "Mark posted".
- **Metrics.** `GET /v1/posts/:id/analytics` feeds `recordMetrics()`, so we can stop pasting numbers by hand.
- **Bonus: comments.** The `comment.received` webhook plus Comment-to-DM could later replace or augment ManyChat for keyword funnels, with attribution to the exact post.
- **Commercial blocker to settle first.** Reselling Outstand inside our SaaS needs **written permission on the $19 plan**. It is explicitly allowed on **Business ($129/mo)**.

---

## 1. Outstand basics

| Item | Detail |
| --- | --- |
| Auth | One API key per Outstand org, `Authorization: Bearer sk_live_…`. Multiple named keys allowed, so keep separate keys for dev and prod. |
| Subscription | Without an `active` subscription every call returns **402** `subscription_inactive`. Not retryable. `trialing` also returns 402. |
| Rate limits | Dynamic. Read `X-RateLimit-Limit/Remaining/Reset`. **429** is retryable: honour `Retry-After`, otherwise exponential backoff. A 429 saying "quota exhausted" is not retryable. |
| Idempotency | `Idempotency-Key` header on `POST /v1/posts` only. Remembered for 24h, scoped to the org. A replay returns the original response plus `Idempotency-Replayed: true`. |
| IDs | Opaque short strings (e.g. `Kx7vQ`). Store and replay them exactly as returned; never construct one. |
| Async model | `POST /v1/posts` returns in milliseconds and means "accepted and queued", **not** "live". Publishing happens later (1–10s per account), with per-account outcomes. |
| Their MCP server | `https://mcp.outstand.so/mcp` (28 tools). Fine for a single-user setup. **Not** for our multi-tenant app: it acts on the whole org with no tenant scoping. Expose our own workspace-scoped MCP tools instead (section 9). |
| React SDK | `@outstand-so/ui` takes the API key as a prop in the browser. **Don't use it.** The key would leak across tenants. |

### Pricing (from `pricing.md`, Oct 2026)

| Plan | Fee | Included | Overage | Notes |
| --- | --- | --- | --- | --- |
| Pay as you go | $19/mo | 3,000 posts | $0.007 → $0.005 | **Reselling needs written permission.** Unlimited accounts. 500 DM conversations included. |
| Business | $129/mo | 50,000 posts | $0.005 | **Reselling permitted.** 1,000 account slots to start (raised free). 10,000 DM conversations included. |

- **Billing unit.** One post delivered to one account. Scheduled posts count on the day they're created or scheduled, whatever the outcome. Drafts are free. Posts deleted before the daily usage report aren't counted.
- **Not billed:** analytics, media uploads, replies.
- **Video re-encode (`processMedia: true`)** is opt-in at **$0.05 per 10s of output**. Billing starts 2026-10-21. Validation is always free.

**Implication.** Reschedules are PATCHes, so they don't create new posts. Cancel-and-recreate flows (changing the target account) would count twice if both creates land in the same usage day. Prefer PATCH where possible.

## 2. Instagram specifics

- **Account type.** Instagram **Business or Creator** accounts only; personal accounts can't post through the API. The connect UI should tell users this before they start OAuth.
- **Scopes.** Default scopes on connect: `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`, `instagram_business_manage_insights`.
  - DMs (`instagram_business_manage_messages`) are opt-in. Passing `scopes` replaces the defaults, so include all five when you want DMs.
- **Formats.** Feed image, carousel (2–10 items), video/Reel, and Story (`instagram.publishAsStory: true`).
- **Caption.** At most 2,200 chars, 30 hashtags and 20 `@mentions`. Stories have no caption.
- **Images.** JPEG, ≤ 8 MB, ≤ 1440px wide, aspect ratio between 4:5 and 1.91:1. Note that 9:16 images are **not** valid feed images, only Stories.
- **Reels.** MP4/MOV, 3s–15min, 9:16 recommended. H.264 or HEVC video with AAC audio is the safe choice; faststart (metadata at the front) matters.
- **Rate limit.** 100 API-published posts per IG account per rolling 24h. A carousel counts as one post; Stories count too. Not a concern at our scale.
- **Useful `instagram.*` options for our product:**
  - `isAiGenerated: true` adds Meta's "AI info" label. This is relevant because Claude generates a lot of our media, so make it a per-idea toggle.
  - `trialReel: { graduationStrategy: "SS_PERFORMANCE" | "MANUAL" }` shows the Reel only to non-followers first. This is a great fit for **testing a recreated format** before it hits followers.
  - `reelCoverUrl` (public JPEG, 9:16) or `reelThumbOffset` (ms) sets the cover frame.
  - `collaborators` (up to 3 usernames), `userTags`, `locationId`, `altText`.
  - `instagram.content` gives an Instagram-only caption override.
- **No remote delete.** You can't delete a published Instagram post through the API (`DELETE /v1/posts/:id/remote` fails for IG). Once it's live, it's live.

## 3. How it maps onto ContentStudio

```
Ready idea ──drag onto calendar day──▶ Scheduled ──(Outstand publishes)──▶ Posted ──▶ metrics/funnel
             setIdeaDate()                          webhook post.published      analytics sync
             └─ creates Outstand post               └─ recordPost() + status    └─ recordMetrics()
```

| ContentStudio today | With Outstand |
| --- | --- |
| `ideas.scheduled_for`, set by calendar drag (`setIdeaDate` → `scheduleIdea`) | Same, plus `POST /v1/posts` (first time) or `PATCH /v1/posts/:id {scheduledAt}` (moves) |
| Drag back to Unscheduled tray (`scheduleIdea(ws, id, null)`) | `DELETE /v1/posts/:id`, which cancels the queued job |
| Editing a Scheduled idea's caption or media | `PATCH /v1/posts/:id {containers}`. Note this **replaces** all containers and media. |
| Manual "Mark posted" with a URL (`markPosted` → `recordPost`) | Automatic on `post.published`, using `platformPostUrl`. Keep the manual path for posts made outside Outstand. |
| `record_metrics` typed by hand or by Claude | Periodic `GET /v1/posts/:id/analytics` → `recordMetrics()` |
| ManyChat webhook → `recordEvent('comment_keyword')` | (Later) `comment.received` → keyword match → `recordEvent`, already tied to our post id |
| `assets` uploaded to `/api/uploads/:id` (private) | Mirrored into Outstand media; the public URL goes in `containers[].media[]` |
| `ideas.platform = 'instagram' \| 'tiktok'` | Selects which connected account to target. TikTok works too, see section 10. |

## 4. Data model changes (additive migrations in `src/lib/db.ts`)

```sql
-- One row per Instagram/TikTok account a workspace connected through Outstand.
CREATE TABLE IF NOT EXISTS social_accounts (
  id TEXT PRIMARY KEY,                       -- our id: sa_…
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  outstand_account_id TEXT NOT NULL UNIQUE,  -- opaque id from Outstand
  network TEXT NOT NULL,                     -- 'instagram' | 'tiktok' | …
  username TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',     -- active | needs_reconnect
  status_detail TEXT,                        -- last token error
  connected_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row per hand-off of an idea to Outstand (history survives cancel/recreate).
CREATE TABLE IF NOT EXISTS publications (
  id TEXT PRIMARY KEY,                       -- pub_…; also used as Idempotency-Key
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  idea_id TEXT NOT NULL REFERENCES ideas(id),
  social_account_id TEXT NOT NULL REFERENCES social_accounts(id),
  outstand_post_id TEXT UNIQUE,              -- null until POST succeeds
  status TEXT NOT NULL DEFAULT 'pending',    -- pending | queued | published | failed | cancelled
  error TEXT,
  scheduled_at TEXT,
  platform_post_id TEXT,
  platform_post_url TEXT,
  post_id TEXT REFERENCES posts(id),         -- our tracked post, set on publish
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS publications_idea ON publications(workspace_id, idea_id);

-- Mirror of an asset in Outstand's media store (public URL, expires after 60 days).
CREATE TABLE IF NOT EXISTS outstand_media (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  outstand_media_id TEXT NOT NULL,
  public_url TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
```

Add these to the `COLUMNS` migration list:

- `ideas.caption TEXT`. Ideas have hook, script and notes but no publishable caption. The `assets.kind='caption'` rows could serve, but a column is simpler to edit and validate (2,200 chars).
- `ideas.social_account_id TEXT`. The target account; default to the workspace's only account on that network.
- `ideas.ai_generated INTEGER`, which sets `instagram.isAiGenerated`.
- `ideas.publish_mode TEXT`, either `'auto'` (Outstand) or `'manual'` (today's Mark posted flow).
- `posts.platform_post_id TEXT`, the native IG media id, used for analytics and comment matching.

Everything stays `workspace_id`-scoped. Use `owned()` and `claimId()` exactly as the other tables do.

## 5. Connecting an Instagram account (per workspace)

1. **Settings → Connected accounts → "Connect Instagram"** posts a server action that calls:
   ```http
   POST /v1/social-networks/instagram/auth-url
   { "tenant_id": "<workspace id>", "redirect_uri": "https://<app>/api/outstand/callback",
     "force_account_selection": true }
   ```
   - `tenant_id` must match `[A-Za-z0-9_-]`. Our `ws_<hex>` ids qualify.
   - `force_account_selection` stops a second connect from silently re-authorizing the first account.
   - Generate a fresh URL every time; it's tenant-specific, so don't cache it.
2. Set a short-lived, httpOnly `cs_oauth` cookie holding a random nonce and the workspace id. Redirect the browser to `data.auth_url`. The session lasts **30 minutes**.
3. Outstand redirects back. Instagram (and TikTok) use the full callback contract: `?success=true&account_id=Kx7vQ&network_unique_id=…&username=brand`, or `?error=…` on failure.
4. **`/api/outstand/callback` must not trust the query string.** Anyone can hand-craft `account_id`. Instead:
   - Require the session and the `cs_oauth` cookie, and check the workspace matches.
   - `GET /v1/social-accounts?id=<account_id>&tenantId=<workspace id>`. Only if it returns the account do we upsert `social_accounts`.
5. Redirect to `/settings?connected=instagram`, with a flash on error.

**Reconnect.** The same flow updates the account in place, keeping its id, scheduled posts and history. Use it for `needs_reconnect`.

**Disconnect.** `DELETE /v1/social-accounts/:id`, then mark our row removed. Block it, or warn, while Scheduled ideas target that account.

**Not for now.** Facebook, LinkedIn and Google Business return a `session` token that has to be finalized with a **signed-in Outstand dashboard session**, so third-party apps can't complete that flow today. Instagram and TikTok are unaffected.

## 6. Media: making our uploads publishable

Outstand fetches media server-side at **publish time**. The URL must be public HTTPS with a correct `Content-Type` and no auth. Our `/api/uploads/:id` needs a session or API key, so there are two options:

- **A. Mirror into Outstand storage (recommended).**
  1. `POST /v1/media/upload {filename, content_type}` returns `{id, upload_url}`. The `upload_url` is a presigned R2 PUT, valid for 1h.
  2. Stream the file from `uploadPath(ws, assetId)` with a `PUT` to `upload_url` (same `Content-Type`).
  3. `POST /v1/media/:id/confirm {size}` returns `url`, a public URL that expires in 60 days.
  4. Cache the result in `outstand_media`. Re-mirror if `expires_at` falls before `scheduledAt` plus a margin. That can't happen today because Outstand's max schedule is 30 days, but it can for reposts or drafts.

  Advantages: the bytes never become public on our domain, the delivery is reliable, and it works with Railway's single replica.
- **B. Signed public URLs on our domain.** Something like `/m/<assetId>?exp=…&sig=HMAC`, served by `serveFile`. This is less work, but the URL must stay valid until publish time (up to 30 days), so a long-lived bearer link to user media. It also makes our app's uptime part of the publish path.

**Pre-flight validation (ours, before calling Outstand):**

- MIME is image/jpeg (convert PNG?), video/mp4 or video/quicktime.
- Size: ≤ 8 MB for images, ≤ 1 GB for Reels.
- Carousel has 2–10 items.
- Caption ≤ 2,200 chars and ≤ 30 hashtags.
- At least one media item (the "Needs media" badge already enforces this visually).

Outstand also probes videos for free:

- Unfixable problems (duration, aspect ratio) return **422**.
- Fixable ones (codec, faststart, fps) come back as `warnings`. Show those warnings on the idea, and offer "Auto-fix video (`processMedia`)" as a paid toggle.

Carousel ordering is the order of `media[]` in the single container. Use asset `created_at`, or add a `position` column to assets when carousels matter.

## 7. Scheduling and publishing flow

All of it lives in a new `src/lib/publishing.ts`, called from `scheduleIdea`/`updateIdea` paths in server actions, never from ingest's pure DB functions.

**schedule(ws, ideaId, when)**, run when an idea gets a date:

1. Check that the idea is `ready` or `scheduled`, has a caption or media, has a target account in `active` status, and the account belongs to the workspace.
2. If `when` is more than 30 days out, store the date only and leave the publication `pending`. The sweeper (below) hands it off once it's inside the window. The calendar should show "Sends to Instagram on <date − 30d>".
3. Mirror the media (section 6).
4. Branch on whether a live publication exists:
   - Live publication with an `outstand_post_id` in `queued` state: `PATCH /v1/posts/:id {scheduledAt}`. The response says `rescheduled: true`.
   - Otherwise:
     ```http
     POST /v1/posts            Idempotency-Key: <publication id>
     { "accounts": ["<outstand_account_id>"],
       "containers": [{ "content": "<caption>", "media": [{ "url": "<public>", "filename": "reel.mp4" }] }],
       "scheduledAt": "2026-10-12T09:00:00Z",
       "instagram": { "isAiGenerated": true, "reelThumbOffset": 500 } }
     ```
5. Then check the response:
   - `post.scheduled === true`. If it's false, nothing will publish it.
   - `post.socialAccounts` contains our account. Unresolved ids are dropped silently.
   - Store `outstand_post_id`, set `status = 'queued'`, and surface any `warnings`.

**unschedule(ws, ideaId)**, run on drag to the tray: `DELETE /v1/posts/:id`, set the publication to `cancelled`, and clear the date. This is the existing behaviour.

**Edit while Scheduled.** Caption or media changes trigger `PATCH /v1/posts/:id {containers:[…]}`. Changing the target account requires delete and recreate, because Outstand can't change accounts on a post.

**Already published.** PATCH returns **409**. Lock the idea's date and media in the UI once the status is `published`.

**Sweeper.** Handles dates more than 30 days out, plus retrying `pending` publications after a transient failure (5xx or 429). Options:

- A Railway cron service hitting `POST /api/cron/publish` with a shared secret.
- An in-process `setInterval` started from `instrumentation.ts` register. This is fine with `numReplicas: 1`, but double-runs if we scale.

The Railway cron is cleaner. Because the `Idempotency-Key` is the publication id, the sweeper is safe to re-run.

**Timezones.** The calendar already stores ISO UTC (`toISOString()`), and new dates default to 9am local. Outstand takes ISO 8601 UTC directly. Show the user's local time on chips (already done).

**Failure handling.** Map Outstand errors as follows:

| Error | Handling |
| --- | --- |
| 402 | Workspace-wide banner ("posting is paused"). Never retry. |
| 429 | Retry with backoff via the sweeper. |
| 400/422 | Show the message on the idea and move the publication to `failed`. |
| Network failure | Retry using the same Idempotency-Key. |

## 8. Webhooks: `/api/webhooks/outstand`

Outstand webhooks are configured **once in the Outstand dashboard** (Settings → Webhooks): name, URL, signing secret, events. There's no per-tenant webhook, so this route is **org-wide**, unlike our `/api/webhooks/manychat/[workspace]`.

- **Env.** `OUTSTAND_API_KEY` and `OUTSTAND_WEBHOOK_SECRET`. Both are Railway env vars only, never in the repo.
- **Verify the signature.** `X-Outstand-Signature: sha256=<hex HMAC-SHA256 of the raw body>`.
  - Read `await req.text()` first and HMAC **that**. Their Express example re-stringifies parsed JSON, which breaks if key order or whitespace differ.
  - Compare with our existing `safeEqual`.
- **Respond fast.** Return 2xx within 30s. Retries go up to 5× with backoff from 10s to 5min. Do the DB work inline (it's cheap SQLite), but defer any outbound calls.
- **Idempotent handling.** Duplicates happen. Dedupe on `postId`+`event` (posts) and on `commentId` (comments).
- **Route by our own mapping, never by payload trust.** Look up `publications` by `data.postId` (Outstand post id) to get `workspace_id`. Unknown ids are ignored with a 200.

| Event | Action |
| --- | --- |
| `post.published` | For our account in `data.socialAccounts`: with `platformPostId` → set the publication to `published`, then `recordPost(ws, {idea_id, platform, url: platformPostUrl, caption})`, store `platform_post_id`, link `publications.post_id`, and set the idea's status to `posted`. With `error` instead (a partial failure) → handle as `post.error`. |
| `post.error` | Set the publication to `failed` with the error, and move the idea back to `ready` (its date was missed). Show a red badge on the card and calendar chip: "Instagram rejected this: <error>". |
| `account.token_expired` | Set `social_accounts.status` to `needs_reconnect` and show a banner with a Reconnect button. ⚠ The doc example shows `accountId: 42` (numeric) while other payloads use opaque strings. Match on `network`+`username`+`orgId` as a fallback and verify against `GET /v1/social-accounts`. |
| `comment.received` (later) | Look up our post by `platformPostId`. If the text matches a workspace `keywords` row, call `recordEvent(ws, {type:'comment_keyword', source:'outstand', post_id, keyword, contact_ref: authorUsername})`. |

Webhook test: the Outstand dashboard has a "Test" button. Alternatively, sign a fixture locally with the secret and `curl` it, the same way we tested the Stripe webhook.

## 9. Metrics, UI and MCP

**Metrics sync.** `GET /v1/posts/:outstandPostId/analytics` returns `metrics_by_account[].metrics`: likes, comments, shares, views, impressions, reach, engagement_rate, and `platform_specific` (Instagram `saves`, `profile_visits`, `follows`). Map these onto `recordMetrics(ws, {post_id, views, likes, comments, shares, saves, profile_visits, follows})`.

- **Cadence.** Run at +1h, +24h, +72h and +7d after publish from the same sweeper, plus a "Refresh stats" button on Track.
- **Not billed** by Outstand. Still respect the rate-limit headers.
- Insights can be thin for accounts with fewer than 100 followers.
- Story insights expire after about 24h. Grab them at +1h and +20h.
- Account-level stats: `GET /v1/social-accounts/:id/metrics?since&until` (followers, reach, views) could feed a Track header.

**UI changes:**

- **Settings → Connected accounts.** List the accounts (avatar, @username, status) with Connect, Reconnect and Disconnect. Copy should mention the Business/Creator requirement.
- **Idea panel, when status is Ready or Scheduled:**
  - A Caption field with a 2,200-char counter and a hashtag counter.
  - An account picker.
  - Toggles for "Publish automatically" (vs manual), "Label as AI-generated" and "Trial Reel".
  - Validation messages from the pre-flight.
- **Calendar chips and kanban cards.** Show publish state: queued (clock), published (check), failed (red with the error in the tooltip), needs reconnect (amber).
  - Disable dragging for `published`.
  - Dragging a `queued` chip PATCHes; dropping it in the tray DELETEs.
- **Track.** Posts published through Outstand get "Synced from Instagram" stats, and the manual `record_metrics` path stays.

**Our MCP tools (`src/lib/mcp/server.ts`), workspace-scoped:**

- `list_social_accounts`
- `schedule_idea {idea_id, when, account_id?, caption?, ai_generated?, trial_reel?}`. Same rules as the calendar: Ready only, at most 30 days for an immediate hand-off.
- `unschedule_idea`
- `publish_now {idea_id}`. Omits `scheduledAt`, so it publishes immediately.
- `get_publish_status {idea_id}`
- `sync_post_metrics {post_id?}`

Extend `get_calendar` with the publish state. Update the `CLAUDE.md` recreate loop: step 5 becomes "schedule → auto-publish → metrics sync" instead of manual `mark_posted`/`record_metrics`.

## 10. TikTok, almost free

The same client works for `network: "tiktok"`.

- **The default `postMode` is `MEDIA_UPLOAD`.** The video lands in the creator's TikTok inbox as a draft and they publish it in the app. There is no public URL and no analytics until they do, and the correlation expires after about 24h.
- **`DIRECT_POST`** needs `privacyLevel` and counts against TikTok's daily active-creator cap.

Recommendation: ship Instagram first. Then add TikTok with `MEDIA_UPLOAD` and keep TikTok ideas on the manual "Mark posted" path.

## 11. Implementation order

1. **Plumbing.**
   - `src/lib/integrations/outstand.ts`: a typed fetch wrapper with Bearer auth, JSON parsing, `{success:false,error}` mapped to `OutstandError(status, code)`, 429/`Retry-After` handling, and logging of the rate-limit headers.
   - Env vars in `.env.example`.
   - Migrations from section 4.
2. **Connect.** The auth-url action, `/api/outstand/callback` with verification, and the Settings UI. Test with a real Business/Creator account.
3. **Publish now.** Media mirror, `POST /v1/posts` without `scheduledAt`, and the webhook route handling `post.published`/`post.error` → `recordPost`. Verify end to end with one real Reel.
4. **Scheduled publishing.** Hook up `setIdeaDate` and the tray (POST/PATCH/DELETE), chip states, the 30-day rule and the sweeper.
5. **Metrics sync** and the Track "Refresh stats" button.
6. **MCP tools and CLAUDE.md** update.
7. **Later:** `comment.received` keyword attribution, Comment-to-DM (needs the DM scope and reconnects, billed per conversation), TikTok, trial Reels and cover images.

Checks at each step: `npx tsc --noEmit`, `npm run lint`, `npm run build`, and a cross-tenant test (workspace B must not be able to target workspace A's `social_account_id` or read its publications).

## 12. Open questions and decisions

- **Plan and reselling.** Do we start on Business ($129/mo, reselling allowed), or ask Outstand for written permission on Pay as you go? Get it in writing before launch.
- **Branding.** Managed Keys shows Outstand's Meta app on the consent screen. Do we want BYOK later, with our own Meta app and 2+ weeks of App Review, so users see "ContentStudio"?
- **Quotas per workspace.** Should we meter posts per workspace (like `consumeQuota` for Scrape Creators) so one tenant can't burn the org's included posts?
- **Schedules more than 30 days out.** Use the sweeper (recommended), or cap the calendar's auto-publish at 30 days?
- **Media hosting.** Option A (Outstand storage, recommended) or B (signed URLs)?
- **PNG images.** Instagram's documented image format is JPEG only (the post-schema doc says JPEG/PNG for IG; the IG page says JPEG). Do we convert PNG to JPEG on upload (needs `sharp`) or reject it?
- **`account.token_expired` id shape.** The docs show a numeric `accountId`. Confirm against a real event.
- **Disconnects.** What happens to Scheduled ideas when their account is disconnected or deleted? Proposal: move them back to Ready and flash a warning.

## Sources

- Docs index for LLMs: https://www.outstand.so/docs/llms.txt, and full docs: https://www.outstand.so/docs/llms-full.txt
- Getting Started (callback contracts, media flow): https://www.outstand.so/docs/getting-started
- Authentication, rate limits, 402: https://www.outstand.so/docs/authentication
- Architecture (async fan-out, partial success): https://www.outstand.so/docs/architecture
- Backend Integration Guide: https://www.outstand.so/docs/backend-integration
- Auth URL (`tenant_id`, `force_account_selection`): https://www.outstand.so/docs/get-social-network-authentication-url
- List social accounts (`tenantId` filter): https://www.outstand.so/docs/list-connected-social-accounts
- Create a post: https://www.outstand.so/docs/create-a-post
- Update a post: https://www.outstand.so/docs/update-a-post
- Delete & cancel a post: https://www.outstand.so/docs/delete-cancel-a-post
- Post Lifecycle: https://www.outstand.so/docs/post-lifecycle
- Idempotency: https://www.outstand.so/docs/idempotency
- Media upload: https://www.outstand.so/docs/get-upload-url and https://www.outstand.so/docs/confirm-upload
- Video processing: https://www.outstand.so/docs/video-processing
- Webhooks: https://www.outstand.so/docs/webhooks
- Post analytics: https://www.outstand.so/docs/get-post-analytics
- Account metrics: https://www.outstand.so/docs/get-account-metrics
- Instagram configuration (specs, limits, Stories, covers, AI label, DMs): https://www.outstand.so/docs/configurations/instagram
- TikTok configuration: https://www.outstand.so/docs/configurations/tiktok
- Comment-to-DM: https://www.outstand.so/docs/conversations/comment-to-dm
- React UI SDK: https://www.outstand.so/docs/sdk/ui
- Pricing: https://www.outstand.so/pricing.md
- Facts and MCP: https://www.outstand.so/llms.txt
