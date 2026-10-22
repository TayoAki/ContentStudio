# Fabric talking-head scripts (Editor V1, 9:16)

Three 60–75 s scripts modelled on @shreya.knows.data's best posts:
- "Future data analysts will be using Microsoft Fabric": 82K views, 12× her followers
- "Microsoft Fabric vs Power BI is the most searched question": 69K views
- "Microsoft is giving away free exam vouchers": 44K views

Her formula: talking to camera, a claim as the first line, three concrete reasons, a "what to do next" close, under 90 seconds.

Each script is a table you can film from:
- **Say:** the line you record.
- **Picture:** what Editor V1 puts on screen for that line. The device names are in the skill's `reference/devices.md`.
- **Source:** the real material to find for it.

Facts come from the Microsoft Fabric Field Guide (`docs/microsoft-fabric-field-guide.md`), checked against Microsoft Learn on Oct 20 2026.

## How to record

- **Frame:** vertical 9:16, phone or camera at eye level, face in the top half. Captions sit at 62% of the height, under your chin.
- **Format:** 1080×1920 or 4K vertical, 30 fps, a quiet room, a lapel mic if you have one.
- **Takes:** one take per script, start to finish. Leave a 1-second pause between lines, which the edit cuts out. If you fluff a line, pause and say it again; the edit keeps the last version.
- **Delivery:** say the numbers exactly as written. The captions use your words, so every number on screen is one you said.
- **Edit it:** `EV1_FORMAT=vertical bash ~/.claude/skills/editor-v1/scripts/new-video.sh ~/Desktop/take.mov fabric-vs-powerbi`, then ask Claude to "edit it with editor-v1, script 1 in docs/reels/fabric-scripts.md is the plan".

---

## Script 1 — "Fabric vs Power BI" (~65 s)

**Hook (caption + post title):** Fabric or Power BI: which one should you learn? Here's the answer in 45 seconds.

