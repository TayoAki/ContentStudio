@AGENTS.md

# ContentStudio

Next.js (App Router, Cache Components on) + Tailwind v4 + `node:sqlite`.

- Data layer: `src/lib/db.ts` (schema), `src/lib/queries.ts` (reads), `src/lib/ingest.ts` (writes, attribution).
- Pages read SQLite synchronously, so every page calls `await connection()` first.
- Pages: `src/app/(studio)/{discover,recreate,track,settings}`; server actions in `src/app/actions.ts`.
- Checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Using the app from Claude Code (recreate workflow)

When asked to research a niche or recreate a format, record results in the app rather than leaving them in chat. Use the `contentstudio` MCP server (`.mcp.json`; tools defined in `src/lib/mcp/server.ts`). Typical loop:

1. Pull trending videos (Virlo MCP or `sync_scrapecreators`) → `add_trending_posts`.
2. Cluster them into formats → `save_format` with `example_urls`.
3. `get_format_brief`, write scripts → `save_ideas`; schedule with `update_idea`.
4. Generate media → `add_assets` linked by `idea_id`.
5. After publishing: `mark_posted`, `create_tracked_link`, `record_metrics`; review with `get_format_performance`.

If the MCP server isn't connected, the same writes exist as HTTP endpoints under `/api/ingest/*` (README "API").
