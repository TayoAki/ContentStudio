# Week of Fri 23 Oct 2026

Seven posts for a data page that teaches and sells Databricks and Microsoft Fabric. The page has three jobs:
- reach people breaking into data (TOFU);
- teach the lakehouse (MOFU);
- sell its help with Fabric cost and setup (BOFU).

**The evidence**
- 7 teardowns of outliers in this niche, plus 78 tagged posts.
- The odds use this niche's base rates from 542 TikTok posts scanned across 31 data and tech-career accounts (last 180 days, pulled Oct 22 2026). Of those posts:
  - 19.6% beat the creator's follower count;
  - 12.9% reach 2×;
  - 7.2% reach 5×;
  - 4.4% reach 10×.

| Day | Post | Funnel | Format | Chance of a 5× outlier |
|---|---|---|---|---|
| Fri 23 Oct 2026 | 5 skills for your first Fabric job (Spark not essential) | TOFU | Text over video | 7.7% (average) |
| Sat 24 Oct 2026 | Free data training so you don't have to look: Databricks Free Edition | MOFU | Voiceover b-roll | 9.6% (good) |
| Sun 25 Oct 2026 | "Experience with Databricks" on a job post means 5 things | TOFU | Talking head (two seats) | 9.2% (good) |
| Mon 26 Oct 2026 | Databricks or Microsoft Fabric: which should you learn? | TOFU | Whiteboard | 7.7% (average) |
| Tue 27 Oct 2026 | Lakehouse from zero, ep 1: a CSV to a Fabric table | MOFU | Screen recording | 8.6% (good) |
| Wed 28 Oct 2026 | How long it took me to learn Fabric: my timeline | MOFU | Talking head | 10.6% (good) |
| Thu 29 Oct 2026 | We paused our Fabric capacity and the bill didn't drop | BOFU | Green screen | 5.1% (weak) |

**How to read the odds**
- The model is `odds.py` in the niche-scripts skill. It compares the tags of 39 outliers with a random sample of 39 ordinary posts. Each lift is shrunk toward 1 when only one or two accounts back it.
- With 39 outliers, the odds **rank** the ideas; they don't predict views.
- **Thursday rates weak by design.** BOFU posts sell; they rarely spread. It is still the week's sales post.
- "Followers" is each account's count on Oct 22 2026, not on the day it posted. An account that grew since then makes its older posts look smaller.

**Who appears on camera**
- Use you, or the AI presenter from `AI-PRESENTER.md` (label it as AI on the platform).
- Posts 3, 6 and 7 answer a question on screen. Use a **real** comment when one arrives ("Replying to @…"). Until then, use a plain question card, never an invented comment.
- Post 6 is a personal timeline. Film it only with your real months; an AI presenter must not tell a made-up life story.

---

## 5 skills for your first Fabric job (Spark not essential)

Fri 23 Oct 2026 · TOFU · Educational · Text over video · about 8 s

### The idea