(Changed Oct 22: "the most searched question in data" had no source, and "no overnight refresh" went further than Microsoft's page, which says a Direct Lake refresh copies only metadata.)

| # | Say | Picture | Source |
|---|---|---|---|
| 1 | "Microsoft Fabric or Power BI: which one should you learn?" | `tile_reveal` onto a search box typing "fabric vs power bi", then you, raw | `find_hop` with a rebuilt search bar (no brand marks) |
| 2 | "It's the wrong question." | you, punch-in on "wrong"; `keyword` shock **WRONG** | — |
| 3 | "Power BI isn't competing with Fabric. Power BI is *inside* Fabric." | `pop_collage`: Fabric's workload icons landing one per word, Power BI's last and biggest | Microsoft Learn "What is Microsoft Fabric" page (`page_card`) |
| 4 | "Fabric is the whole kitchen: getting data in, storing it, cleaning it, and serving it." | `seq` on each verb: pipeline, lake, notebook, dashboard | Fabric docs screenshots via `capture.mjs`, re-coloured |
| 5 | "Everything lands in OneLake, one data lake for your whole organization, stored as open Delta tables." | `cutout_world` with **ONELAKE** behind your head | OneLake overview page |
| 6 | "Then Power BI reads those tables directly. That's Direct Lake. No import copy, and a refresh only copies metadata." | `page_card` with the highlighter on "copies only metadata" | Direct Lake overview page |
| 7 | "So if you already know Power BI, you're not starting over. You're one layer up from where Fabric starts." | you, raw; `captions` big on "one layer" | — |
| 8 | "Learn the lakehouse, a little SQL, and how data gets into OneLake." | `seq`: lakehouse, SQL, pipeline (three real screens) | Learn pages |
| 9 | "That's the difference between a report builder and the person who owns the data." | you, raw; `keyword` title *owns the data* | — |
| 10 | "Comment FABRIC and I'll send you the free learning path I'd follow." | `comment_box` with the caret blinking | — |

**Facts to keep exact:**
- Power BI is one of Fabric's workloads. OneLake stores tables as open Delta Parquet.
- Direct Lake reads Delta tables from OneLake without an import refresh, and needs an F or P capacity. Say "no import refresh", not "real-time".

**Post caption:** Fabric vs Power BI, settled 👇 #microsoftfabric #powerbi #dataanalyst #dataengineering

---

## Script 2 — "The free DP-700 path" (~70 s)

**Hook:** Microsoft gave away free Fabric exam vouchers twice in the last year. Here's how to be ready for the next one.

| # | Say | Picture | Source |
|---|---|---|---|
| 1 | "Microsoft gave away free Fabric certification exams twice in the last year." | `tile_reveal` onto the Fabric Data Days page; `keyword` key **FREE** | Fabric Community "Fabric Data Days" page (FLAG: the campaign page, check its licence or use a rebuilt card) |
| 2 | "And most people missed it because they weren't ready." | you, raw, punch-in on "missed" | — |
| 3 | "The last round, Fabric Data Days, closed in August." | `calendar` Jun–Aug 2026, the close date landing with a click | dates from the campaign page |
| 4 | "To get a voucher you had to join the Fabric Community, watch sessions and finish Microsoft Learn modules." | `seq`: community page, session page, Learn module, a click each | the real pages via `capture.mjs` |
| 5 | "So here's how to be ready before the next one drops." | `neg_flash` into you, raw | — |
| 6 | "One: pick DP-700, the Fabric Data Engineer exam, or DP-600 if you're a Power BI person." | `pop_collage`: the two exam pages | Microsoft Learn exam pages |
| 7 | "Two: do the free Microsoft Learn path for it now. It's the same content the vouchers asked for." | `page_card` with the highlighter on the module list | Learn path page |
| 8 | "Three: take the free practice assessment until you pass it twice." | `focus_card` on the practice assessment page | Learn practice assessment page |
| 9 | "Then when the vouchers come back, you claim one and book the exam the same week." | `cutout_world` with **DP-700** behind your head | — |
| 10 | "Follow so you hear about the next round the day it opens." | you, raw; end card | — |

**Facts to keep exact:**
- **Dates.** Fabric Data Days 2026 ran June 15 to Aug 7, 2026, with Aug 10, 2026 as the voucher request deadline. Re-check the dates on the campaign page before recording; sources differ by a few days.
- **"Twice in the last year."** This rests on the Dec 2025 and summer 2026 rounds. If you can't confirm the Dec 2025 round on an official page, say "Microsoft gave away free Fabric exams this summer" instead.
- **Requirements.** The steps in line 4 are what the 2026 round required. Don't promise the next round will be the same.
- **The exams.** DP-700 is Microsoft Certified: Fabric Data Engineer Associate. DP-600 is Fabric Analytics Engineer Associate.
- **No vouchers right now.** Never say "free vouchers right now". The offer is closed.

**Post caption:** Free Fabric certs come back every few months. Be ready this time 👇 #dp700 #microsoftfabric #dataengineer #certification

---

## Script 3 — "Future data analysts will be using Fabric" (~60 s)

**Hook:** Future data analysts will be using Microsoft Fabric. Here's why, and what to learn first.

| # | Say | Picture | Source |
|---|---|---|---|
| 1 | "Future data analysts will be using Microsoft Fabric." | `tile_reveal` onto the Fabric home page; `keyword` title *Microsoft Fabric* | Fabric overview page |
| 2 | "Not because it's new. Because of three things." | you, raw; `captions` big on "three" | — |
| 3 | "One: one copy of the data. Every tool reads the same lake, so nobody's arguing about whose numbers are right." | `cutout_world` with **ONE COPY** behind your head; `wall3d` of workload screens | OneLake overview page |
| 4 | "Two: one bill. A single capacity pays for pipelines, SQL, Spark and Power BI." | `pop_shatter`: four workload cards, one per word | licences and capacity page |
| 5 | "Three: AI built in. Data agents answer questions in plain English, on top of the models you already built." | `typewriter`: a plain-English question typing; `page_card` on the data agents page | data agents concept page |
| 6 | "Which means the analyst who understands the whole flow gets the job, not just the one who builds charts." | you, raw, punch-in on "whole flow" | — |
| 7 | "So learn SQL, keep Power BI, and add one thing: the lakehouse." | `seq`: SQL, Power BI, lakehouse, a click each | Learn pages |
| 8 | "That's the DP-600 exam, and it's the skill set every Fabric job posting lists." | `focus_card` on the DP-600 exam page | Microsoft Learn exam page |
| 9 | "Follow for one Fabric skill a day." | you, raw; end card | — |

**Facts to keep exact:**
- **One capacity.** One F-SKU capacity covers every workload.
- **Data agents.** They answer in natural language over semantic models, warehouses and KQL. They are read-only and English-only, so don't oversell them.
- **"Every job posting lists."** This is a claim, not a measurement. If you want to keep it, check 10 real Fabric postings first, or say "most Fabric job posts I've seen".

**Post caption:** What to learn for Fabric in 2026, in order 👇 #microsoftfabric #dataanalyst #powerbi #dp600

---

## Rights

- **Pages:** the Microsoft Learn and Fabric pages are captured as screenshots for commentary. Editor V1 lists each one in its PLAN.md table and flags anything unclear before rendering.
- **Music:** none ships with the kit. Use a track you have the rights to.
- **Brand marks:** don't use Microsoft logos as decoration. Show them only when the line names the product.
