@AGENTS.md

# ContentStudio

Next.js (App Router, Cache Components on) + Tailwind v4 + `node:sqlite`.

- Data layer: `src/lib/db.ts` (schema), `src/lib/queries.ts` (reads), `src/lib/ingest.ts` (writes, attribution).
- Pages read SQLite synchronously, so every page calls `await connection()` first.
- Pages: `src/app/(studio)/{discover,recreate,track,settings}`; server actions in `src/app/actions.ts`.
- Checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Using the app from Claude Code (recreate workflow)

When asked to research a niche or recreate a format, push results into the app rather than leaving them in chat. See README "API" for payloads. Typical loop:

1. Pull trending videos (Virlo MCP or `POST /api/sync/scrapecreators`) → `POST /api/ingest/trending`.
2. Cluster them into formats → `POST /api/ingest/formats` with `example_urls`.
3. Write scripts → `POST /api/ingest/ideas` (`created_by: "claude"`, `status: "scripting"`).
4. Generate media → `POST /api/ingest/assets` linked by `idea_id`.
