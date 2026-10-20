# REEL_SPEC

Measured from 9 outlier reels downloaded on 2026-10-20 (TikTok, 720×1280 H.264 + AAC 44.1 kHz).
Every value below comes from a frame grab, a pixel sample, or an on-screen change detected
frame by frame. Nothing is from memory. Where the source can't be measured, it says so.

Output is 1080×1920, so measured pixel values (at 720 wide) are multiplied by **1.5**.

## References

| Format | Account | Post | Views | Length |
|---|---|---|---|---|
| A. Score quiz | @your.bummy.quizzes | "8/8 is CRAZY!" (7683693461480033567) | 3.8M | 63.9 s |
| A. Score quiz | @your.bummy.quizzes | "Could YOU get 8/8?" (7696334016043109662) | 4.3M | 74.5 s |
| A. Score quiz | @your.bummy.quizzes | "5/5 is STANDARD" (7648299309431098655) | 4.3M | 33.3 s |
| B. SQL puzzle | @d3ven.codes | "Simple SQL question…" (7639039653324033294) | 96K | 14.1 s |
| B. SQL puzzle | @d3ven.codes | "The table has 1,000 rows…" (7648345112619093261) | 30K | 10.1 s |
| C. Street trivia | @voodies | "Delivery Nurse Trivia \| Did you get the last one?" (7693939091234114847) | 8.9M | 119.7 s |
| C. Street trivia | @voodies | "Accounting Trivia" (7662118921025096990) | 4.3M | 68.5 s |
| C. Street trivia | @voodies | "Mom banker trivia" (7656125032250314014) | 3.9M | 114.9 s |
| (meme, not used) | @d3ven.codes | POV Claude tokens (7680247961963482381) | 776K | 8.0 s |

## What the scrape corrected

The 7-day plan in the Fabric guide described the templates from assumptions. The footage shows otherwise:

| Plan said | Footage shows |
|---|---|
| Dark background | Background is the **creator's face-cam** in every quiz and SQL reel. Overlays sit on top. |
| 3-second countdown bar per question | **No countdown.** One question at a time; answers fill a numbered list. |
| Answer shown for 1 s after each question | The answer is **written into the list** about 0.5–1 s before the next question appears. |
| 20–30 s reels | Score quizzes run **33 s (5 questions) to 64–75 s (8 questions)**. SQL puzzles run **10–14 s**. |
| Running count "3/5" in the corner | No counter. The numbered list *is* the progress indicator. |
| "Did you get the last one?" is a template | @voodies is a **filmed street interview**. It can't be templated; see Format C. |

## Format A: Score quiz (@your.bummy.quizzes)

### Layout (720-wide measurements)

