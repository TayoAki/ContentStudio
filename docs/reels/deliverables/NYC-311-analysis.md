# NYC 311: the data set and the questions (NYC)

- **Data:** [311 Service Requests from 2010 to Present](https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9), NYC Open Data (dataset id `erm2-nwe9`).
- **Window:** `created_date` from 2025-10-01 up to, but not including, 2026-10-01.

## The questions
1. How many complaints were there in total?
2. What are the top 10 complaint types?
3. For Noise - Residential: how many per hour of the day?
4. For Noise - Residential: how many per day of the week?
5. For Noise - Residential: what's the split by descriptor (loud music/party, banging…)?
6. For HEAT/HOT WATER: how many per month?
7. Which complaint types have the fewest complaints?

## The same questions as API queries (SoQL)
Base URL: `https://data.cityofnewyork.us/resource/erm2-nwe9.json`. Add `$where=created_date >= '2025-10-01T00:00:00' AND created_date < '2026-10-01T00:00:00'` to each.

| # | Query |
| --- | --- |
| 1 | `$select=count(*)` |
| 2 | `$select=complaint_type, count(*) as n&$group=complaint_type&$order=n DESC&$limit=10` |
| 3 | `$select=date_extract_hh(created_date) as h, count(*) as n&$group=h` (+ `AND complaint_type='Noise - Residential'`) |
| 4 | `$select=date_extract_dow(created_date) as d, count(*) as n&$group=d` (0 = Sunday) |
| 5 | `$select=descriptor, count(*) as n&$group=descriptor` |
| 6 | `$select=date_extract_m(created_date) as m, count(*) as n&$group=m` (+ `AND complaint_type='HEAT/HOT WATER'`) |
| 7 | Query 2 with `$order=n ASC` |

## In Microsoft Fabric
1. Land the data in a lakehouse: a pipeline Copy activity or a notebook reading the API or the CSV export.
2. Create a data agent on the lakehouse table.
3. Ask the 7 questions in plain English.
4. Check the agent's answers against the API counts above.

Data agents need a paid Fabric capacity; they aren't on the trial.
