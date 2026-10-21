# Lessons from earlier runs (quiz, fighting games, Microsoft Fabric — Oct 2026)

- **Homonyms swamp keyword search.**
  - "Fabric" → textiles, lake houses and an amp model called DP600H.
  - "Melee" → weapons and Terraria.
  - "Rivals" → Roblox.
  - "Evo France" → French protests.
  Write `--must` before the first run and look at the top 30 rows.
- **Search ignores date filters sometimes.** TikTok returned 2022 posts for "last six months":
  `--since` in discover.py drops them.
- **Trend farmers top the ratios.** Accounts with hashtag-only captions such as
  `#creatorsearchinsights`, or with unrelated hits (a cow fight in a Tekken search), have huge views ÷
  followers. Drop them.
- **Captions hide the format.** "😭😭😭" was a Mortal Kombat juggle with a POV caption. Look at frames
  (clips.py) before naming a mechanic.
- **What gets shared is rarely the mechanic itself.** In fighting games, 20 of the 50 most-shared
  clips had no gameplay at all: a movie, memes, cosplay. The rest were situations (beating a friend,
  trolling) with the mechanic as the punchline.
- **Saves mark reference content.**
  - Certification and quiz posts get 3–6% saves.
  - Fighting-game clips get 0.1–1.3% saves.
  - Choose the CTA to match.
- **Cadence drops kill reach.** Two Fabric accounts lost their reach within a month of slowing from
  about 3–4 posts a week to about 1.
- **Time-bound claims expire.** The Fabric Data Days free-voucher offer closed Aug 10 2026. A script
  saying "free right now" in October would have been false. Check every offer against today's date.
- **Paid promotion inflates views.** A YouTube channel with a 190K median on 64K subscribers was
  probably running ads. Don't model a formula on it.
- **YouTube bot-checks video pages.** Use search and channel listing pages, a few at a time
  (discover.py and history.py only do that).
