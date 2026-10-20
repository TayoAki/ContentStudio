"""Render quiz and SQL-puzzle reels from docs/reels/REEL_SPEC.md.

Every layout value comes from the spec (measured at 720 wide, x1.5 here).

  python3 scripts/reels/render.py scripts/reels/week1.json out/ [--only ID] [--bg ID=face.mp4]

Per reel it writes <id>.mp4 (overlay on --bg footage, or on a plain preview
background) and, with --overlay, <id>_overlay.mov (QuickTime Animation with alpha,
to drop over your own face-cam in CapCut / Edits). Fonts: run scripts/reels/fetch_fonts.sh first.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
FPS = 30
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
EMOJI_FONT = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

# Format A: score quiz (@your.bummy.quizzes)
PILL_RED = (0xE8, 0x3C, 0x40, 255)
TEXT_WHITE = (0xFC, 0xFC, 0xFC, 255)
PILL_SIZE, PILL_PAD_X, PILL_PAD_Y, PILL_RADIUS, PILL_PITCH, PILL_TOP = 63, 27, 18, 12, 80, 249
PILL_MAX_W = 860
LIST_X, LIST_GAP, LIST_SIZE, LIST_STROKE, LIST_MAX_W, LIST_MIN = 129, 63, 60, 4, 760, 46  # list cap top sits 63 px under the pill
LIST_PITCH = {8: 92, 5: 98}
Q_TOP, Q_SIZE, Q_PITCH, Q_MAX_W, Q_STROKE = 1380, 58, 75, 860, 3
TIMING = {  # hook, per question, answer lands at
    8: (4.5, 7.0, 6.25),
    5: (4.0, 6.0, 5.4),
}

# Format B: SQL puzzle (@d3ven.codes)
SQL_LEN, SQL_CTA_AT = 12.0, 4.0
HOOK_SIZE, HOOK_TOP, HOOK_PITCH = 60, 210, 87
PANEL_X0, PANEL_X1, PANEL_TOP, PANEL_PAD = 51, 1035, 600, 25
CODE_SIZE, CODE_X, LINENO_RIGHT, CODE_PITCH = 48, 300, 188, 85
PANEL_BG = (0x00, 0x04, 0x04, 255)
KW = (0xF8, 0x84, 0xF8, 255)
PUNCT = (0xF8, 0xE0, 0x30, 255)
IDENT = (0xF4, 0xF4, 0xF0, 255)
LINENO = (0x8A, 0x8A, 0x8A, 255)
COMMENT = (0x8A, 0x8A, 0x8A, 255)  # not in the reference; reuses the line-number grey
TRICK = (0xE0, 0xC8, 0x50, 255)
HINT_Y = 1320
KEYWORDS = {
    "SELECT", "FROM", "WHERE", "NOT", "IN", "AND", "OR", "JOIN", "LEFT", "INNER", "ON", "AS",
    "ORDER", "BY", "GROUP", "HAVING", "IS", "NULL", "EXISTS", "CAST", "INT", "COUNT", "AVG",
    "SUM", "COALESCE", "DISTINCT",
}


def font(name, size):
    path = os.path.join(FONTS, name + ".ttf")
    if not os.path.exists(path):
        sys.exit(f"missing {path}: run scripts/reels/fetch_fonts.sh")
    return ImageFont.truetype(path, size)


def wrap(text, f, max_w):
    """Greedy wrap, then narrowed until just before it needs another line, so lines come out even."""
    lines = greedy_wrap(text, f, max_w)
    while max_w > 100:
        tighter = greedy_wrap(text, f, max_w - 10)
        if len(tighter) > len(lines):
            break
        lines, max_w = tighter, max_w - 10
    return lines


def greedy_wrap(text, f, max_w):
    lines, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if cur and f.getlength(trial) > max_w:
            lines.append(cur)
            cur = word
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return lines


def blank():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


# ---------- Format A ----------

def typographic(text):
    return text.replace("'", "\u2019")


def draw_pill(img, text):
    """Draws the hook and returns the y of its bottom edge."""
    d = ImageDraw.Draw(img)
    text = typographic(text)
    f = font("TikTokSans-500", PILL_SIZE)
    lines = wrap(text, f, PILL_MAX_W - 2 * PILL_PAD_X)
    asc = f.getbbox("A")[1]
    for i, line in enumerate(lines):
        w = f.getlength(line)
        top = PILL_TOP + i * PILL_PITCH
        x0 = (W - w) / 2 - PILL_PAD_X
        # Boxes of neighbouring lines touch; the first is taller by the top pad.
        y0 = top if i == 0 else top + 2
        y1 = PILL_TOP + (i + 1) * PILL_PITCH + (PILL_PAD_Y if i == len(lines) - 1 else 2)
        d.rounded_rectangle([x0, y0, x0 + w + 2 * PILL_PAD_X, y1], PILL_RADIUS, fill=PILL_RED)
        d.text(((W - w) / 2, top + PILL_PAD_Y - asc + 4), line, font=f, fill=TEXT_WHITE)
    return y1


def fit(text, name, size, max_w, min_size=24):
    f = font(name, size)
    while f.getlength(text) > max_w and size > min_size:
        size -= 2
        f = font(name, size)
    return f


def draw_list(img, n, answers, top):
    d = ImageDraw.Draw(img)
    pitch = LIST_PITCH[n]
    answers = [typographic(a) for a in answers]
    for i in range(n):
        text = f"{i + 1}. " + (answers[i] if i < len(answers) else "")
        f = fit(text, "TikTokSans-500", LIST_SIZE, LIST_MAX_W, LIST_MIN)
        num = font("TikTokSans-500", LIST_SIZE)
        y = top + num.getbbox("1")[3] - num.getbbox("1")[1] + i * pitch  # baseline
        prefix = f"{i + 1}. "
        d.text((LIST_X, y), prefix, font=num, fill=TEXT_WHITE, stroke_width=LIST_STROKE, stroke_fill=(0, 0, 0, 255), anchor="ls")
        if i < len(answers):
            d.text((LIST_X + num.getlength(prefix), y), answers[i], font=f, fill=TEXT_WHITE,
                   stroke_width=LIST_STROKE, stroke_fill=(0, 0, 0, 255), anchor="ls")


def draw_question(img, text):
    d = ImageDraw.Draw(img)
    f = font("TikTokSans-500", Q_SIZE)
    for i, line in enumerate(wrap(typographic(text), f, Q_MAX_W)):
        d.text((W / 2, Q_TOP + i * Q_PITCH), line, font=f, fill=TEXT_WHITE, anchor="ma",
               stroke_width=Q_STROKE, stroke_fill=(0, 0, 0, 255))


def quiz_states(reel):
    qs = reel["questions"]
    n = len(qs)
    if n not in TIMING:
        sys.exit(f"{reel['id']}: {n} questions; the spec only measured {sorted(TIMING)}")
    hook, per_q, answer_at = TIMING[n]
    shorts = [q.get("short", q["a"]) for q in qs]
    states = []

    def frame(question, answered):
        img = blank()
        pill_bottom = draw_pill(img, reel["hook"])
        draw_list(img, n, shorts[:answered], pill_bottom + LIST_GAP)
        if question is not None:
            draw_question(img, question)
        return img

    states.append((frame(None, 0), hook))
    for i, q in enumerate(qs):
        last = i == n - 1
        states.append((frame(q["q"], i), answer_at))
        # The last answer lands and the reel cuts ~0.75 s later so it loops.
        states.append((frame(q["q"], i + 1), 0.75 if last else per_q - answer_at))
    return states


# ---------- Format B ----------

TOKEN = re.compile(r"(--[^\n]*)|('[^']*')|([A-Za-z_][A-Za-z_0-9.]*)|(\s+)|(.)")


def code_tokens(line):
    for m in TOKEN.finditer(line):
        comment, string, word, space, other = m.groups()
        if comment:
            yield comment, COMMENT
        elif string:
            yield string, PUNCT  # strings: not in the reference, shown yellow like punctuation
        elif word:
            yield word, KW if word.upper() in KEYWORDS else IDENT
        elif space:
            yield space, IDENT
        else:
            yield other, PUNCT if other in "();," else IDENT


def shadow_text(img, xy, text, f, anchor="ma"):
    layer = blank()
    ImageDraw.Draw(layer).text((xy[0] + 2, xy[1] + 3), text, font=f, fill=(0, 0, 0, 153), anchor=anchor)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(3)))
    ImageDraw.Draw(img).text(xy, text, font=f, fill=(255, 255, 255, 255), anchor=anchor, embedded_color=True)


def draw_line_with_emoji(img, y, text, f):
    """Centred text where a trailing emoji is drawn from Noto Color Emoji."""
    m = re.match(r"^(.*?)\s*([\U0001F300-\U0001FAFF])$", text)
    if not m:
        shadow_text(img, (W / 2, y), text, f)
        return
    body, emoji = m.groups()
    e_img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(e_img).text((0, 0), emoji, font=ImageFont.truetype(EMOJI_FONT, 109), embedded_color=True)
    e_img = e_img.crop(e_img.getbbox())
    size = int(f.size * 0.95)
    e_img = e_img.resize((size, size), Image.LANCZOS)
    gap = f.size * 0.25
    total = f.getlength(body) + gap + size
    x = (W - total) / 2
    shadow_text(img, (x, y), body, f, anchor="la")
    img.alpha_composite(e_img, (int(x + f.getlength(body) + gap), int(y + f.size * 0.05)))


def sql_frame(reel, bottom_line):
    img = blank()
    hook_f = font("TikTokSans-Cond-600", HOOK_SIZE)
    y = HOOK_TOP
    for block_i, block in enumerate(reel["hook"]):
        if block_i:
            y += HOOK_PITCH * 0.6  # blank line between the two hook blocks
        for line in wrap(block, hook_f, 900):
            shadow_text(img, (W / 2, y), line, hook_f)
            y += HOOK_PITCH
    code = reel["code"].split("\n")
    top = max(PANEL_TOP, int(y + 40))
    d = ImageDraw.Draw(img)
    d.rectangle([PANEL_X0, top, PANEL_X1, top + len(code) * CODE_PITCH + 2 * PANEL_PAD], fill=PANEL_BG)
    mono = font("JetBrainsMono-400", CODE_SIZE)
    code_x = CODE_X
    widest = max(mono.getlength(l) for l in code)
    if code_x + widest > PANEL_X1 - 30:  # long lines: shrink to fit the panel
        size = int(CODE_SIZE * (PANEL_X1 - 30 - code_x) / widest)
        if size < 40:
            sys.exit(f"{reel['id']}: a code line is too long for the panel; break it (max ~28 chars)")
        mono = font("JetBrainsMono-400", size)
    for i, line in enumerate(code):
        base = top + PANEL_PAD + i * CODE_PITCH + CODE_PITCH * 0.7
        d.text((LINENO_RIGHT, base), str(i + 1), font=font("JetBrainsMono-400", CODE_SIZE), fill=LINENO, anchor="rs")
        x = code_x
        for tok, color in code_tokens(line):
            d.text((x, base), tok, font=mono, fill=color, anchor="ls")
            x += mono.getlength(tok)
    for t in reel.get("trick", []):
        line, needle = t["line"] - 1, t["text"]
        start = code[line].find(needle)
        if start < 0:
            sys.exit(f"{reel['id']}: trick text {needle!r} not on line {t['line']}")
        x0 = code_x + mono.getlength(code[line][:start]) - 6
        x1 = code_x + mono.getlength(code[line][: start + len(needle)]) + 6
        base = top + PANEL_PAD + line * CODE_PITCH + CODE_PITCH * 0.7
        d.rectangle([x0, base - mono.size * 0.95, x1, base + mono.size * 0.35], outline=TRICK, width=3)
    draw_line_with_emoji(img, max(HINT_Y, top + len(code) * CODE_PITCH + 2 * PANEL_PAD + 150),
                         bottom_line, font("TikTokSans-Cond-600", HOOK_SIZE))
    return img


def sql_states(reel):
    return [
        (sql_frame(reel, reel["hint"]), SQL_CTA_AT),
        (sql_frame(reel, "Comment your answer 👇"), SQL_LEN - SQL_CTA_AT),
    ]


# ---------- encode ----------

def encode(states, out_mp4, out_mov=None, bg=None, audio=None):
    with tempfile.TemporaryDirectory() as tmp:
        lst = os.path.join(tmp, "list.txt")
        with open(lst, "w") as fh:
            for i, (img, dur) in enumerate(states):
                p = os.path.join(tmp, f"s{i:03d}.png")
                img.save(p)
                fh.write(f"file '{p}'\nduration {dur:.3f}\n")
            fh.write(f"file '{p}'\n")  # concat demuxer needs the last file twice
        total = sum(d for _, d in states)
        overlay = ["-f", "concat", "-safe", "0", "-i", lst]
        if out_mov:  # QuickTime Animation keeps alpha and costs almost nothing on static frames
            subprocess.run(["ffmpeg", "-v", "error", "-y", *overlay, "-t", f"{total:.3f}", "-r", str(FPS),
                            "-c:v", "qtrle", "-pix_fmt", "argb", out_mov], check=True)
        if bg:
            bg_in = ["-stream_loop", "-1", "-i", bg]
            bg_chain = f"[1:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}[bg]"
        else:
            # Preview only: plain warm wall tone. The real format needs your face-cam (--bg).
            bg_in = ["-f", "lavfi", "-i", f"color=c=0x3a3530:s={W}x{H}:r={FPS}"]
            bg_chain = f"[1:v]vignette=PI/4,fps={FPS}[bg]"
        audio_in, amap = [], []
        if audio:
            audio_in, amap = ["-i", audio], ["-map", "2:a", "-c:a", "aac", "-b:a", "128k"]
        elif bg:
            amap = ["-map", "1:a?", "-c:a", "aac", "-b:a", "128k"]
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", *overlay, *bg_in, *audio_in,
            "-filter_complex", f"{bg_chain};[0:v]fps={FPS},format=rgba[ov];[bg][ov]overlay=0:0:format=auto[v]",
            "-map", "[v]", *amap, "-t", f"{total:.3f}",
            "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            out_mp4,
        ], check=True)
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan")
    ap.add_argument("out")
    ap.add_argument("--only", action="append")
    ap.add_argument("--bg", action="append", default=[], help="ID=footage.mp4")
    ap.add_argument("--audio", action="append", default=[], help="ID=track.m4a")
    ap.add_argument("--stills", action="store_true", help="also save one PNG per state")
    ap.add_argument("--overlay", action="store_true", help="also write <id>_overlay.mov with alpha")
    args = ap.parse_args()
    bgs = dict(s.split("=", 1) for s in args.bg)
    audios = dict(s.split("=", 1) for s in args.audio)
    os.makedirs(args.out, exist_ok=True)
    with open(args.plan) as fh:
        reels = json.load(fh)["reels"]
    for reel in reels:
        if args.only and reel["id"] not in args.only:
            continue
        states = quiz_states(reel) if reel["format"] == "quiz" else sql_states(reel)
        if args.stills:
            for i, (img, _) in enumerate(states):
                img.save(os.path.join(args.out, f"{reel['id']}_state{i:02d}.png"))
        base = os.path.join(args.out, reel["id"])
        total = encode(states, base + ".mp4", base + "_overlay.mov" if args.overlay else None,
                       bgs.get(reel["id"]), audios.get(reel["id"]))
        print(f"{reel['id']}: {total:.1f}s -> {base}.mp4")


if __name__ == "__main__":
    main()
