# The seven factors, applied to our videos (Oct 22 2026)

Source: the short-form breakdown you pasted (7,356 shorts studied).
- **The checklist:** every short has seven factors: topic, hooks (verbal / written / visual), value, angle, CTA, format, editing style.
- **In the skill:** it's now built into `niche-scripts` (`reference/seven-factors.md`). `discover.py` lists every post that passes the 5× rule as a hook bank.

## 1 · Your topic map (niche → sub-niches)
**Niche:** data platforms for analytics teams, from a Databricks + Fabric sales engineer.

| Sub-niche | Example topics |
| --- | --- |
| Fabric fundamentals | OneLake, lakehouse, Fabric vs Power BI |
| Power BI → Fabric | Direct Lake, semantic models, storage modes |
| Databricks | Free Edition, Unity Catalog, Databricks + Power BI |
| Capacity & cost | Pausing, reservations, throttling, sizing |
| AI on your data | Fabric data agents, Copilot, Claude Dashboards |
| Careers & certs | DP-600 / DP-700, what to learn first |
| SQL & modelling | Puzzles, interview questions |

One sub-niche per video. Rotate them across a week.

## 2 · Hooks: only from 5× posts
**Rule:** views ≥ 5× the account's followers (or 5× the channel's median on YouTube).

**From our pulls:** 77 of 190 data-category TikToks pass, but only 12 of 50 Fabric ones.

**Our references, checked against the rule:**

| Reference | Score | Passes 5×? | Use |
| --- | --- | --- | --- |
| @shreya.knows.data | 69K on ~7K (10×) | ✓ | — |
| @kairadc | 216× | ✓ | — |
| @gourmet.data | 21× | ✓ | — |
| @9jabestwebdev | 203× | ✓ | — |
| The Bald Coder | 573× channel median | ✓ | — |
| Parker Prompts' top three | 16.7×, 8×, 5.7× median | ✓ | — |
| @selectdata | 2.8× | ✗ | Saves / format evidence only |
| @nocode.joshua | 1.6× | ✗ | Same |
| @dhany.indraswara | 4.2× | ✗ | Same |

Every video needs all three hooks in the first 3 seconds:
- **Verbal:** the first line you say.
- **Written:** the words on screen from frame 1.
- **Visual:** the opening picture.

Our scripts had the verbal one only. The Fabric vs Power BI cut now has all three:
- **Written:** "Fabric vs Power BI is the WRONG question".
- **Visual:** the two product tiles, then the strike.

## 3–7 · The nine scripts, audited

| # | Script | Sub-niche | Angle | Written hook | Own-experience line | CTA (lead?) | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Fabric vs Power BI | Fabric fundamentals | Comparison | ✓ (v4) | ✗ add one | FABRIC ✓ | Talking + screen |
| 2 | Free DP-700 path | Careers | Tutorial | ✗ | ✗ | Follow only → add a keyword (DP700) | Talking + screen |
| 3 | Future analysts use Fabric | Careers | Opinion / tip | ✗ | ✗ | Follow only | Whiteboard |
| 4 | Interview question | Power BI → Fabric | Challenge | ✓ (question card) | ✗ | Comment answer (engagement) | Talking + card |
| 5 | Plain-English questions | AI on data | Tutorial | ✗ | ✗ | Follow + promise | Talking + screen |
| 6 | 3 free things | Careers | List / tip | ✗ | ✗ | Save → add a keyword (FREE) | Green screen |
| 7 | Claude Dashboards | AI on data | Tutorial (news) | partial | ✗ | DASH ✓ | Talking + screen |
| 8 | NYC 311 | Fabric fundamentals | Story | ✗ add "4 million complaints" | ✓ (you ran it) | NYC ✓ | Voice-over + charts |
| 9 | Pausing Fabric | Capacity & cost | Myth-bust | ✓ ("misconception…") | ✗ | PAUSE ✓ | Text over face |

**The two gaps across the set:**
- **Your own experience is missing from 8 of 9.** The breakdown's point is that authority comes from what you've seen, and you have a seller's view no one else does. Add one line per script, e.g.:
    - "When I demo Fabric to Power BI teams, the first thing they ask is…"
    - "The customers I see pause their capacity are usually…"
- **A lead CTA is missing from 4 of 9.** Every script should end on "comment WORD" (7 letters or fewer, never reused) with a real freebie, delivered by an auto-DM (ManyChat on Instagram).

## 4 · One topic, seven videos
Direct Lake as the example:

| Angle | Video |
| --- | --- |
| Tutorial | Set up Direct Lake on a lakehouse in 60 s |
| Comparison | Import vs DirectQuery vs Direct Lake |
| Myth-bust | "Direct Lake never refreshes" (it frames metadata) |
| Do vs don't | Don't put SQL RLS on a Direct Lake on OneLake model and expect it to apply |
| Tip | Check which Direct Lake you're on before you add security |
| Transformation | A customer's 2-hour import refresh before vs after (a real one you can share) |
| Challenge | The interview question (Script 4) |

## 6 · Format
- **Not:** "sitting down and talking videos are boring."
- **What we already have:** talking + screen cutaways (the Parker structure).
- **Next to try:**
    - **Clone:** you vs you, "the Power BI dev" vs "the Fabric engineer". It suits every comparison script.
    - **Whiteboard:** Shreya's format, for Script 3.
    - **Green screen:** Script 6.

## 7 · Editing style (fixed, so it's recognisable)

| Element | Choice |
| --- | --- |
| Colours | Blue ground, yellow key words, white |
| Fonts | Primary (bold) for written hooks; secondary for captions; an accent for annotations |
| Visual types | Talking head, real screens in a window, graphic slides |

That's Editor V1's `ev1_parker.py` kit. The house style is to use it for every video.
