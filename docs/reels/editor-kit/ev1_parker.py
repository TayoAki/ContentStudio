"""ev1_parker.py — the "Parker" look: clean explainer graphics on a purple ground.

Studied from Parker Prompts (youtube.com/@parkerprompts, 134K subscribers, Oct 2026): long-form AI-tool
tutorials whose B-roll is one consistent design system, not found footage:
  - a purple radial ground under every graphic beat;
  - a sentence building word by word, centred, white, with the key words in yellow and a soft glow;
  - numbered lists: neon-outlined number badges and outlined pills, built one per word, then one item isolated;
  - "X ≠ Y" contrasts: two tiles with the connector struck through in red;
  - rows of real app icons on dark rounded tiles;
  - flows: icon tiles joined by a dashed line, a step pill landing on each verb;
  - screen material inside a window frame with a title chip (the face cam goes in a ringed circle, top right);
  - a chapter pill "1. NAME" in the lower third, and a pink light flash between sections.
Every device follows the ev1_devices contract (frame-snapped times, explicit z, transforms only, fromTo with
immediateRender:false, its own sound cues). Import after ev1_more:  from ev1_parker import *
"""
from ev1_more import *  # noqa: F401,F403  (Comp, fr, esc, sfx, W, H, CX, CY, VERTICAL, FPS …)

F1_ = 1 / FPS
PP_YEL = '#FFE14D'
PP_EDGE = '#C86BFF'
PP_CSS = f'''
.pp-ground{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;overflow:hidden;
  background:radial-gradient(ellipse 85% 60% at 50% 38%,#8a3cf5 0%,#5a14b8 38%,#2c0861 72%,#16042f 100%)}}
.pp-glow{{position:absolute;width:{round(W * .9)}px;height:{round(W * .9)}px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,120,220,.28),rgba(255,120,220,0) 70%)}}
.pp-text{{position:absolute;left:{round(W * .07)}px;width:{round(W * .86)}px;text-align:center;
  font:700 var(--pp-size,58px)/1.28 var(--ev1-sans);color:#fff;letter-spacing:-0.01em;
  text-shadow:0 0 18px rgba(255,255,255,.35),0 4px 24px rgba(30,0,60,.6)}}
.pp-text .w{{opacity:0;display:inline-block;margin:0 .14em}}
.pp-text .y{{color:{PP_YEL};text-shadow:0 0 22px rgba(255,225,77,.55),0 4px 24px rgba(30,0,60,.6)}}
.pp-badge{{display:inline-flex;align-items:center;justify-content:center;width:var(--pp-b,74px);height:var(--pp-b,74px);
  border:4px solid {PP_EDGE};border-radius:16px;font:800 calc(var(--pp-b,74px)*.55)/1 var(--ev1-sans);color:#fff;
  background:rgba(60,10,120,.55);box-shadow:0 0 18px rgba(200,107,255,.8),inset 0 0 12px rgba(200,107,255,.5)}}
.pp-pill{{display:inline-flex;align-items:center;height:var(--pp-b,74px);padding:0 30px;border:4px solid {PP_EDGE};border-radius:16px;
  font:800 calc(var(--pp-b,74px)*.42)/1 var(--ev1-sans);color:#fff;text-transform:uppercase;letter-spacing:.02em;
  background:rgba(60,10,120,.55);box-shadow:0 0 18px rgba(200,107,255,.8),inset 0 0 12px rgba(200,107,255,.5);white-space:nowrap}}
.pp-tile{{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:var(--pp-t,200px);height:var(--pp-t,200px);
  border-radius:34px;background:linear-gradient(160deg,#2a2a33,#15151b);border:2px solid rgba(255,255,255,.12);
  box-shadow:0 18px 50px rgba(10,0,30,.55),0 0 0 1px rgba(0,0,0,.4)}}
.pp-tile img{{width:52%;height:auto;border-radius:12px}}
.pp-tile span{{font:700 calc(var(--pp-t,200px)*.11)/1.1 var(--ev1-sans);color:#e9e6f2;text-align:center}}
.pp-win{{position:absolute;border-radius:22px;overflow:hidden;background:#1d1d24;border:2px solid rgba(255,255,255,.16);
  box-shadow:0 40px 110px rgba(10,0,30,.7),0 0 40px rgba(200,107,255,.35)}}
.pp-win .bar{{height:52px;background:#2a2a32;display:flex;align-items:center;gap:12px;padding:0 20px;position:relative}}
.pp-win .bar i{{width:16px;height:16px;border-radius:50%;display:block}}
.pp-chip{{position:absolute;left:50%;top:9px;transform:translateX(-50%);padding:6px 22px;border-radius:10px;background:#7b2ff7;
  font:700 22px/1.2 var(--ev1-sans);color:#fff;white-space:nowrap;box-shadow:0 0 16px rgba(123,47,247,.7)}}
.pp-hl{{position:absolute;background:{PP_YEL};mix-blend-mode:multiply;transform-origin:0 50%;border-radius:4px}}
.pp-ring{{position:absolute;border:7px solid {PP_YEL};border-radius:22px;box-shadow:0 0 30px rgba(255,225,77,.65)}}
.pp-chapter{{position:absolute;display:flex;align-items:center;gap:0;height:96px;border-radius:20px;overflow:hidden;
  background:linear-gradient(90deg,#9b4dff,#c86bff);box-shadow:0 0 30px rgba(200,107,255,.8)}}
.pp-chapter b{{display:flex;align-items:center;justify-content:center;width:96px;height:96px;background:#5a14b8;
  font:900 italic 54px/1 var(--ev1-sans);color:#fff}}
.pp-chapter span{{padding:0 34px;font:900 italic 50px/1 var(--ev1-sans);color:#fff;text-transform:uppercase;white-space:nowrap}}
'''


