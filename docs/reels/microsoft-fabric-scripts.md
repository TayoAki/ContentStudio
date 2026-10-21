# Microsoft Fabric scripts, set 2 (Editor V1, 9:16)

Three scripts, 50–65 s each, written by the `niche-scripts` skill from `docs/reels/microsoft-fabric-research.md` (pulled Oct 21 2026). Each copies the shape of a post that out-saved its niche:
- an interview question
- AI on top of your Power BI data
- a list of free resources

They don't repeat set 1 (`docs/reels/fabric-scripts.md`: Fabric vs Power BI, the DP-700 path, "future data analysts").

## The formula

- **Saves win, and three formats earn them** (4–6% of views, against 1–2% for everything else):
    - interview questions: @selectdata, 266K views, 10.7K saves
    - free resources with "save this": @dhany.indraswara, 74K, 4.4%
    - certification paths: @mampolokeng_1, 88K, 5.7%
- **Hook = a promise of something useful in the first line**, said and on screen: "Here's a Fabric interview question…", "Need dashboard ideas? 100+ free files". Hot takes ("Power BI is dead") get views but fewer saves.
- **The rising topic is AI on your Power BI and Fabric data:**
    - @selectdata "Claude + Power BI": 237K, 4.6% saves
    - @jennytumay "vibecoding reports with AI": 43K
    - Data Goblins' agentic Power BI videos
- **Picture: a face plus a card or screen.**
    - The winners show a question card (A–D), a whiteboard, or the real page behind the speaker.
    - Editor V1's `page_card`, `typewriter` and `cutout_world` cover all three.
- **Length:** 50–90 s on TikTok and Reels. @selectdata runs 2–3 minutes, but only with a 95K-follower audience.
- **Cadence:** keep it up. @selectdata posted 14–24 a month and kept a 10K median. Shreya and @mampolokeng_1 fell to 1–3 posts a month in September, and their medians fell with them.

## How to record

Same as set 1:
- vertical 9:16, face in the top half, one take per script, a 1-second pause between lines;
- then `EV1_FORMAT=vertical bash ~/.claude/skills/editor-v1/scripts/new-video.sh <take>`, and ask Claude to edit it with editor-v1 using the script as the plan.

For script 1, hold for 3 seconds on line 5 so the answer card stays up.

---

## Script 1 — "The Fabric interview question Power BI people miss" (~55 s)

