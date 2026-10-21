# Microsoft Fabric Field Guide

Oct 20, 2026 · @Taco Trader

Fabric is Microsoft's SaaS analytics platform: one F-SKU capacity pays for every workload, one lake (OneLake) stores everything as open Delta tables, and Power BI's Direct Lake mode is the hook. Lead with it in Microsoft 365 and Power BI estates; pair it with Databricks through the zero-copy mirrored Unity Catalog, knowing that Unity Catalog permissions do not carry over.

## At a glance

*(Diagram in the Claude Doc: sources → OneLake → engines → consumers.)*

Read it top to bottom: data comes in by mirroring, Data Factory, shortcuts or eventstreams, lands once in OneLake, is processed by whichever engine fits the team, and is consumed in Power BI, agents, Microsoft 365 and alerts. One capacity pays for all of it.

## Five ideas that explain Fabric

Everything else in Fabric follows from these five ideas. Learn them first and the product map makes sense.

| Idea | What it means | Why a buyer cares |
| --- | --- | --- |
| **1. One capacity pays for everything** | You rent an F-SKU (F2 to F8192) of Capacity Units (CUs). Spark, SQL, pipelines, real-time, Power BI, Copilot and agents all draw from that one pool, and usage is smoothed over time (24 h for background jobs) | One bill, sized to average not peak; no clusters to manage. Risk: workloads compete for the same CUs |
| **2. One lake per tenant (OneLake)** | Every tenant gets one OneLake, built on ADLS Gen2. Every engine writes open Delta Parquet (Iceberg readable too). Hierarchy: tenant → workspace → item | No copies per engine; a warehouse table is readable from a Spark notebook with no connector |
| **3. Shortcuts and mirroring bring data in without ETL** | Shortcuts point at data where it lives (ADLS, S3, GCS, Dataverse, SharePoint, other workspaces). Mirroring replicates operational databases (Azure SQL, SQL Server, Snowflake, Cosmos DB, BigQuery, Oracle, SAP and more) into Delta, or mirrors only metadata (Azure Databricks Unity Catalog) | Replication compute is free and mirroring includes 1 TB of storage per CU (an F64 gets 64 TB) |
| **4. Direct Lake is the Power BI hook** | Power BI's VertiPaq engine pages Delta columns straight from OneLake. A "refresh" only re-points metadata, in seconds | Import-like speed with no import refresh windows. Needs an F (or P) capacity |
| **5. Two security planes** | Control plane: four workspace roles (Admin, Member, Contributor, Viewer) and item permissions. Data plane: OneLake security roles with row and column security, defined once and enforced in Spark, SQL and Power BI | Closest thing to Unity Catalog fine-grained access, but Admin/Member/Contributor bypass it and it is grant-only |

