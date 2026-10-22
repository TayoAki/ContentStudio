# All scripts and what inspired them

Nine scripts in three sets, written Oct 20–21 2026. For each one:
- what you say;
- the post(s) it was modelled on, with their numbers;
- what we took from them (the format, never their words);
- where the facts come from.

Shot lists, on-screen plans and the full "keep exact" notes are in the set's own file.

**Where the inspirations were found:**
- `microsoft-fabric-research.md`: the Fabric niche;
- `data-category-trends.md`: the whole data category, top 10 formats;
- `data-ideas-2026-10-21.md`: news × formats.

## At a glance

| # | Script | Length | Inspired by | File |
| --- | --- | --- | --- | --- |
| 1 | Fabric vs Power BI | ~65 s | @shreya.knows.data, "Microsoft Fabric vs. Power BI is the most searched question…" | `fabric-scripts.md` |
| 2 | The free DP-700 path | ~70 s | @shreya.knows.data, "Microsoft is giving away 100% FREE exam vouchers for DP-600, DP-700…" | `fabric-scripts.md` |
| 3 | Future data analysts will be using Fabric | ~60 s | @shreya.knows.data, "Future Data Analysts will be using Microsoft Fabric" | `fabric-scripts.md` |
| 4 | The Fabric interview question Power BI people miss | ~55 s | @selectdata, SQL interview question | `microsoft-fabric-scripts.md` |
| 5 | Your boss is about to ask Power BI questions in plain English | ~65 s | @selectdata, "Claude + Power BI" | `microsoft-fabric-scripts.md` |
| 6 | 3 free things Microsoft gives you to learn Fabric | ~50 s | @dhany.indraswara, "Need Power BI dashboard ideas? 100+ free files" | `microsoft-fabric-scripts.md` |
| 7 | Claude builds dashboards on your Databricks data now | ~45 s | @nocode.joshua, "Claude just dropped Claude Dashboards" | `data-scripts-2026-10-21.md` |
| 8 | I analysed every complaint New York made to 311 this year | ~50 s | @gourmet.data, "using data science to understand perfumes" | `data-scripts-2026-10-21.md` |
| 9 | Pausing your Fabric capacity doesn't save money if you reserved it | ~35 s + an 8 s text cut | @kairadc, "misconception that you need a coding language to land your first data analyst role" | `data-scripts-2026-10-21.md` |

---

## 1. Fabric vs Power BI

| | |
| --- | --- |
| Set | Set 1 |
| File | `fabric-scripts.md` |
| Length | ~65 s |
| Keyword | FABRIC |

