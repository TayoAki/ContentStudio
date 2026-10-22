# AI talking videos: InfiniteTalk (reviewed Oct 22 2026)

[MeiGen-AI/InfiniteTalk](https://github.com/MeiGen-AI/InfiniteTalk): audio-driven talking video, Apache 2.0. "We claim no rights over your generated contents"; you're accountable for lawful, non-harmful use.

**Two modes:**
- **Image + audio → video:** one photo is animated to speak the audio. Good up to about 1 minute; colour drifts after that.
- **Video + audio → video ("sparse-frame dubbing"):** a real clip is re-performed to new audio. Lips, head, body and expression all follow the audio. Lengths can be unlimited.

## Can we run it
- **Not in this cloud session:** no GPU. The base model is Wan2.1-I2V **14B**, at 480p or 720p.
- **On our own GPU:** low-VRAM and fp8 modes exist (`--num_persistent_param_in_dit 0`, `--quant fp8`), and [Wan2GP](https://github.com/deepbeepmeep/Wan2GP/) wraps it for smaller cards. It's slow, minutes of GPU time per clip.
- **Hosted APIs** (check current prices before use):
    - WaveSpeed lists InfiniteTalk at $0.15 a run, or $0.30 per 5 s at 720p ([WaveSpeed](https://wavespeed.ai/id/infinitetalk-api)). At that rate a 47 s video's presenter is about $3. Its localized pages also show $0.075 starting prices, which conflict.
    - fal prices for it are only reported second-hand ([Kie.ai comparison](https://breakingac.com/news/2025/dec/05/how-to-choose-the-most-cost-effective-infinite-talk-api-the-efficient-solution-provided-by-kieai/)).
- **Newer from the same team:** LongCat-Video-Avatar 1.5 (May 2026): Whisper-Large lip sync, 8-step distillation, steadier long videos. Evaluate it alongside InfiniteTalk.

## How it fits our pipeline
1. **You record one reference clip once:** 30–60 s, talking naturally on camera, good light, same framing as the edit (mid-shot, plain background). This clip is the identity and the body language.
2. **Voice:** your own recorded audio, or a clone of **your** voice made with your consent. The current Piper voice is a stand-in.
3. **Dub:** InfiniteTalk dubs the reference clip to the script audio (video → video), producing a talking-head take per script.
4. **Edit:** that take drops into the existing slots:
    - `pp_talk` (full-frame face shots) already accepts a video;
    - the presenter circle (`pp_pip`) needs one change before it can take a video: the renderer requires videos as top-level clips, so the circle becomes a masked top-level video.
5. **Same timing:** the cuts, captions and Parker pacing stay as they are, because they're anchored to the script's words.

## Rules
- **Only your face** (or a consented, licensed one). The placeholder photo in our examples is someone else. It stays a still placeholder and must never be animated to say our script.
- **Label it.** TikTok, Instagram and YouTube require realistic AI-generated or altered video to be disclosed: use each platform's AI label.
- **Same fact standard as a real take:** the AI presenter says only the checked script.

## Recommendation
Recording yourself is still the best version, and Parker's channel is a real person. InfiniteTalk is worth it for **volume**: one reference clip, then a new talking-head take per script without filming.

**First test:** one 47 s script (Fabric vs Power BI), your reference clip, a hosted API (≈ $3). Compare it side by side with a real take before committing.
