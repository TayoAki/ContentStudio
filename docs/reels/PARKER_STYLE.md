# The Parker Prompts look: what we learned and how we build it

Reviewed Oct 22 2026: [Parker Prompts](https://www.youtube.com/@parkerprompts/videos).
- **Channel:** 134K subscribers, 83 videos.
- **Format:** long-form AI-tool tutorials, 8–16 min, typical video ≈35K views.
- **Watched in full:** "I tried Google's 7 FREE AI Tools" and "5 AI fundamentals".

## What performs on his channel

| Views | Title | Shape |
| --- | --- | --- |
| 220K (≈6× typical) | ChatGPT vs Claude vs Gemini: Which $20 AI Plan Is Worth It? | Head-to-head with a money question |
| 99K | How to Build a Second Brain With NotebookLM + Obsidian (Full Setup) | Two tools combined into a system |
| 77K | How to Create High Quality AI Videos With Claude | Outcome-first how-to |
| 67K | The Best FREE AI Tools Right Now (2026) | Free list |
| 67K | How to Use Gemini Notebook Better than 99% of People | Mastery promise |
| — | "Master 97% of X in 12 Minutes" (many videos) | Repeated title template |

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

## How we build it
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
| Pink light flash | `pp_flash` |

**First video in this look:** Script 1 "Fabric vs Power BI" (`ALL-SCRIPTS.md`).
- Built from Microsoft's own icons and diagram (cropped from the Microsoft Learn architecture image) and Microsoft Learn pages in windows.
- No stock images, no invented UI.

## What we still need from you to match him
1. **A face.** His talking head carries most of the runtime, and our examples use a synthetic voice and no face.
    - Record in good light, mid-shot, plain background.
    - The edit adds the chapter pills, captions and flashes, and puts you in the ringed circle over screen demos.
2. **Real screen recordings** of Fabric / Databricks / Power BI doing the thing you're talking about (OBS or the Mac screen recorder, 1080p). They replace the page captures.
3. **A YouTube long-form track.** His results come from 8–16 minute tutorials. Our scripts are 45–60 s reels; a long-form version of the "Databricks vs Fabric" comparison is the clearest test.