def _css(c):
    css_once(c, 'parker-kit', PP_CSS)


def _full(c, t0, t1, inner, z):
    return c.clip(t0, t1, inner, z, cls='', style=f'position:absolute;left:0;top:0;width:{W}px;height:{H}px')


def pp_ground(c, t0, t1, z=0):
    """the purple ground, with a slow pink glow drifting across it (never a still frame)"""
    _css(c)
    gid = c.uid('ppg')
    cid = _full(c, t0, t1, f'<div class="pp-ground"><div id="{gid}" class="pp-glow" style="left:{-W // 4}px;top:{H // 6}px"></div></div>', z)
    d = fr(t1) - fr(t0)
    c.at(f'tl.fromTo("#{gid}",{{x:0,y:0}},{{x:{W // 2},y:{H // 5},duration:{d:.4f},ease:"none",immediateRender:false}},{fr(t0):.4f});')
    return cid


def pp_text(c, t0, t1, words, z, y=None, size=None, yellow=(), fade=6):
    """a sentence building word by word on its own onsets (white; words in `yellow` — exact text or index — in yellow).
    words = [(text, onset)]. Laid out final so nothing re-centres."""
    _css(c)
    size = size or (66 if VERTICAL else 58)
    y = CY if y is None else y
    spans = []
    for k, (wt, on) in enumerate(words):
        sid = c.uid('ppw')
        cls = 'w y' if (k in yellow or wt.strip('.,:;?!"') in yellow) else 'w'
        spans.append(f'<span id="{sid}" class="{cls}">{esc(wt)}</span>')
        tt = max(fr(t0), fr(on))
        c.at(f'tl.fromTo("#{sid}",{{opacity:0,y:10,filter:"blur(6px)"}},{{opacity:1,y:0,filter:"blur(0px)",duration:{fade * F1_:.4f},ease:"power2.out",immediateRender:false}},{tt:.4f});')
    _full(c, t0, t1, f'<div class="pp-text" style="--pp-size:{size}px;top:{y}px;transform:translateY(-50%)">{"".join(spans)}</div>', z)


def pp_icons(c, t0, t1, icons, z, y=None, tile=None, gap=34):
    """a row of real app icons on dark tiles, each rising in on its word. icons = [(src, label, t_in)]"""
    _css(c)
    tile = tile or (210 if VERTICAL else 190)
    y = CY if y is None else y
    n = len(icons); tw = n * tile + (n - 1) * gap
    x0 = (W - tw) // 2
    parts = []
    for k, (src, label, t_in) in enumerate(icons):
        iid = c.uid('ppi')
        lab = f'<span>{esc(label)}</span>' if label else ''
        parts.append(f'<div id="{iid}" class="pp-tile" style="--pp-t:{tile}px;position:absolute;left:{x0 + k * (tile + gap)}px;top:{y - tile // 2}px;opacity:0">'
                     f'<img src="{src}">{lab}</div>')
        c.at(f'tl.fromTo("#{iid}",{{opacity:0,y:40,scale:.9}},{{opacity:1,y:0,scale:1,duration:{6 * F1_:.4f},ease:"back.out(1.6)",immediateRender:false}},{fr(t_in):.4f});')
        sfx(c, t_in, 'click_soft')
    _full(c, t0, t1, ''.join(parts), z)


