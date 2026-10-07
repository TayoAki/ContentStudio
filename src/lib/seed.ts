import type { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";

// Demo login + workspace with a seeded men's-fashion niche so the app is
// explorable locally. On by default outside production; SEED_DEMO_DATA overrides.
export const DEMO_EMAIL = "demo@contentstudio.dev";
export const DEMO_PASSWORD = "demo-password";
const WS = "ws_demo";

const DAY = 86_400_000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
const isoAhead = (msAhead: number) => new Date(Date.now() + msAhead).toISOString();

// Deterministic PRNG so demo numbers are stable between resets.
function rng(seedValue: number) {
  let s = seedValue;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function seed(conn: DatabaseSync) {
  const rand = rng(42);
  const run = (sql: string, ...args: (string | number | null)[]) =>
    conn.prepare(sql).run(...args);

  conn.exec("BEGIN");
  try {
    const salt = randomBytes(16);
    const hash = `scrypt$${salt.toString("hex")}$${scryptSync(DEMO_PASSWORD, salt, 64).toString("hex")}`;
    run("INSERT INTO users (id, email, name, password_hash) VALUES ('usr_demo', ?, 'Demo', ?)", DEMO_EMAIL, hash);
    run("INSERT INTO workspaces (id, name, manychat_secret) VALUES (?, 'Demo studio', ?)", WS, randomBytes(18).toString("base64url"));
    run("INSERT INTO memberships (user_id, workspace_id) VALUES ('usr_demo', ?)", WS);
    run(
      `INSERT INTO niches (workspace_id, id, name, keywords) VALUES ('${WS}', ?, ?, ?), ('${WS}', ?, ?, ?)`,
      "fashion", "Men's fashion", "colour combinations, outfit ideas, mens style tips, capsule wardrobe",
      "fitness", "Fitness", "workout, form tips, hypertrophy, mobility",
    );

    const formats: [string, string, string, string, string[], string, string][] = [
      [
        "fmt_two_ways", "fashion", "1 Piece, 2 Ways",
        "Two people (or two looks) style the same hero piece for different vibes, side by side.",
        [
          "0-2s: Both looks standing still, text: 'One blazer. Two vibes.'",
          "2-6s: Look 1 breakdown — piece, fit tip, shoe",
          "6-10s: Look 2 breakdown — contrast colour, structure, shoe",
          "10-13s: The rule that makes both work",
          "End card: 'Save this for your next fit'",
        ],
        "Instantly scannable, high save rate (people bookmark outfit references), works with zero talking.",
        "testing",
      ],
      [
        "fmt_stop_wearing", "fashion", "Stop Wearing X, Wear Y",
        "Corrective advice format: show the common mistake, then the upgrade.",
        ["Hook: 'Stop wearing ___ with ___'", "Show the mistake", "Show the fix", "Why it works (1 line)", "CTA: comment STYLE for the full guide"],
        "Pattern interrupt hook + mild controversy drives comments; ideal for ManyChat keyword CTAs.",
        "testing",
      ],
      [
        "fmt_colour_guide", "fashion", "Colour Combination Guide",
        "Flat-lay or on-body outfits labelled with the colours that pair, one combo per beat. Built to be saved.",
        [
          "0-1s: Title card, e.g. 'Colour combos that always work'",
          "1-8s: 4-6 outfits, each labelled 'navy + camel', 'olive + cream'…",
          "Last beat: 'Save this for your next fit'",
        ],
        "Pure reference content: people save it to use later, which the algorithm reads as high value. No talking, so it works across languages.",
        "winner",
      ],
      [
        "fmt_formula", "fashion", "Outfit Formula Breakdown",
        "Text overlay formula (Top + Bottom + Shoe) over a slow pan of the outfit.",
        ["Formula title card", "Piece 1 close-up", "Piece 2 close-up", "Shoe close-up", "Full look"],
        "Educational and repeatable; viewers save it as a shopping list.",
        "watching",
      ],
      [
        "fmt_form_fix", "fitness", "Form Fix in 10 Seconds",
        "Split screen: wrong rep vs right rep with one cue.",
        ["Hook: 'You're doing ___ wrong'", "Wrong rep (red)", "Right rep (green)", "The one cue"],
        "Saves + shares from people sending it to gym partners.",
        "watching",
      ],
    ];
    for (const [fid, niche, name, summary, structure, why, status] of formats) {
      run(
        `INSERT INTO formats (workspace_id, id, niche_id, name, summary, structure, why_it_works, status) VALUES ('${WS}', ?, ?, ?, ?, ?, ?, ?)`,
        fid, niche, name, summary, JSON.stringify(structure), why, status,
      );
    }

    // Accounts from real research in the fashion niche (figures as reported at
    // the time); the "AI models" row is a labelled placeholder.
    type SeedCreator = {
      id: string; platform: string; handle: string; name: string; niche: string; followers: number;
      prev: number; ageDays: number | null; category: string; sells: string | null; sellsUrl: string | null;
    };
    const creators: SeedCreator[] = [
      { id: "cr_1", platform: "instagram", handle: "layrandlayr", name: "LAYR", niche: "fashion", followers: 1_000_000, prev: 0, ageDays: 135,
        category: "Colour & outfit guides", sells: "Own clothing brand", sellsUrl: "https://layr-layr.com" },
      { id: "cr_2", platform: "instagram", handle: "styleformula.daily", name: "Style Formula Daily", niche: "fashion", followers: 410_000, prev: 0, ageDays: null,
        category: "Colour & outfit guides", sells: "Digital style guide (Gumroad)", sellsUrl: null },
      { id: "cr_3", platform: "instagram", handle: "thestyleformulaa", name: "The Style Formula", niche: "fashion", followers: 303_000, prev: 0, ageDays: null,
        category: "Colour & outfit guides", sells: "Style guide (Beacons)", sellsUrl: null },
      { id: "cr_4", platform: "instagram", handle: "dresscodelab.co", name: "Dress Code Lab", niche: "fashion", followers: 160_000, prev: 0, ageDays: null,
        category: "Colour & outfit guides", sells: "Affiliate links (ShopMy)", sellsUrl: null },
      { id: "cr_5", platform: "instagram", handle: "example.ai.model", name: "Example account (demo placeholder)", niche: "fashion", followers: 240_000, prev: 120_000, ageDays: 70,
        category: "AI models", sells: "Brand deals", sellsUrl: null },
      { id: "cr_6", platform: "tiktok", handle: "liftlab", name: "Lift Lab (demo)", niche: "fitness", followers: 140_000, prev: 70_000, ageDays: 120,
        category: "Form tips", sells: null, sellsUrl: null },
    ];
    for (const c of creators) {
      run(
        `INSERT INTO creators (workspace_id, id, platform, handle, display_name, niche_id, followers, followers_30d_ago, first_post_at, source, category, sells, sells_url)
         VALUES ('${WS}', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c.id, c.platform, c.handle, c.name, c.niche, c.followers, c.prev, c.ageDays === null ? null : iso(c.ageDays * DAY),
        "scrapecreators", c.category, c.sells, c.sellsUrl,
      );
    }

    // [creator, format, hook, views, saves (null = not reported), thumbnail, days ago]
    const trending: [string, string, string, number, number | null, string | null, number][] = [
      ["cr_1", "fmt_two_ways", "Couple outfit inspiration", 14_400_000, 478_000, "/samples/blazer-two-ways.webp", 40],
      ["cr_1", "fmt_colour_guide", "Colour combinations", 12_200_000, null, null, 55],
      ["cr_1", "fmt_formula", "Jeans guide", 12_100_000, null, null, 62],
      ["cr_1", "fmt_colour_guide", "Office colour combos", 6_200_000, null, null, 30],
      ["cr_2", "fmt_colour_guide", "Fall third-colour outfit ideas", 1_600_000, null, null, 12],
      ["cr_3", "fmt_colour_guide", "Save this colour guide", 1_200_000, null, null, 9],
      ["cr_4", "fmt_colour_guide", "Colour pairings that look elevated", 2_400_000, null, null, 18],
      ["cr_5", "fmt_two_ways", "Same outfit, two moods (AI model demo)", 900_000, 41_000, null, 6],
      ["cr_6", "fmt_form_fix", "You're squatting wrong (10 sec fix)", 3_100_000, 90_000, null, 7],
    ];
    trending.forEach(([cid, fid, hook, views, saves, thumb, daysAgo], i) => {
      const c = creators.find((x) => x.id === cid)!;
      run(
        `INSERT INTO trending_posts (workspace_id, id, platform, url, creator_id, niche_id, format_id, caption, hook, thumbnail_url,
           views, likes, comments, shares, saves, posted_at, source)
         VALUES ('${WS}', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        `tp_${i + 1}`, c.platform,
        c.platform === "instagram" ? `https://www.instagram.com/${c.handle}/#demo-${i + 1}` : `https://www.tiktok.com/@${c.handle}#demo-${i + 1}`,
        cid, c.niche, fid, hook, hook, thumb,
        views, Math.round(views * (0.05 + rand() * 0.03)), Math.round(views * (0.002 + rand() * 0.004)), 0, saves ?? 0,
        iso(daysAgo * DAY), "scrapecreators",
      );
    });

    const ideas: [string, string, string, string, string, string, number | null, string][] = [
      ["idea_1", "fmt_two_ways", "Navy vs cream blazer — 2 vibes", "One blazer. Two vibes. Which are you?", "posted", "instagram", -9, "claude"],
      ["idea_2", "fmt_stop_wearing", "Stop wearing sneakers with blazers", "Stop wearing sneakers with your blazer.", "posted", "instagram", -5, "claude"],
      ["idea_3", "fmt_two_ways", "White tee, 2 ways (day / night)", "Same white tee. Day to night in 10 seconds.", "posted", "tiktok", -2, "claude"],
      ["idea_4", "fmt_formula", "Wedding guest formula (fall)", "The fall wedding guest formula nobody tells you.", "scheduled", "instagram", 2, "claude"],
      ["idea_5", "fmt_two_ways", "Black jeans, 2 ways", "One pair of black jeans. Two completely different men.", "producing", "instagram", 4, "claude"],
      ["idea_6", "fmt_stop_wearing", "Stop tucking your tee like this", "Stop tucking your t-shirt like this.", "scripting", "tiktok", 6, "user"],
      ["idea_7", "fmt_formula", "Loafers with jeans: the rule", "", "idea", "instagram", null, "claude"],
    ];
    for (const [iid, fid, title, hook, status, platform, dayOffset, by] of ideas) {
      const date = dayOffset === null ? null : dayOffset < 0 ? iso(-dayOffset * DAY) : isoAhead(dayOffset * DAY);
      // Work in progress has a planned date; only scheduled/posted ideas have a publish date.
      const inProgress = status === "idea" || status === "scripting" || status === "producing";
      run(
        `INSERT INTO ideas (workspace_id, id, format_id, title, hook, script, status, platform, scheduled_for, planned_for, created_by)
         VALUES ('${WS}', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        iid, fid, title, hook,
        hook ? `HOOK: ${hook}\nBEAT 1: show look one, call out the hero piece\nBEAT 2: show look two, contrast colour\nRULE: one structured piece + one relaxed piece\nCTA: save this` : "",
        status, platform,
        inProgress ? null : date,
        inProgress ? date : null,
        by,
      );
    }
    run(
      `INSERT INTO assets (workspace_id, id, idea_id, kind, url, label, created_by) VALUES ('${WS}', ?, ?, ?, ?, ?, ?), ('${WS}', ?, ?, ?, ?, ?, ?)`,
      "as_1", "idea_1", "image", "/samples/blazer-two-ways.webp", "Cover frame", "claude",
      "as_2", "idea_5", "image", "/samples/blazer-two-ways.webp", "Reference look", "user",
    );

    // Published posts + their funnels.
    const posts: [string, string, string, number, number, string | null][] = [
      ["post_1", "idea_1", "instagram", 9, 1_840_000, "BLAZER"],
      ["post_2", "idea_2", "instagram", 5, 320_000, "LOAFER"],
      ["post_3", "idea_3", "tiktok", 2, 96_000, null],
    ];
    for (const [pid, iid, platform, daysAgo, views, keyword] of posts) {
      const title = ideas.find((i) => i[0] === iid)![2];
      run(
        `INSERT INTO posts (workspace_id, id, idea_id, platform, url, caption, thumbnail_url, published_at) VALUES ('${WS}', ?, ?, ?, ?, ?, ?, ?)`,
        pid, iid, platform, `https://example.com/${platform}/me/${pid}`, title,
        pid === "post_1" ? "/samples/blazer-two-ways.webp" : null, iso(daysAgo * DAY),
      );
      // Daily metric snapshots with a viral-ish curve.
      for (let d = daysAgo; d >= 0; d--) {
        const progress = 1 - Math.pow(0.55, daysAgo - d + 1);
        const v = Math.round(views * progress);
        run(
          `INSERT INTO post_metrics (post_id, captured_at, views, likes, comments, shares, saves, profile_visits, follows)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          pid, iso(d * DAY), v, Math.round(v * 0.07), Math.round(v * 0.004), Math.round(v * 0.015),
          Math.round(v * 0.08), Math.round(v * 0.03), Math.round(v * 0.006),
        );
      }
      const slug = `demo-${pid.replace("post_", "p")}`;
      run(
        `INSERT INTO links (workspace_id, slug, destination, label, post_id) VALUES ('${WS}', ?, ?, ?, ?)`,
        slug, "https://example.com/blazer-guide", `${title} — DM link`, pid,
      );
      if (keyword) run(`INSERT INTO keywords (workspace_id, keyword, post_id, link_slug) VALUES ('${WS}', ?, ?, ?)`, keyword, pid, slug);

      // Funnel events: comments(keyword) -> DMs -> clicks -> opt-ins -> purchases.
      const kwComments = keyword ? Math.round(views * 0.0011) : 0;
      const clicks = keyword ? Math.round(kwComments * 0.62) : Math.round(views * 0.0004);
      const optins = Math.round(clicks * 0.28);
      const purchases = Math.round(optins * 0.12);
      let n = 0;
      const ev = (type: string, value = 0, source = "manychat", clickId: string | null = null) =>
        run(
          `INSERT INTO events (workspace_id, id, type, post_id, link_slug, keyword, click_id, value_cents, source, created_at)
           VALUES ('${WS}', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `ev_${pid}_${n++}`, type, pid, slug, keyword, clickId, value, source,
          iso(Math.max(0, daysAgo - rand() * daysAgo) * DAY),
        );
      for (let i = 0; i < kwComments; i++) ev("comment_keyword");
      for (let i = 0; i < kwComments; i++) ev("dm_sent");
      for (let i = 0; i < clicks; i++) ev("link_click", 0, "link", `clk_${pid}_${i}`);
      for (let i = 0; i < optins; i++) ev("optin", 0, "link", `clk_${pid}_${i}`);
      for (let i = 0; i < purchases; i++) ev("purchase", 2900, "stripe", `clk_${pid}_${i}`);
    }
    run(
      `INSERT INTO links (workspace_id, slug, destination, label, post_id) VALUES ('${WS}', ?, ?, ?, NULL)`,
      "demo-bio", "https://example.com/shop", "Link in bio",
    );
    for (let i = 0; i < 140; i++) {
      run(
        `INSERT INTO events (workspace_id, id, type, post_id, link_slug, value_cents, source, created_at) VALUES ('${WS}', ?, 'link_click', NULL, 'demo-bio', 0, 'link', ?)`,
        `ev_bio_${i}`, iso(rand() * 10 * DAY),
      );
    }
    conn.exec("COMMIT");
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
}
