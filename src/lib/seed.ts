import type { DatabaseSync } from "node:sqlite";

// Demo data for the fashion niche so the app is explorable before any
// integration is connected. Disable with SEED_DEMO_DATA=false.

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
    run(
      "INSERT INTO niches (id, name, keywords) VALUES (?, ?, ?), (?, ?, ?)",
      "fashion", "Men's fashion", "mens style, outfit ideas, style tips, capsule wardrobe",
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
        "winner",
      ],
      [
        "fmt_stop_wearing", "fashion", "Stop Wearing X, Wear Y",
        "Corrective advice format: show the common mistake, then the upgrade.",
        ["Hook: 'Stop wearing ___ with ___'", "Show the mistake", "Show the fix", "Why it works (1 line)", "CTA: comment STYLE for the full guide"],
        "Pattern interrupt hook + mild controversy drives comments; ideal for ManyChat keyword CTAs.",
        "testing",
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
        "INSERT INTO formats (id, niche_id, name, summary, structure, why_it_works, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        fid, niche, name, summary, JSON.stringify(structure), why, status,
      );
    }

    const creators: [string, string, string, string, number, number, number][] = [
      ["cr_1", "instagram", "fitsbydre", "Dre | Style Tips", 184_000, 41_000, 94],
      ["cr_2", "tiktok", "blazerseason", "Blazer Season", 312_000, 88_000, 61],
      ["cr_3", "instagram", "thecapsuleguy", "The Capsule Guy", 96_000, 52_000, 140],
      ["cr_4", "tiktok", "menswear.math", "Menswear Math", 58_000, 9_000, 38],
      ["cr_5", "instagram", "oldmoneyfits", "Old Money Fits", 1_200_000, 1_150_000, 1400],
      ["cr_6", "tiktok", "liftlab", "Lift Lab", 140_000, 70_000, 120],
    ];
    for (const [cid, platform, handle, name, followers, prev, ageDays] of creators) {
      run(
        `INSERT INTO creators (id, platform, handle, display_name, niche_id, followers, followers_30d_ago, first_post_at, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        cid, platform, handle, name, cid === "cr_6" ? "fitness" : "fashion", followers, prev, iso(ageDays * DAY),
        platform === "tiktok" ? "virlo" : "scrapecreators",
      );
    }

    const trending: [string, string, string, string, string | null, number, number][] = [
      ["cr_1", "fmt_two_ways", "One blazer. Two completely different vibes.", "Navy textured vs cream double-breasted — which one?", "/samples/blazer-two-ways.webp", 2_400_000, 3],
      ["cr_2", "fmt_two_ways", "Same jeans, two blazers, zero effort", "Light wash + navy, black denim + cream.", "/samples/blazer-two-ways.webp", 1_150_000, 5],
      ["cr_4", "fmt_stop_wearing", "Stop wearing sneakers with blazers", "Do this instead 👇 comment LOAFER", null, 870_000, 2],
      ["cr_3", "fmt_formula", "The only date-night formula you need", "Tee + blazer + straight denim + suede loafer", null, 640_000, 6],
      ["cr_2", "fmt_stop_wearing", "Stop buying skinny jeans in 2026", "Straight leg changes everything.", null, 1_900_000, 9],
      ["cr_5", "fmt_formula", "Old money summer formula", "Linen + loafers.", null, 450_000, 4],
      ["cr_6", "fmt_form_fix", "You're squatting wrong (10 sec fix)", "Knees out, chest proud.", null, 3_100_000, 7],
    ];
    trending.forEach(([cid, fid, hook, caption, thumb, views, daysAgo], i) => {
      const saveRate = fid === "fmt_two_ways" || fid === "fmt_formula" ? 0.06 + rand() * 0.04 : 0.015 + rand() * 0.02;
      const platform = (creators.find((c) => c[0] === cid) ?? creators[0])[1];
      run(
        `INSERT INTO trending_posts (id, platform, url, creator_id, niche_id, format_id, caption, hook, thumbnail_url,
           views, likes, comments, shares, saves, posted_at, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        `tp_${i + 1}`, platform, `https://example.com/${platform}/post/${i + 1}`, cid,
        fid === "fmt_form_fix" ? "fitness" : "fashion", fid, caption, hook, thumb,
        views, Math.round(views * (0.05 + rand() * 0.04)), Math.round(views * (0.002 + rand() * 0.006)),
        Math.round(views * (0.01 + rand() * 0.02)), Math.round(views * saveRate), iso(daysAgo * DAY),
        platform === "tiktok" ? "virlo" : "scrapecreators",
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
      run(
        `INSERT INTO ideas (id, format_id, title, hook, script, status, platform, scheduled_for, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        iid, fid, title, hook,
        hook ? `HOOK: ${hook}\nBEAT 1: show look one, call out the hero piece\nBEAT 2: show look two, contrast colour\nRULE: one structured piece + one relaxed piece\nCTA: save this` : "",
        status, platform,
        dayOffset === null ? null : dayOffset < 0 ? iso(-dayOffset * DAY) : isoAhead(dayOffset * DAY),
        by,
      );
    }
    run(
      "INSERT INTO assets (id, idea_id, kind, url, label, created_by) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)",
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
        "INSERT INTO posts (id, idea_id, platform, url, caption, thumbnail_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
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
      const slug = `${pid.replace("post_", "p")}`;
      run(
        "INSERT INTO links (slug, destination, label, post_id) VALUES (?, ?, ?, ?)",
        slug, "https://example.com/blazer-guide", `${title} — DM link`, pid,
      );
      if (keyword) run("INSERT INTO keywords (keyword, post_id, link_slug) VALUES (?, ?, ?)", keyword, pid, slug);

      // Funnel events: comments(keyword) -> DMs -> clicks -> opt-ins -> purchases.
      const kwComments = keyword ? Math.round(views * 0.0011) : 0;
      const clicks = keyword ? Math.round(kwComments * 0.62) : Math.round(views * 0.0004);
      const optins = Math.round(clicks * 0.28);
      const purchases = Math.round(optins * 0.12);
      let n = 0;
      const ev = (type: string, value = 0, source = "manychat", clickId: string | null = null) =>
        run(
          `INSERT INTO events (id, type, post_id, link_slug, keyword, click_id, value_cents, source, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      "INSERT INTO links (slug, destination, label, post_id) VALUES (?, ?, ?, NULL)",
      "bio", "https://example.com/shop", "Link in bio",
    );
    for (let i = 0; i < 140; i++) {
      run(
        "INSERT INTO events (id, type, post_id, link_slug, value_cents, source, created_at) VALUES (?, 'link_click', NULL, 'bio', 0, 'link', ?)",
        `ev_bio_${i}`, iso(rand() * 10 * DAY),
      );
    }
    conn.exec("COMMIT");
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
}