**Inspired by:**
- [@shreya.knows.data, "Microsoft Fabric vs. Power BI is the most searched question…"](https://www.tiktok.com/@shreya.knows.data/video/7638031376217853205): 68,935 views (her 2nd best).

**What we took:** The claim-as-first-line hook, three reasons, a "what to do next" close, under 90 s.

**Script:**

> Microsoft Fabric versus Power BI is the most searched question in data right now.
>
> And it's the wrong question.
>
> Power BI isn't competing with Fabric. Power BI is *inside* Fabric.
>
> Fabric is the whole kitchen: getting data in, storing it, cleaning it, and serving it.
>
> Everything lands in one lake, OneLake, as open Delta tables.
>
> Then Power BI reads those tables directly. That's Direct Lake. No import, no overnight refresh.
>
> So if you already know Power BI, you're not starting over. You're one layer up from where Fabric starts.
>
> Learn the lakehouse, a little SQL, and how data gets into OneLake.
>
> That's the difference between a report builder and the person who owns the data.
>
> Comment FABRIC and I'll send you the free learning path I'd follow.

**Facts from:**
- Microsoft Fabric Field Guide (`docs/microsoft-fabric-field-guide.md`), checked against Microsoft Learn on Oct 20 2026
- What is Microsoft Fabric, the OneLake overview and the Direct Lake overview on Microsoft Learn

---

## 2. The free DP-700 path

| | |
| --- | --- |
| Set | Set 1 |
| File | `fabric-scripts.md` |
| Length | ~70 s |
| Keyword | — |

**Inspired by:**
- [@shreya.knows.data, "Microsoft is giving away 100% FREE exam vouchers for DP-600, DP-700…"](https://www.tiktok.com/@shreya.knows.data/video/7659620910105677076): 43,638 views.

**What we took:** A free-offer hook. Rewritten as "be ready for the next round" because that offer closed Aug 10 2026.

**Script:**

> Microsoft gave away free Fabric certification exams twice in the last year.
>
> And most people missed it because they weren't ready.
>
> The last round, Fabric Data Days, closed in August.
>
> To get a voucher you had to join the Fabric Community, watch sessions and finish Microsoft Learn modules.
>
> So here's how to be ready before the next one drops.
>
> One: pick DP-700, the Fabric Data Engineer exam, or DP-600 if you're a Power BI person.
>
> Two: do the free Microsoft Learn path for it now. It's the same content the vouchers asked for.
>
> Three: take the free practice assessment until you pass it twice.
>
> Then when the vouchers come back, you claim one and book the exam the same week.
>
> Follow so you hear about the next round the day it opens.

**Facts from:**
- Fabric Data Days 2026 dates (Jun 15 – Aug 7; requests by Aug 10), from the field guide
- The DP-700 / DP-600 exam pages on Microsoft Learn

⚠ The hook's "twice in the last year" needs the Dec 2025 round confirmed on an official page; otherwise say "this summer".

---

## 3. Future data analysts will be using Fabric

| | |
| --- | --- |
| Set | Set 1 |
| File | `fabric-scripts.md` |
| Length | ~60 s |
| Keyword | — |

**Inspired by:**
- [@shreya.knows.data, "Future Data Analysts will be using Microsoft Fabric"](https://www.tiktok.com/@shreya.knows.data/video/7635415703377448212): 82,211 views, 11.9× her followers (her best post).

**What we took:** The same claim hook, then three reasons and what to learn first.

**Script:**

> Future data analysts will be using Microsoft Fabric.
>
> Not because it's new. Because of three things.
>
> One: one copy of the data. Every tool reads the same lake, so nobody's arguing about whose numbers are right.
>
> Two: one bill. A single capacity pays for pipelines, SQL, Spark and Power BI.
>
> Three: AI built in. Data agents answer questions in plain English, on top of the models you already built.
>
> Which means the analyst who understands the whole flow gets the job, not just the one who builds charts.
>
> So learn SQL, keep Power BI, and add one thing: the lakehouse.
>
> That's the DP-600 exam, and it's the skill set every Fabric job posting lists.
>
> Follow for one Fabric skill a day.

**Facts from:**
- The field guide (OneLake, capacity, data agents)
- The DP-600 exam page on Microsoft Learn

⚠ "Every Fabric job posting lists" is a claim: check 10 postings or say "most Fabric job posts I've seen".

---

## 4. The Fabric interview question Power BI people miss

| | |
| --- | --- |
| Set | Set 2 |
| File | `microsoft-fabric-scripts.md` |
| Length | ~55 s |
| Keyword | — |

**Inspired by:**
- [@selectdata, SQL interview question](https://www.tiktok.com/@selectdata/video/7667345672042974481): 266K views, 10.7K saves (4.0%), 26× the account's median.

**What we took:** Question, four options, a pause, the answer, then one expert detail.

**Script:**

> Here's a Microsoft Fabric interview question that trips up Power BI people.
>
> Your sales data lives in a lakehouse, as Delta tables in OneLake.
>
> The report needs import speed, but nobody wants to wait for an import refresh.
>
> Which storage mode? A, Import. B, DirectQuery. C, Direct Lake. D, Dual.
>
> Pause, and lock in your answer.
>
> It's C. Direct Lake.
>
> Power BI loads the Delta columns straight from OneLake, and a refresh only copies metadata, in a few seconds.
>
> Now the answer that gets you the job: there are two kinds of Direct Lake.
>
> Direct Lake on SQL falls back to DirectQuery when the SQL endpoint has row-level security, and gets slower.
>
> Direct Lake on OneLake never falls back, but it doesn't apply that SQL security either.
>
> Comment the answer you picked before the reveal.

**Facts from:**
- [Direct Lake overview](https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview), Microsoft Learn (checked Oct 21 2026)

An example cut was made (TTS voice, no face).

---

## 5. Your boss is about to ask Power BI questions in plain English

| | |
| --- | --- |
| Set | Set 2 |
| File | `microsoft-fabric-scripts.md` |
| Length | ~65 s |
| Keyword | — |

**Inspired by:**
- [@selectdata, "Claude + Power BI"](https://www.tiktok.com/@selectdata/video/7636938088559758593): 237K views, 10.8K saves (4.6%).
- [@jennytumay, PBIP for vibecoding reports with AI](https://www.tiktok.com/@jennytumay/video/7669200559345290527): 43K views, 17.9× her median.

**What we took:** AI does a Power BI job, here's how, here are the catches.

**Script:**

> Your boss is about to ask your Power BI data questions in plain English.
>
> In Microsoft Fabric, the thing that answers is a data agent.
>
> You point it at up to five sources: semantic models, a warehouse, a KQL database.
>
> It turns the question into DAX, SQL or KQL, runs it, and answers.
>
> And you can publish it to Teams, Microsoft 365 Copilot, Copilot Studio, or any AI app that speaks MCP.
>
> Which means the semantic model you built for reports is now what the AI reads.
>
> Three catches before you demo it.
>
> One: it's read-only. It answers questions; it doesn't change data.
>
> Two: it answers in English, and it isn't on the free trial.
>
> Three: every question uses capacity, about 400 CU-seconds, so watch the bill.
>
> The skill that matters now is a clean semantic model, because that's what the AI is reading.
>
> Follow, and next I'll build one live.

**Facts from:**
- The field guide: data agents (up to 5 sources; read-only; English; not on the trial; about 400 CU-seconds a question)

---

## 6. 3 free things Microsoft gives you to learn Fabric

| | |
| --- | --- |
| Set | Set 2 |
| File | `microsoft-fabric-scripts.md` |
| Length | ~50 s |
| Keyword | — |

**Inspired by:**
- [@dhany.indraswara, "Need Power BI dashboard ideas? 100+ free files"](https://www.tiktok.com/@dhany.indraswara/video/7660163521614777620): 74K views, 4.4% saves.
- [@mampolokeng_1, green-screen posts about free programs](https://www.tiktok.com/@mampolokeng_1): 477K, 134K and 88K views.

**What we took:** A numbered list of free things, the real page behind you, and "save this".

**Script:**

> Three free things Microsoft gives you to learn Fabric. Save this.
>
> One: a 60-day Fabric trial, a real capacity you can build on.
>
> No Copilot or data agents on the trial, but lakehouses, pipelines and Power BI are there to practice on.
>
> Two: the official practice assessment for the DP-700 exam, free on Microsoft Learn.
>
> Same style, wording and difficulty as the real questions, and it shows you where you're weak.
>
> Three: the exam sandbox. You click through the real exam interface before exam day.
>
> And the exam is 100 minutes, so practice with a timer.
>
> Already certified? Renewing is free too: an online assessment on Microsoft Learn.
>
> Save this, and send it to the friend who keeps saying they'll start Fabric next month.

**Facts from:**
- [DP-700 certification page](https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/) (verified Oct 21 2026: free practice assessment, exam sandbox, 100 minutes, free renewal)
- Trial: 60 days (field guide; re-check)

---

## 7. Claude builds dashboards on your Databricks data now

| | |
| --- | --- |
| Set | Set 3 |
| File | `data-scripts-2026-10-21.md` |
| Length | ~45 s |
| Keyword | DASH |

**Inspired by:**
- [@nocode.joshua, "Claude just dropped Claude Dashboards"](https://www.tiktok.com/@nocode.joshua/video/7695498034079108359): 228K views, 3.5% saves (same topic).
- [Pavan Lalwani, "I Created a Full Dashboard in 3 Minutes Using Claude AI"](https://www.youtube.com/watch?v=Rlkkl2wc4pQ): 972K views, 163× channel median.
- [@copilottips, "Copilot built me the work dashboard Microsoft forgot to make"](https://www.tiktok.com/@copilottips/video/7690607180663344416): 513K views.

**What we took:** "AI builds the dashboard", #2 of the top 10 formats; a 3-step layout with you below and product cards above.

**Script:**

> Claude can now build a live dashboard straight from your Databricks data, and you never write the query.
>
> It's called Claude Dashboards. It came out on October 8th, and it's in beta on paid plans.
>
> Step one: connect your data. Databricks, Snowflake, BigQuery, Redshift and ClickHouse are all on the list.
>
> Step two: ask in plain English. Something like, how did this month's pipeline compare to last month?
>
> Claude writes the query and builds the dashboard.
>
> Step three: it stays live. When the data changes, the dashboard changes. No asking again.
>
> And this is the part I'd show your boss. Click any number, and it shows you the query behind it. Every chart also shows when it last refreshed.
>
> Two catches. Power BI isn't on the list of tools you can send it to. And on Enterprise plans, it's off until your admin turns it on.
>
> Comment DASH and I'll send you my setup checklist.

**Facts from:**
- [Anthropic, "Build live dashboards and animate explainers with Claude"](https://claude.com/resources/articles/dashboards-and-motion), Oct 8 2026

An example cut was made (TTS voice, no face).

---

## 8. I analysed every complaint New York made to 311 this year

| | |
| --- | --- |
| Set | Set 3 |
| File | `data-scripts-2026-10-21.md` |
| Length | ~50 s |
| Keyword | NYC |

**Inspired by:**
- [@gourmet.data, "using data science to understand perfumes"](https://www.tiktok.com/@gourmet.data/video/7683919006683680014): 122K views on 5.8K followers (21×), 4.0% saves.
- [The Bald Coder, "I'm a Data Scientist. I Analyzed the ENTIRE Qur'an"](https://www.youtube.com/watch?v=MpWb5YBsVxc): 618K views, 573× channel median.

**What we took:** "A data person analyses something that isn't data", #1 of the top 10 formats (the highest share rate).

**Script:**

> New Yorkers filed almost four million complaints with 311 in the last year. I loaded every one of them into Microsoft Fabric and asked it questions in plain English.
>
> Number one isn't noise. It's illegal parking. Six hundred and eleven thousand complaints.
>
> Noise is second, and noise has a clock. Complaints about noisy neighbours peak between ten and eleven at night. And the worst day isn't Friday or Saturday. It's Sunday.
>
> Over half of those are loud music or a party. Most of the rest are banging and pounding.
>
> Heat is the seasonal one. January had about twenty-two times more heat complaints than August.
>
> But my favourite part of this data set is the bottom of the list. Fifteen complaints about radioactive material. Six about squeegees. And exactly one complaint filed under trapping pigeon.
>
> Comment NYC and I'll send you the data set and every question I asked.

**Facts from:**
- [NYC 311 Service Requests](https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9), NYC Open Data, Oct 1 2025 – Sep 30 2026, pulled Oct 21 2026

⚠ Re-run the analysis in Fabric before filming; the script says you did.

---

## 9. Pausing your Fabric capacity doesn't save money if you reserved it

| | |
| --- | --- |
| Set | Set 3 |
| File | `data-scripts-2026-10-21.md` |
| Length | ~35 s + an 8 s text cut |
| Keyword | PAUSE |

**Inspired by:**
- [@kairadc, "misconception that you need a coding language to land your first data analyst role"](https://www.tiktok.com/@kairadc/video/7671004519790054678): 235K views on 1.1K followers (216×), 5.9% saves.

**What we took:** The myth-bust: the misconception stated flat, then the answer building on screen.

**Script:**

> Pausing your Fabric capacity doesn't save money if you bought a reservation.
>
> A reservation is paid for every hour, whether you use it or not. Microsoft applies it hour by hour, and an hour you don't use doesn't carry over. So pausing a reserved capacity just throws those hours away.
>
> Pausing only saves money on pay-as-you-go.
>
> And there's a second surprise. When you pause, any smoothed usage still waiting to be billed is added up and charged straight away.
>
> So before you pause, check two things. Is this capacity reserved? And how much smoothed usage is waiting? The Capacity Metrics app shows you.
>
> Comment PAUSE and I'll send you my capacity cost checklist.

**Facts from:**
- [Save costs with Fabric capacity reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/fabric-capacity), Microsoft Learn (updated Sep 30 2026)
- [Pause and resume your Fabric capacity](https://learn.microsoft.com/en-us/fabric/enterprise/pause-resume), Microsoft Learn (updated Aug 14 2026)