def pp_vs(c, t0, t1, a, b, t_strike, z, y=None, joiner='vs', tile=None):
    """the "AI ≠ ChatGPT" contrast: two tiles and a joiner word between, struck through in red on `t_strike`.
    a / b = (src, label, t_in)"""
    _css(c)
    tile = tile or (250 if VERTICAL else 230)
    y = CY if y is None else y
    jw = 200
    tw = 2 * tile + jw; x0 = (W - tw) // 2
    ids = []
    parts = []
    for k, (src, label, t_in) in enumerate((a, b)):
        iid = c.uid('ppv'); ids.append(iid)
        x = x0 if k == 0 else x0 + tile + jw
        parts.append(f'<div id="{iid}" class="pp-tile" style="--pp-t:{tile}px;position:absolute;left:{x}px;top:{y - tile // 2}px;opacity:0">'
                     f'<img src="{src}"><span>{esc(label)}</span></div>')
        c.at(f'tl.fromTo("#{iid}",{{opacity:0,scale:.85}},{{opacity:1,scale:1,duration:{6 * F1_:.4f},ease:"back.out(1.6)",immediateRender:false}},{fr(t_in):.4f});')
        sfx(c, t_in, 'click_soft')
    jid, sid = c.uid('ppj'), c.uid('pps')
    parts.append(f'<div id="{jid}" style="position:absolute;left:{x0 + tile}px;top:{y}px;width:{jw}px;text-align:center;transform:translateY(-50%);'
                 f'font:900 96px/1 var(--ev1-sans);color:#fff;text-shadow:0 0 20px rgba(255,255,255,.5);opacity:0">{esc(joiner)}'
                 f'<div id="{sid}" style="position:absolute;left:12px;right:12px;top:50%;height:14px;margin-top:-7px;background:#FF2D55;border-radius:7px;'
                 f'transform:rotate(-24deg) scaleX(0);transform-origin:0 50%;box-shadow:0 0 18px rgba(255,45,85,.8)"></div></div>')
    c.at(f'tl.fromTo("#{jid}",{{opacity:0}},{{opacity:1,duration:{4 * F1_:.4f},immediateRender:false}},{fr(max(a[2], b[2])):.4f});')
    c.at(f'tl.fromTo("#{sid}",{{scaleX:0,rotation:-24}},{{scaleX:1,rotation:-24,duration:{5 * F1_:.4f},ease:"power2.out",immediateRender:false}},{fr(t_strike):.4f});')
    sfx(c, t_strike, 'hit')
    _full(c, t0, t1, ''.join(parts), z)


def pp_list(c, t0, t1, items, z, y=None, badge=None, focus=None):
    """numbered list: neon number badge + outlined pill per item, each landing on its word.
    items = [(text, t_in)]; focus = (index, t) isolates that item and slides it to the centre."""
    _css(c)
    badge = badge or (92 if VERTICAL else 74)
    gap = round(badge * .55)
    y = CY if y is None else y
    n = len(items); th = n * badge + (n - 1) * gap
    top = y - th // 2
    left = round(W * (.12 if VERTICAL else .32))
    rows = []
    for k, (txt, t_in) in enumerate(items):
        rid = c.uid('ppl')
        rows.append(f'<div id="{rid}" style="position:absolute;left:{left}px;top:{top + k * (badge + gap)}px;display:flex;gap:22px;align-items:center;opacity:0">'
                    f'<div class="pp-badge" style="--pp-b:{badge}px">{k + 1}</div><div class="pp-pill" style="--pp-b:{badge}px">{esc(txt)}</div></div>')
        c.at(f'tl.fromTo("#{rid}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:{5 * F1_:.4f},ease:"power2.out",immediateRender:false}},{fr(t_in):.4f});')
        sfx(c, t_in, 'click')
        if focus and k != focus[0]:
            c.at(f'tl.to("#{rid}",{{opacity:0,duration:{5 * F1_:.4f}}},{fr(focus[1]):.4f});')
        elif focus:
            dy = y - badge // 2 - (top + k * (badge + gap))
            c.at(f'tl.to("#{rid}",{{y:{dy},scale:1.2,duration:{8 * F1_:.4f},ease:"power2.inOut"}},{fr(focus[1]):.4f});')
    _full(c, t0, t1, ''.join(rows), z)


