import type { Format, TrendingPost } from "./queries";
import { compact, pct } from "./format";

// The handoff to Claude Code: everything it needs to write scripts in this
// format, plus how to push results back into ContentStudio.
export function claudeBrief(format: Format, examples: TrendingPost[], appUrl: string): string {
  const ex = examples
    .slice(0, 5)
    .map(
      (p, i) =>
        `${i + 1}. @${p.handle} (${p.platform}) — ${compact(p.views)} views, ${pct(p.save_rate)} save rate, ${p.reach_multiple.toFixed(1)}x followers\n   Hook: "${p.hook}"\n   Caption: ${p.caption}${p.transcript ? `\n   Transcript: ${p.transcript}` : ""}\n   ${p.url}`,
    )
    .join("\n");
  return `You are writing short-form scripts for our ${format.niche_id} account using a proven format.

FORMAT: ${format.name}
${format.summary}

STRUCTURE:
${format.structure.map((b) => `- ${b}`).join("\n")}

WHY IT WORKS: ${format.why_it_works}

TOP EXAMPLES (what's working right now):
${ex || "(none yet)"}

TASK:
1. Write 5 new ideas in this exact format for our audience. Each needs a title, a scroll-stopping hook (<= 10 words), and a beat-by-beat script that matches the structure above. Optimise for SAVES: make it genuinely useful reference content.
2. Save each idea to ContentStudio with the MCP tool save_ideas (format_id "${format.id}"), or without MCP:
   curl -X POST ${appUrl}/api/ingest/ideas \\
     -H "Authorization: Bearer $CONTENTSTUDIO_API_KEY" -H "Content-Type: application/json" \\
     -d '{"format_id":"${format.id}","title":"...","hook":"...","script":"...","status":"scripting","created_by":"claude"}'
3. When you generate images/videos for an idea, register them with add_assets (or POST ${appUrl}/api/ingest/assets).
`;
}
