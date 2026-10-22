# Hypit: what it is and how we use it (reviewed Oct 22 2026)

[hypit-ai/hypit](https://github.com/hypit-ai/hypit) is an open-source video system for coding agents (Claude Code, Codex).

| | |
| --- | --- |
| Pitch | "Clone any viral video with AI agents" |
| How it works | A reference video becomes an editable composition: footage, captions, B-roll and effects, anchored to *words* instead of seconds |
| Authoring | `.svml` markup, components as npm packages |
| Rendering | Headless Chromium |
| Generation (optional, paid per service) | Seedance / GPT Image / ElevenLabs |
| Alignment | WhisperX |

## Does it fit
- **Runs here:** needs Node ≥ 22.15 (we have 22.22) and pnpm (10.28 installed). Install is `npx skills add hypit-ai/hypit -g`.
- **License:** modified Apache 2.0.
    - **Free for:** our own organisation's videos, including commercial and client work. The output belongs to us.
    - **Needs a commercial licence:** running it as a multi-tenant service, or selling or bundling it. So it can run on our side, but must not become a feature ContentStudio offers to other workspaces.
- **Overlap with what we have:** Editor V1 is also an HTML → MP4 system (HyperFrames + GSAP) with word-anchored beats in `build.py`. Hypit is a bigger, more formal version of the same idea.

## What we took from it now (in Editor V1's `ev1_parker.py`)
From its vertical explainer example (`examples/complex-explainer`: 137 s, presenter + website demos + 8 animated scenes):

1. **Fixed on-screen elements.**
    - A topic plaque with a countdown clock stays top-left from the end of the hook (`pp_timer`). Their "1 minute" promise is the retention device.
    - The presenter circle stays up over graphic scenes, not only over screens (`pp_pip`).
2. **Stage behind every screenshot:** the same material enlarged, blurred and dimmed behind the window (`pp_window(..., stage=True)`, now the default). A 9:16 frame never shows empty ground.

## What to adopt next (worth it once we have real takes)

| Hypit piece | What it would fix for us |
| --- | --- |
| `hypit capture` (browser-capture) | Scripted **screen recordings** of real web pages: navigate, scroll, type, click. Replaces our still captures with moving demos, the biggest gap vs Parker. We can do the same today with Playwright's video recording. |
| WhisperX alignment (`hypit transcribe`) | Aligns the **script** to the **recorded take** word by word, so every cut stays anchored when you re-record a line. Our whisper alignment works for TTS; real takes with retakes need this. |
| Studio comments (`hypit studio`, `FEEDBACK.json`) | You leave **timestamped notes on the picture** ("24 s: this cut is random") and the agent reads and resolves them. Better than describing a moment in chat. |
| Variants ("one workflow, 100 variants") | The same Fabric vs Power BI structure for "Databricks vs Snowflake", "Copilot vs data agents": swap the words and assets, keep the cuts. |
| Caption families (`caption-fine`, karaoke styles) | More caption looks if we want a second style. |

## Recommendation
- **Now:** keep Editor V1 (it already does what we need) and keep borrowing Hypit's layout ideas.
- **When the first real recording exists:** trial Hypit on that one video, using `hypit capture` for the demos and WhisperX for alignment. Compare the result and the editing loop (Studio comments) with Editor V1 before switching.
- **Generation:** its models (AI presenters, AI B-roll) cost per call and aren't needed for this format.