def pp_window(c, t0, t1, src, z, title='', img_w=None, marks=(), rings=(), scroll=None, width=None, y=None, pad=0, bg='#fff'):
    """real screen material in a window frame with a purple title chip, rising in. img_w = the capture's pixel width
    (to scale marks); marks = [(boxes px, t)] highlighter (light pages), rings = [(box px, t)] outline (dark images);
    scroll = (from_px, to_px) pans a tall capture inside a viewport of `view_h` px."""
    _css(c)
    width = width or (W - 90 if VERTICAL else round(W * .7))
    y = CY if y is None else y
    s = (width - 2 * pad) / (img_w or width)
    wid, cid = c.uid('ppwin'), c.uid('ppwc')
    mk = []
    for boxes, tm in marks:
        for j, (x, yy, w, h) in enumerate(boxes):
            mid = c.uid('pph')
            mk.append(f'<div id="{mid}" class="pp-hl" style="left:{x * s:.0f}px;top:{yy * s:.0f}px;width:{w * s:.0f}px;height:{h * s:.0f}px"></div>')
            c.pre.append(f'gsap.set("#{mid}",{{scaleX:0}});')
            c.at(f'tl.fromTo("#{mid}",{{scaleX:0}},{{scaleX:1,duration:{5 * F1_:.4f},ease:"power2.out",immediateRender:false}},{fr(tm) + j * 5 * F1_:.4f});')
        sfx(c, tm, 'click_soft')
    for (x, yy, w, h), tm in rings:
        rid = c.uid('ppr')
        mk.append(f'<div id="{rid}" class="pp-ring" style="left:{x * s - 8:.0f}px;top:{yy * s - 8:.0f}px;width:{w * s + 16:.0f}px;height:{h * s + 16:.0f}px;opacity:0"></div>')
        c.at(f'tl.fromTo("#{rid}",{{opacity:0,scale:1.3}},{{opacity:1,scale:1,duration:{5 * F1_:.4f},ease:"power2.out",immediateRender:false}},{fr(tm):.4f});')
        sfx(c, tm, 'click_soft')
    view = ''
    if scroll:
        view = f'height:{scroll[2]}px;overflow:hidden;'
    chip = f'<div class="pp-chip">{esc(title)}</div>' if title else ''
    inner = (f'<div id="{wid}" class="pp-win" style="left:{(W - width) // 2}px;top:{y}px;width:{width}px;transform:translateY(-50%)">'
             f'<div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>{chip}</div>'
             f'<div style="position:relative;{view}background:{bg if pad else 'transparent'};padding:{pad}px"><div id="{cid}" style="position:relative"><img src="{src}" style="display:block;width:100%">{"".join(mk)}</div></div></div>')
    _full(c, t0, t1, inner, z)
    c.pre.append(f'gsap.set("#{wid}",{{opacity:0}});')
    c.at(f'tl.fromTo("#{wid}",{{opacity:0,scale:.92,y:60}},{{opacity:1,scale:1,y:0,duration:{8 * F1_:.4f},ease:"power3.out",immediateRender:false}},{fr(t0):.4f});')
    c.at(f'tl.fromTo("#{wid}",{{scale:1}},{{scale:1.035,duration:{fr(t1) - fr(t0) - 8 * F1_:.4f},ease:"none",immediateRender:false}},{fr(t0) + 8 * F1_:.4f});')
    if scroll:
        c.at(f'tl.fromTo("#{cid}",{{y:{-scroll[0] * s:.0f}}},{{y:{-scroll[1] * s:.0f},duration:{fr(t1) - fr(t0):.4f},ease:"power1.inOut",immediateRender:false}},{fr(t0):.4f});')
    sfx(c, t0, 'swish', 0.8)
    return wid