The vocabulary you will hear: **tenant** (the organization's Fabric instance), **capacity** (the CU pool), **workspace** (a container of items tied to one capacity and region), **item** (lakehouse, warehouse, notebook, pipeline, eventhouse, report), **domain** (a group of workspaces for a business area, used for data-mesh style governance).

## The workloads

Fabric has nine workloads on the same capacity and lake. Pick the store by team skill and data shape: Spark teams use a Lakehouse, T-SQL teams a Warehouse, apps a SQL database, events an Eventhouse.

| Workload | What it is | Pick it when | Databricks counterpart | Status and gotchas |
| --- | --- | --- | --- | --- |
| **Data Factory** | Pipelines (about 90% of ADF activities), Dataflow Gen2 (Power Query, 150+ sources), Copy job (incremental and CDC), dbt job, Airflow job, 200+ connectors, on-prem and VNet gateways | Ingestion and orchestration, ADF or Synapse pipelines moving over | Lakeflow Connect, Jobs/Workflows | dbt job and Copy job CDC/SCD2 GA Sep 2026. No SSIS (keep it in ADF), no managed VNet, Airflow has no private networking |
| **Mirroring** | Near-real-time replication of a database into OneLake Delta (changes as often as every 15 s), or metadata-only mirroring of a catalog | Analytics on operational data with no ETL | Lakeflow Connect, Lakehouse Federation | Free replication compute; 1 TB storage per CU. Snowflake mirroring polls 24×7 and burns Snowflake credits |
| **Data Engineering** | Lakehouse (Tables + Files), Spark Runtime 1.3/2.0 (Spark 4.1), Native Execution Engine (Velox + Gluten, "up to 6×"), notebooks, Spark job definitions, materialized lake views, user data functions, API for GraphQL | Code-first ETL, medallion architecture, data science prep | Databricks Spark + Photon, Lakeflow Declarative Pipelines | No GPU pools; max node 64 vCores / 512 GB; native engine doesn't accelerate Structured Streaming |
| **Data Warehouse** | Serverless T-SQL warehouse storing Delta in OneLake, multi-table ACID transactions, zero-copy clone, time travel up to 120 days, result-set caching, migration assistant (Synapse, SQL Server, Teradata) | SQL-first BI teams, Synapse dedicated pool or SQL Server estates | Databricks SQL warehouses | No enforced constraints, no triggers; cold-start sensitive; same-region only |
| **Databases** | SQL database in Fabric (Azure SQL engine, auto-mirrored to OneLake, pauses after 15 min idle), Cosmos DB in Fabric, Database hub | App backends, translytical apps, vector search | Lakebase (Postgres) | Entra-only auth; feature gaps vs Azure SQL |
| **Real-Time Intelligence** | Real-Time hub, Eventstreams (CDC, Kafka endpoint), Eventhouse/KQL, real-time dashboards, Activator alerts, operations agent | Sub-second analytics and alerting on events, logs and IoT | Structured Streaming, DLT | At-least-once delivery, 1 MB message cap; Eventhouse is billed as interactive (uptime) |
| **Data Science** | MLflow experiments and models, FLAML AutoML, model endpoints (preview), SynapseML, semantic link, AI Functions (LLM transforms in Python, Spark, T-SQL, Dataflows) | Analyst-level ML and LLM enrichment close to BI | Mosaic AI, Model Serving, Feature Store | Model endpoints: preview, 3 nodes max, no GPU. Databricks is far deeper for ML |
| **Fabric IQ** | Data agents (NL to SQL/DAX/KQL over up to 5 sources), ontology, Planning, Graph (GQL), MCP servers, Microsoft 365 Copilot integration | Agents grounded on governed data and Power BI semantics | Genie, Agent Bricks, metric views | Data agents are read-only, English, 25-row answers; ontology is preview |
| **Power BI** | Reports, semantic models, Direct Lake, Copilot | Every BI consumer | AI/BI Dashboards | Viewers need Pro below F64 |

Also in preview: **Fabric Apps** (TypeScript apps built with the Rayfin SDK, with GraphQL, SQL database and Entra SSO, no hosting charge). Creators call it a "SaaS killer" because a coding agent can build an internal app on governed data in minutes; it has no private link, outbound protection or ALM yet.

## Buying and sizing

Every deal needs a capacity plus per-user licenses, and F64 is the line that matters most: below it, every Power BI viewer needs a Pro license. F SKUs are bought in Azure (or through a CSP), billed per second with a 1-minute minimum, with an optional 1-year reservation. P SKUs are retiring.

| SKU | CUs | Spark vCores | Power BI equivalent | Notes |
| --- | --- | --- | --- | --- |
| F2–F32 | 2–32 | 4–64 | A1–A3 (F8+) | Viewers need Pro or PPU; Copilot from F2 |
| **F64** | 64 | 128 | P1 | Free-licensed viewers can view Power BI content; Direct Lake 1.5B rows per table, 25 GB memory |
| F128–F512 | 128–512 | 256–1,024 | P2–P4 | Resizing across F256 ↔ F512 can cancel in-flight jobs |
| F1024–F8192 | 1,024–8,192 | 2,048–16,384 | P5 (F1024) | F512+ not in all regions |
| Trial | 4 or 64 | – | – | 60 days, 1 TB; no Copilot, data agents, private link |

**How each workload burns capacity** (the docs' price example is $0.18 per CU-hour, pay-as-you-go, US West 2):

| Workload | Rate | Smoothing |
| --- | --- | --- |
| Spark | 1 CU = 2 vCores, billed for active session time only | 24 h (background) |
| Spark autoscale billing | Serverless, off the capacity, own meter and max-CU cap | None |
| Warehouse / SQL endpoint | Per-query CU-seconds (vNode = 4 vCores) | 24 h |
| Pipelines | 1.5 CU-h per copy throughput unit-hour; 0.0056 CU-h per activity run | 24 h |
| Copy job | 1.5 CU-h full, 3 CU-h incremental (1 TB example: $12.67 full vs $25.38 incremental) | 24 h |
| Dataflow Gen2 | 12 CU/s for the first 10 min of a query, then 1.5 CU/s | 24 h |
| Eventhouse | Uptime: active seconds × vCores | 5–64 min (interactive) |
| Data agent | 100 / 10 / 400 CU-s per 1K input / cached / output tokens (\~400 CU-s per question, \~13,800 a day on an F64) | 24 h |
| Mirroring | Replication free; 1 TB storage free per CU | – |
| OneLake | Storage per GB-month (no CU); reads 104 and writes 1,626 CU-s per 10K hot-tier transactions | – |

**Throttling is progressive, and in-flight jobs always finish:**

1. Up to 10 minutes of future capacity used: no throttling.
2. 10–60 minutes: new interactive operations are delayed 20 seconds.
3. 60 minutes to 24 hours: new interactive operations are rejected; background jobs still run.
4. Over 24 hours: everything new is rejected until the overage burns down.

Ways out: scale up, pause and resume (bills the accumulated usage), capacity overage billing (3× the normal rate, on by default since Sep 2026), surge protection, or moving Spark to autoscale billing.

**Hidden costs to raise before the customer finds them:** Pro licenses for viewers below F64; OneLake transactions, with Spark-driven operations counted from Oct 15 2026; BCDR writes at about 1.9× hot rates; cool/cold retrieval fees; soft-deleted data billed for 7 days; VNet gateway uptime (4 CU, about $526 a month if always on); always-on Eventhouse eating a small SKU; storage billed while the capacity is paused.

## Fabric and Databricks together

The default "both" story is Databricks for engineering and ML, Fabric for BI and agents, joined by the mirrored Unity Catalog with no data copy. The catch: Unity Catalog permissions are not mirrored, and tables with row filters or column masks cannot be mirrored at all.

| Path | Direction | Copies data? | UC governance applies? | Status |
| --- | --- | --- | --- | --- |
| **Mirrored Azure Databricks catalog** | Fabric reads UC tables | No: metadata only, data read in place through shortcuts | **No.** One connection credential reads everything; access is rebuilt in OneLake security | GA source; OneLake security model is preview |
| Databricks Spark reads/writes OneLake (ABFS) | Databricks reads and writes Fabric data | Writes land in OneLake | No; Fabric roles apply (SPN needs Contributor on the workspace) | Documented |
| OneLake catalog federation in UC | Databricks queries Fabric tables | No | UC grants on the Databricks side | **Preview** |
| ADLS / Iceberg shortcuts | Fabric reads Delta or Iceberg in ADLS | No | No; storage access only | GA (Iceberg: < 5,000 commits, no private link) |
| Azure Databricks activity | Fabric pipelines run Databricks notebooks, jars, jobs (incl. serverless) | Whatever the job does | Cluster access mode decides | GA |
| Azure Databricks connector (Power BI, Dataflow, Copy) | Fabric queries a Databricks SQL warehouse | Yes for Import/Copy; DirectQuery is live | **Yes**: the query runs in Databricks as the user | GA (Copy accepts personal access tokens only) |

**What the mirrored catalog leaves out:** views, materialized views, streaming tables (so most Lakeflow/DLT output), Delta Sharing tables, federated tables, non-Delta external tables, and tables with row-level or column-mask policies. Changes show up in seconds to minutes, not instantly. Firewalled Databricks managed storage isn't supported, and each catalog can use only one storage account.

**Delta features Databricks writes that Fabric engines can't read:** `TIMESTAMP_NTZ` (SQL endpoint, Direct Lake), column mapping by id (SQL endpoint), identity columns, Lakeflow Declarative Pipelines, and Delta 4.x features (variant, collations) outside Spark. Test the real gold tables before promising Direct Lake SLAs.

**Whiteboard patterns:**

| Pattern | Draw it as | Use when | Watch for |
| --- | --- | --- | --- |
| A. Databricks engineers, Fabric consumes | UC gold Delta → mirrored catalog → SQL endpoint + Direct Lake → Power BI, Copilot, data agents | Existing UC estate with a Power BI front end (the default) | Governance duplicated in Fabric; gold must be plain Delta tables |
| B. Fabric-first, Databricks for ML | Sources → Fabric mirroring/pipelines → OneLake → Databricks reads via ABFS or federation → scores back to OneLake | Microsoft shop that needs serious ML | Serverless Databricks only gets single-node delta-rs I/O to OneLake; one writer per table path |
| C. Fabric orchestrates Databricks | Fabric pipeline → Databricks activity → Delta → mirrored catalog → Power BI | ADF users moving to Fabric | 2 MB return-value limit |
| D. Governed BI over Databricks SQL | Power BI → Databricks connector → SQL warehouse (UC masks enforced) | UC row filters and masks must hold per user | Uses DBSQL compute; no Direct Lake |
| E. Move DBSQL serving to Fabric | Mirror → repoint Power BI to Direct Lake → rebuild transforms in Fabric → retire DBSQL | Customer consolidating on Fabric | It's a rewrite: no translation of Databricks SQL, DLT or UC policies |

**Which to lead with:**

| Customer profile | Lead with | Bring in the other when |
| --- | --- | --- |
| Microsoft 365 / Power BI shop, modest engineering | Fabric | They already run Databricks: add the mirrored catalog |
| Existing Azure Databricks + UC, Power BI front end | Both (pattern A) | Default |
| Multi-cloud (AWS/GCP) | Databricks | Fabric as the Microsoft BI layer via S3/GCS shortcuts |
| Heavy ML, GenAI engineering, streaming | Databricks | Fabric for business self-service on gold |
| Regulated, UC policies are the system of record | Databricks | Pattern D, or rebuild RLS in OneLake security and accept two places to administer it |
| SMB, little Spark skill | Fabric | Rarely |
| Snowflake shop | Fabric as the BI/AI add-on | Budget Snowflake credits; 1,000-table cap |

## Use cases

Fabric's strongest use cases all end in Power BI, Microsoft 365 or an alert. Its weakest are heavy ML, GPU and complex stateful streaming, where Databricks should own the work.

| Use case | Fabric components | Why Fabric | Databricks' role |
| --- | --- | --- | --- |
| Kill Power BI import refreshes | Lakehouse or mirrored catalog → Direct Lake semantic model | Import-class speed, seconds-long "refresh", no copy | Owns the gold Delta tables (pattern A) |
| Analytics on operational databases without ETL | Mirroring (Azure SQL, SQL Server, Cosmos DB, Snowflake, BigQuery, Oracle, SAP) → SQL endpoint / Direct Lake | Free replication compute, 1 TB per CU included | Reads the mirrored Delta for ML |
| Migrate ADF or Synapse | Mount the ADF factory in Fabric, built-in assessment, Warehouse migration assistant | Microsoft says new features land only in Fabric (no backports) | Keeps Spark/ML jobs; Fabric orchestrates them via the Databricks activity |
| Medallion lakehouse for a Microsoft shop | Bronze/silver lakehouses, gold lakehouse or warehouse, materialized lake views (GA Sep 2026) | One capacity, workspaces per layer, domains for data mesh | Optional engineering plane |
| Fraud detection | Eventstream → Eventhouse (KQL) → ML scoring → Activator alerts → real-time dashboard | Sub-second queries over billions of events, built-in alerting | Trains the fraud model; scores land back for Activator |
| Connected factory / IIoT | OPC UA / MQTT → Eventstream → Eventhouse → digital twin builder → operations agent | Microsoft reference design: 1M+ events/hour, 30K tags, 40 factories | Predictive-maintenance models |
| ESG / carbon reporting | Event ingestion → Eventhouse (20-year retention) → dashboards | Microsoft reference design: 8M+ events/day | – |
| Natural-language Q&A on governed data | Data agent over semantic models, warehouse, KQL; published to Teams, Copilot Studio, M365 Copilot, MCP | Reuses years of Power BI DAX models as AI grounding | Genie competes; Fabric wins where Power BI models already exist |
| LLM enrichment at scale | AI Functions in Spark, T-SQL, Dataflow Gen2 (classify, extract, summarize, translate) | Analysts can call LLMs from SQL or Power Query | `ai_query` competes for engineering teams |
| FP&A and planning | Fabric IQ Planning (PowerTable, intelligence sheets) on semantic models | Replaces departmental planning tools on the same data | None native |
| Internal data apps | Fabric Apps (preview) + SQL database | No hosting or per-user charge; built by coding agents | Databricks Apps competes (GA, Python) |
| App backend + analytics (translytical) | SQL database in Fabric, auto-mirrored to OneLake, Power BI write-back | OLTP and analytics in one place | Lakebase competes |

## A systematic sales motion

Run every Fabric opportunity through the same six steps. The output of each step decides the next one, and step 1 often decides whether Fabric, Databricks or both lead.

1. **Qualify: where does the estate's gravity sit?**
   - How much of BI is Power BI today, and do viewers already have Pro through Microsoft 365 E5?
   - Is Azure Databricks with Unity Catalog already the engineering platform? Is any data in AWS or GCP?
   - What share of compute is Spark ETL vs SQL/BI serving vs ML/GPU?
   - Output: a lead decision using the profile table above.
2. **Discover: the five pains Fabric fixes.**
   - Slow or costly Power BI import refreshes, model size limits (Direct Lake).
   - ETL just to copy operational databases (mirroring).
   - Duplicate lakes and copies across business units (OneLake, shortcuts, domains).
   - Permissions that drift between engines (OneLake security, Purview).
   - Too many tools and bills for a small team (one capacity).
   - Also ask: freshness SLA (seconds, minutes, hourly), event volumes and the 1 MB message limit, private-link and customer-managed-key mandates, data residency.
3. **Design: draw the architecture with them.**
   - Pick the store per team: Lakehouse (Spark), Warehouse (T-SQL), SQL database (apps), Eventhouse (events).
   - Pick ingestion: mirroring first, then Copy job, pipelines, Dataflow Gen2, Eventstream.
   - If Databricks is present, choose pattern A–E and name which engine owns writes for each layer.
   - Decide where access policy lives (Unity Catalog, OneLake security, Purview) and who maintains the copy.
4. **Prove: a POC scoped to GA features.**
   - Start on a trial (60 days, F64-size) or pay-as-you-go, not a reservation. Note that trials have no Copilot, data agents or private link.
   - Test real gold tables against Direct Lake guardrails and Delta feature support before promising SLAs.
   - Success criteria: refresh time, query latency, freshness, CU used per job in the Capacity Metrics app.
5. **Size: from the Metrics app, not guesses.**
   - Size to the 24-hour average, since background work is smoothed; keep interactive BI and Eventhouse headroom.
   - Do the F64 break-even: Pro count × Pro price vs stepping up to F64.
   - Separate capacities or surge protection for noisy neighbours; Spark autoscale billing for spiky Spark; a Copilot capacity to isolate AI spend.
   - Check Azure CU quota in the region (an F64 needs 64 available CUs).
6. **Close: reservation and rollout.**
   - Reserve the steady base for a year; keep dev/test on pay-as-you-go with pause schedules.
   - Plan workspaces per medallion layer, domains per business area, Git integration and deployment pipelines from day one.
   - Hand over the hidden-cost list so the first invoice holds no surprises.

## Objections and watch-outs

Most objections have a documented answer, but several answers carry caveats you should say out loud rather than let the customer discover.

| Objection | Answer from the docs | Caveat to say out loud |
| --- | --- | --- |
| "Throttling will break my users" | Progressive stages; in-flight jobs finish; surge protection; overage billing; autoscale billing for Spark | Overage costs 3×; Eventhouse and BI are interactive, so they feel throttling first |
| "Noisy neighbours on a shared capacity" | Capacity and workspace surge protection (workspace level is preview), separate capacities, Copilot capacity | Workspace caps are checked every 5 min, so they're soft limits |
| "Pro for 5,000 viewers is too expensive" | At F64+, Free-licensed viewers can view; E5 includes Pro; app-owns-data embedding needs no end-user license | License updates after scaling to F64 can take up to a day |
| "Is it lock-in?" | Open Delta/Parquet, ADLS-compatible APIs, Iceberg virtualization, native engine built on open-source Velox/Gluten | Iceberg virtualization: < 5,000 commits, 2-min lag, no private link |
| "Fine-grained access is weaker than Unity Catalog" | OneLake security roles with row and column security across Spark, SQL, Power BI | Admin/Member/Contributor bypass it; grant-only; SQL-endpoint RLS triggers Direct Lake fallback |
| "SaaS means we lose network control" | Tenant and workspace private links, managed private endpoints, outbound access protection (default-deny) | Private link turns off Copilot, starter pools and some Power BI exports |
| "We need our own keys" | Workspace customer-managed keys plus capacity BYOK | Not every item supports CMK; check per workload |
| "Is DR built in?" | Availability-zone resiliency is automatic; OneLake geo-replication is an opt-in toggle | Notebooks, pipelines and KQL need Git or active/active rebuilds; recovery is manual |
| "Copilot will blow up the bill" | Data agent \~400 CU-s per question; a separate Copilot capacity isolates AI spend | Outside the US/EU, Copilot needs cross-geo processing turned on |
| "It's just ADX and Event Hubs rebranded" | Adds the Real-Time hub, no-code CDC, Activator, one-copy OneLake, one bill, Copilot | Partly true: Eventstream runs on an Event Hubs namespace |

**Still in preview (keep POCs off these):** OneLake catalog federation into Unity Catalog, the OneLake security data access model, Fabric IQ ontology, Fabric Apps, model endpoints, workspace surge protection, the Eventstream SQL operator, digital twin builder, operations agent, warehouse custom SQL pools and GPU acceleration.

**Where Microsoft's own docs disagree (verify before quoting):**

- Mirrored Databricks catalog freshness: "instantly" (mirroring overview) vs "a few seconds to several minutes" (feature page). Quote the feature page.
- The mirrored catalog is called a "continuously replicated copy" (tutorial) but is metadata-only (feature page). Don't sell it as a DR copy.
- V-Order is "on by default" on one page and "off for workspaces created after April 2025" on another.
- Runtime 2.0 ships Delta 4.2 on one page and 4.1 on others.
- SSIS has a pricing meter but is listed as not available in Fabric Data Factory.
- Data agent answers: 25 rows on the concept page vs 1,000 rows in preview.

## Sources

Built from 211 Microsoft Learn pages scraped on Oct 20 2026. The ones most worth bookmarking:

- [What is Microsoft Fabric](https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview) · [Terminology](https://learn.microsoft.com/en-us/fabric/fundamentals/fabric-terminology) · [What's new](https://learn.microsoft.com/en-us/fabric/fundamentals/whats-new)
- [OneLake overview](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview) · [Shortcuts](https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts) · [OneLake security](https://learn.microsoft.com/en-us/fabric/onelake/security/data-access-control-model) · [OneLake consumption](https://learn.microsoft.com/en-us/fabric/onelake/onelake-consumption)
- [Direct Lake overview](https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview) · [Choose a data store](https://learn.microsoft.com/en-us/fabric/fundamentals/decision-guide-data-store) · [Lakehouse vs Warehouse](https://learn.microsoft.com/en-us/fabric/fundamentals/decision-guide-lakehouse-warehouse) · [Delta Lake interoperability](https://learn.microsoft.com/en-us/fabric/fundamentals/delta-lake-interoperability)
- [Licenses and capacity](https://learn.microsoft.com/en-us/fabric/enterprise/licenses) · [Throttling and smoothing](https://learn.microsoft.com/en-us/fabric/enterprise/throttling) · [Surge protection](https://learn.microsoft.com/en-us/fabric/enterprise/surge-protection) · [Capacity planning](https://learn.microsoft.com/en-us/fabric/enterprise/capacity-planning-overview)
- [Mirroring overview](https://learn.microsoft.com/en-us/fabric/mirroring/overview) · [Mirroring Azure Databricks](https://learn.microsoft.com/en-us/fabric/mirroring/azure-databricks) · [its limitations](https://learn.microsoft.com/en-us/fabric/mirroring/azure-databricks-limitations) · [its security](https://learn.microsoft.com/en-us/fabric/mirroring/azure-databricks-security) · [Databricks with OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-azure-databricks)
- [Data Factory overview](https://learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview) · [ADF vs Fabric Data Factory](https://learn.microsoft.com/en-us/fabric/data-factory/compare-fabric-data-factory-and-azure-data-factory) · [Pipeline pricing](https://learn.microsoft.com/en-us/fabric/data-factory/pricing-pipelines)
- [Lakehouse overview](https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview) · [Spark runtime](https://learn.microsoft.com/en-us/fabric/data-engineering/runtime) · [Fabric Data Warehouse](https://learn.microsoft.com/en-us/fabric/data-warehouse/data-warehousing) · [SQL database](https://learn.microsoft.com/en-us/fabric/database/sql/overview)
- [Real-Time Intelligence](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/overview) · [Fraud detection architecture](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/architectures/fraud-detection) · [Connected factory](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/architectures/connected-factory)
- [Data agents](https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent) · [Fabric IQ](https://learn.microsoft.com/en-us/fabric/iq/overview) · [Fabric Apps](https://learn.microsoft.com/en-us/fabric/apps/overview) · [Copilot in Fabric](https://learn.microsoft.com/en-us/fabric/fundamentals/copilot-fabric-overview)
- [Permission model](https://learn.microsoft.com/en-us/fabric/security/permission-model) · [Private links](https://learn.microsoft.com/en-us/fabric/security/security-private-links-overview) · [CI/CD overview](https://learn.microsoft.com/en-us/fabric/cicd/cicd-overview)

Databricks-side claims in this guide (Photon, Genie, Model Serving, Lakebase, Databricks Apps) come from general knowledge, not these pages. Check current Databricks docs before putting them on a slide.
