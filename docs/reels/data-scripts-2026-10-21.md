# Scripts: Claude Dashboards, NYC 311, Fabric pause (Oct 21 2026)

Ideas 1, 3 and 4 from `docs/reels/data-ideas-2026-10-21.md`, written with Content Machine's script system:
- the hook first;
- the value spread through the video, best bit late;
- one comment keyword per video;
- every fact sourced.

**Before filming:**
- **Voice:** there are no recordings of you yet, so the voice is plain, short sentences. Read each one aloud; any line that doesn't sound like you, tell me and it becomes a rule.
- **References:** each script names the post it copies and what to take from it. That's the structure and pacing, not the words. Stills from each reference are in the session's `refs/` folder.

---

## Script 1: "Claude builds dashboards on your Databricks data now"

| | |
| --- | --- |
| Keyword | DASH |
| Format | short |
| Length | ≈150 words · ≈45 s |
| Angle | news |

### Reference

**[@nocode.joshua, "Claude just dropped Claude Dashboards"](https://www.tiktok.com/@nocode.joshua/video/7695498034079108359)**
- 228K views, 3.5% saves, posted Oct 11, 44 s.
- Same topic, already proven.

**Copy his layout:**
- You on camera in the lower half; a clean product card in the upper half that changes on every step.
- A small all-caps caption bar between the two.
- A numbered "3 simple steps" frame at 0:04.

**His timing:**

| Time | Beat |
| --- | --- |
| 0–4 s | Hook |
| 4–7 s | "here's how, 3 steps" |
| 7–13 s | Step 1 |
| 14–25 s | Step 2 |
| 27–36 s | Step 3 + "click the number to see how it worked it out" |
| 40 s | Beta note |

**Where we go further** (what he leaves out):
- the Databricks angle (your customers);
- the two catches.

**Also behind this format:**
- [Pavan Lalwani, "I Created a Full Dashboard in 3 Minutes Using Claude AI"](https://www.youtube.com/watch?v=Rlkkl2wc4pQ): 972K views, 163× channel median.
- [@copilottips](https://www.tiktok.com/@copilottips/video/7690607180663344416): 513K, 2.8% saves.

### Hooks (pick one)
1. Claude can now build a live dashboard from your Databricks data, and you never write the query.
2. You don't need to build this dashboard anymore.
3. Anthropic just put a dashboard builder inside Claude, and Databricks is on the list from day one.

### Script

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

### Facts

| Claim | Value | Source |
| --- | --- | --- |
| Launch date and status | Oct 8 2026, beta, paid plans | [Anthropic: Build live dashboards and animate explainers with Claude](https://claude.com/resources/articles/dashboards-and-motion) |
| Data connectors | Amazon Redshift, BigQuery, ClickHouse, Databricks, Snowflake (+ Salesforce) | same page |
| How you build one | Ask in plain language; Claude builds it | same page |
| Query behind a number | "Click any number to see the query behind it" | same page |
| Refresh time | Each chart shows when its data was last refreshed | same page |
| Stays live | Stays current as the data changes | same page |
| Where it can go | Amplitude, Grafana, Hex, Mixpanel, Omni, Perplexity, PostHog, Sigma; Databricks Genie, Looker, monday.com, Tableau "coming soon"; Power BI not listed | same page |
| Enterprise | Off by default; admins turn it on | same page |

⚠ **Check on the day you film:**
- Betas change fast; re-open the page.
- If Power BI gets added, cut that catch.
- Don't say "every plan" or "free".

### On screen

| When you say… | Show |
| --- | --- |
| The hook | You, with a Claude dashboard card above you (your own screen recording) |
| "October 8th, beta" | The Anthropic page headline, date highlighted |
| Step 1 | The connector list, Databricks highlighted |
| Step 2 | The question typing |
| "it stays live" | A number changing |
| "click any number" | The query panel opening |
| "Two catches" | The "coming soon" list and the Enterprise note |

### The free thing (DASH)
A setup checklist:
- which plan you need;
- turning it on for Enterprise;
- connecting Databricks (read-only access first);
- 5 good first questions;
- what to check before you trust a number.

### Cover text
DASHBOARDS IN CLAUDE

### Caption draft
Claude builds live dashboards on your Databricks data now. Comment DASH for my setup checklist. #databricks #claude #dataanalytics #dashboard

---

## Script 3: "I analysed every complaint New York made to 311 this year"

| | |
| --- | --- |
| Keyword | NYC |
| Format | story / list |
| Length | ≈150 words · ≈50 s |
| Angle | story (a data person analyses something that isn't data) |

### Reference

**[@gourmet.data, "using data science to understand perfumes"](https://www.tiktok.com/@gourmet.data/video/7683919006683680014)**
- 122K views on 5.8K followers (21×), 4.0% saves, 1.4% shares, 63 s.

**Copy his structure:**

| Time | Beat |
| --- | --- |
| 0–4 s | "I took thousands of X and charted Y" |
| 4–7 s | "then I noticed something really interesting" |
| 7–12 s | Who I am |
| Rest | Walk through the chart, one finding at a time |

- Every finding has its own chart in the upper half, you below, captions in a bar.

**Also behind this format:**
- [The Bald Coder, "I'm a Data Scientist. I Analyzed the ENTIRE Qur'an"](https://www.youtube.com/watch?v=MpWb5YBsVxc): 618K views, 573× channel median.

**Our twist:** the analysis happens in Microsoft Fabric, asked in plain English. The product is in the video, but the story is New York.

### Hooks (pick one)
1. New Yorkers filed almost four million complaints with 311 in the last year. I loaded every one into Microsoft Fabric.
2. I sell data platforms for a living, so I analysed every complaint New York made in a year. The weirdest one is at the end.
3. What do New Yorkers complain about at 10pm on a Sunday? I have the data.

### Script

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

### Facts

Dataset: [NYC 311 Service Requests from 2010 to Present](https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9), NYC Open Data. Window: Oct 1 2025 – Sep 30 2026 (created_date). Pulled Oct 21 2026 through the dataset's API.

| Claim | Value |
| --- | --- |
| Total complaints | 3,963,898 |
| #1 type | Illegal Parking, 611,282 |
| #2 type | Noise - Residential, 432,431 |
| #3 type | HEAT/HOT WATER, 359,087 |
| Residential noise by hour | Peak 22:00–22:59 (42,705), then 23:00 (41,113) |
| Residential noise by day | Sunday 87,909 (most); Saturday 82,975; Friday 56,168; Thursday 49,048 (least) |
| Residential noise descriptors | Loud Music/Party 247,972 (57%); Banging/Pounding 147,644 (34%) |
| Heat by month | January 79,928 vs August 3,682 (21.7×, said as "about 22×") |
| Radioactive Material | 15 |
| Squeegee | 6 |
| Trapping Pigeon | 1 |

⚠ **Check before filming:**
- **Re-run in Fabric.** Load the same window into a lakehouse, ask a Fabric data agent the same questions, and say only what Fabric returns. The numbers move as the city updates the data.
- **Sunday:** the day comes from when the complaint was created. Late Saturday-night calls after midnight count as Sunday. That may be part of why Sunday wins; don't claim it on camera unless you check it.
- **Data agents:** the "asked it in plain English" line needs a Fabric data agent on your capacity. Data agents aren't on the free trial (field guide).

### On screen

| Finding | Show |
| --- | --- |
| The hook | A map or bar race of complaint counts; you below |
| Each finding | Its own chart: top types bar, hour-of-day line, day-of-week bars, descriptor split, month line |
| "asked it in plain English" | The data agent answering |
| The bottom of the list | The rare categories with their counts |

### The free thing (NYC)
- the dataset link and the exact filter;
- the notebook / SQL;
- the 7 questions you asked the data agent.

### Cover text
4 MILLION COMPLAINTS

### Caption draft
I analysed every 311 complaint New York made in a year. The bottom of the list is the best part. Comment NYC for the data set. #nyc #dataanalytics #microsoftfabric #datavisualization

---

## Script 4: "Pausing your Fabric capacity doesn't save money if you reserved it"

| | |
| --- | --- |
| Keyword | PAUSE |
| Format | short |
| Length | ≈115 words · ≈35 s, plus an 8-second text-only cut |
| Angle | taboo / myth |

### Reference

**[@kairadc, "misconception that you need a coding language to land your first data analyst role"](https://www.tiktok.com/@kairadc/video/7671004519790054678)**
- 235K views on 1.1K followers (216×), 5.9% saves, 8 s.
- The shape: the misconception in the caption, a numbered answer building on screen one line at a time over your face, trending audio, no talking.
- That's the 8-second cut below.

**The talking version** keeps her opening (the myth stated flat) and then proves it with Microsoft's own pages on screen.

### Hooks (pick one)
1. Pausing your Fabric capacity doesn't save money if you bought a reservation.
2. Your Fabric capacity is paused. Your bill isn't.
3. Stop pausing Fabric to save money until you check this.

### Script (talking, ≈35 s)

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

### 8-second text-only cut (kairadc style)
- **Caption:** "misconception: pausing Fabric always saves money"
- **On screen, one line per beat:**
    1. reserved? the hours are paid anyway
    2. unused hours don't carry over
    3. pausing bills smoothed usage now
    4. only pay-as-you-go saves

### Facts

| Claim | Value | Source |
| --- | --- | --- |
| Reservation applies hourly; unused hours don't carry over | "applied to CUs on an hourly basis. If you don't have workloads consuming CUs for a full hour, you don't receive the full discount benefit… It doesn't carry over." | [Microsoft Learn: Save costs with Microsoft Fabric Capacity reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/fabric-capacity) (updated Sep 30 2026) |
| Unused reserved quantity is lost | "You lose the reservation quantity for that hour. You can't carry forward unused reserved hours." | same page, example 2 |
| Pausing bills the remaining smoothed usage | "the remaining cumulative overages and smoothed operations on your capacity are summed, and added to your Azure bill" | [Microsoft Learn: Pause and resume your Fabric capacity](https://learn.microsoft.com/en-us/fabric/enterprise/pause-resume) (updated Aug 14 2026) |
| Pausing ends throttling | "pausing it stops the throttling and returns your capacity to a healthy state immediately" | same page (a fact for the checklist) |
| Monitoring | Monitor a paused capacity with the Capacity Metrics app | same page |
| Storage | Not covered by the reservation; billed at pay-as-you-go | reservations page |

⚠ **Notes:**
- "Paid for every hour" describes the commitment: a 1- or 3-year term, paid up front or monthly (reservations page). Don't quote a discount percentage on camera; it varies by region and term.
- The idea list cited a community thread saying storage bills while paused. That's left out: Microsoft's pages don't say it in those words.

### On screen

| When you say… | Show |
| --- | --- |
| The hook | The Azure portal "Pause" button with a red X, or you |
| "doesn't carry over" | The reservations page line, highlighted |
| "added up and charged" | The pause page line, highlighted |
| "check two things" | The Capacity Metrics app |

### The free thing (PAUSE)
A capacity cost checklist:
- reserved or pay-as-you-go?
- smoothed usage waiting before a pause;
- schedule pause/resume (runbook);
- right-size before you reserve;
- storage is billed separately.

### Cover text
PAUSED ≠ SAVED

### Caption draft
Pausing Fabric doesn't always save money. Comment PAUSE for my capacity cost checklist. #microsoftfabric #powerbi #finops #azure
