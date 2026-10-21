# Claude Dashboards: setup checklist (DASH)

Source: [Anthropic, "Build live dashboards and animate explainers with Claude"](https://claude.com/resources/articles/dashboards-and-motion), Oct 8 2026. It's a beta, so check the page for changes.

1. **Plan.** Dashboards is in beta on paid plans. On Enterprise it's off by default: ask an admin to turn it on in Organization settings.
2. **Connect a source.** Amazon Redshift, BigQuery, ClickHouse, Databricks or Snowflake (or Salesforce for CRM data).
   - Start with read-only access to one schema you know well.
   - Ask your admin how your company connects these.
3. **Ask a plain-English question you already know the answer to.** Check Claude's number against your existing report before you trust anything new.
4. **Click the numbers.** Every figure links to the query behind it. Read the query: is the filter, date range and join what you meant?
5. **Check the refresh time** shown on each chart before you share it.
6. **Five good first questions:**
   - "How did this month compare to last month, by region?"
   - "What are the top 10 customers by revenue this quarter, and how did each change?"
   - "Which product had the biggest drop week over week?"
   - "Show daily active users for the last 90 days with a 7-day average."
   - "Which accounts haven't ordered in 60 days?"
7. **Where it can go next:** Amplitude, Grafana, Hex, Mixpanel, Omni, Perplexity, PostHog and Sigma. Databricks Genie, Looker, monday.com and Tableau are listed as coming soon. Power BI isn't listed.