**Hook pill**, centred, top:
- Text: white `#FCFCFC`, TikTok Sans Medium (500), 42 px.
- Measured: line 1 is 504 px wide; 42 px TikTok Sans gives 504 px.
- Line pitch 53 px.
- Each line has its own red rounded box, sized to that line. This is TikTok's built-in "background" text style.
- Box colour `#E83C40` (most common sampled value; the range is #E83C3C–#EC3C40).
- Box padding: 18 px horizontal, about 12 px above the cap height.
- Corner radius about 8 px.
- Neighbouring lines' boxes touch, with no gap.
- Top of first box at y = 166 (8/8 reels) or 154 (5/5 reel).
- 3 lines (8/8 reels) or 3–4 lines (5/5 reel).
- Hook copy pattern: `The average person can't even answer ONE of these questions` / `The average American should be able to answer all of these`.

**Numbered list**, left aligned:
- x = 86.
- First row's cap top at y = 377. Row pitch about 61 px for 8 rows; about 65 px for the 5/5 reel's 5 rows (from y ≈ 405).
- Text: white with a black outline (about 2 px), TikTok Sans Medium.
- Size: about 40 px. "3. Mitochondria" measured 299 px wide.
- Long answers shrink to fit; "Thomas Edison" and "English" render smaller than "CPU" in the 5/5 reel.
- Numbers `1.`–`N.` are on screen from frame 0, with empty answers.
- The list stays on screen for the whole video.

**Question caption**:
- Centred horizontally. Its 2–3 lines sit around y = 920–1000 (8/8) or y ≈ 825–900 (5/5), so about 65–72% of the height.
- White, TikTok Sans Medium about 39 px. "What are human nails" measured 396 px.
- Line pitch about 50 px. Light dark outline for legibility.
- One question at a time; it is replaced when the next question starts.

**Background**: creator's face-cam, plain room, creator talking. He reads each question out loud.

### Timing (detected from frame-by-frame changes, 4 fps)

| Reel | Hook only | Per question | Answer lands | Last answer |
|---|---|---|---|---|
| 8/8 CRAZY | 0–4.25 s | 6.25–8.75 s (mean 7.0 s) | 0.5–1.0 s before next question | 63.0 s of 63.9 s |
| Could YOU get 8/8 | 0–5.25 s | 6.25–9.0 s (mean 7.5 s) | 0.25–1.75 s before next | 73.25 s of 74.5 s |
| 5/5 STANDARD | 0–3.75 s | 4.5–6.75 s (mean 5.8 s) | about 0.5 s before next | 32.75 s of 33.3 s |

The last answer appears in the final ~1 s and the video ends: **hard cut, no outro**. That makes the reel loop, and the viewer sees the full list again.

### Caption, hashtags and CTA

- **Post caption**: score claim plus 4–6 broad tags, e.g. `8/8 is CRAZY! #generalknowledge #trivia #answer #average`.
- **CTA**: none on screen. The comments fill up with scores on their own.

### Template values (1080×1920)

| Element | Value |
|---|---|
| Hook pill | font TikTok Sans 500, 63 px; box `#E83C40`; padding 27 / 18 px; radius 12 px; line pitch 80 px; first box top y = 249 |
| List | x = 129; first row cap top 63 px under the hook box; pitch 92 px (8 rows) or 98 px (5 rows); font TikTok Sans 500, 60 px, long answers shrink to fit 760 px (min 46 px); stroke 4 px `#000000` |
| Question | centre x = 540; first line top y = 1380; font TikTok Sans 500, 58 px; pitch 75 px; max width 860 px; stroke 3 px `#000000` |
| Timing (8 questions) | hook 4.5 s; 7.0 s per question; answer at +6.25 s; total 60.5 s |
| Timing (5 questions) | hook 4.0 s; 6.0 s per question; answer at +5.4 s; total 34 s |

## Format B: SQL puzzle (@d3ven.codes)

### Layout (7639039653324033294; 720-wide)

**Hook**, two blocks, centred:
- Lines 1–2: `Interviewer: This query returns zero rows...` (y = 140–249).
- Then a blank line and `Why might that happen?` (y = 310–354).
- Font: white, condensed sans with a soft dark shadow. TikTok Sans Condensed SemiBold 40 px matches: "Why might that happen?" measured 386 px, rendered 389 px.

**Code panel**:
- Black box `#000404`, x = 34–690 (656 px wide), y = 399–766.
- Square corners, no border.
- Line numbers in grey, right-aligned at x ≈ 125.
- Code starts at x = 200. Line pitch 57 px.
- Monospace 32 px: JetBrains Mono at 32 px, "banned_users" measured 230 px.

Syntax colours (sampled):

| Token | Colour |
|---|---|
| Keywords (SELECT/FROM/WHERE/NOT IN) | pink `#F884F8` |
| Parentheses and `;` | yellow `#F8E030` |
| Identifiers | white `#F4F4F0` |
| Indent guide | thin grey vertical line |

- **The trick token** (`NOT IN`) has a thin yellow outline box (`#E0C850`, 1–2 px).

**Under the panel**, centred around y = 880–925:
- `Pay attention to the sub-query....` from 0 to 4 s.
- Then `Comment your answer 👇` until the end.
- Same condensed font.

**Background**: creator at a desk, filmed over the shoulder, barely moving. Talking isn't needed.

**Answer**: never shown in the video.

### Second reference (7648345112619093261)

The same idea in a different style:
- Hook `This table has 1,000 rows.` / `So why does this query return 847?` near the top.
- Full-width panel `#08080C` with VS Code Dark+ colours: keywords blue `#569CD6`, function names yellow `#DCDCAA`.
- 2-line query.
- 10 s total. No CTA line.

### Timing

| Reel | Length | Changes |
|---|---|---|
| 7639039653324033294 | 14.1 s | the hint line swaps to the CTA at 4.0 s; nothing else changes |
| 7648345112619093261 | 10.1 s | fully static |

**Template**: 12 s total, hint for 0–4 s, CTA from 4 s. Short and static invites a re-read on every loop.

### Caption

The hook repeated plus an ellipsis tease: `Simple SQL question… but this one trips up a LOT of people.`

### Template values (1080×1920)

| Element | Value |
|---|---|
| Hook | TikTok Sans Condensed 600, 60 px; white; shadow 3 px `#000000` at 60%; centred; first line top y = 210; line pitch 87 px |
| Panel | x = 51–1035; top y = 600; height = rows × 85 + 50 px; fill `#000404` |
| Code | JetBrains Mono 400, 48 px; code x = 300; line numbers right-aligned to x = 188 in `#8A8A8A`; pitch 85 px |
| Colours | keywords `#F884F8`; punctuation `#F8E030`; text `#F4F4F0`; trick box `#E0C850`, 3 px, padding 6 px |
| Hint / CTA | TikTok Sans Condensed 600, 60 px; centre x = 540; y = 1320 |

## Format C: Street trivia (@voodies), filmed, not templated

What the frames show:
- An interviewer with a handheld mic approaches someone in their work clothes (scrubs outside a hospital, for example).
- **No on-screen hook text.** The hook is spoken, and the title lives only in the post caption.
- Captions show **one word at a time**, bold white serif, centred at about 52% of the height (y ≈ 670 of 1280). For example: "know", "labor", "effacement".
- 5 questions get harder, then a closing chat about the job.
- 68–120 s long.

**Not measured:**
- No transcript was pulled; the Scrape Creators key isn't available in this session.
- The serif typeface isn't identified.

To use this format, film it. The 4 "| Did you get the last one?" reels in the plan are rendered as Format A with 5 questions until you film. That is an adaptation, not a clone.

## Audio

All references carry the creator's own voice (AAC 44.1 kHz stereo, about 64 kb/s). The renderer outputs:
1. a silent overlay video;
2. an MP4 on your footage if you pass `--bg`, with its audio kept, or `--audio` to add a track.

A silent reel with a generic background is *not* the format. Film a face-cam of yourself reading the questions (about 60 s for 8/8, about 35 s for 5/5) and re-render with `--bg`.

## Adapted copy for our niche

| Reference | Ours |
|---|---|
| `The average person can't even answer ONE of these questions` | `Most data engineers can't answer ONE of these` |
| `The average American should be able to answer all of these` | `Every data engineer should get all 8` |
| `Interviewer: This query returns zero rows... / Why might that happen?` | `Interviewer: <surprising result> / Why might that happen?` |

## Rendering

The templates are in `scripts/reels/render.py`; the content is in `scripts/reels/week1.json`.

```bash
scripts/reels/fetch_fonts.sh                     # TikTok Sans + JetBrains Mono (OFL), once
python3 scripts/reels/render.py scripts/reels/week1.json out/            # all 14 reels, preview background
python3 scripts/reels/render.py scripts/reels/week1.json out/ \
  --only 03-thu-am-databricks-vs-fabric-8of8 --bg 03-thu-am-databricks-vs-fabric-8of8=face.mp4
python3 scripts/reels/render.py ... --overlay    # also <id>_overlay.mov with alpha for CapCut / Edits
```

- **Quiz reels** take `hook`, plus `questions[]` with `q`, `a`, and an optional `short` used in the list.
- **SQL reels** take:
  - `hook`: two blocks;
  - `code`;
  - `trick`: a 1-based `line` plus the `text` to box;
  - `hint`.
- `answer` and `caption` are for the post and pinned comment. They are never drawn.
- 5- and 8-question quizzes are measured. Other counts have no timing in this spec and are rejected.
