# The Parker Prompts look: what we learned and how we build it

Reviewed Oct 22 2026: [Parker Prompts](https://www.youtube.com/@parkerprompts/videos).
- **Channel:** 134K subscribers, 83 videos.
- **Format:** long-form AI-tool tutorials, 8–16 min, typical video ≈35K views.
- **Watched in full:** "I tried Google's 7 FREE AI Tools" and "5 AI fundamentals".

## What performs on his channel (outlier method)

**Method:** views ÷ the channel's median over all 83 videos. The median is **47K**.

| × median | Views | Length | Title |
| --- | --- | --- | --- |
| **16.7×** | 783K | 11 min | I Tried Google's 7 FREE AI Tools (Destroys All Paid Alternatives) |
| **8.0×** | 375K | 19 min | How to Use NotebookLM Better than 99% of People |
| **5.7×** | 270K | 6 min | How to Use Grok AI Better than 99% of People |
| 4.9× | 230K | 11 min | Google's 6 Hour Prompt Engineering Course in 10 Minutes |
| 4.8× | 225K | 10 min | The Only AI Guide You'll Ever Need in 2026 |
| 4.7× | 220K | 13 min | ChatGPT vs Claude vs Gemini: Which $20 AI Plan Is Worth It? |
| 4.2× | 198K | 9 min | I Tested Gemini vs Claude vs ChatGPT So You Don't Have To |
| 4.2× | 197K | 12 min | Claude's 13 Free AI Courses in 12 Minutes |

**What the outliers have in common:**
- **A free / money angle:** "FREE", "$20 plan", "free courses".
- **A mastery promise:** "better than 99% of people", "in 10 minutes".
- **Or a head-to-head test.**

**Studied in full:**
- #1, via its TikTok copy: full video, transcript, every cut.
- #2, #3 and #4: YouTube storyboard frames across the whole video.

**What the outliers are made of** (share of storyboard frames):

| Kind of shot | Share of frames |
| --- | --- |
| Screen demo in a framed window, with his face in a ringed circle (top right) | ~55–70% |
| Talking head on camera, cut back to every 30–60 s, alternating wide and tight framings | ~20% |
| Graphic slides between: word-by-word text, numbered lists, big numeral + word ("1 Task"), a PROMPT card typing, icon rows | ~15–25% |

**For us:**
- "Databricks vs Fabric: which one is worth it for your team?" is his best shape.
- So is "Fabric + Power BI + Copilot: the full setup".

**Platform:** his TikTok posts are the same 16:9 videos letterboxed: 1,887 and 99 views. His format wins on YouTube long-form, not as a re-post to TikTok. Reels need the same look reframed to 9:16 (what we built).

## How his videos are built

**Script:**
- **Hook (0–20 s):** a lived claim ("I spent the last month testing every free AI tool Google has released…"), a turn ("what I found was shocking"), a number with a price ("outperforming paid alternatives that cost $20 to $50 per month"), then the promise of the list ("I'm walking you through all seven").
- **Body:** a numbered list. Each item has the same beats: name + URL, what it is, a live demo with a real prompt, the result, who it's for, "the best part: it's free".

**Picture:**
- **Clean talking head** in a studio (bookshelf, plants, soft light), mid-shot. Punch-ins between framings; a pink light flash between sections.
- **Purple ground** under every graphic beat: a radial purple gradient with a soft pink glow.
- **Text slides:** a sentence fades in word by word, centred, white, with key words in yellow and a soft glow. This is his caption on graphic beats.
- **Numbered lists:** neon-outlined number badges and outlined uppercase pills. They build one per word, then one item is isolated and centred, sometimes with a hand-drawn annotation arrow.
- **Contrast:** "AI ≠ [ChatGPT icon]", two things with the joiner struck through in red.
- **Icon rows:** real app icons on dark rounded tiles, rising in one by one.
- **Flows:** icon tiles joined by a dashed line, a step pill landing on each step ("Detects the email → Checks the database → Drafts the reply").
- **Screen demos:**
    - a real screen recording, either full frame with his face in a pink-ringed circle (top right), or in a Mac-style window on the purple ground with a purple title chip;
    - zooms into the prompt box as he types.
- **Chapter pill:** "1. AI STUDIO BUILD", a number box and an italic uppercase name, sliding in over the talking head.
- **Captions on the talking head:** small, sentence case, white with key words in yellow, bottom centre.
- **Pace:** 7–9 s average shot over the whole video, much faster in the cold open (≈1.5 s).

## Cut timing (measured frame by frame, Oct 22)

**Source:** the 16.7× outlier ("I Tried Google's 7 FREE AI Tools", 11:22), every cut detected (`editor-kit/shot_analyze.py`) and matched against a word-level transcript. "5 AI fundamentals" was measured as a check.

**Shot lengths:**

| Shot | Share of time | Median | Middle half |
| --- | --- | --- | --- |
| Screen demo (face in circle) | 55% | 5.6 s | 2.2–9.9 s (up to 25 s) |
| Talking head | 27% | 3.3 s | 1.6–5.1 s |
| Graphic slide | 18% | 5.4 s | 4.8–7.5 s |

**Rules from the data:**
- **Cuts land on phrase starts:** 72% within 0.35 s of a new phrase.
- **A cut comes just before the word:** 73% come before it, with a median gap of 0.12 s. The picture changes, then the word arrives.
- **The face is the hub.** Counts over the whole video:
    - face → screen 25, screen → face 27;
    - face → graphic 17, graphic → face 15;
    - graphic → screen only 4, screen → graphic only 2.
    - Screen → screen (27) is a demo continuing.
- **The face is never gone long:** median 7.2 s between face shots (4.3 s in the second video).
- **Pace:** a cut every 2.5 s in the first 30 s, then one every 5–7 s for the rest of the video. The second video runs one every 3–4 s throughout.
- **Long screens keep moving:** something changes inside a screen shot about every 3.4 s (a zoom into the region, a highlight, a scroll).

**Our cut, measured the same way** (`fabric-vs-powerbi-paced`, 45 s):
- **Cut timing:** cuts sit 0.12 s before the word, every one (`LEAD = 0.12`).
- **Pace:** one every 2.3 s in the first 30 s; median shot 2.6 s. It's a 45 s reel, so it stays at hook pace.
- **Hub rule:** no graphic → screen cut; the face is never gone more than about 5 s.
- **Screens:** they zoom into the line being talked about (`pp_window(..., zoom=…)`).

## What goes on the face vs the screen (the "That's Direct Lake" fix)

In the 16.7× outlier, every talking-head shot under 1.6 s sitting between two screens is a **signpost** that hands over to the next screen:

| Time | Shot | Line |
| --- | --- | --- |
| 206 s | 1.2 s | "Here is how it works." |
| 251 s | 0.8 s | "And here it is." |
| 316 s | 1.1 s | "Here's how to access it." |
| 497 s | 1.4 s | "Here's what makes this powerful." |
| 575 s | 1.4 s | "Now you have two options here." |

The longer face shots inside a demo (2–5 s) are **reactions and opinions**:
- "the workflow looks perfect";
- "the quality is honestly shocking".

His chapter pills sit only on face shots that open a new section, 3–9 s long.

**Rule:**

| What's said | Where it goes |
| --- | --- |
| Facts, names, numbers, steps | The screen (or a graphic) |
| Signposts ("here's how…", "here it is") | The face, briefly |
| Opinions, reactions, the CTA | The face |
| A name inside an explanation ("That's Direct Lake") | Never cut away from the page: highlight it on the page instead |

**Also:** a screen shot holds at least ~1.5 s; his rare sub-second screens are deliberate UI flashes.

### Our cut against the rule (v5, 47 s)

| Start | Length | Shot | What's said | Role |
| --- | --- | --- | --- | --- |
| 0.0 | 2.6 s | Graphic | "Microsoft Fabric or Power BI:" | Hook (cold open) |
| 2.6 | 1.4 s | Face | "which one should you learn?" | Question / signpost |
| 4.0 | 1.6 s | Graphic | "It's the wrong question." | Claim as a statement slide |
| 5.7 | 2.1 s | Face | "Power BI isn't competing with Fabric." | Opinion |
| 7.7 | 2.3 s | Screen | "Power BI is inside Fabric." | Fact |
| 10.1 | 1.7 s | Face | "Fabric is the whole kitchen:" | Signpost |
| 11.7 | 3.7 s | Graphic | "getting data in, storing, cleaning, serving" | Fact (list) |
| 15.5 | 1.6 s | Face | "Everything lands in OneLake," | Signpost |
| 17.1 | 2.2 s | Screen | "one data lake for your whole organization," | Fact |
| 19.3 | 2.4 s | Screen | "stored as open Delta tables." | Fact |
| 21.8 | 2.6 s | Screen | "Then Power BI reads those tables directly." | Fact |
| 24.3 | 1.8 s | Screen | "That's Direct Lake. No import copy," | Name: stays on the page (was a 0.8 s face shot) |
| 26.1 | 2.8 s | Screen | "and a refresh only copies metadata." | Fact |
| 28.9 | 2.9 s | Face | "So if you already know Power BI, you're not starting over." | Opinion |
| 31.8 | 2.5 s | Face (tight) | "You're one layer up from where Fabric starts." | Opinion |
| 34.3 | 4.4 s | Graphic | "Learn the lakehouse, a little SQL, how data gets into OneLake." | Fact (list) |
| 38.7 | 4.2 s | Face | "That's the difference between a report builder and the person who owns the data." | Opinion |
| 42.9 | 4.4 s | Face | "Comment FABRIC…" | CTA (he ends every video on camera) |

**Known gap:** the face is away 11.8 s from 17.1 s to 28.9 s, all fact. That's inside his range (median 7.2 s, 75th percentile 13.6 s) but long for a reel. A real take could add a signpost here ("Here's the part Power BI people miss.").

## How we build it

**Colours:** ours are **blue** (the kit's default theme); `PP_THEME=purple` gives his.

The kit is `components/ev1_parker.py` in the Editor V1 skill (a copy is in `docs/reels/editor-kit/`). Use `from ev1_parker import *` in a video's `build.py`; it works in 16:9 and 9:16.

| His device | Kit function |
| --- | --- |
| Purple ground | `pp_ground` |
| Word-by-word text slide, yellow key words | `pp_text` |
| Small yellow-keyword captions | `pp_captions` |
| Numbered badges + pills, build and isolate | `pp_list` (with `focus`) |
| "A ≠ B" red strike | `pp_vs` |
| Icon tiles | `pp_icons` |
| Step flow with dashed connectors | `pp_flow` |
| Screen material in a window with a title chip; highlighter / outline / scroll | `pp_window` |
| Chapter pill | `pp_chapter` |
| Pink light flash (blue in ours) | `pp_flash` |
| Talking head, wide / tight, punch-ins | `pp_talk` |
| Face in a ringed circle over screen material | `pp_pip` (or `pp_window(..., pip=…)`) |
| PROMPT card typing | `pp_prompt` |

**Second cut, Oct 22 (blue, with structure):**
- talking head → graphic → screen with the face circle → graphic → talking head;
- a light flash on every change of kind;
- the presenter is a **placeholder still** until the real take exists.

**First video in this look:** Script 1 "Fabric vs Power BI" (`ALL-SCRIPTS.md`).
- Built from Microsoft's own icons and diagram (cropped from the Microsoft Learn architecture image) and Microsoft Learn pages in windows.
- No stock images, no invented UI.

## What we still need from you to match him
1. **A presenter.** The talking head carries about a quarter of his runtime. His presenter is AI-generated (per you), so this can be an AI presenter too (`AI-PRESENTER.md`): a synthetic host, or you dubbed from one reference clip.
    - Record in good light, mid-shot, plain background.
    - The edit adds the chapter pills, captions and flashes, and puts you in the ringed circle over screen demos.
2. **Real screen recordings** of Fabric / Databricks / Power BI doing the thing you're talking about (OBS or the Mac screen recorder, 1080p). They replace the page captures.
3. **A YouTube long-form track.** His results come from 8–16 minute tutorials. Our scripts are 45–60 s reels; a long-form version of the "Databricks vs Fabric" comparison is the clearest test.