- **Topic:** The five skills worth learning for a first Microsoft Fabric role, in order: SQL, Power BI, lakehouse and Delta tables, pipelines, and PySpark marked "not essential to start". The myth it breaks: that you need Spark or Python before you can get hired on Fabric.
- **Angle:** Myth bust · **Hook pattern:** Numbered promise ("5 skills worth learning to…") · **Style:** easy, educational
- **Series:** "5 skills worth learning to land your first [Fabric / Databricks / analytics engineer] role" (repeat per role)
- **Odds:** 7.7% chance of a 5× outlier (this niche's base rate is 7.2%), rated average, low confidence. 20.8% to beat your follower count, 13.7% to reach 2×, 4.7% to reach 10×.
  - 1.06× the niche base rate: evidence ×1.06 · funnel stage ×1.00 · its sources median 216.5×
  - Format "text over video": used by 2 of 39 outliers
  - Angle "myth bust": used by 1 of 39 outliers
  - Video type "list": used by 8 of 39 outliers
  - Complexity "easy": used by 29 of 39 outliers
  - Delivery "educational": used by 25 of 39 outliers
- **Why it should work:** @kairadc's 216× post is the biggest outlier in the scan. It is one 8-second selfie shot where the text does all the work:
  - a title, then a numbered list of 5 skills;
  - the last item breaks the myth: "Python (not essential)".
  - It is short enough to rewatch, and the list makes people comment their own.

  We keep that shape: a title, five numbered items, the myth-breaker last. The skills are ours, they're for Fabric, and each one maps to a Microsoft Learn path. The model rates it only average because few outliers use this format. The source is the strongest single post in the niche, which is why it opens the week.
- **Borrows its structure from:**
  - @kairadc, 216.5× their followers: https://www.tiktok.com/@kairadc/video/7671004519790054678
- **Risk:**
  - A list post lives on the comment war it starts ("you forgot Python!"). A flat list gets scrolled past. Fix: keep "(not essential)" on PySpark, and reply to the first disagreeing comments with video replies (Sunday's format).
  - The model's confidence is low: only 2 outliers use this format.

### Script

#### Hook (first 3 seconds)

- **Say:** nothing; a trending sound plays under it
- **On screen:** 5 skills worth learning to land your first Microsoft Fabric role
- **Show:** You at a desk, chin on hand, looking at the lens as if mid-thought. The title sits in the upper third.

#### Beats

1. **HOOK**
   - Say: (sound only)
   - Film: Selfie framing, phone at eye level, soft window light. Rest your chin on your hand, then look up at the camera.
   - Edit: Title on from frame 1, white text with a soft shadow, centred in the upper third.
2. **LIST**
   - Say: (sound only)
   - Film: Same shot. Raise a pen and tap the air as if counting.
   - Edit: At about 2.5 s the list appears under the title, all at once, as in the source: 1. SQL · 2. Power BI · 3. Lakehouse + Delta tables · 4. Pipelines (Data Factory) · 5. PySpark (not essential to start). Hold to the end, at about 8 s, so the list can be read twice on the loop.

#### Close and post

- **Call to action:** none on screen; the caption asks the question (a comment ask).
- **Caption:** What would you swap? I'd still learn SQL first. 👇 #microsoftfabric #dataanalyst #powerbi #sql #datajobs
- **Hashtags:** #microsoftfabric #dataanalyst #powerbi #sql #datajobs

**Keep exact:**
- "Not essential to start" is advice, not a fact. Don't change it to "you'll never need Python".
- "Pipelines (Data Factory)": Data Factory is Fabric's data-integration workload (pipelines and Dataflow Gen2), per the Fabric overview page.

### Shot list (SEALCaM)

#### Shot 1 · HOOK + LIST · about 8 s

- **Say:** (trending sound, no voice)
- **On screen:** 5 skills worth learning to land your first Microsoft Fabric role → the five numbered items
- **S (Subject):**
  - Primary: you, framed from the chest up, chin resting on one hand.
  - Secondary: a pen in the other hand, raised as if counting.
- **E (Environment):** A plain light wall or a soft bedroom corner behind you, slightly out of focus. Nothing on the wall that competes with the text.
- **A (Action):**
  - 0.0–2.5 s: you hold still with a tired, knowing look.
  - About 2.5 s: you lift the pen and tap the air. The list appears at once and stays.
  - The camera doesn't move.
- **L (Lighting):** Soft window light from one side, warm and slightly overexposed, low contrast. It reads as natural daylight.
- **Ca (Camera):** Front phone camera, wide lens, held at eye level or propped on a stack of books. A selfie distance of about 50 cm. Locked-off.
- **M (Metatokens):**
  - Raw phone look, no grade.
  - Text: small white sans-serif with a soft shadow, centred. The title is 2–3 lines and the list is left-aligned and numbered.
  - No captions of speech.
- **Borrowed from:** @kairadc scene 1

### Teleprompter

Just the words, in order.

(No voice. On screen:) 5 skills worth learning to land your first Microsoft Fabric role.

1. SQL. 2. Power BI. 3. Lakehouse and Delta tables. 4. Pipelines, Data Factory. 5. PySpark, not essential to start.

---

## Free data training so you don't have to look: Databricks Free Edition

Sat 24 Oct 2026 · MOFU · Educational · Voiceover b-roll · about 45 s

### The idea

- **Topic:** One free resource per video. This week: Databricks Free Edition.
  - What it is: a no-cost Databricks workspace for learning, with serverless compute.
  - What you can do in it: notebooks, the SQL editor, Lakeflow pipelines, Genie dashboards.
  - Its limits: serverless-only and quota-limited.
  - Three things to do in your first hour.
- **Angle:** Resource list · **Hook pattern:** Shared problem ("It's hard to get experience when every job wants experience") · **Style:** easy, educational
- **Series:** "Free data training so you don't have to look" (one resource a week: Free Edition, Microsoft Learn's DP-700 path, the Fabric trial, Databricks Academy)
- **Odds:** 9.6% chance of a 5× outlier (this niche's base rate is 7.2%), rated good, high confidence. 26.0% to beat your follower count, 17.2% to reach 2×, 5.9% to reach 10×.
  - 1.33× the niche base rate: evidence ×1.16 · funnel stage ×1.15 · its sources median 24.0×
  - Format "voiceover broll": used by 5 of 39 outliers
  - Angle "resource list": used by 7 of 39 outliers
  - Video type "list": used by 8 of 39 outliers
  - Complexity "easy": used by 29 of 39 outliers
  - Delivery "educational": used by 25 of 39 outliers
- **Why it should work:** @fxvouri runs this exact series ("Finding tech opportunities so you don't have to"). Five posts in the scan clear 5×, from 6.2× to 24×. The template:
  - a shared-pain opener;
  - one named opportunity with its page on screen;
  - who can apply and what to do before the deadline;
  - "save this and send it to someone".

  The voice carries all the information; the picture is fast lifestyle b-roll that changes every 1–2 s, so the eye never rests. We keep the template and the pace. The resource is ours (a data platform's free tier, not an internship), the facts come from Databricks' own page, and the "what to do this week" steps point to the lakehouse skills we sell.
- **Borrows its structure from:**
  - @fxvouri, 24.0× their followers: https://www.tiktok.com/@fxvouri/video/7664927530952068374
- **Risk:**
  - The format depends on lots of b-roll. With only a few clips, it reads as slow. Fix: shoot 25–30 one-to-two-second clips during a normal day (commute, coffee, laptop, lifts, street) before writing the edit.
  - All five @fxvouri outliers come from one account, so the format lift is shrunk toward 1.
  - Free tiers change. Re-check the page the day you post.

### Before you film

- Open https://docs.databricks.com/aws/en/getting-started/free-edition and its "Free Edition limitations" page the day you record. If anything below has changed, change the line.
- [[YOUR B-ROLL: 25–30 clips of 1–2 s each from your day: walking, a lift, coffee, the laptop open on the Databricks workspace]]

### Script

#### Hook (first 3 seconds)

- **Say:** "It's hard to get data experience when every data job wants experience first."
- **On screen:** Free data training so you don't have to look
- **Show:** You walk toward the camera on a street or in a lobby, then cut to a phone-in-hand shot of you looking at the lens.

#### Beats

1. **HOOK**
   - Say: It's hard to get data experience when every data job wants experience first.
   - Film: Two clips: you looking into the lens with your hair blowing (1.3 s), then walking past glass buildings (1.5 s).
   - Edit: Title in two lines, white serif with a soft shadow, upper third. Caption words pop one at a time at the bottom.
2. **PROMISE**
   - Say: So every week I find one free way to get real hands-on time, and this week it's Databricks Free Edition.
   - Film: An escalator, a lift door, then you at a desk opening the laptop.
   - Edit: Cut every 1–1.5 s. On "Databricks Free Edition", the big title **FREE EDITION** lands centre-frame over the laptop shot.
3. **WHAT IT IS**
   - Say: It's a no-cost Databricks workspace for students and anyone learning, with serverless compute, so there's no cluster to set up.
   - Film: Walking shots; the laptop showing the Free Edition sign-up page.
   - Edit: Pop a card of the docs page with the line "a no-cost version of Databricks" highlighted.
4. **WHAT YOU CAN DO**
   - Say: You get notebooks, the SQL editor, Lakeflow pipelines and Genie dashboards, the same tools the job posts list.
   - Film: Four quick clips, one per tool named: a notebook cell running, the SQL editor, a pipeline graph, a dashboard.
   - Edit: Each tool name appears as a small caption tag on its clip.
5. **THE CATCH**
   - Say: The catch: it's serverless-only and quota-limited, so it's for learning, not for running a business.
   - Film: You in a lift or on stairs, a more serious look.
   - Edit: Text card "serverless-only, quota-limited" over the shot, as in the source's "This is NOT just targeted at…" card.
6. **WHAT TO DO**
   - Say: Here's what I'd do in your first hour. Sign up. Load one public dataset into a table. Then schedule one job and write down what broke.
   - Film: Three clips, one per step: the sign-up page, the upload screen, the jobs page.
   - Edit: Numbered text "1 · 2 · 3" builds on screen with each step. A **DO THIS TODAY** title on the first.
7. **CTA**
   - Say: Save this, send it to someone trying to get into data, and follow for next week's free one.
   - Film: Wide city or office shot at dusk, then a last shot of you turning away.
   - Edit: Caption pops only; no end card.

#### Close and post

- **Call to action:** "Save this, send it to someone trying to get into data, and follow for next week's free one." (save + share + follow)
- **Caption:** Free Databricks, no excuses 👩🏾‍💻 Databricks Free Edition: notebooks, SQL, pipelines, dashboards. Save this for your first hour. #databricks #dataengineering #dataanalyst #learndata #freeresources
- **Hashtags:** #databricks #dataengineering #dataanalyst #learndata #freeresources

**Keep exact** (Databricks docs, "Databricks Free Edition", read Oct 22 2026):
- "a no-cost version of Databricks designed for students, educators, hobbyists" and others learning.
- The workspace "includes serverless compute and default storage".
- The environment is "serverless-only, quota-limited". Don't quote quota numbers; the page doesn't give them.
- The page doesn't say "no credit card". Don't say it unless the sign-up flow shows it.
- The tools listed: notebooks, the SQL editor, Lakeflow pipelines, dashboards with Genie, Genie Code, Lakebase.

### Shot list (SEALCaM)

#### Shot 1 · HOOK · about 1.3 s

- **Say:** "It's hard to get data experience…"
- **On screen:** Free data training / so you don't have to look
- **S (Subject):** You, head and shoulders, looking straight into the lens, with hair or jacket moving.
- **E (Environment):** An office lobby or a street with glass behind, a little out of focus.
- **A (Action):** A small step toward the camera, a direct look, then the cut.
- **L (Lighting):** Overcast daylight or lobby light, soft and even, neutral to cool.
- **Ca (Camera):** Phone held at arm's length or by a friend, 26mm-equivalent wide, eye level, handheld with slight sway.
- **M (Metatokens):** Natural phone video, light contrast boost. Title in a white serif with a soft shadow; speech captions as single white words, lower third.
- **Borrowed from:** @fxvouri scene 1–2

#### Shot 2 · HOOK · about 1.5 s

- **Say:** "…when every data job wants experience first."
- **On screen:** title holds
- **S (Subject):** You, full body, walking away from or past the camera.
- **E (Environment):** Glass office buildings or a wide street.
- **A (Action):** A steady walk. The camera follows a step behind.
- **L (Lighting):** Bright overcast daylight with reflections in the glass.
- **Ca (Camera):** Phone at chest height, wide lens, walking follow shot.
- **M (Metatokens):** Same caption style, pace of one cut every 1–1.5 s.
- **Borrowed from:** @fxvouri scene 3

#### Shot 3 · PROMISE · about 4 s (3 clips)

- **Say:** "So every week I find one free way to get real hands-on time, and this week it's Databricks Free Edition."
- **On screen:** **FREE EDITION** (big, centre) on the last clip
- **S (Subject):**
  - Clips 1–2: architecture (an escalator, a lift).
  - Clip 3: you at a desk opening a laptop.
- **E (Environment):** Office or library interiors, then a desk with the laptop.
- **A (Action):** Escalator rising; lift doors; the laptop lid opening, the screen lighting up.
- **L (Lighting):** Interior daylight, then soft desk light.
- **Ca (Camera):**
  - Clip 1: low angle looking up the escalator.
  - Clip 2: eye level.
  - Clip 3: over-the-shoulder at desk height.
- **M (Metatokens):** The big title is a white serif, about 15% of the frame height, landing on the word "Free".
- **Borrowed from:** @fxvouri scenes 7–11 ("OUTREACHY" title lands over the desk shot)

#### Shot 4 · WHAT IT IS · about 5 s

- **Say:** "It's a no-cost Databricks workspace for students and anyone learning, with serverless compute, so there's no cluster to set up."
- **On screen:** card: the docs page line "a no-cost version of Databricks", highlighted in yellow
- **S (Subject):** A street or corridor walk, then the laptop showing the Free Edition page.
- **E (Environment):** Outside, then the desk.
- **A (Action):** Walking clips cut on phrase starts. The docs card pops in at about 60% width with a small bounce.
- **L (Lighting):** Daylight outside; screen glow at the desk.
- **Ca (Camera):** Handheld walking, then a locked-off phone over the laptop.
- **M (Metatokens):** White card with a drop shadow and a yellow highlighter swipe across the quoted line.
- **Borrowed from:** @fxvouri scenes 15–18 ("Work on Open Source" page card)

#### Shot 5 · WHAT YOU CAN DO · about 6 s (4 clips)

- **Say:** "You get notebooks, the SQL editor, Lakeflow pipelines and Genie dashboards, the same tools the job posts list."
- **On screen:** a tag per clip: notebooks · SQL editor · Lakeflow · Genie
- **S (Subject):** Four screen clips in the Free Edition workspace: a notebook cell running, the SQL editor, a pipeline graph, a dashboard.
- **E (Environment):** The laptop on a desk, shot at an angle so the room is visible at the edges.
- **A (Action):** One cut per tool, on the word.
- **L (Lighting):** Screen glow, a warm desk lamp.
- **Ca (Camera):** Phone filming the screen at a 15° angle, locked-off. Or a direct screen capture with a slow push-in.
- **M (Metatokens):** Small black-on-white tag in the lower third for each tool name.
- **Borrowed from:** @fxvouri scenes 13–16 (one clip per fact)

#### Shot 6 · THE CATCH · about 4 s

- **Say:** "The catch: it's serverless-only and quota-limited, so it's for learning, not for running a business."
- **On screen:** serverless-only, quota-limited
- **S (Subject):** You in a lift mirror or on stairs, a straight face.
- **E (Environment):** A lift or stairwell.
- **A (Action):** You glance at the camera on "catch"; the text card slides in.
- **L (Lighting):** Interior overhead light, slightly cool.
- **Ca (Camera):** Mirror selfie or a friend at eye level, handheld.
- **M (Metatokens):** Bold black text in a white box, centred, like the source's "This is NOT just targeted at…" card.
- **Borrowed from:** @fxvouri scenes 17–18

#### Shot 7 · WHAT TO DO · about 8 s (3 clips)

- **Say:** "Here's what I'd do in your first hour. Sign up. Load one public dataset into a table. Then schedule one job and write down what broke."
- **On screen:** **DO THIS TODAY** → 1 sign up · 2 load a dataset · 3 schedule a job
- **S (Subject):** The sign-up page; the table upload screen; the jobs page.
- **E (Environment):** The laptop at a café table or desk.
- **A (Action):** Each step cuts on its verb, and the numbered list builds.
- **L (Lighting):** Daylight café or desk.
- **Ca (Camera):** Over-the-shoulder, phone locked-off.
- **M (Metatokens):** The title is bold white caps with an outline. The list is in the source's yellow sticky-note style.
- **Borrowed from:** @fxvouri scenes 24–28 ("DO THIS TODAY" title, then the steps)

#### Shot 8 · CTA · about 4 s

- **Say:** "Save this, send it to someone trying to get into data, and follow for next week's free one."
- **On screen:** speech captions only
- **S (Subject):** A wide city or office view at dusk, then you turning away.
- **E (Environment):** A rooftop, a window or a street at dusk.
- **A (Action):** A slow pan across the view; a last 1 s clip of you.
- **L (Lighting):** Blue-hour dusk, city lights coming on.
- **Ca (Camera):** Phone on a window ledge, slow handheld pan.
- **M (Metatokens):** No end card. The video ends on the last word so it loops.
- **Borrowed from:** @fxvouri scenes 29–34

### Teleprompter

Just the words, in order.

It's hard to get data experience when every data job wants experience first.

So every week I find one free way to get real hands-on time, and this week it's Databricks Free Edition.

It's a no-cost Databricks workspace for students and anyone learning, with serverless compute, so there's no cluster to set up.

You get notebooks, the SQL editor, Lakeflow pipelines and Genie dashboards, the same tools the job posts list.

The catch: it's serverless-only and quota-limited, so it's for learning, not for running a business.

Here's what I'd do in your first hour. Sign up. Load one public dataset into a table. Then schedule one job and write down what broke.

Save this, send it to someone trying to get into data, and follow for next week's free one.

---

## "Experience with Databricks" on a job post means 5 things

Sun 25 Oct 2026 · TOFU · Educational · Talking head (two seats) · about 55 s

### The idea

- **Topic:** A job seeker reads "experience with Databricks" off a job post and panics. A mentor explains it in five things:
  1. notebooks;
  2. Delta tables;
  3. jobs that run on a schedule;
  4. Unity Catalog permissions;
  5. a SQL warehouse for the analysts.

  Then how to practise them for free.
- **Angle:** Tip · **Hook pattern:** Quote the scary job-post phrase · **Style:** easy, educational
- **Series:** "What the job post actually means" ("strong SQL", "experience with Fabric", "knows Unity Catalog")
- **Odds:** 9.2% chance of a 5× outlier (this niche's base rate is 7.2%), rated good, medium confidence. 25.1% to beat your follower count, 16.6% to reach 2×, 5.7% to reach 10×.
  - 1.28× the niche base rate: evidence ×1.28 · funnel stage ×1.00 · its sources median 11.1×
  - Format "talking head": used by 4 of 39 outliers
  - Angle "tip": used by 5 of 39 outliers
  - Video type "reaction reply": used by 4 of 39 outliers
  - Complexity "easy": used by 29 of 39 outliers
  - Delivery "educational": used by 25 of 39 outliers
- **Why it should work:** @zubayer.hossain470 (11.1×) plays two people from two camera setups:
  - the anxious job seeker at the laptop by a window;
  - the calm senior in a desk chair.

  They trade short lines. The jargon is shrunk to a short keyword list that stacks on screen, and the clip ends on a cliffhanger ("This one also says… Next video."). We keep the two-seat dialogue, the stacked keyword list and the cliffhanger. The job phrase, the five items and the practice plan are ours and specific to Databricks. Every line is new.
- **Borrows its structure from:**
  - @zubayer.hossain470, 11.1× their followers: https://www.tiktok.com/@zubayer.hossain470/video/7678044906979429664
- **Risk:**
  - Two-seat sketches fall flat if the two characters look the same. Fix: change seat, shirt or glasses, and light for each character (window side vs desk side), as the source does.
  - Keep each line under 6 seconds.

### Script

#### Hook (first 3 seconds)

- **Say:** (Seeker, reading off the laptop) "'Experience with Databricks.' I've never even logged in."
- **On screen:** Experience with Databricks (red tag, as if highlighted from a job post)
- **Show:** The seeker types at a laptop by a window, then turns to the camera, worried.

#### Beats

1. **HOOK**
   - Say (Seeker): "Experience with Databricks." I've never even logged in.
   - Film: Seat A: laptop by the window, side-on, then a turn to the lens.
   - Edit: Red tag "Experience with Databricks" pops at 0.0 s in the middle third. Speech captions in a black box.
2. **REFRAME**
   - Say (Mentor): Nobody means all of Databricks. Day to day, it's five things.
   - Film: Seat B: desk chair facing the camera, glasses on, relaxed.
   - Edit: Hard cut on "Nobody".
3. **QUESTION**
   - Say (Seeker): Only five?
   - Film: Seat A, a short sceptical look.
   - Edit: About 1 s.
4. **LIST**
   - Say (Mentor): Notebooks. Delta tables. Jobs that run on a schedule. Unity Catalog permissions. And a SQL warehouse for the analysts.
   - Film: Seat B, counting on fingers.
   - Edit: Each item stacks in a black box at the top as it is said, building a five-line list (the source's SELECT/FROM/WHERE stack).
5. **DOUBT**
   - Say (Seeker): That can't be the whole job.
   - Film: Seat A.
   - Edit: About 1.5 s.
6. **REAL WORK**
   - Say (Mentor): The real work is questions. Which table landed late? Who's allowed to see this column? Why did last night's job fail? Those five things are how you answer them.
   - Film: Seat B, leaning in.
   - Edit: The three questions as single-line captions, a beat each.
7. **PRACTICE**
   - Say (Seeker): So how do I get experience before the job? (Mentor) Sign up for the free edition, load one public dataset, schedule one job and lock down one table. Then write up what broke and put it on GitHub.
   - Film: Seat A for the question, then Seat B for the answer.
   - Edit: A screen inset of Databricks Free Edition for a second on "free edition".
8. **CLIFFHANGER**
   - Say (Seeker): OK, but this one also says "Unity Catalog". (Mentor) Next video.
   - Film: Seat A, scrolling the laptop; then Seat B, a small smile.
   - Edit: End on "Next video" with no end card, so it loops.

#### Close and post

- **Call to action:** "Next video." (follow, implied by the cliffhanger)
- **Caption:** "Experience with Databricks" sounds scarier than it is. Part 2: Unity Catalog. #databricks #dataengineering #dataanalyst #techjobs #learndata
- **Hashtags:** #databricks #dataengineering #dataanalyst #techjobs #learndata

**Keep exact:**
- Notebooks, Delta tables, scheduled jobs (Lakeflow Jobs), Unity Catalog permissions and SQL warehouses are all Databricks features. Delta Lake is the default table format.
- "Five things" is our framing of day-to-day work, not a Databricks statement. Present it as advice.
- Free Edition facts: as on Saturday.

### Shot list (SEALCaM)

#### Shot 1 · HOOK · about 3 s

- **Say:** "'Experience with Databricks.' I've never even logged in."
- **On screen:** Experience with Databricks (red tag)
- **S (Subject):** The seeker, waist-up, side-on at a laptop, hands on the keys.
- **E (Environment):** A window with sheer curtains behind, and a tall object in the background (a bookcase or plant).
- **A (Action):** Types, stops, turns the head to the lens on "never".
- **L (Lighting):** Soft window light from camera left, warm interior fill, medium contrast.
- **Ca (Camera):** Phone on a tripod at desk height, slightly low, 26mm wide, locked-off.
- **M (Metatokens):**
  - Natural phone video.
  - The red tag is white italic text on a red rounded box.
  - Speech captions: white text in a black box, lower third.
- **Borrowed from:** @zubayer.hossain470 scene 1

#### Shot 2 · REFRAME · about 3 s

- **Say:** "Nobody means all of Databricks. Day to day, it's five things."
- **On screen:** captions
- **S (Subject):** The mentor, waist-up, centred in a black desk chair, glasses on.
- **E (Environment):** A plain white wall with one framed poster.
- **A (Action):** Hands together, a small open-palm gesture on "five".
- **L (Lighting):** Overhead room light plus a desk lamp, cooler than Seat A.
- **Ca (Camera):** Phone on a tripod at chest height, straight on, locked-off, slightly wider than Seat A.
- **M (Metatokens):** The same caption style. The change of seat and colour is what tells the viewer it's another person.
- **Borrowed from:** @zubayer.hossain470 scene 2

#### Shot 3 · QUESTION · about 1 s

- **Say:** "Only five?"
- **On screen:** captions
- **S (Subject):** The seeker, head turned to the lens.
- **E (Environment):** As Shot 1.
- **A (Action):** A raised eyebrow, a small head tilt.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** As Shot 1.
- **Borrowed from:** @zubayer.hossain470 scene 3

#### Shot 4 · LIST · about 7 s

- **Say:** "Notebooks. Delta tables. Jobs that run on a schedule. Unity Catalog permissions. And a SQL warehouse for the analysts."
- **On screen:** a stack that builds: NOTEBOOKS / DELTA TABLES / JOBS / UNITY CATALOG / SQL WAREHOUSE
- **S (Subject):** The mentor, counting on fingers.
- **E (Environment):** As Shot 2.
- **A (Action):** One finger per item. Each word appears on its first syllable.
- **L (Lighting):** As Shot 2.
- **Ca (Camera):** As Shot 2.
- **M (Metatokens):** White caps in black boxes, stacked top-centre, one per line, left edge aligned.
- **Borrowed from:** @zubayer.hossain470 scene 4

#### Shot 5 · DOUBT · about 1.5 s

- **Say:** "That can't be the whole job."
- **On screen:** captions
- **S (Subject):** The seeker.
- **E (Environment):** As Shot 1.
- **A (Action):** Leans back, sceptical.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** As Shot 1.
- **Borrowed from:** @zubayer.hossain470 scene 5

#### Shot 6 · REAL WORK · about 9 s

- **Say:** "The real work is questions. Which table landed late? Who's allowed to see this column? Why did last night's job fail? Those five things are how you answer them."
- **On screen:** captions, one question per line
- **S (Subject):** The mentor, leaning forward.
- **E (Environment):** As Shot 2.
- **A (Action):** A hand gesture per question; settles back on "answer them".
- **L (Lighting):** As Shot 2.
- **Ca (Camera):** As Shot 2.
- **M (Metatokens):** As Shot 2.
- **Borrowed from:** @zubayer.hossain470 scene 6

#### Shot 7 · PRACTICE · about 12 s (two setups)

- **Say:** "So how do I get experience before the job?" / "Sign up for the free edition, load one public dataset, schedule one job and lock down one table. Then write up what broke and put it on GitHub."
- **On screen:** captions; a 1 s inset of the Free Edition sign-up page
- **S (Subject):** The seeker (question), then the mentor (answer).
- **E (Environment):** Seats A and B.
- **A (Action):** A hard cut between seats on the question mark. The inset pops top-centre on "free edition".
- **L (Lighting):** As each seat.
- **Ca (Camera):** As each seat.
- **M (Metatokens):** The inset is a rounded card with a drop shadow at 60% width.
- **Borrowed from:** @zubayer.hossain470 scenes 9–10

#### Shot 8 · CLIFFHANGER · about 4 s

- **Say:** "OK, but this one also says 'Unity Catalog'." / "Next video."
- **On screen:** captions
- **S (Subject):** The seeker scrolling the laptop, then the mentor smiling.
- **E (Environment):** Seats A and B.
- **A (Action):** The seeker points at the screen; cut; the mentor gives a small smile and the clip ends.
- **L (Lighting):** As each seat.
- **Ca (Camera):** As each seat.
- **M (Metatokens):** No end card. The video ends on the word.
- **Borrowed from:** @zubayer.hossain470 scenes 13–14

### Teleprompter

Just the words, in order. (A = seeker, B = mentor)

A: "Experience with Databricks." I've never even logged in.

B: Nobody means all of Databricks. Day to day, it's five things.

A: Only five?

B: Notebooks. Delta tables. Jobs that run on a schedule. Unity Catalog permissions. And a SQL warehouse for the analysts.

A: That can't be the whole job.

B: The real work is questions. Which table landed late? Who's allowed to see this column? Why did last night's job fail? Those five things are how you answer them.

A: So how do I get experience before the job?

B: Sign up for the free edition, load one public dataset, schedule one job and lock down one table. Then write up what broke and put it on GitHub.

A: OK, but this one also says "Unity Catalog".

B: Next video.

---

## Databricks or Microsoft Fabric: which should you learn?

Mon 26 Oct 2026 · TOFU · Educational · Whiteboard · about 60 s

### The idea

- **Topic:** Databricks and Fabric are both lakehouses on open Delta tables. They differ in who each is built for:
  - Databricks: on any of three clouds, engineering-heavy.
  - Fabric: Microsoft's all-in-one, with Power BI included.

  Inside one company they can work together: Fabric can mirror an Azure Databricks Unity Catalog without copying the data. The answer: learn the lakehouse once.
- **Angle:** Comparison · **Hook pattern:** "Is X just Y? No." · **Style:** medium, educational
- **Series:** "X or Y: which should you learn?" (next: Fabric warehouse or lakehouse; DP-600 or DP-700)
- **Odds:** 7.7% chance of a 5× outlier (this niche's base rate is 7.2%), rated average, low confidence. 20.8% to beat your follower count, 13.7% to reach 2×, 4.7% to reach 10×.
  - 1.06× the niche base rate: evidence ×1.06 · funnel stage ×1.00 · its sources median 10.0×
  - Format "whiteboard": used by 3 of 39 outliers
  - Angle "comparison": used by 1 of 39 outliers
  - Video type "explainer": used by 7 of 39 outliers
  - Complexity "medium": used by 9 of 39 outliers
  - Delivery "educational": used by 25 of 39 outliers
- **Why it should work:** @shreya.knows.data's "Is Microsoft Fabric just the new Power BI?" (10×) has three parts:
  1. A yes/no hook answered "Absolutely not" within 2 seconds.
  2. A "this is X and this is Y" logo split.
  3. The data life cycle drawn as stages (bring in, store, transform, report, AI). Each stage lands as a big yellow word, with the tool logos popping on a grey grid between whiteboard shots.

  She has two whiteboard posts above 5× (10× and 11.9×). We keep the hook shape, the logo split and the stage-by-stage build. Ours compares Databricks with Fabric, adds the mirroring fact (they work together), and closes on a keyword for our lakehouse map.
  The model rates it average: "medium" complexity costs it. Keep the language easy.
- **Borrows its structure from:**
  - @shreya.knows.data, 10.0× their followers: https://www.tiktok.com/@shreya.knows.data/video/7638031376217853205
- **Risk:**
  - Comparisons draw "you're wrong" comments from fans of either side. That is reach, but only if every line is defensible. Fix: no "better", no prices. Say "built for", not "best for".
  - Brand logos: show each only on the line that names it.

### Before you film

- [[YOUR FREEBIE: a one-page "lakehouse map": what carries over between Databricks and Fabric (Delta tables, Spark, SQL, medallion layers) and what doesn't (workspace/capacity model, governance tools)]]. Make it, then set an auto-reply or DM flow for the keyword LAKE before posting.
- Draw the board before you record: two columns, DATABRICKS | FABRIC, and a shared strip across the bottom, DELTA TABLES · SPARK · SQL.

### Script

#### Hook (first 3 seconds)

- **Say:** "Is Databricks just Microsoft Fabric with a different logo? No."
- **On screen:** Databricks vs Fabric (logos either side of a slash), then captions
- **Show:** You beside the whiteboard, marker in hand. The two logos pop above your head with a "vs" between.

#### Beats

1. **HOOK**
   - Say: Is Databricks just Microsoft Fabric with a different logo? No.
   - Film: You beside the board, a slight turn to the lens on "No."
   - Edit: Logo split pops at 1.3 s ("Databricks ⁄ vs ⁄ Fabric"). A punch-in on "No."
2. **SPLIT**
   - Say: This is Databricks, and this is Fabric.
   - Film: Point to each column of the board.
   - Edit: Each logo card lands over its column as it is named.
3. **SAME**
   - Say: Underneath, they're both lakehouses. Your data sits in open Delta tables, and Spark and SQL run on top.
   - Film: Tap the shared strip at the bottom of the board.
   - Edit: Cut to the grey grid. Big yellow words **DELTA**, **SPARK**, **SQL** land one per word.
4. **DATABRICKS**
   - Say: Databricks runs on AWS, Azure and Google Cloud, and it's built for teams who engineer data and train models.
   - Film: Write "any cloud" under DATABRICKS.
   - Edit: On the grid: AWS, Azure and Google Cloud wordmarks pop in a row (wordmarks, no logos).
5. **FABRIC**
   - Say: Fabric is Microsoft's all-in-one: storage, pipelines, a warehouse and Power BI, all paid for by one capacity.
   - Film: Write "all-in-one" under FABRIC.
   - Edit: On the grid: four words pop, one per noun: STORAGE · PIPELINES · WAREHOUSE · POWER BI.
6. **TOGETHER**
   - Say: And they're not rivals inside a company. Fabric can mirror an Azure Databricks catalog and read those tables without copying the data.
   - Film: Draw an arrow from DATABRICKS to FABRIC.
   - Edit: A page card of the Microsoft Learn mirroring page, with "no data movement or data replication" highlighted.
7. **ANSWER**
   - Say: So which should you learn? Learn the lakehouse once. Delta, Spark and SQL carry over to both.
   - Film: Circle the shared strip.
   - Edit: Big title **LEARN IT ONCE** stacked over the board.
8. **CTA**
   - Say: Comment LAKE and I'll send you my one-page map of what carries over and what doesn't.
   - Film: Cap the marker, look at the lens.
   - Edit: Comment-box graphic with "LAKE" typing in.

#### Close and post

- **Call to action:** "Comment LAKE and I'll send you my one-page map of what carries over and what doesn't." (comment keyword, 4 letters)
- **Caption:** Databricks or Fabric? Learn the lakehouse once. Comment LAKE for the map 👇 #databricks #microsoftfabric #dataengineering #lakehouse #dataanalyst
- **Hashtags:** #databricks #microsoftfabric #dataengineering #lakehouse #dataanalyst

**Keep exact:**
- **Databricks runs on AWS, Azure and Google Cloud.** Delta Lake is its default table format.
- **Fabric lakehouse tables are Delta tables** ("Lakehouse Load to Delta Lake tables", Microsoft Learn, updated Sep 23 2026).
- **One capacity:** Fabric workloads draw from one F-SKU capacity (Fabric Field Guide).
- **Mirroring:** "When you use Fabric to read data that is registered in Unity Catalog, there is no data movement or data replication." This is for **Azure** Databricks (Microsoft Learn, "Mirrored catalog from Azure Databricks", updated Oct 3 2026). Don't say "any Databricks".
- **"Built for":** these are positioning lines, not limits. Fabric does have Spark notebooks, and Databricks does have dashboards.

### Shot list (SEALCaM)

#### Shot 1 · HOOK · about 1.3 s

- **Say:** "Is Databricks just…"
- **On screen:** captions
- **S (Subject):**
  - Primary: you, waist-up, standing to the right of a whiteboard on an easel.
  - Secondary: the board, with the two drawn columns.
- **E (Environment):** A bright room with a plain wall. The whiteboard fills the left half of the frame.
- **A (Action):** Marker raised, about to write; you turn toward the lens.
- **L (Lighting):** Soft daylight from a window behind the camera, bright and even, neutral white.
- **Ca (Camera):** Phone on a tripod at chest height, 26mm, a slight angle to the board, locked-off.
- **M (Metatokens):** Natural phone look. Captions in bold condensed white caps with a dark outline, lower third.
- **Borrowed from:** @shreya.knows.data scene 1

#### Shot 2 · HOOK · about 2 s

- **Say:** "…Microsoft Fabric with a different logo? No."
- **On screen:** Databricks / vs / Fabric logo split, top third
- **S (Subject):** You, a slight punch-in. The logos above your head.
- **E (Environment):** As Shot 1.
- **A (Action):** A small head shake on "No". The logo split pops with a slash between.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** A 110% digital punch-in on "No".
- **M (Metatokens):** Logos as flat icons with "vs" in italic, no box.
- **Borrowed from:** @shreya.knows.data scene 2

#### Shot 3 · SPLIT · about 3 s

- **Say:** "This is Databricks, and this is Fabric."
- **On screen:** one logo card over each column of the board
- **S (Subject):** The board's two columns. Your hand points.
- **E (Environment):** As Shot 1.
- **A (Action):** Point left on "Databricks", right on "Fabric". Each card lands as it is named.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** Cards are white rounded rectangles framed with a coloured border, as in the source's product-diagram cards.
- **Borrowed from:** @shreya.knows.data scene 3

#### Shot 4 · SAME · about 6 s

- **Say:** "Underneath, they're both lakehouses. Your data sits in open Delta tables, and Spark and SQL run on top."
- **On screen:** DELTA · SPARK · SQL (big yellow words)
- **S (Subject):** You tapping the shared strip, then a full-frame grey grid with the words.
- **E (Environment):** The board, then a flat light-grey background with a faint white grid.
- **A (Action):** A cut to the grid on "Delta". Each word lands on its first syllable and stacks.
- **L (Lighting):** As Shot 1; the grid is flat.
- **Ca (Camera):** Board shot, then a graphic plate.
- **M (Metatokens):** Yellow condensed caps with a darker outline, upper third. The grid matches the source's grey 3×3 grid.
- **Borrowed from:** @shreya.knows.data scenes 4–5 ("Bring DATA in" over the grid)

#### Shot 5 · DATABRICKS · about 5 s

- **Say:** "Databricks runs on AWS, Azure and Google Cloud, and it's built for teams who engineer data and train models."
- **On screen:** AWS · Azure · Google Cloud wordmarks
- **S (Subject):** You writing "any cloud" under DATABRICKS, then the grid with three wordmarks.
- **E (Environment):** Board, then grid.
- **A (Action):** Writing; a cut to the grid on "AWS"; the three wordmarks pop in a row, one per name.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** Wordmarks in dark grey sans, centred.
- **Borrowed from:** @shreya.knows.data scenes 6–7 ("TRANSFORM it" with the Databricks and dbt logos)

#### Shot 6 · FABRIC · about 6 s

- **Say:** "Fabric is Microsoft's all-in-one: storage, pipelines, a warehouse and Power BI, all paid for by one capacity."
- **On screen:** STORAGE · PIPELINES · WAREHOUSE · POWER BI
- **S (Subject):** You writing "all-in-one", then the grid with four words.
- **E (Environment):** Board, then grid.
- **A (Action):** One word per noun, stacking down the frame.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** Yellow caps, the same as Shot 4.
- **Borrowed from:** @shreya.knows.data scenes 8–9 ("REPORTING" with Power BI and Tableau)

#### Shot 7 · TOGETHER · about 7 s

- **Say:** "And they're not rivals inside a company. Fabric can mirror an Azure Databricks catalog and read those tables without copying the data."
- **On screen:** page card: "no data movement or data replication" highlighted
- **S (Subject):** You drawing an arrow DATABRICKS → FABRIC, then the Learn page card above your head.
- **E (Environment):** As Shot 1.
- **A (Action):** The arrow is drawn; the card drops in over the top third; the highlighter swipes the line.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** The page card is a dark rounded screenshot with a drop shadow, like the source's Fabric product card over her head.
- **Borrowed from:** @shreya.knows.data scene 13 (the Fabric card above the board)

#### Shot 8 · ANSWER · about 6 s

- **Say:** "So which should you learn? Learn the lakehouse once. Delta, Spark and SQL carry over to both."
- **On screen:** **LEARN IT ONCE**
- **S (Subject):** You circling the shared strip.
- **E (Environment):** As Shot 1.
- **A (Action):** The circle is drawn; the title stacks word by word over the board.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** Slow 105% push-in.
- **M (Metatokens):** A two-tone stacked title (white and yellow), like the source's "FULL STACK DATA PROFESSIONAL".
- **Borrowed from:** @shreya.knows.data scene 14

#### Shot 9 · CTA · about 4 s

- **Say:** "Comment LAKE and I'll send you my one-page map of what carries over and what doesn't."
- **On screen:** a comment box, "LAKE" typing
- **S (Subject):** You, marker capped, facing the lens.
- **E (Environment):** As Shot 1.
- **A (Action):** A nod on "LAKE"; the comment box slides up from the bottom.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** A white comment bubble with a blinking caret.
- **Borrowed from:** @shreya.knows.data scene 14 (the end of the long take)

### Teleprompter

Just the words, in order.

Is Databricks just Microsoft Fabric with a different logo? No.

This is Databricks, and this is Fabric.

Underneath, they're both lakehouses. Your data sits in open Delta tables, and Spark and SQL run on top.

Databricks runs on AWS, Azure and Google Cloud, and it's built for teams who engineer data and train models.

Fabric is Microsoft's all-in-one: storage, pipelines, a warehouse and Power BI, all paid for by one capacity.

And they're not rivals inside a company. Fabric can mirror an Azure Databricks catalog and read those tables without copying the data.

So which should you learn? Learn the lakehouse once. Delta, Spark and SQL carry over to both.

Comment LAKE and I'll send you my one-page map of what carries over and what doesn't.

---

## Lakehouse from zero, ep 1: a CSV to a Fabric table

Tue 27 Oct 2026 · MOFU · Educational · Screen recording · about 60 s

### The idea

- **Topic:** In a Fabric workspace: create a lakehouse, upload a CSV to Files, then use **Load to tables** to turn it into a Delta table. Then query it from the SQL analytics endpoint. It is episode 1 of a numbered beginner series.
- **Angle:** Tutorial · **Hook pattern:** Series opener ("Welcome to Lakehouse from zero, episode 1") · **Style:** easy, educational
- **Series:** "Lakehouse from zero, ep N" (ep 2: a notebook on that table; ep 3: a semantic model and a Direct Lake report)
- **Odds:** 8.6% chance of a 5× outlier (this niche's base rate is 7.2%), rated good, high confidence. 23.5% to beat your follower count, 15.5% to reach 2×, 5.3% to reach 10×.
  - 1.20× the niche base rate: evidence ×1.04 · funnel stage ×1.15 · its sources median 16.8×
  - Format "screen recording": used by 8 of 39 outliers
  - Angle "tutorial": used by 9 of 39 outliers
  - Video type "step by step": used by 9 of 39 outliers
  - Complexity "easy": used by 29 of 39 outliers
  - Delivery "educational": used by 25 of 39 outliers
- **Why it should work:** @jennytumay's numbered Fabric/Power BI series puts two episodes over 5× (16.8× for the PBIP episode, 7.3× for the semantic model). Each episode:
  - opens on a bold yellow title card naming the episode;
  - is pure screen recording with a short yellow caption box on every action;
  - ends on "stay tuned for next steps".

  A numbered series earns follows because people want the next part. We keep the title-card opener, the yellow action captions and the cliffhanger close. Ours is a different series name and starts at the very first step, which is where our audience is.
- **Borrows its structure from:**
  - @jennytumay, 16.8× their followers: https://www.tiktok.com/@jennytumay/video/7669200559345290527
- **Risk:**
  - Screen recordings die when the cursor wanders. Fix:
    - record at 100% zoom on a clean workspace;
    - cut every wait (spinners, loading);
    - keep each action under 4 seconds.
  - Our series name must not copy hers.

### Before you film

- [[YOUR WORKSPACE: a Fabric workspace on a trial or F capacity, cleared of other items]]
- [[YOUR CSV: one small public dataset with a header row; we suggest a city's open-data export, under 5 MB]]

### Script

#### Hook (first 3 seconds)

- **Say:** "Lakehouse from zero, episode one: we're taking a plain CSV and turning it into a real table in Microsoft Fabric."
- **On screen:** LAKEHOUSE FROM ZERO · ep 1 · CSV → Delta table (yellow title card over the workspace)
- **Show:** The empty Fabric workspace behind a bold yellow title card.

#### Beats

1. **HOOK**
   - Say: Lakehouse from zero, episode one: we're taking a plain CSV and turning it into a real table in Microsoft Fabric.
   - Film: Screen capture of the empty workspace.
   - Edit: Yellow title card centre-left for 3 s. Caption boxes start after it.
2. **CREATE**
   - Say: In your workspace, click New item, pick Lakehouse, and give it a name.
   - Film: Click New item → Lakehouse → type the name → Create.
   - Edit: Yellow caption box per action. Cut the loading spinner.
3. **UPLOAD**
   - Say: Your lakehouse has two areas, Files and Tables. Upload the CSV into Files first.
   - Film: Point at Files and Tables in the explorer; Get data → Upload files → pick the CSV.
   - Edit: A 1 s zoom on the Files/Tables explorer.
4. **LOAD**
   - Say: Now the step most people miss. Click the three dots on the file and choose Load to tables, New table.
   - Film: … → Load to tables → New table.
   - Edit: Zoom on the menu. Caption "Load to tables → New table".
5. **SETTINGS**
   - Say: Name it with lowercase letters and underscores, no spaces or dashes, and keep "first row as header" ticked so your columns get real names.
   - Film: Type the table name; show the Column header checkbox; click Load.
   - Edit: Caption "lowercase + underscores only". Highlight the checkbox.
6. **RESULT**
   - Say: And there it is under Tables, saved as a Delta table that Spark, SQL and Power BI can all read.
   - Film: Expand Tables; click the table to preview the rows.
   - Edit: Caption "Delta table ✓".
7. **QUERY**
   - Say: Switch to the SQL analytics endpoint and you can query it with plain SQL straight away.
   - Film: Switch the view to the SQL analytics endpoint; run `SELECT TOP 10 * FROM <table>`.
   - Edit: Cut the wait. The result grid fills the frame.
8. **CLIFFHANGER**
   - Say: Next episode, we open a notebook on this table. Follow so you don't miss it.
   - Film: Hold on the result grid.
   - Edit: Yellow end-caption "ep 2: notebooks".

#### Close and post

- **Call to action:** "Follow so you don't miss it." (follow for the series)
- **Caption:** Lakehouse from zero, ep 1: CSV → Delta table in Fabric. Save it for when you build yours. #microsoftfabric #lakehouse #dataengineering #powerbi #fabrictutorial
- **Hashtags:** #microsoftfabric #lakehouse #dataengineering #powerbi #fabrictutorial

**Keep exact** (Microsoft Learn, "Lakehouse Load to Delta Lake tables", updated Sep 23 2026):
- "Load to tables" turns **CSV or Parquet** files into Delta tables, from a single file or a folder.
- New table names: "lowercase alphanumeric characters and underscores (`_`) only… Dashes (`-`) and spaces aren't allowed."
- Column header unticked → columns are named `_c0`, `_c1`, …
- You **can't** set a custom column schema in this flow; a notebook does that. Don't claim otherwise.

### Shot list (SEALCaM)

#### Shot 1 · HOOK · about 3 s

- **Say:** "Lakehouse from zero, episode one…"
- **On screen:** LAKEHOUSE FROM ZERO / ep 1 / CSV → Delta table
- **S (Subject):** A yellow title card over the Fabric workspace.
- **E (Environment):** The Fabric web UI in a browser, light theme, an empty workspace list.
- **A (Action):** The card pops with a small scale bounce; the workspace sits still behind it.
- **L (Lighting):** Screen capture, flat.
- **Ca (Camera):** Full-screen capture cropped to 9:16 around the left nav and the content pane.
- **M (Metatokens):** Bold black serif-italic title on a bright yellow block, stacked over three lines, like the source's "POWER BI & Fabric / Back2Basics / ep 3" card.
- **Borrowed from:** @jennytumay scene 1

#### Shot 2 · CREATE · about 6 s

- **Say:** "In your workspace, click New item, pick Lakehouse, and give it a name."
- **On screen:** yellow box "New item → Lakehouse"
- **S (Subject):** The New item panel; the Lakehouse tile; the name dialog.
- **E (Environment):** Fabric UI.
- **A (Action):** Cursor clicks, each followed by a hard cut; the spinner is cut out.
- **L (Lighting):** Flat screen.
- **Ca (Camera):** A 9:16 crop that follows the cursor, with a 110% zoom on the dialog.
- **M (Metatokens):** Captions in a rounded pale-yellow box with dark text, lower third, one per action.
- **Borrowed from:** @jennytumay scenes 3–5

#### Shot 3 · UPLOAD · about 6 s

- **Say:** "Your lakehouse has two areas, Files and Tables. Upload the CSV into Files first."
- **On screen:** "Files = raw · Tables = Delta"
- **S (Subject):** The lakehouse explorer; the Upload files dialog.
- **E (Environment):** Fabric UI; the OS file picker.
- **A (Action):** A 1 s zoom on Files/Tables; Get data → Upload files → pick the CSV.
- **L (Lighting):** Flat screen.
- **Ca (Camera):** Crop and zoom.
- **M (Metatokens):** The yellow caption box.
- **Borrowed from:** @jennytumay scenes 6–8

#### Shot 4 · LOAD · about 5 s

- **Say:** "Now the step most people miss. Click the three dots on the file and choose Load to tables, New table."
- **On screen:** "Load to tables → New table"
- **S (Subject):** The file's context menu.
- **E (Environment):** Fabric UI.
- **A (Action):** The menu opens; the cursor hovers over Load to tables; New table is chosen.
- **L (Lighting):** Flat screen.
- **Ca (Camera):** A 130% zoom on the menu.
- **M (Metatokens):** The yellow caption box, with the menu item ringed.
- **Borrowed from:** @jennytumay scenes 9–13 (Get Data menu path)

#### Shot 5 · SETTINGS · about 7 s

- **Say:** "Name it with lowercase letters and underscores, no spaces or dashes, and keep 'first row as header' ticked so your columns get real names."
- **On screen:** "lowercase + underscores only"
- **S (Subject):** The Load file to new table dialog.
- **E (Environment):** Fabric UI.
- **A (Action):** Type the name; the checkbox is highlighted; click Load.
- **L (Lighting):** Flat screen.
- **Ca (Camera):** Zoom on the dialog.
- **M (Metatokens):** The yellow caption box and a yellow highlight on the checkbox.
- **Borrowed from:** @jennytumay scenes 15–19 (Options and settings, a checkbox highlighted)

#### Shot 6 · RESULT · about 5 s

- **Say:** "And there it is under Tables, saved as a Delta table that Spark, SQL and Power BI can all read."
- **On screen:** "Delta table ✓"
- **S (Subject):** The new table under Tables; the data preview.
- **E (Environment):** Fabric UI.
- **A (Action):** Expand Tables, click the table; rows fill the preview.
- **L (Lighting):** Flat screen.
- **Ca (Camera):** Crop that follows the cursor.
- **M (Metatokens):** The yellow caption box.
- **Borrowed from:** @jennytumay scene 24 (the result shown as proof)

#### Shot 7 · QUERY · about 6 s

- **Say:** "Switch to the SQL analytics endpoint and you can query it with plain SQL straight away."
- **On screen:** `SELECT TOP 10 *`
- **S (Subject):** The SQL analytics endpoint query editor; the result grid.
- **E (Environment):** Fabric UI.
- **A (Action):** Switch views, paste the query, run; the waiting time is cut.
- **L (Lighting):** Flat screen.
- **Ca (Camera):** Zoom on the editor, then the grid fills the frame.
- **M (Metatokens):** The yellow caption box; the SQL in a monospace overlay.
- **Borrowed from:** @jennytumay scene 25

#### Shot 8 · CLIFFHANGER · about 3 s

- **Say:** "Next episode, we open a notebook on this table. Follow so you don't miss it."
- **On screen:** "ep 2: notebooks"
- **S (Subject):** The result grid.
- **E (Environment):** Fabric UI.
- **A (Action):** A hold; the end caption pops.
- **L (Lighting):** Flat screen.
- **Ca (Camera):** Static.
- **M (Metatokens):** The yellow caption box, slightly larger.
- **Borrowed from:** @jennytumay scene 25 ("stay tuned for next steps")

### Teleprompter

Just the words, in order.

Lakehouse from zero, episode one: we're taking a plain CSV and turning it into a real table in Microsoft Fabric.

In your workspace, click New item, pick Lakehouse, and give it a name.

Your lakehouse has two areas, Files and Tables. Upload the CSV into Files first.

Now the step most people miss. Click the three dots on the file and choose Load to tables, New table.

Name it with lowercase letters and underscores, no spaces or dashes, and keep "first row as header" ticked so your columns get real names.

And there it is under Tables, saved as a Delta table that Spark, SQL and Power BI can all read.

Switch to the SQL analytics endpoint and you can query it with plain SQL straight away.

Next episode, we open a notebook on this table. Follow so you don't miss it.

---

## How long it took me to learn Fabric: my timeline

Wed 28 Oct 2026 · MOFU · Inspirational · Talking head · about 50 s

### The idea

- **Topic:** Your real path into Fabric, month by month: what you learned, which certification or project, the first job or client, with a screenshot as proof on every month. It ends with a promise to show the portfolio next.
- **Angle:** Story · **Hook pattern:** Answer a real question with a number ("It took me N months…") · **Style:** easy, inspirational
- **Series:** "Replying to your questions" (any real comment answered on camera)
- **Odds:** 10.6% chance of a 5× outlier (this niche's base rate is 7.2%), rated good, medium confidence. 28.8% to beat your follower count, 19.0% to reach 2×, 6.5% to reach 10×.
  - 1.47× the niche base rate: evidence ×1.28 · funnel stage ×1.15 · its sources median 15.2×
  - Format "talking head": used by 4 of 39 outliers
  - Angle "story": used by 12 of 39 outliers
  - Video type "reaction reply": used by 4 of 39 outliers
  - Complexity "easy": used by 29 of 39 outliers
  - Delivery "inspirational": used by 6 of 39 outliers
- **Why it should work:** @romdataanalyst (15.2×) answers "How long did you study for?":
  - The comment is pinned on screen the whole time.
  - The answer is a number ("six months") and then a month-by-month timeline.
  - Every month gets a proof screenshot that pops over the talking head: the certificates list, the SQL code, the dashboard, the email inbox, the course portal.
  - It ends on "I'll show you my portfolio next video".

  Story is the most common angle among this scan's outliers (12 of 39). It is the best-rated post of the week. The structure is borrowed; the months and the proof have to be yours.
- **Borrows its structure from:**
  - @romdataanalyst, 15.2× their followers: https://www.tiktok.com/@romdataanalyst/video/7680520215096102164
- **Risk:**
  - It only works if it is true. Invented months, fake certificates or a made-up hire break trust and platform rules. Fix: fill every placeholder from your own history. If you don't have this story yet, skip the post and run a second "Lakehouse from zero" episode instead.
  - Use a real comment for the reply card, or a plain question card.

### Before you film

Replace every [[placeholder]] with your own facts. Each month needs one screenshot you can show.

- [[N MONTHS: how long from your start to your first Fabric work]]
- [[MONTH 1: what you decided and why, e.g. "I'd been building Power BI reports for N years"]] + [[proof: an old report screenshot]]
- [[MONTH 2: the Learn path or course you did]] + [[proof: the Learn progress page or certificate]]
- [[MONTH 3: your first lakehouse or project]] + [[proof: the workspace or notebook screenshot, blurred where needed]]
- [[MONTH 4: certification, e.g. DP-600 or DP-700]] + [[proof: the badge]]
- [[MONTH 5–6: first job, project or client]] + [[proof: an email or calendar screenshot with names blurred]]
- [[A REAL COMMENT asking how long it took, or a question card]]

### Script

#### Hook (first 3 seconds)

- **Say:** "It took me [[N months]] to go from Power BI reports to building in Fabric, and here's my exact timeline."
- **On screen:** HOW I ACTUALLY LEARNED FABRIC + the reply card "How long did it take you?"
- **Show:** You at a laptop, typing, glancing up at the lens. The reply card is pinned top-left.

#### Beats

1. **HOOK**
   - Say: It took me [[N months]] to go from Power BI reports to building in Fabric, and here's my exact timeline.
   - Film: Desk, laptop, glance to the lens on the number.
   - Edit: Title in white caps with an outline, top. Reply card pinned under it for the whole video. Captions in white caps, with the key word in a red box.
2. **MONTH 1**
   - Say: In [[month]], I [[what you decided]].
   - Film: Same setup.
   - Edit: Proof screenshot 1 pops over the centre, about 70% width, for 1.5 s.
3. **MONTH 2**
   - Say: In [[month]], I did [[the Learn path or course]], while [[what else you were doing]].
   - Film: Same.
   - Edit: Proof 2 (the course list or certificate) pops.
4. **MONTH 3**
   - Say: In [[month]], I built my first lakehouse: [[what it was]].
   - Film: Same.
   - Edit: Proof 3 (workspace or notebook) pops; then a second screenshot stacks over it, as in the source's code → dashboard pair.
5. **MONTH 4**
   - Say: In [[month]], I passed [[DP-600 / DP-700]].
   - Film: Same.
   - Edit: Badge pops.
6. **MONTH 5–6**
   - Say: And in [[month]], [[first job, project or client]].
   - Film: Same; let the face hold for a beat after this line.
   - Edit: Proof 5 pops, then the face holds with no overlay.
7. **CLIFFHANGER**
   - Say: Next video I'll show you the exact project I used to get it.
   - Film: Same.
   - Edit: No end card.

#### Close and post

- **Call to action:** "Next video I'll show you the exact project I used to get it." (follow, implied)
- **Caption:** [[N]] months from Power BI to Fabric. Ask me anything about the path 👇 #microsoftfabric #powerbi #dataanalyst #careerchange #dp600
- **Hashtags:** #microsoftfabric #powerbi #dataanalyst #careerchange #dp600

**Keep exact:**
- Every month, number and badge must be true and shown.
- Blur names and emails on the proof screenshots.

### Shot list (SEALCaM)

#### Shot 1 · HOOK · about 10 s

- **Say:** "It took me [[N months]] to go from Power BI reports to building in Fabric, and here's my exact timeline."
- **On screen:** HOW I ACTUALLY LEARNED FABRIC · reply card "How long did it take you?"
- **S (Subject):** You, chest-up, slightly side-on at a laptop; the keyboard in the foreground.
- **E (Environment):** A plain grey or white wall, a dim room.
- **A (Action):** Typing, looking up on the number, then back to the screen.
- **L (Lighting):** A single soft key from the screen side, warm, a darker background, medium-high contrast.
- **Ca (Camera):** Phone propped at desk height, a slightly low angle, 26mm, locked-off.
- **M (Metatokens):**
  - Raw phone look.
  - Captions in bold white caps with the key word on a red box, lower third.
  - The reply card is a white speech bubble, top-left.
- **Borrowed from:** @romdataanalyst scenes 1–2

#### Shot 2 · MONTHS 1–2 · about 10 s

- **Say:** Month 1 and Month 2 lines.
- **On screen:** proof screenshots 1 and 2
- **S (Subject):** You, as Shot 1; the screenshots over the centre.
- **E (Environment):** As Shot 1.
- **A (Action):** Each screenshot pops with a short scale-in on the month word and holds 1.5 s.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** Screenshots at full brightness with a white border, like the source's certificate list.
- **Borrowed from:** @romdataanalyst scenes 3–6 (the "DAY 1" post and certificates pop-overs)

#### Shot 3 · MONTH 3 · about 6 s

- **Say:** Month 3 line.
- **On screen:** proof 3: a workspace or notebook, then a second screenshot stacked over it
- **S (Subject):** Two screenshots overlapping over you.
- **E (Environment):** As Shot 1.
- **A (Action):** The first pops; 0.7 s later the second lands on top, offset down-right.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** The stacked screenshots read as "a lot of work done".
- **Borrowed from:** @romdataanalyst scenes 7–8 (SQL code → dashboard stack)

#### Shot 4 · MONTHS 4–6 · about 14 s

- **Say:** Month 4 and Month 5–6 lines.
- **On screen:** badge; proof 5
- **S (Subject):** You; the badge; the email or calendar screenshot.
- **E (Environment):** As Shot 1.
- **A (Action):** Pop-overs on the month words. After the last line, the face holds alone for 1 s.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** As above.
- **Borrowed from:** @romdataanalyst scenes 10–13 (inbox screenshot, course portal, a long hold on the face)

#### Shot 5 · CLIFFHANGER · about 3 s

- **Say:** "Next video I'll show you the exact project I used to get it."
- **On screen:** captions
- **S (Subject):** You, looking at the lens.
- **E (Environment):** As Shot 1.
- **A (Action):** A small nod; the video ends.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** No end card.
- **Borrowed from:** @romdataanalyst scene 13

### Teleprompter

Just the words, in order.

It took me [[N months]] to go from Power BI reports to building in Fabric, and here's my exact timeline.

In [[month]], I [[what you decided]].

In [[month]], I did [[the Learn path or course]], while [[what else you were doing]].

In [[month]], I built my first lakehouse: [[what it was]].

In [[month]], I passed [[DP-600 / DP-700]].

And in [[month]], [[first job, project or client]].

Next video I'll show you the exact project I used to get it.

---

## We paused our Fabric capacity and the bill didn't drop

Thu 29 Oct 2026 · BOFU · Educational · Green screen · about 40 s

### The idea

- **Topic:** Why pausing a Fabric capacity doesn't lower the bill when the capacity is reserved:
  - Reservations apply hour by hour, and unused hours are lost.
  - Pausing also bills any smoothed usage still waiting, straight away.

  Two checks before you pause, then the offer: the PAUSE checklist, and a cost review for teams that want one.
- **Angle:** Tip · **Hook pattern:** Answer a costly question on screen · **Style:** easy, educational
- **Series:** "Fabric bills, explained" (next: what smoothing actually does to your bill)
- **Odds:** 5.1% chance of a 5× outlier (this niche's base rate is 7.2%), rated weak, medium confidence. 13.8% to beat your follower count, 9.1% to reach 2×, 3.1% to reach 10×.
  - 0.70× the niche base rate: evidence ×1.17 · funnel stage ×0.60 · its sources median 46.7×
  - Format "green screen": used by 3 of 39 outliers
  - Angle "tip": used by 5 of 39 outliers
  - Video type "reaction reply": used by 4 of 39 outliers
  - Complexity "easy": used by 29 of 39 outliers
  - Delivery "educational": used by 25 of 39 outliers
- **Why it should work:** It is the week's sales post: it speaks to the people who pay Fabric bills, and it ends on our offer. It rates weak because BOFU posts rarely spread in this niche (1 of 39 outliers).
  @yadhirasarmientoe's 46.7× reply holds attention with almost nothing:
  - the viewer's question pinned on screen;
  - one face, close, talking fast;
  - the page being discussed pops up as proof for 15 seconds, then disappears.

  We use that for a question worth money. The facts are verified on two Microsoft Learn pages, and the PAUSE checklist already exists (`docs/reels/deliverables/PAUSE-fabric-capacity-cost-checklist.md`).
- **Borrows its structure from:**
  - @yadhirasarmientoe, 46.7× their followers: https://www.tiktok.com/@yadhirasarmientoe/video/7672945855665687829
- **Risk:**
  - A wrong number in a cost video costs the sale. Fix: no discount percentages or prices on camera, only the two rules, word for word from the pages.
  - Use a real comment for the card when one comes in; until then, a plain question card.

### Before you film

- [[YOUR OFFER LINE: what a cost review is, e.g. "a 30-minute look at your capacity, free for the first five teams"]]. Put it in your bio link before posting.
- Set the auto-reply or DM flow for the keyword PAUSE, sending the checklist.

### Script

#### Hook (first 3 seconds)

- **Say:** "If your Fabric capacity is reserved, pausing it doesn't save you a cent."
- **On screen:** question card: "We paused our Fabric capacity. Why didn't the bill drop?"
- **Show:** Close on you with a handheld mic; the question card is pinned top-left.

#### Beats

1. **HOOK**
   - Say: If your Fabric capacity is reserved, pausing it doesn't save you a cent.
   - Film: Close-up, a handheld lapel mic in frame, a dark background.
   - Edit: The question card is pinned top-left for the whole video. Captions in white caps with the key word on a red box.
2. **RULE 1**
   - Say: A reservation is paid for every hour, used or not. Microsoft applies it hour by hour, and an unused hour doesn't carry over.
   - Film: Same.
   - Edit: The Microsoft Learn reservations page pops top-right, about 45% width, with "It doesn't carry over" highlighted.
3. **RULE 2**
   - Say: And when you pause, any smoothed usage still waiting gets added up and billed straight away.
   - Film: Same.
   - Edit: Swap the page card for the "Pause and resume" page, with "summed, and added to your Azure bill" highlighted.
4. **TWO CHECKS**
   - Say: So before you pause, check two things: is this capacity reserved, and how much smoothed usage is waiting? The Capacity Metrics app shows you.
   - Film: Same; count two on your fingers.
   - Edit: The page card goes. Captions "1 reserved? · 2 smoothing waiting?".
5. **CTA**
   - Say: Comment PAUSE and I'll send you my capacity cost checklist. And if you want me to look at yours, the link's in my bio.
   - Film: Same; a direct look at the lens.
   - Edit: Comment-box graphic with "PAUSE" typing in.

#### Close and post

- **Call to action:** "Comment PAUSE and I'll send you my capacity cost checklist. And if you want me to look at yours, the link's in my bio." (comment keyword + offer)
- **Caption:** Paused ≠ saved. Comment PAUSE for my Fabric capacity cost checklist. #microsoftfabric #powerbi #finops #azure #dataengineering
- **Hashtags:** #microsoftfabric #powerbi #finops #azure #dataengineering

**Keep exact** (verified Oct 21 2026; see `docs/reels/data-scripts-2026-10-21.md` Script 4):
- **Reservation, hourly:** "applied to CUs on an hourly basis… It doesn't carry over." Source: Microsoft Learn, "Save costs with Microsoft Fabric Capacity reservations" (updated Sep 30 2026).
- **Pause:** "the remaining cumulative overages and smoothed operations on your capacity are summed, and added to your Azure bill". Source: Microsoft Learn, "Pause and resume your Fabric capacity" (updated Aug 14 2026).
- **No numbers:** don't quote a discount percentage.

### Shot list (SEALCaM)

#### Shot 1 · HOOK · about 3 s

- **Say:** "If your Fabric capacity is reserved, pausing it doesn't save you a cent."
- **On screen:** question card · captions
- **S (Subject):** You, a tight close-up (eyes in the upper third). A fluffy lapel mic held up in your hand.
- **E (Environment):** A dark room or a car at night, with a few out-of-focus lights.
- **A (Action):** Talking fast and direct; the mic moves a little with your hand.
- **L (Lighting):** One soft key from the phone side (a ring light or the phone screen), warm skin, dark falloff, high contrast.
- **Ca (Camera):** Front phone camera at arm's length, eye level, handheld.
- **M (Metatokens):**
  - Raw phone look, slight grain.
  - The question card is a white speech bubble with a small avatar, top-left.
  - Captions in condensed white caps with the key word on a red box, mid-lower frame.
- **Borrowed from:** @yadhirasarmientoe scene 1

#### Shot 2 · RULE 1 · about 9 s

- **Say:** "A reservation is paid for every hour, used or not. Microsoft applies it hour by hour, and an unused hour doesn't carry over."
- **On screen:** page card, the reservations page, highlight on "It doesn't carry over"
- **S (Subject):** You; the Learn page card top-right.
- **E (Environment):** As Shot 1.
- **A (Action):** The card pops in on "Microsoft"; the highlighter swipes on "carry over".
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** A white rounded card with a drop shadow, partly overlapping the question card, like the source's YouTube channel card.
- **Borrowed from:** @yadhirasarmientoe scene 2

#### Shot 3 · RULE 2 · about 6 s

- **Say:** "And when you pause, any smoothed usage still waiting gets added up and billed straight away."
- **On screen:** page card, the pause page, highlight on "summed, and added to your Azure bill"
- **S (Subject):** You; the second card.
- **E (Environment):** As Shot 1.
- **A (Action):** A card swap on "pause".
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** As Shot 2.
- **Borrowed from:** @yadhirasarmientoe scene 3 (a second page view replaces the first)

#### Shot 4 · TWO CHECKS · about 9 s

- **Say:** "So before you pause, check two things: is this capacity reserved, and how much smoothed usage is waiting? The Capacity Metrics app shows you."
- **On screen:** 1 reserved? · 2 smoothing waiting?
- **S (Subject):** You, counting two.
- **E (Environment):** As Shot 1.
- **A (Action):** The card disappears; two fingers up.
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** Numbered captions in the same style.
- **Borrowed from:** @yadhirasarmientoe scene 4 (the long face-only hold after the card)

#### Shot 5 · CTA · about 6 s

- **Say:** "Comment PAUSE and I'll send you my capacity cost checklist. And if you want me to look at yours, the link's in my bio."
- **On screen:** a comment box, "PAUSE" typing
- **S (Subject):** You, looking at the lens.
- **E (Environment):** As Shot 1.
- **A (Action):** A small lean in on "look at yours".
- **L (Lighting):** As Shot 1.
- **Ca (Camera):** As Shot 1.
- **M (Metatokens):** A white comment bubble with a caret.
- **Borrowed from:** @yadhirasarmientoe scene 4

### Teleprompter

Just the words, in order.

If your Fabric capacity is reserved, pausing it doesn't save you a cent.

A reservation is paid for every hour, used or not. Microsoft applies it hour by hour, and an unused hour doesn't carry over.

And when you pause, any smoothed usage still waiting gets added up and billed straight away.

So before you pause, check two things: is this capacity reserved, and how much smoothed usage is waiting? The Capacity Metrics app shows you.

Comment PAUSE and I'll send you my capacity cost checklist. And if you want me to look at yours, the link's in my bio.

---

# Reference breakdowns

These are the outliers this week borrows from, scene by scene. Each shot in the shot lists names the scene it borrows from.
- Cuts were detected automatically (`teardown.py scenes`, threshold 0.25), with speech from faster-whisper.
- Where the detector split one shot into many quick re-frames, consecutive scenes are grouped and the range is given.
- Quotes are the creators' words, kept short and for analysis only. Nothing here is reused in our scripts.

### Reference breakdown: @kairadc (216.5×)

https://www.tiktok.com/@kairadc/video/7671004519790054678 · 7.8 s · one shot.

#### Scene 1 · 0.0–7.8 s · HOOK + LIST · single shot

- **Said:** no voice; a song plays. The detected speech is the on-screen list read by ASR.
- **On screen:** "5 skills worth learning to land your first data analyst role" → "1. SQL 2. PowerBI 3. data cleansing 4. basic stats 5. Python (not essential)"
- **S (Subject):** A young woman, chest-up, chin resting on her hand, in a cable-knit vest. A pencil is the secondary subject.
- **E (Environment):** A soft cream bedroom wall, out of focus.
- **A (Action):** She holds a bored, knowing look, then raises the pencil and points up as the list appears. The camera doesn't move.
- **L (Lighting):** Soft daylight from the left, warm and bright, low contrast.
- **Ca (Camera):** Front phone camera, selfie distance, eye level, locked-off.
- **M (Metatokens):** Raw phone look. Small white centred sans-serif text with a soft shadow. The list appears at once and holds.

### Reference breakdown: @fxvouri (24.0×)

https://www.tiktok.com/@fxvouri/video/7664927530952068374 · 62.3 s · 34 detected cuts, one every 1.8 s, grouped here into 8 beats.

#### Scenes 1–3 · 0.0–3.4 s · HOOK · hard cuts

- **Said:** "It's difficult to get experience in tech when all the job roles want you to have experience…"
- **On screen:** "Finding Tech opportunities" (white serif title, two lines) + word captions
- **S (Subject):** The creator, close in an office lobby, then full body walking past glass offices, then a lift-mirror selfie.
- **E (Environment):** A modern office lobby, a city street with glass towers, a lift.
- **A (Action):** A look to the lens, then walking, then a mirror pose. A cut every 1–1.3 s.
- **L (Lighting):** Overcast daylight and lobby light, cool-neutral.
- **Ca (Camera):** Handheld phone, wide lens; a mix of a friend filming and selfies.
- **M (Metatokens):** Natural phone video. Title in a white serif with a soft shadow; single-word captions, lower centre.

#### Scenes 4–11 · 3.4–15.7 s · PROMISE + NAME · hard cuts

- **Said:** "…I'm on a mission to help you find tech opportunities you can mention on your CV, with a focus on the ones that are free. Today we've got Outreachy…"
- **On screen:** a big title, "OUTREACHY", landing over a desk shot; then "Fully remote" with a hand-drawn arrow
- **S (Subject):**
  - Architecture: an escalator, a glass atrium, a red bus on a street.
  - The creator at a desk with a laptop.
- **E (Environment):** London offices and streets; a co-working desk by a window over an atrium.
- **A (Action):** Each clip lasts 1–2 s and cuts on phrase starts. The program name lands on the word.
- **L (Lighting):** Daylight, varied.
- **Ca (Camera):** Low angles up escalators; a locked-off desk shot.
- **M (Metatokens):** The big white serif title takes about 15% of the frame height. Handwritten-style annotation.

#### Scenes 12–18 · 15.7–31.2 s · DETAILS · hard cuts

- **Said:** "…you don't need to be a uni student… a $7,000 stipend. This isn't just targeted at software engineers…"
- **On screen:** yellow sticky-note callouts; a white page card, "Work on Open Source"; a text card, "This is NOT just targeted at SOFTWARE ENGINEERS"
- **S (Subject):** Walking clips, a suitcase, two friends in a lift, a hotel bathroom.
- **E (Environment):** Streets, a lift, a hotel.
- **A (Action):** A page card pops over the b-roll on each fact.
- **L (Lighting):** Mixed interiors.
- **Ca (Camera):** Handheld, POV and mirror shots.
- **M (Metatokens):** Facts carried by cards, the picture by lifestyle shots.

#### Scenes 19–23 · 31.2–44.2 s · WHO CAN APPLY · hard cuts

- **Said:** "Now for who can apply… at least 18 and able to commit at least 30 hours a week… applications for the next one opening in August."
- **On screen:** "WHO CAN APPLY?" title; an eligibility text card
- **S (Subject):** A red-brick building, a hotel room, a mirror selfie.
- **E (Environment):** Exterior and hotel.
- **A (Action):** A cut per clause.
- **L (Lighting):** Daylight.
- **Ca (Camera):** Static exteriors, handheld interiors.
- **M (Metatokens):** As above.

#### Scenes 24–28 · 44.2–56.6 s · WHAT TO DO · hard cuts

- **Said:** "So here's what I recommend you do before then. Check out the eligibility… sign up for the mailing list… prepare for the application essay questions…"
- **On screen:** "DO THIS TODAY" (bold caps), then each step as a caption
- **S (Subject):** Food on a café table, the creator spinning on a rooftop, office buildings.
- **E (Environment):** A café, a rooftop, the city.
- **A (Action):** Steps cut on their verbs.
- **L (Lighting):** Bright daylight.
- **Ca (Camera):** Top-down food, a selfie spin.
- **M (Metatokens):** The title in heavier caps than the serif titles.

#### Scenes 29–34 · 56.6–62.3 s · CTA · hard cuts

- **Said:** "Make sure you save this video and send it to someone who's also trying to break into tech, and follow for more tech opportunities."
- **On screen:** word captions
- **S (Subject):** The creator in front of a screen at an event; a city skyline at dusk.
- **E (Environment):** A conference screen; a dusk skyline.
- **A (Action):** A cut on "save", "send", "follow".
- **L (Lighting):** The screen glow, then blue hour.
- **Ca (Camera):** Handheld wide.
- **M (Metatokens):** No end card; it ends on the last word.

### Reference breakdown: @zubayer.hossain470 (11.1×)

https://www.tiktok.com/@zubayer.hossain470/video/7678044906979429664 · 71.2 s · 14 scenes, alternating between two setups. A = the seeker by the window; B = the senior in the chair.

#### Scene 1 · 0.0–7.0 s · HOOK · A

- **Said:** "Proficient in SQL. Well, I've seen production SQL 200 lines and this is something that I've never understood."
- **On screen:** "Proficient in SQL" (white italic on a red box); speech captions in black boxes
- **S (Subject):** A man in a yellow tee at a laptop, side-on, turning to the lens.
- **E (Environment):** Sheer curtains behind; a large badminton-bag graphic leaning at the right.
- **A (Action):** Typing, then a turn to camera, puzzled.
- **L (Lighting):** Soft window daylight from the left, warm room.
- **Ca (Camera):** Phone at desk height, slightly low, locked-off.
- **M (Metatokens):** Natural phone video. The red tag reads like a highlighted job-post phrase.

#### Scene 2 · 7.0–14.0 s · REFRAME · B (hard cut)

- **Said:** "Well, nobody writes all of that lines in one day. Proficient just means like knowing six keywords."
- **On screen:** captions
- **S (Subject):** The same man with glasses, in a black desk chair, holding a wallet.
- **E (Environment):** A white wall with a poster.
- **A (Action):** Calm, explaining gestures.
- **L (Lighting):** Overhead room light, cooler.
- **Ca (Camera):** Straight-on, chest height, locked-off.
- **M (Metatokens):** Glasses, seat and wall tell you it's the "other person".

#### Scenes 3–5 · 14.0–25.0 s · LIST · A / B / A

- **Said:** "Only six?" / "Select, from, where, join, group by, and order by. That's most of the job." / "Ah, that can't be true."
- **On screen:** SELECT / FROM / WHERE / JOIN / GROUP BY / ORDER BY, stacking in black boxes top-centre
- **S (Subject):** The two characters alternating.
- **E (Environment):** Both setups.
- **A (Action):** The keywords stack one per word.
- **L (Lighting):** As each setup.
- **Ca (Camera):** As each setup.
- **M (Metatokens):** White caps on black boxes, left edges aligned.

#### Scenes 6–8 · 25.0–44.2 s · THE REAL WORK · B / A / B

- **Said:** "The actual work is the questions… You translate those questions into keywords." / "…the 200-line monster queries grew over the years, layer by layer…"
- **On screen:** captions
- **S (Subject):** The senior, then the seeker, then the senior.
- **E (Environment):** Both setups.
- **A (Action):** Long explaining takes with hand gestures.
- **L (Lighting):** As each setup.
- **Ca (Camera):** As each setup.
- **M (Metatokens):** As above.

#### Scenes 9–12 · 44.2–65.9 s · PRACTICE + PAYOFF · A / B / A / B

- **Said:** "So how do I practice like it's real work?" / "…grab a sample database, write 10 questions business would ask, answer them in SQL, and put it on your GitHub." / "That's doable and boring." / a closing line about it being ordinary
- **On screen:** captions
- **S (Subject):** Alternating.
- **E (Environment):** Both.
- **A (Action):** A question, a recipe, a reaction, the payoff.
- **L (Lighting):** As each.
- **Ca (Camera):** As each.
- **M (Metatokens):** As above.

#### Scenes 13–14 · 65.9–71.2 s · CLIFFHANGER · A / B

- **Said:** "This one also says strong CS fundamentals, but I don't have a degree." / "Next video."
- **On screen:** captions
- **S (Subject):** The seeker pointing at the laptop; the senior smiling.
- **E (Environment):** Both.
- **A (Action):** A new problem raised, then cut off.
- **L (Lighting):** As each.
- **Ca (Camera):** As each.
- **M (Metatokens):** No end card.

### Reference breakdown: @shreya.knows.data (10.0×)

https://www.tiktok.com/@shreya.knows.data/video/7638031376217853205 · 69.8 s · 14 scenes. The whiteboard take runs underneath; graphic plates cut in over it.

#### Scenes 1–2 · 0.0–3.8 s · HOOK · same shot continues

- **Said:** "Is Microsoft Fabric just the new Power BI? Absolutely not."
- **On screen:** a Microsoft Fabric product card above her head; then a Power BI screenshot; then the "Fabric vs Power BI" logo split; condensed white caps captions
- **S (Subject):** A woman with long dark hair, waist-up, to the right of a whiteboard on an easel titled "Fabric vs Power BI".
- **E (Environment):** A bright room with a plain wall.
- **A (Action):** Writing, then turning to the lens. The cards pop above her.
- **L (Lighting):** Soft frontal daylight, bright and even.
- **Ca (Camera):** Phone on a tripod at chest height, locked-off.
- **M (Metatokens):** Product cards with drop shadows; bold condensed captions with an outline.

#### Scene 3 · 3.8–7.1 s · SPLIT · hard cut

- **Said:** "This is Fabric and this is Power BI."
- **On screen:** two Fabric architecture diagrams, framed in colour
- **S (Subject):** Full-frame diagram cards with her small in the corner.
- **E (Environment):** A dark plate behind the cards.
- **A (Action):** The cards slide in side by side.
- **L (Lighting):** Graphic.
- **Ca (Camera):** Graphic plate.
- **M (Metatokens):** Coloured frames (blue, pink, green) on the cards.

#### Scenes 4–9 · 7.1–28.0 s · LIFE CYCLE · board and grid alternating

- **Said:** "Power BI is a reporting tool and reporting is usually the last step in a data life cycle… some tools bring data in… some store it… tools that transform it like Databricks and dbt… then comes your reporting…"
- **On screen:** big yellow stage words ("Bring DATA in", "TRANSFORM it", "REPORTING"), each with its tool logos
- **S (Subject):** Her at the board, alternating with a full-frame grey grid of words and logos.
- **E (Environment):** The board; a flat light-grey 3×3 grid.
- **A (Action):** A cut to the grid on each stage word; logos pop one per name.
- **L (Lighting):** As the board; the grid is flat.
- **Ca (Camera):** Board locked-off; graphic plates.
- **M (Metatokens):** Yellow condensed caps with an outline; full-colour logos.

#### Scenes 10–12 · 28.0–37.7 s · AI STAGE · board and grid

- **Said:** "And now we also have AI tools like Foundry and LangGraph. So as you can see, Power BI is just one of the tools…"
- **On screen:** "AI TOOLS" with the Azure AI Foundry and LangGraph logos
- **S (Subject):** As above.
- **E (Environment):** As above.
- **A (Action):** As above.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** As above.

#### Scenes 13–14 · 37.7–69.8 s · PAYOFF · same shot continues

- **Said:** "So instead of jumping between four or five tools, we have one place… if you are a Power BI developer, Fabric expands what you can do…"
- **On screen:** the Fabric product card again; at the end, a stacked "FULL STACK DATA PROFESSIONAL" title
- **S (Subject):** Her at the board, talking to the lens.
- **E (Environment):** As Scene 1.
- **A (Action):** One long take of about 30 s with gestures; the title builds at the end.
- **L (Lighting):** As Scene 1.
- **Ca (Camera):** Locked-off.
- **M (Metatokens):** A two-tone stacked title in white and yellow.

### Reference breakdown: @jennytumay (16.8×)

https://www.tiktok.com/@jennytumay/video/7669200559345290527 · 79.5 s · 25 detected cuts, grouped into 6 beats. Screen recording only, with voice.

#### Scenes 1–2 · 0.0–11.5 s · HOOK · hard cuts

- **Said:** "Hey guys, welcome back to Back to Basics. For episode five, where we're going to create a Power BI project file, aka a PBIP…"
- **On screen:** yellow caption boxes ("hey guys", "aka a PBIP"); a quick file-explorer flash
- **S (Subject):** The Fabric web UI showing a semantic model diagram.
- **E (Environment):** A browser on a dark desktop.
- **A (Action):** The cursor idles; a whip transition into File Explorer.
- **L (Lighting):** Screen.
- **Ca (Camera):** A full-screen capture cropped to vertical.
- **M (Metatokens):** Pale yellow rounded caption boxes with dark text, lower third. Other episodes open on a bold yellow title card.

#### Scenes 3–7 · 11.5–31.1 s · CREATE + DOWNLOAD · hard cuts

- **Said:** "From our semantic model, I'm going to click on File, Create New Report… I'm just going to call it School Data Report… download the file and open up the report in Power BI Desktop…"
- **On screen:** a caption box per action
- **S (Subject):** Fabric menus and save dialogs.
- **E (Environment):** Browser UI.
- **A (Action):** A click, then a cut, then the next click. Waits are removed.
- **L (Lighting):** Screen.
- **Ca (Camera):** A crop that follows the cursor.
- **M (Metatokens):** As above.

#### Scenes 8–14 · 31.1–42.8 s · ALTERNATIVE PATH · hard cuts

- **Said:** "You can also just open a blank report in the desktop, click Data, Get Data, Power BI Semantic Models, and select our School Data Semantic Model. I prefer the second method…"
- **On screen:** caption boxes
- **S (Subject):** Power BI Desktop in dark theme; the OneLake catalog.
- **E (Environment):** The desktop app.
- **A (Action):** A menu path click by click.
- **L (Lighting):** Screen.
- **Ca (Camera):** Crop and zoom.
- **M (Metatokens):** As above.

#### Scenes 15–19 · 42.8–55.7 s · SETTINGS · hard cuts

- **Said:** "…make sure we have some preview settings enabled… File, Options and Settings, Preview Features… Power BI Project Save option on. You'll probably have to restart…"
- **On screen:** caption boxes; the checkbox shown
- **S (Subject):** The Options dialog.
- **E (Environment):** Desktop app.
- **A (Action):** Scroll to the checkbox and tick it.
- **L (Lighting):** Screen.
- **Ca (Camera):** Zoom on the dialog.
- **M (Metatokens):** As above.

#### Scenes 20–24 · 55.7–66.4 s · SAVE AS PBIP · hard cuts

- **Said:** "…save as School Data Report, but we're going to select the PBIP file instead for the file type. You can even see up here that it's a Power BI Project file now."
- **On screen:** caption boxes
- **S (Subject):** The Save dialog; the title bar.
- **E (Environment):** Desktop app.
- **A (Action):** Change the file type; point at the title bar.
- **L (Lighting):** Screen.
- **Ca (Camera):** Zoom.
- **M (Metatokens):** As above.

#### Scene 25 · 66.4–79.5 s · PROOF + CLIFFHANGER · same shot continues

- **Said:** "…we've got two files and a folder… Everything stored in plaintext versus one binary file. We all know who loves plaintext, AI. Stay tuned for next steps."
- **On screen:** "ai ❤️" sticker; caption box
- **S (Subject):** File Explorer showing the PBIP folder.
- **E (Environment):** Desktop.
- **A (Action):** Open the folder; the sticker pops.
- **L (Lighting):** Screen.
- **Ca (Camera):** Static.
- **M (Metatokens):** A pixel-style sticker for the punchline.

### Reference breakdown: @romdataanalyst (15.2×)

https://www.tiktok.com/@romdataanalyst/video/7680520215096102164 · 56.1 s · 13 scenes. One talking-head setup; the "cuts" are screenshots popping over it.

#### Scenes 1–3 · 0.0–12.3 s · HOOK · same shot continues

- **Said:** "It took me six months to become a data analyst as a career shifter and here's my exact timeline. On January, I decided to learn data analytics…"
- **On screen:** "HOW I ACTUALLY BECAME A DATA ANALYST"; a reply card, "How long did you study for?"; a screenshot of his earlier "DAY 1" post
- **S (Subject):** A young man in a white tee with glasses, at a laptop, looking up and away.
- **E (Environment):** A plain grey wall, a dim room.
- **A (Action):** Typing, glancing up. His own old post pops in as proof of day 1.
- **L (Lighting):** A soft single key from the front-left, warm, darker background.
- **Ca (Camera):** Phone at desk height, slightly low, locked-off.
- **M (Metatokens):** Bold white caps captions with the key word on a red box. A white reply bubble at the top.

#### Scenes 4–8 · 12.3–22.0 s · MONTH 2 · same shot + pop-overs

- **Said:** "On February, I started taking certifications on DataCamp such as data analyst in SQL, Power BI and Excel while building portfolios."
- **On screen:** a certificates list screenshot; SQL code; a dashboard screenshot stacked on the code
- **S (Subject):** Him, plus the screenshots.
- **E (Environment):** As above.
- **A (Action):** Screenshots pop on the nouns; the dashboard stacks over the code.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** Screenshots at full brightness.

#### Scenes 9–11 · 22.0–33.3 s · MONTH 3 · same shot + pop-over

- **Said:** "March, I started applying in data analyst roles, not just to get hired, but to actually experience the technical assessments and interview questions."
- **On screen:** an email inbox screenshot with highlighted subject lines
- **S (Subject):** As above.
- **E (Environment):** As above.
- **A (Action):** As above.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** As above.

#### Scenes 12–13 · 33.3–56.1 s · MONTHS 4–7 + CLIFFHANGER · same shot

- **Said:** "On April, I enrolled in my master's in business analytics… Then in July, finally, I've been hired… I will show you my portfolio… on my next video."
- **On screen:** a course portal screenshot, then the face alone
- **S (Subject):** As above.
- **E (Environment):** As above.
- **A (Action):** The last screenshot goes, then a long face-only hold to the end.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** No end card.

### Reference breakdown: @yadhirasarmientoe (46.7×)

https://www.tiktok.com/@yadhirasarmientoe/video/7672945855665687829 · 43.5 s · 4 scenes; one take with page cards.

#### Scene 1 · 0.0–2.4 s · HOOK · single take

- **Said:** (Spanish) "The best video to learn Python is from this channel…"
- **On screen:** a reply card, "Responde al comentario de Lorrayne: algún buen video para Python"; captions in condensed white caps with the key word on a red box
- **S (Subject):** A woman with glasses in a striped shirt, close, holding a fluffy lapel mic up to her mouth.
- **E (Environment):** A dark car or room at night with a few soft lights behind.
- **A (Action):** Fast, direct talking.
- **L (Lighting):** A single soft frontal key (screen or ring light), dark falloff, high contrast.
- **Ca (Camera):** Front phone camera at arm's length, eye level, handheld.
- **M (Metatokens):** Raw phone look with slight grain. Reply bubble top-left.

#### Scene 2 · 2.4–17.3 s · PROOF · same take + card

- **Said:** "…it's called Solo Python, a Peruvian guy who years ago, when nobody talked about AI, was already teaching it… most courses are for beginners…"
- **On screen:** the YouTube channel card (name, subscribers, banner) top-right
- **S (Subject):** Her, plus the channel card.
- **E (Environment):** As above.
- **A (Action):** The card pops on "canal" and holds for about 15 s.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** A white card with a drop shadow, overlapping the reply bubble.

#### Scene 3 · 17.3–20.3 s · PROOF 2 · card swap

- **Said:** "…there are ethical hacking and security videos too…"
- **On screen:** the channel's course list (video thumbnails)
- **S (Subject):** As above.
- **E (Environment):** As above.
- **A (Action):** The card swaps to the course list.
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** As above.

#### Scene 4 · 20.3–43.5 s · WHY + CTA · same take, face only

- **Said:** "…his content isn't on the internet, much less in Spanish… he read all the documentation and took the time to structure it… follow me for more content like this."
- **On screen:** captions only
- **S (Subject):** Her, close.
- **E (Environment):** As above.
- **A (Action):** A long talking hold with no cards, ending on "follow".
- **L (Lighting):** As above.
- **Ca (Camera):** As above.
- **M (Metatokens):** No end card.