def pp_flow(c, t0, t1, nodes, z, x=None, top=None, tile=None, gap=None):
    """a flow: icon tiles stacked (9:16) or in a row (16:9) joined by a dashed line; on each step the node lights up and
    its step pill slides out beside it. nodes = [(src, step_text, t)]"""
    _css(c)
    tile = tile or (180 if VERTICAL else 170)
    n = len(nodes)
    parts = []
    if VERTICAL:
        gap = gap or 120
        th = n * tile + (n - 1) * gap
        top = top if top is not None else CY - th // 2
        x = x if x is not None else round(W * .12)
        parts.append(f'<div style="position:absolute;left:{x + tile // 2 - 3}px;top:{top + tile // 2}px;width:0;height:{th - tile}px;border-left:6px dashed rgba(255,255,255,.55)"></div>')
        pos = [(x, top + k * (tile + gap)) for k in range(n)]
    else:
        gap = gap or 160
        tw = n * tile + (n - 1) * gap
        x = (W - tw) // 2; top = top if top is not None else CY - tile
        parts.append(f'<div style="position:absolute;left:{x + tile // 2}px;top:{top + tile // 2 - 3}px;width:{tw - tile}px;height:0;border-top:6px dashed rgba(255,255,255,.55)"></div>')
        pos = [(x + k * (tile + gap), top) for k in range(n)]
    for (src, step, tm), (px, py) in zip(nodes, pos):
        nid, pid = c.uid('ppn'), c.uid('ppp')
        parts.append(f'<div id="{nid}" class="pp-tile" style="--pp-t:{tile}px;position:absolute;left:{px}px;top:{py}px"><img src="{src}"></div>')
        if VERTICAL:
            pl = f'left:{px + tile + 36}px;top:{py + tile // 2}px;transform:translateY(-50%)'
        else:
            pl = f'left:{px + tile // 2}px;top:{py + tile + 40}px;transform:translateX(-50%)'
        parts.append(f'<div id="{pid}" style="position:absolute;{pl}"><div class="pp-pill" style="--pp-b:86px;opacity:0">{esc(step)}</div></div>')
        c.at(f'tl.to("#{nid}",{{boxShadow:"0 0 0 5px {PP_YEL}, 0 0 46px rgba(255,225,77,.7)",duration:{4 * F1_:.4f}}},{fr(tm):.4f});')
        c.at(f'tl.fromTo("#{pid} .pp-pill",{{opacity:0,x:-30}},{{opacity:1,x:0,duration:{5 * F1_:.4f},ease:"power2.out",immediateRender:false}},{fr(tm):.4f});')
        sfx(c, tm, 'click')
    _full(c, t0, t1, ''.join(parts), z)


def pp_chapter(c, t0, t1, n, text, z, y=None):
    """the chapter pill: a number box and the name, sliding in from the left"""
    _css(c)
    y = round(H * (.70 if VERTICAL else .78)) if y is None else y
    pid = c.uid('ppc')
    _full(c, t0, t1, f'<div id="{pid}" class="pp-chapter" style="left:{round(W * .08)}px;top:{y}px"><b>{n}{"." if isinstance(n, int) else ""}</b><span>{esc(text)}</span></div>', z)
    c.at(f'tl.fromTo("#{pid}",{{x:-80,opacity:0}},{{x:0,opacity:1,duration:{6 * F1_:.4f},ease:"power3.out",immediateRender:false}},{fr(t0):.4f});')
    sfx(c, t0, 'swish', 0.8)


def pp_flash(c, t, z=90, frames_n=8):
    """the pink light flash between sections"""
    _css(c)
    fid = c.uid('ppf')
    _full(c, t - 3 * F1_, t + frames_n * F1_, f'<div id="{fid}" style="position:absolute;left:0;top:0;width:{W}px;height:{H}px;opacity:0;'
                                              f'background:radial-gradient(ellipse at 30% 40%,rgba(255,150,230,.95),rgba(170,60,255,.55) 45%,rgba(120,20,220,0) 80%)"></div>', z)
    c.at(f'tl.fromTo("#{fid}",{{opacity:0}},{{opacity:1,duration:{3 * F1_:.4f},immediateRender:false}},{fr(t) - 3 * F1_:.4f});'
         f'tl.to("#{fid}",{{opacity:0,duration:{frames_n * F1_:.4f}}},{fr(t):.4f});')
    sfx(c, t, 'swish', 0.6)


def pp_captions(c, words, t_end, z=60, y=None, yellow=(), size=None):
    """the small caption under screen beats: white, key words yellow (a pp_text at the bottom)"""
    pp_text(c, words[0][1], t_end, words, z, y=y or round(H * (.80 if VERTICAL else .88)), size=size or (46 if VERTICAL else 40), yellow=yellow, fade=3)