Modelled on: [@selectdata, SQL interview question](https://www.tiktok.com/@selectdata/video/7667345672042974481): 266K views, 10.7K saves (4.0%), 2.8× followers. The shape is: question, four options, pause, answer, one expert detail.

**Hook (caption + post title):** Here's a Microsoft Fabric interview question that trips up Power BI people.

| # | Say | Picture | Source |
| --- | --- | --- | --- |
| 1 | "Here's a Microsoft Fabric interview question that trips up Power BI people." | you, raw; `keyword` key **INTERVIEW** | — |
| 2 | "Your sales data lives in a lakehouse, as Delta tables in OneLake." | `tile_reveal` onto the lakehouse explorer | Lakehouse overview page (`capture.mjs`) |
| 3 | "The report needs import speed, but nobody wants to wait for an import refresh." | `seq`: a refresh spinner, a clock | rebuilt refresh dialog |
| 4 | "Which storage mode? A, Import. B, DirectQuery. C, Direct Lake. D, Dual." | `typewriter`: the question and the four options, one per word | text only |
| 5 | "Pause and lock in your answer." | the options card held for 3 s; `comment_box` caret | — |
| 6 | "It's C. Direct Lake." | `neg_flash` into you; `keyword` shock **DIRECT LAKE** | — |
| 7 | "Power BI reads the Delta columns straight from OneLake, so a refresh just updates metadata, in seconds." | `page_card` with the highlighter on the Direct Lake description | Direct Lake overview page |
| 8 | "Now the answer that gets you the job: say when it falls back." | you, raw, punch-in on "falls back" | — |
| 9 | "Put row-level security on the SQL endpoint and Direct Lake falls back to DirectQuery, and gets slower." | `page_card` on the fallback note | Direct Lake overview page |
| 10 | "Comment the answer you picked before the reveal." | `comment_box` | — |

**Keep exact:**
- **Direct Lake:** it reads Delta tables from OneLake with no import refresh. A refresh re-points metadata, in seconds. It needs an F or P capacity. (Field guide, "Five ideas" row 4.)
- **Fallback:** RLS on the SQL endpoint makes Direct Lake fall back (field guide, Objections table). Before recording, confirm on the Direct Lake overview page that the fallback is to DirectQuery and name it exactly as Microsoft does.
- **"Dual"** is a real Power BI storage mode. Keep all four options real.

**Post caption:** Fabric interview question 👇 A, B, C or D? #microsoftfabric #powerbi #dataengineer #interviewprep

---

## Script 2 — "Your boss is about to ask Power BI questions in plain English" (~65 s)

Modelled on: [@selectdata, "Claude + Power BI"](https://www.tiktok.com/@selectdata/video/7636938088559758593): 237K views, 10.8K saves (4.6%). Also [@jennytumay, PBIP for vibecoding reports with AI](https://www.tiktok.com/@jennytumay/video/7669200559345290527): 43K views, 17.9× her median. The shape is: AI does a Power BI job, here's how, here's the catch.

**Hook:** Your boss is about to ask your Power BI data questions in plain English. Here's what answers.

| # | Say | Picture | Source |
| --- | --- | --- | --- |
| 1 | "Your boss is about to ask your Power BI data questions in plain English." | `typewriter`: a plain-English sales question typing | text only |
| 2 | "In Microsoft Fabric, the thing that answers is a data agent." | `tile_reveal` onto the data agents page; `keyword` title *data agent* | Data agents concept page |
| 3 | "You point it at up to five sources: semantic models, a warehouse, a KQL database." | `pop_collage`: five source cards, one per word | data agent docs |
| 4 | "It turns the question into DAX, SQL or KQL, runs it, and answers." | `terminal`: the question in, generated DAX scrolling, the answer row marked | rebuilt UI fed with the example |
| 5 | "And you can publish it to Teams, Microsoft 365 Copilot, Copilot Studio, or any AI app that speaks MCP." | `seq`: four destinations, a click each | the publish options on the docs page |
| 6 | "Which means the semantic model you built for reports is now what the AI reads." | `cutout_world` with **YOUR MODEL** behind your head | — |
| 7 | "Three catches before you demo it." | you, raw; `captions` big on "three" | — |
| 8 | "One: it's read-only. It answers questions; it doesn't change data." | `focus_card` on the read-only note | data agent docs |
| 9 | "Two: it answers in English, and it isn't on the free trial." | `seq`: the language note, the trial limits | docs + trial page |
| 10 | "Three: every question uses capacity, about 400 CU-seconds, so watch the bill." | `keyword` key **400 CU-s** | Data agent consumption page |
| 11 | "The skill that matters now is a clean semantic model, because that's what the AI is reading." | you, raw, punch-in on "clean" | — |
| 12 | "Follow, and next I'll build one live." | end card | — |

**Keep exact:**
- **Data agents:** natural language to SQL, DAX or KQL over up to 5 sources; published to Teams, Copilot Studio, Microsoft 365 Copilot and MCP; read-only and English. (Field guide, workloads table, "Fabric IQ".)
- **Trial:** no data agents, Copilot or private link (field guide, SKU table, "Trial" row).
- **Cost:** about 400 CU-seconds per question (field guide, consumption table). Say "about".
- **Row limit:** don't quote one. The docs disagree (25 vs 1,000 rows).
- **The line-12 promise:** a follow-up must exist.

**Post caption:** Plain-English questions on your Power BI data, and the 3 catches 👇 #microsoftfabric #powerbi #ai #copilot

---

## Script 3 — "3 free things Microsoft gives you to learn Fabric" (~50 s)

Modelled on:
- [@dhany.indraswara, "Need Power BI dashboard ideas? 100+ free files, SAVE + SHARE"](https://www.tiktok.com/@dhany.indraswara/video/7660163521614777620): 74K views, 4.4% saves.
- [@mampolokeng_1's green-screen free-program posts](https://www.tiktok.com/@mampolokeng_1): 477K, 134K and 88K views.

The shape is: a numbered list of free things, the real page behind you, "save this".

**Hook:** 3 free things Microsoft gives you to learn Fabric. Save this.

| # | Say | Picture | Source |
| --- | --- | --- | --- |
| 1 | "Three free things Microsoft gives you to learn Fabric. Save this." | you in front of the Learn page (`cutout_world` or a green-screen take); `keyword` key **FREE** | Microsoft Learn Fabric page |
| 2 | "One: a 60-day Fabric trial, a real capacity you can build on." | `tile_reveal` onto the trial page | Fabric trial page |
| 3 | "No Copilot or data agents on the trial, but lakehouses, pipelines and Power BI are there to practice on." | `seq`: lakehouse, pipeline, report | Fabric docs |
| 4 | "Two: the official practice assessment for the DP-700 exam, free on Microsoft Learn." | `page_card` with the highlighter on "Take the practice assessment" | [DP-700 certification page](https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/) |
| 5 | "Same style, wording and difficulty as the real questions, and it shows you where you're weak." | `focus_card` on the practice description | same page |
| 6 | "Three: the exam sandbox. You click through the real exam interface before exam day." | `page_card` on "Exam Sandbox" | same page |
| 7 | "And the exam is 100 minutes, so practice with a timer." | `keyword` key **100 MIN** | same page |
| 8 | "Already certified? Renewing is free too: an online assessment on Microsoft Learn." | `focus_card` on the renewal note | same page |
| 9 | "Save this, and send it to the friend who keeps saying they'll start Fabric next month." | you, raw; end card | — |

**Keep exact:**
- **Verified Oct 21 2026 on the [DP-700 certification page](https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/):**
    - the free practice assessment "provide[s] you with an overview of the style, wording, and difficulty of the questions";
    - the exam sandbox lets you "experience the look and feel of the exam";
    - the exam is 100 minutes;
    - renewal is "at no cost by passing an online assessment on Microsoft Learn".
- **Trial:** 60 days, with no Copilot, data agents or private link (field guide, SKU table). Before recording, confirm on the trial page that it's still 60 days.
- **No exam price:** the page says the price depends on the country.
- **No vouchers:** the free-voucher offer closed Aug 10 2026, so don't mention vouchers.

**Post caption:** 3 free ways to learn Microsoft Fabric. Save it for later 🔖 #microsoftfabric #dp700 #dataengineer #freeresources

---

## Rights

- **Pages:** Microsoft Learn and Fabric pages appear as screenshots for commentary. Editor V1 lists every source in PLAN.md and flags anything unclear before it renders.
- **Music:** bring a track you have the rights to.
- **Copying:** the modelled posts are evidence for a pattern. Their words, footage and audio aren't reused.
