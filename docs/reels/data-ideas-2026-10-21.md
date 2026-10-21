# Video ideas: data category, Oct 21 2026

**Topic × format.** Each idea pairs:
- a **topic** that is new or widely asked about right now (Content Machine system 1: the scraper + web research), with
- a **format** already proven in this category (`docs/reels/data-category-trends.md`, formats #1–#10).

Best first, by viral potential:
- how far the format spreads (shares, breakouts on small accounts);
- how fresh the topic is;
- how well it fits a Databricks + Fabric seller.

**Sources scanned:**
- 94 finds from the last 14 days: the Fabric and Power BI update blogs, the Databricks blog, 5 YouTube channels (Guy in a Cube, Data Goblins, Databricks, Pragmatic Works, How to Power BI) and Hacker News.
- Web searches for common questions and complaints.
- Reddit blocks this environment (HTTP 403); run the scraper from your own machine to add r/MicrosoftFabric, r/PowerBI, r/databricks and r/dataengineering.

## 1 · "Claude built a dashboard on my Power BI model in 3 minutes"
- **Format:** #2, AI builds the dashboard. Pavan Lalwani's Claude dashboard video: 972K views, 163× channel median.
- **Angle:** news.
- **Why now:** Claude Dashboards on a Power BI semantic model was covered by How to Power BI / datatraining.io (Oct 16–17) and Data Goblins (Oct 17–19).
- **Sources:**
    - https://www.youtube.com/watch?v=mGcby3on34M
    - https://www.youtube.com/watch?v=4FI7DaEIa7A
    - https://www.youtube.com/shorts/8v26MQ2DbKk
- **Check before filming:** only third-party write-ups so far. Confirm on Anthropic's or Microsoft's own page what it is, what plan it needs, and that RLS is honoured.
- **Free thing to DM:** a setup checklist.
- **Length:** short, ≈30–45 s, screen recording.

## 2 · "I asked my data a question in plain English and Fabric wrote the DAX"
- **Format:** #2, AI builds it, plus #8, explained visually.
- **Angle:** news.
- **Why now:** advanced NL2SQL and advanced DAX generation in Fabric data agents went GA on Oct 19.
- **Source:** https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Advanced-NL2SQL-and-advanced-DAX-generation-in-Fabric-data/ba-p/5374654
- **Free thing to DM:** the prompt and business-context text you gave the agent.
- **Length:** ≈45 s.

## 3 · "I'm a data sales engineer. I analysed [something people care about] in Fabric."
- **Format:** #1, a data person analyses something that isn't data. This format has the highest share rate in the category: The Bald Coder's "I analyzed the entire Qur'an" got 618K views (573×); @thedreydossier got 3% shares.
- **Angle:** story.
- **Topic:** pick a public dataset your audience argues about (NBA stats, flight delays, your city's 311 calls, gas prices). Ask it questions with a data agent (idea 2), so the video shows the product without selling it.
- **Free thing to DM:** the dataset and notebook.
- **Length:** 60–90 s.

## 4 · "Pausing your Fabric capacity doesn't save money if you reserved it"
- **Format:** #3 (short meme) or #8 (explained in 60 s).
- **Angle:** taboo / myth.
- **Why it works:** cost is the most common Fabric complaint (throttling, idle capacity).
- **Source:** a Fabric Community thread says reserved capacity bills while paused and OneLake storage bills either way: https://community.fabric.microsoft.com/t5/Fabric-platform/Microsoft-Fabric-Capacity-Paused/td-p/4668761
- **Check before filming:** confirm on Microsoft Learn's Fabric pricing / pause-resume page.
- **Free thing to DM:** a capacity cost checklist.
- **Length:** 15–30 s.

## 5 · "Why your Fabric reports are slow at 9 am"
- **Format:** #8, a concept explained visually.
- **Angle:** problem.
- **Why now:**
    - throttling at peak hours is the top admin complaint;
    - Microsoft's answers just shipped: Custom SQL Pools GA (Oct 12) and a redesigned Capacity Metrics app (preview, Oct 12).
- **Sources:**
    - https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Custom-SQL-Pools-in-Fabric-Data-Warehouse-Generally-Available/ba-p/5368292
    - https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/A-new-look-and-new-capabilities-in-the-Capacity-Metrics-App/ba-p/5374114
    - https://kanerika.com/blogs/microsoft-fabric-capacity/ (complaint themes, secondary)
- **Length:** ≈50 s.

## 6 · "I sell both Databricks and Fabric. Here's when I tell customers to pick each."
- **Format:** #6, tier list / ranking, plus #9, a hot take. Data with Baraa's "Databricks vs Snowflake vs Fabric" got 142K views.
- **Angle:** questions. "Databricks or Fabric?" is the most-asked comparison.
- **Why it works:** your credibility. Most comparison posts come from consultancies with something to sell.
- **Sources** (consensus: Databricks for Spark/Python, ML, multi-cloud and scale; Fabric for Microsoft-centric, Power BI-led teams; many run both):
    - https://www.lucentinnovation.com/resources/it-insights/databricks-vs-fabric
    - https://lanternstudios.com/insights/blog/microsoft-fabric-databricks-or-both/
- **Free thing to DM:** a one-page decision sheet.
- **Length:** list, ≈50–60 s.

## 7 · "Fabric Apps: the SaaS killer?"
- **Format:** #9, hot take, plus a build-along. On YouTube now: "Microsoft Fabric Apps Explained (The SaaS Killer?)", and a run of Data Goblins Fabric Apps videos that earlier research put at 17× median.
- **Angle:** news / opinion.
- **Sources:**
    - https://www.youtube.com/watch?v=xjizOqvu-EU
    - https://www.youtube.com/watch?v=i8l0PT1WD4k
- **Your take:** prototype vs product. Data Goblins warns against shipping prototypes.
- **Length:** ≈45 s.

## 8 · "Power BI finally has a native Gantt chart"
- **Format:** #7, dashboard makeover: the old 15-minute workaround vs the new visual.
- **Angle:** news.
- **Why now:** it's in the October 2026 update (preview).
- **Sources:**
    - https://community.fabric.microsoft.com/t5/Power-BI-Updates-Blog/Power-BI-October-2026-Feature-Summary/ba-p/5374650
    - https://www.youtube.com/watch?v=kH9rljmL3lM
- **Length:** ≈30 s.

## 9 · "Day in the life of a data sales engineer"
- **Format:** #4, day-in-the-life series. @itssimplyjordan's 9–5 series got 939K, 634K, 473K and 391K.
- **Angle:** story.
- **Why it works:** almost nobody films the sales-engineer side of data: demos, POCs, the customer's "can it do X?".
- **Length:** 60–90 s; number the episodes.

## 10 · "Claude Code can now run your Fabric notebooks"
- **Format:** #2, AI builds it.
- **Angle:** news.
- **Why now:** Fabric Notebook Toolkit (FNTK, preview, Oct 21) connects coding agents such as Claude Code to Fabric notebooks through a CLI.
- **Source:** https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Connect-coding-agents-to-Fabric-notebooks-with-FNTK-Preview/ba-p/5375986
- **Length:** ≈40 s.

## 11 · "Learn Databricks and Fabric for free"
- **Format:** #5, free resources. This format gets the highest saves (7–8.6%).
- **Angle:** free-thing.
- **Content:** Databricks Free Edition (Alex The Analyst's videos on it run 14–32× his median), the Fabric 60-day trial, and the DP-700 free practice assessment and exam sandbox (verified Oct 21).
- **Sources:**
    - https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/
    - Databricks Free Edition page (confirm before filming)
- **Free thing to DM:** a links list.
- **Length:** list, ≈45 s.

## 12 · "The Databricks connector in Power BI just changed"
- **Format:** #8, explained in 60 s.
- **Angle:** news, and good for buyers who run both platforms.
- **Why now:** the Databricks ADBC connector for Power BI and Fabric went GA on Oct 15, part of the move from ODBC to ADBC. Existing connections keep working.
- **Source:** https://community.fabric.microsoft.com/t5/Power-BI-Updates-Blog/Databricks-ADBC-connector-for-Power-BI-and-Microsoft-Fabric/ba-p/5369591
- **Length:** ≈30 s.

## Also seen (lower viral potential, useful for sales)

| Item | Date | Why it matters |
| --- | --- | --- |
| Teradata → Fabric Migration Assistant | Preview, Oct 21 | Useful for sales conversations |
| Fabric data agent custom tool in Foundry retired; use Fabric IQ | Oct 20 | Useful for sales conversations |
| Databricks AI Runtime | GA, Oct 21 | Useful for sales conversations |
| Agent Memory on Databricks | Oct 20 | Useful for sales conversations |
| Fivetran, "I benchmarked Databricks against my iPhone" | Oct 8 | A possible hot-take reaction; read it before using |
