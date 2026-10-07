import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import fs from "node:fs";
const keys = JSON.parse(fs.readFileSync(process.argv[2] + "/keys.json", "utf8"));
async function connect(key) {
  const c = new Client({ name: "t", version: "0" });
  await c.connect(new StreamableHTTPClientTransport(new URL("http://localhost:3100/api/mcp"), { requestInit: { headers: { Authorization: `Bearer ${key}` } } }));
  return async (name, args = {}) => { const r = await c.callTool({ name, arguments: args }); const t = r.content[0].text; return r.isError ? { ERROR: t } : JSON.parse(t); };
}
const A = await connect(keys.alice), B = await connect(keys.bob);
const niche = await A("save_niche", { name: "Men's fashion", keywords: "mens style tips, outfit ideas" });
console.log("A niche", niche);
const search = await A("search_instagram_reels", { query: "mens style tips", niche_id: niche.id });
console.log("A reels search", search.stored, "reels;", search.handles?.slice(0, 4));
const sync = await A("sync_creators", { platform: "instagram", handles: [search.handles[0]], niche_id: niche.id });
console.log("A ig sync", sync);
const ov = await A("get_discover_overview", { niche_id: niche.id, limit: 3 });
console.log("A top posts", ov.top_posts.map((p) => `${p.handle} ${p.views}v ${p.reach_multiple.toFixed(2)}x`));
const fmt = await A("save_format", { name: "Body-type style guide", niche_id: niche.id, structure: ["hook", "3 tips", "cta"], example_urls: [ov.top_posts[0].url] });
const idea = await A("save_ideas", { ideas: [{ title: "Style for tall guys", format_id: fmt.id }] });
const post = await A("mark_posted", { idea_id: idea.ids[0] });
console.log("A usage", await A("get_usage"));
// ---- Bob must see none of it and touch none of it
console.log("B niches", await B("list_niches"));
console.log("B trending", (await B("list_trending_posts", {})).length);
console.log("B ideas", (await B("list_ideas", {})).length);
console.log("B update A idea", await B("update_idea", { idea_id: idea.ids[0], title: "pwned" }));
console.log("B save idea w/ A format", await B("save_ideas", { ideas: [{ title: "x", format_id: fmt.id }] }));
console.log("B overwrite A format", await B("save_format", { id: fmt.id, name: "pwned" }));
console.log("B link to A post", await B("create_tracked_link", { slug: "b-link", destination: "https://example.com", post_id: post.post_id }));
console.log("B metrics on A post", await B("record_metrics", { metrics: [{ post_id: post.post_id, views: 1 }] }));
console.log("B perf A post", await B("get_performance", { post_id: post.post_id }));
console.log("B format brief A", await B("get_format_brief", { format_id: fmt.id }));
const al = await A("create_tracked_link", { slug: "alice-guide", destination: "https://example.com/g", post_id: post.post_id, keyword: "GUIDE" });
console.log("A link", al, "| B same slug:", await B("create_tracked_link", { slug: "alice-guide", destination: "https://example.com" }));
console.log("A idea title still", (await A("get_idea", { idea_id: idea.ids[0] })).title);
