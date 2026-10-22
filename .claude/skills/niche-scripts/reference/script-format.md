# Script format

One file per niche: `docs/reels/<niche-slug>-scripts.md`. The worked example is
`docs/reels/fabric-scripts.md`.

```markdown
# <Niche> scripts (<edit style>, <9:16 | 16:9>)

<One sentence: N scripts, how long, modelled on which accounts/posts (with numbers), and the formula
in a clause.>

## The formula (from <pull date>)

- Hook: <pattern> — e.g. "<real hook>" (<views>, <x> its account's median)
- Length: <s> · Structure: <claim → 3 reasons → what to do> · CTA: <comment X / follow for Y>
- Saved vs shared: <what kind of post gets saved here, what gets shared>
- Cadence that worked: <posts a week; what happened when it dropped>

## How to record

<frame, takes, pauses, how to hand it to the editor>

---

## Script 1 — "<title>" (~<n> s)

Modelled on: [@account, "<their hook>"](<url>) — <views>, <x>× <followers|median>.

**Seven factors:** sub-niche <…> · angle <tutorial | comparison | myth-bust | do vs don't | tip | transformation | challenge> · format <talking + screen | whiteboard | clone | …> · CTA comment <WORD> → <freebie>

**Hooks (first 3 s), each from a 5× post in the hook bank:**
- Verbal (heard): "<the first line>" — from <@account, views, ×followers>
- Written (on screen from frame 1): <2–8 words>
- Visual (what's seen): <the opening picture>

| # | Say | Picture | Source |
|---|---|---|---|
| 1 | "<line>" | <device / shot> | <real page or footage to find; FLAG if rights unclear> |

**Keep exact:**
- <fact to say verbatim, with its source>
- <claim to check before filming → fallback wording>

**Post caption:** <caption> <3–5 hashtags the winners use>
```

Text-only reels (no filming) use the JSON shape in `scripts/reels/week1.json` instead
(`format: quiz | sql`), rendered by `scripts/reels/render.py`.
