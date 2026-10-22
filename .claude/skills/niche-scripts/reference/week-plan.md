# Week plan: format and tag vocabulary

A week plan is 7 posts, one a day, each with its odds, a script, a SEALCaM shot list and a
teleprompter, plus an appendix that breaks down every reference post scene by scene. It is built
from a niche scan, not from a guess. Example: `docs/reels/data-week-of-2026-10-23.md`.

## Pipeline

All scripts are in `<skill>/scripts/`. Run them with `python3 -I`, working in a scratch folder `<work>`.

1. **Scan.** `scan.py --out <work> --tiktok <handle> … [--pages 2 --days 180]`
   - Pulls each account's recent posts and works out the niche's base rates: the share of posts reaching 1×, 2×, 5× and 10× the account's followers.
   - Writes `scan.json`, `base_rates.json` / `.md` and `outliers.json` (every 5× post).
   - Use the 20–40 accounts from discovery and histories.
   - Media links expire within about a day, so run steps 2 and 4 the same day.
2. **Tag sheets.** `teardown.py sheets --scan <work> --sample 40`
   - Covers every outlier plus a seeded random sample of ordinary posts, 6 frames each.
   - Read every `tag/sheet_*.jpg` and fill `tag/tags.json` with the vocabulary below.
   - Tag what you see, not what the caption claims.
3. **Lifts.** `odds.py lifts --scan <work>` → `lifts.md`
   - Shows which formats, angles and video types the outliers over-use, and how many distinct accounts back each one.
4. **Teardowns.** `teardown.py scenes --scan <work> --post <id> --asr-python <python with faster-whisper>`
   - Run it for each reference you will borrow from.
   - Read `teardown/<id>/sheet.jpg` and fill the SEALCaM skeleton in `breakdown.md`.
   - Merge micro-cuts that only re-frame the same shot into one segment, and say so.
5. **Plan.**
   - Choose 7 posts: a funnel mix (about 3 TOFU, 3 MOFU, 1 BOFU) and at least 4 different formats.
   - Each post borrows its structure from 1–2 tagged outliers.
   - Write `plan.json` with each post's tags and the outlier ids it borrows from (`sources`).
   - Run `odds.py score --scan <work> --plan plan.json` and paste the Odds blocks.
6. **Write** the week file in the format below. Facts follow the same rules as `script-format.md`: every number, name and date comes from a page you opened.

## Tag vocabulary

| Field | Values |
|---|---|
| format | `talking_head` (face to camera) · `talking_screen` (face plus screen/slides, cut or split) · `green_screen` (face over a page or comment) · `screen_recording` (screen only, voice or captions) · `whiteboard` · `text_over_video` (one shot, the text carries it) · `voiceover_broll` (voice over lifestyle b-roll) · `pov_vlog` · `carousel` (photo post) · `visual_prop` · `podcast_clip` · `animated_explainer` |
| angle | `tutorial` · `tip` · `story` · `resource_list` · `comparison` · `myth_bust` · `opinion` · `news` · `relatable` · `review` · `showcase` |
| video_type | `step_by_step` · `list` · `explainer` · `story` · `reaction_reply` (answers a comment or a question on screen) · `reaction` (reacts to news or a page) · `meme` · `demo` · `day_in_life` |
| complexity | `easy` (anyone can follow) · `medium` (needs the basics) · `hard` |
| delivery | `educational` · `entertaining` · `inspirational` |
| funnel | `TOFU` (strangers: broad, shareable) · `MOFU` (people learning the topic: saves, follows) · `BOFU` (people ready to buy: the offer, a keyword for the lead magnet) |
| niche | `core` (teaches the niche) · `adjacent` (career or lifestyle around it) · `off` |

## How the odds read

- Base rates come from the scan.
- A tag value's lift compares how often outliers use it with how often ordinary posts do. The lift is shrunk toward 1 when few accounts back it.
- The five content lifts are averaged, as a geometric mean, because they overlap. The funnel stage multiplies on top.
- Ratings: strong ≥ 2× the base rate, good ≥ 1.2×, average ≥ 0.8×, weak below that.
- With 40 outliers, the model ranks ideas; it doesn't predict them. Say so in the plan.
- A BOFU post rates low by design: it exists to sell, not to spread.

## Week file format

```
# Week of <Day DD Mon YYYY>

<one paragraph: who it's for, how many teardowns, base rates from N scanned posts>

| Day | Post | Funnel | Format | Chance of a 5× outlier |

---

## <Post title>

<Day> · <FUNNEL> · <Delivery> · <Format> · about N s

### The idea
- **Topic:** … · **Angle:** … · **Hook pattern:** … · **Style:** complexity, delivery
- **Series:** the repeatable wording, if any
- **Odds:** (pasted from odds.py)
- **Why it should work:** which reference supplies what, and what is new in ours
- **Borrows its structure from:** @account, N× their followers: URL
- **Risk:** what could sink it, and the fix

### Before you film        (only when the script has [[placeholders]] or a freebie to build)

### Script
#### Hook (first 3 seconds): Say / On screen / Show
#### Beats: numbered HOOK / STEP / PROOF / CTA …, each with Say / Film / Edit
#### Close and post: Call to action, Caption, Hashtags
**Keep exact:** facts with their source pages

### Shot list (SEALCaM)
#### Shot N · BEAT · about N s
- Say / On screen / S / E / A / L / Ca / M / Borrowed from: @account scene N

### Teleprompter
Just the words, in order.

---

# Reference breakdowns
### Reference breakdown: @account (N×)
URL · scene by scene in SEALCaM.
#### Scene N · t0–t1 s · BEAT · hard cut | same shot continues
- Said / On screen / S / E / A / L / Ca / M
```

SEALCaM:
- **S**ubject: who or what, primary and secondary.
- **E**nvironment: the set and background.
- **A**ction: what moves, including the camera and the captions.
- **L**ighting.
- **Ca**mera: lens feel, framing, angle, movement.
- **M**etatokens: render look, caption style, pace.
