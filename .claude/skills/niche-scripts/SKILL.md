---
name: niche-scripts
description: >-
  Research what is performing in a content niche right now (TikTok, Instagram Reels, YouTube), find
  the outlier accounts and the formats they repeat, then write short-form video scripts modelled on
  those winners, every line grounded in checked facts and ready to film and edit (Editor V1 or the
  reel templates). Use when someone asks for scripts, hooks or a content plan "based on what's
  working" in a niche, to "find the outliers and write our version", or to turn niche research into
  videos. Not for editing a recording (that is editor-v1) or rendering text-only reels
  (scripts/reels/render.py).
---

# Niche scripts: from what's performing to what we film

Scripts copy a **proven formula**, never a guess: the hook pattern, length, structure and call to
action of posts that beat their own account's normal, in this niche, recently. Every claim in a
script is a fact someone checked. The output is a scripts file the person films from, plus the
evidence behind it.

The method was worked out on the quiz, fighting-game and Microsoft Fabric niches in this repo
(`docs/reels/REEL_SPEC.md`, `docs/reels/fabric-scripts.md`); `reference/script-format.md` is the
output format, `reference/seven-factors.md` the checklist every script fills, `reference/lessons.md` the traps those runs hit.

## Inputs (ask only for what you can't infer)

- **Niche** in the person's words ("Microsoft Fabric for data analysts").
- **Search terms**: 6–12 that people actually type or tag (product names, exam codes, "X vs Y",
  "X tutorial", the niche's slang). Infer them; show them in the plan.
- **Relevance regex** (`--must`) and **exclusions** (`--exclude`): every niche has a homonym
  ("fabric" = textiles, "rivals" = Roblox, "melee" = weapons). Write them before searching.
- **Who it's for** (their audience, their offer) and **how many scripts** (default 3).
- **Facts source**: a guide, docs or pages the scripts may draw on. No facts source → the scripts
  stick to what you verify while writing (fetch the page; a search snippet is not a source).
- `SCRAPECREATORS_API_KEY` in the environment for TikTok/Instagram. Never write the key to a file or
  put it in a command the transcript keeps; if it's missing, ask the person to set it, or run
  YouTube-only (`--platforms youtube`, needs `yt-dlp`).

**Needs:** Python 3.9+, `yt-dlp` for YouTube (`pipx install yt-dlp`), and `ffmpeg` + Pillow for `clips.py`.

## Workflow

Work in a scratch folder `<work>` (the session scratchpad); only the finished scripts go in the repo.
Scripts live in `<skill>/scripts/`; run them with `python3 -I`.

1. **Discover**: `discover.py --niche … --out <work> --query … --must … [--exclude …]`.
   Open `<work>/report.md`. Read the top 30 posts: any stray (the homonym) → tighten `--must` /
   `--exclude` and rerun. Note which **topics** and **hook shapes** repeat across platforms.
2. **Pick the outliers**: from the accounts table, the ones whose score is high **and** that hit more
   than once (posts found ≥ 2, or a second big post in history). Drop non-niche accounts and
   trend-farmers (hashtag-only captions, unrelated top posts), and say you did.
3. **Histories**: `history.py --out <work> --tiktok <handle> … --youtube <channel url> …` for the
   top 2–5. From `history.md` read: what their best posts have in common (first line, length,
   topic), cadence and what happened when it changed, hit rate (≥10× own median), saves %.
4. **Watch the winners** (optional, recommended when captions are vague): `clips.py --out <work>
   --by shares --top 20`, then Read every `clips/sheet_*.jpg` and fill `clips/tags.tsv`
   (format · hook · mechanic). Look before you claim a format.
5. **Hook bank.** From the posts that pass the **5× rule** (views ≥ 5× followers; `report.md` marks them),
   write down each one's verbal, written and visual hook (`reference/seven-factors.md`).
   Every script borrows its three hooks from this bank.
6. **Write the formula** in 5–8 bullets before any script: hook pattern(s) with real examples and
   their numbers, length, structure (claim → 3 reasons → what to do), CTA, what gets saved vs
   shared. This is what the scripts copy; show it to the person.
7. **Write the scripts** in `reference/script-format.md`'s format, filling all seven factors (`reference/seven-factors.md`):
   - **Each script maps to one proven post**, named with its numbers ("modelled on @x, 82K, 12×
     followers"). Its hook copies that post's hook **shape**, not its words.
   - **Lines:** one idea per line, about 8–14 s of talking per 3 lines, 60–90 s total unless the
     niche's winners run otherwise. The first line is the hook and works with the sound off.
   - **Facts:** every number, date, price and name comes from the facts source or a page you
     opened. Time-bound claims (an offer, a deadline, a "new" feature) are checked against
     today's date, and a closed offer is never written as open. Weak claims ("every job posting")
     are flagged with a softer fallback.
   - **Keep exact:** each script ends with a "Keep exact" list: the facts to say verbatim, the
     claims to check before filming, and the fallback wording.
   - **Picture column:** for an Editor V1 edit, each line gets a device and a real source
     (`~/.claude/skills/editor-v1/reference/devices.md`). For a text-only reel, use the
     `scripts/reels/week1.json` shape instead.
8. **Save**:
   - `docs/reels/<niche-slug>-scripts.md` (the scripts, the formula, the evidence table).
   - The research summary `docs/reels/<niche-slug>-research.md`: outlier tables, with links and
     the pull date.
   - Commit both.
   - If the person keeps a content plan (a Claude Doc or the ContentStudio calendar), add the
     scripts there too: in ContentStudio, `save_format` for the formula (`example_urls` = the
     winning posts) and `save_ideas` for each script (`hook`, `script`, `planned_for`). Use the
     MCP tools, or `POST /api/ingest/formats` and `/api/ingest/ideas` (README "API").
9. **Report** in chat: the formula in a few bullets, the scripts' titles with the post each copies,
   the claims to check before filming, and the limits: search samples are about 60 posts per
   term, Instagram has no saves or shares, YouTube Shorts are undercounted, and older YouTube dates
   are approximate.

## Rules

- **Copy formats, not content.** Never reuse someone's script, words, footage or audio. Their post
  is evidence for a pattern; ours is new writing.
- **Outlier ≠ luck.** One viral post on a tiny account is a lead, not a formula. Claim a pattern only
  when it repeats (several posts, accounts or platforms).
- **Numbers carry their source.** Views/followers with platform and pull date; say what a metric is
  (views ÷ followers, ÷ the channel's own median).
- **No fabricated urgency.** "Free right now", "only today", "every company" only when true today
  and sourced.
- **Spend credits deliberately.** Discovery is about 2 credits per term per platform; a history is
  1 credit per page (`--max-pages`). Tell the person before a run that will use more than about 200.
- **Nothing posts.** The skill writes files and plans; filming and publishing are the person's.
