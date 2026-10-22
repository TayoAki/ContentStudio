"""ev1_parker.py — the "Parker" look: clean explainer graphics on a purple ground.

Studied from Parker Prompts (colours: THEMES; ours is blue, theirs purple) (youtube.com/@parkerprompts, 134K subscribers, Oct 2026): long-form AI-tool
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
import os
from ev1_more import *  # noqa: F401,F403  (Comp, fr, esc, sfx, W, H, CX, CY, VERTICAL, FPS …)

F1_ = 1 / FPS
PP_YEL = '#FFE14D'
THEMES = {
    # the reference's purple
    'purple': dict(g0='#8a3cf5', g1='#5a14b8', g2='#2c0861', g3='#16042f', glow='rgba(255,120,220,.28)', shade='rgba(30,0,60,.6)',
                   edge='#C86BFF', edge_glow='rgba(200,107,255,.8)', fill='rgba(60,10,120,.55)', chip='#7b2ff7',
                   chap0='#9b4dff', chap1='#c86bff', chapb='#5a14b8', fl0='rgba(255,150,230,.95)', fl1='rgba(170,60,255,.55)'),
    # ours (default): the same system in blue
    'blue': dict(g0='#2f86ff', g1='#1448c4', g2='#0a2266', g3='#040c26', glow='rgba(90,210,255,.30)', shade='rgba(0,12,45,.6)',
                 edge='#5AB8FF', edge_glow='rgba(90,184,255,.8)', fill='rgba(10,45,130,.55)', chip='#1f6bff',
                 chap0='#2f7bff', chap1='#5ab8ff', chapb='#0b3aa8', fl0='rgba(160,225,255,.95)', fl1='rgba(40,120,255,.55)'),
}
T = THEMES[os.environ.get('PP_THEME', 'blue')]
PP_EDGE = T['edge']
PP_CSS = f'''
.pp-ground{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;overflow:hidden;
  background:radial-gradient(ellipse 85% 60% at 50% 38%,{T['g0']} 0%,{T['g1']} 38%,{T['g2']} 72%,{T['g3']} 100%)}}
.pp-glow{{position:absolute;width:{round(W * .9)}px;height:{round(W * .9)}px;border-radius:50%;
  background:radial-gradient(circle,{T['glow']},rgba(0,0,0,0) 70%)}}
.pp-text{{position:absolute;left:{round(W * .07)}px;width:{round(W * .86)}px;text-align:center;
  font:700 var(--pp-size,58px)/1.28 var(--ev1-sans);color:#fff;letter-spacing:-0.01em;
  text-shadow:0 0 18px rgba(255,255,255,.35),0 4px 24px {T['shade']}}}
.pp-text .w{{opacity:0;display:inline-block;margin:0 .14em}}
.pp-text .y{{color:{PP_YEL};text-shadow:0 0 22px rgba(255,225,77,.55),0 4px 24px {T['shade']}}}
.pp-badge{{display:inline-flex;align-items:center;justify-content:center;width:var(--pp-b,74px);height:var(--pp-b,74px);
  border:4px solid {PP_EDGE};border-radius:16px;font:800 calc(var(--pp-b,74px)*.55)/1 var(--ev1-sans);color:#fff;
  background:{T['fill']};box-shadow:0 0 18px {T['edge_glow']},inset 0 0 12px {T['edge_glow']}}}
.pp-pill{{display:inline-flex;align-items:center;height:var(--pp-b,74px);padding:0 30px;border:4px solid {PP_EDGE};border-radius:16px;
  font:800 calc(var(--pp-b,74px)*.42)/1 var(--ev1-sans);color:#fff;text-transform:uppercase;letter-spacing:.02em;
  background:{T['fill']};box-shadow:0 0 18px {T['edge_glow']},inset 0 0 12px {T['edge_glow']};white-space:nowrap}}
.pp-tile{{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:var(--pp-t,200px);height:var(--pp-t,200px);
  border-radius:34px;background:linear-gradient(160deg,#2a2a33,#15151b);border:2px solid rgba(255,255,255,.12);
  box-shadow:0 18px 50px {T['shade']},0 0 0 1px rgba(0,0,0,.4)}}
.pp-tile img{{width:52%;height:auto;border-radius:12px}}
.pp-tile span{{font:700 calc(var(--pp-t,200px)*.11)/1.1 var(--ev1-sans);color:#e9e6f2;text-align:center}}
.pp-win{{position:absolute;border-radius:22px;overflow:hidden;background:#1d1d24;border:2px solid rgba(255,255,255,.16);
  box-shadow:0 40px 110px {T['shade']},0 0 40px {T['edge_glow']}}}
.pp-win .bar{{height:52px;background:#2a2a32;display:flex;align-items:center;gap:12px;padding:0 20px;position:relative}}
.pp-win .bar i{{width:16px;height:16px;border-radius:50%;display:block}}
.pp-chip{{position:absolute;left:50%;top:9px;transform:translateX(-50%);padding:6px 22px;border-radius:10px;background:{T['chip']};
  font:700 22px/1.2 var(--ev1-sans);color:#fff;white-space:nowrap;box-shadow:0 0 16px {T['edge_glow']}}}
.pp-hl{{position:absolute;background:{PP_YEL};mix-blend-mode:multiply;transform-origin:0 50%;border-radius:4px}}
.pp-ring{{position:absolute;border:7px solid {PP_YEL};border-radius:22px;box-shadow:0 0 30px rgba(255,225,77,.65)}}
.pp-chapter{{position:absolute;display:flex;align-items:center;gap:0;height:96px;border-radius:20px;overflow:hidden;
  background:linear-gradient(90deg,{T['chap0']},{T['chap1']});box-shadow:0 0 30px {T['edge_glow']}}}
.pp-chapter b{{display:flex;align-items:center;justify-content:center;width:96px;height:96px;background:{T['chapb']};
  font:900 italic 54px/1 var(--ev1-sans);color:#fff}}
.pp-chapter span{{padding:0 34px;font:900 italic 50px/1 var(--ev1-sans);color:#fff;text-transform:uppercase;white-space:nowrap}}
'''


def _css(c):
    css_once(c, 'parker-kit', PP_CSS)


def _full(c, t0, t1, inner, z):
    return c.clip(t0, t1, inner, z, cls='', style=f'position:absolute;left:0;top:0;width:{W}px;height:{H}px')


def pp_ground(c, t0, t1, z=0):
    """the ground (blue by default; PP_THEME=purple for the reference's colour), with a slow pink glow drifting across it (never a still frame)"""
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


def pp_window(c, t0, t1, src, z, title='', img_w=None, marks=(), rings=(), scroll=None, width=None, y=None, pad=0, bg='#fff', pip=None, zoom=None, stage=True):
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
    if stage:   # Hypit's Stage: the same material enlarged, blurred and dimmed behind the window, so 9:16 never shows empty ground
        sid_ = c.uid('ppst')
        _full(c, t0, t1, f'<img id="{sid_}" src="{src}" style="position:absolute;left:-10%;top:-10%;width:120%;height:120%;object-fit:cover;'
                         f'filter:blur(38px) brightness(.42) saturate(1.2);opacity:.9">', z - 1)
        c.at(f'tl.fromTo("#{sid_}",{{scale:1.08}},{{scale:1.16,duration:{fr(t1) - fr(t0):.4f},ease:"none",immediateRender:false}},{fr(t0):.4f});')
    inner = (f'<div id="{wid}" class="pp-win" style="left:{(W - width) // 2}px;top:{y}px;width:{width}px;transform:translateY(-50%)">'
             f'<div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>{chip}</div>'
             f'<div style="position:relative;{view}background:{bg if pad else 'transparent'};padding:{pad}px"><div id="{cid}" style="position:relative"><img src="{src}" style="display:block;width:100%">{"".join(mk)}</div></div></div>')
    _full(c, t0, t1, inner, z)
    c.pre.append(f'gsap.set("#{wid}",{{opacity:0}});')
    c.at(f'tl.fromTo("#{wid}",{{opacity:0,scale:.92,y:60}},{{opacity:1,scale:1,y:0,duration:{8 * F1_:.4f},ease:"power3.out",immediateRender:false}},{fr(t0):.4f});')
    c.at(f'tl.fromTo("#{wid}",{{scale:1}},{{scale:1.035,duration:{fr(t1) - fr(t0) - 8 * F1_:.4f},ease:"none",immediateRender:false}},{fr(t0) + 8 * F1_:.4f});')
    if zoom:   # his screen-recording punch: the content zooms into the region being talked about (box px, t, scale)
        (zx, zy, zw, zh), zt, zs = zoom
        c.at(f'tl.set("#{cid}",{{transformOrigin:"{pad + (zx + zw / 2) * s:.0f}px {pad + (zy + zh / 2) * s:.0f}px"}},{fr(t0):.4f});'
             f'tl.fromTo("#{cid}",{{scale:1}},{{scale:{zs},duration:{12 * F1_:.4f},ease:"power2.inOut",immediateRender:false}},{fr(zt):.4f});')
    if scroll:
        c.at(f'tl.fromTo("#{cid}",{{y:{-scroll[0] * s:.0f}}},{{y:{-scroll[1] * s:.0f},duration:{fr(t1) - fr(t0):.4f},ease:"power1.inOut",immediateRender:false}},{fr(t0):.4f});')
    sfx(c, t0, 'swish', 0.8)
    if pip:
        pp_pip(c, t0, t1, pip[0], z + 2, focus=pip[1] if len(pip) > 1 else (.5, .3))
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
                                              f'background:radial-gradient(ellipse at 30% 40%,{T['fl0']},{T['fl1']} 45%,rgba(0,0,0,0) 80%)"></div>', z)
    c.at(f'tl.fromTo("#{fid}",{{opacity:0}},{{opacity:1,duration:{3 * F1_:.4f},immediateRender:false}},{fr(t) - 3 * F1_:.4f});'
         f'tl.to("#{fid}",{{opacity:0,duration:{frames_n * F1_:.4f}}},{fr(t):.4f});')
    sfx(c, t, 'swish', 0.6)


def pp_captions(c, words, t_end, z=60, y=None, yellow=(), size=None):
    """the small caption under screen beats: white, key words yellow (a pp_text at the bottom)"""
    pp_text(c, words[0][1], t_end, words, z, y=y or round(H * (.80 if VERTICAL else .88)), size=size or (46 if VERTICAL else 40), yellow=yellow, fade=3)


def pp_pip(c, t0, t1, src, z, focus=(.5, .3), size=None, x=None, y=None, zoom=2.2):
    """the presenter in a ringed circle, top right, over screen material (his face cam). src = the talking-head
    take (video) or, until it exists, a still; focus = the face centre as fractions of the frame."""
    _css(c)
    size = size or (250 if VERTICAL else 230)
    x = x if x is not None else W - size - (50 if VERTICAL else 60)
    y = y if y is not None else (190 if VERTICAL else 50)
    pid = c.uid('pip')
    media = (f'<video class="clip" src="{src}" muted playsinline' if src.endswith(('.mp4', '.mov', '.webm')) else f'<img src="{src}"')
    inner = (f'<div id="{pid}" style="position:absolute;left:{x}px;top:{y}px;width:{size}px;height:{size}px;border-radius:50%;overflow:hidden;'
             f'border:7px solid {PP_EDGE};box-shadow:0 0 30px {T["edge_glow"]},0 14px 40px rgba(0,0,0,.5);background:#111">'
             f'{media} style="position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:{focus[0] * 100:.0f}% {focus[1] * 100:.0f}%;'
             f'transform:scale({zoom});transform-origin:{focus[0] * 100:.0f}% {focus[1] * 100:.0f}%"></div>')
    _full(c, t0, t1, inner, z)
    c.at(f'tl.fromTo("#{pid}",{{scale:0,opacity:0}},{{scale:1,opacity:1,duration:{6 * F1_:.4f},ease:"back.out(1.7)",immediateRender:false}},{fr(t0) + 4 * F1_:.4f});')


def pp_talk(c, t0, t1, src, z, focus=(.5, .32), tight=False, punches=(), push=0.03):
    """the talking head, edge to edge (a 16:9 take is cover-cropped around the face on a 9:16 frame). tight=True is the
    closer framing he cuts to; punches = [(t, scale)] hard punch-ins on a word. src: the take (video), or a still
    standing in for it until the take exists."""
    t0, t1 = fr(t0), fr(t1)
    s0 = 1.32 if tight else 1.0
    org = f'{focus[0] * 100:.0f}% {focus[1] * 100:.0f}%'
    if src.endswith(('.mp4', '.mov', '.webm')):
        return broll(c, t0, t1, src, z, rate=push, start_scale=s0, origin=org, media_start=t0, punches=punches)
    iid = c.uid('talk')
    c.clip(t0, t1, f'<img id="{iid}" src="{src}" class="ev1-fill" style="object-fit:cover;object-position:{org};transform-origin:{org}">', z)
    c.pre.append(f'gsap.set("#{iid}",{{scale:{s0}}});')
    c.at(f'tl.fromTo("#{iid}",{{scale:{s0}}},{{scale:{s0 + push * (t1 - t0):.4f},duration:{t1 - t0:.4f},ease:"none",immediateRender:false}},{t0:.4f});')
    for tp, sc in punches:
        c.at(f'tl.set("#{iid}",{{scale:{sc}}},{fr(tp):.4f});tl.fromTo("#{iid}",{{scale:{sc}}},{{scale:{sc + push * (t1 - fr(tp)):.4f},duration:{t1 - fr(tp):.4f},ease:"none",immediateRender:false}},{fr(tp):.4f});')
    return iid


def pp_prompt(c, t0, t1, text, z, t_type=None, y=None, width=None, cps=28, label='PROMPT'):
    """his PROMPT card: a dark glass card with a title strip, the prompt typing in (cps characters a second)"""
    _css(c)
    width = width or (W - 140 if VERTICAL else round(W * .55))
    y = CY if y is None else y
    cid = c.uid('ppq')
    t_type = fr(t_type if t_type is not None else t0 + 6 * F1_)
    chars = []
    for j, ch in enumerate(text):
        sid = c.uid('pq')
        chars.append(f'<span id="{sid}" style="opacity:0">{esc(ch)}</span>')
        c.at(f'tl.set("#{sid}",{{opacity:1}},{t_type + j / cps:.4f});')
    inner = (f'<div id="{cid}" style="position:absolute;left:{(W - width) // 2}px;top:{y}px;width:{width}px;transform:translateY(-50%);border-radius:22px;overflow:hidden;'
             f'background:linear-gradient(180deg,rgba(40,44,56,.92),rgba(18,20,28,.95));border:2px solid rgba(255,255,255,.18);box-shadow:0 30px 90px {T["shade"]},0 0 30px {T["edge_glow"]}">'
             f'<div style="padding:16px 0;text-align:center;font:800 30px/1 var(--ev1-sans);letter-spacing:.12em;color:#e8ecf5;background:rgba(255,255,255,.06);border-bottom:2px solid rgba(255,255,255,.1)">{esc(label)}</div>'
             f'<div style="padding:34px 40px;font:600 {44 if VERTICAL else 36}px/1.35 var(--ev1-sans);color:#fff;min-height:{170 if VERTICAL else 120}px">{"".join(chars)}</div></div>')
    _full(c, t0, t1, inner, z)
    c.at(f'tl.fromTo("#{cid}",{{opacity:0,scale:.9}},{{opacity:1,scale:1,duration:{6 * F1_:.4f},ease:"power3.out",immediateRender:false}},{fr(t0):.4f});')
    sfx(c, t0, 'swish', 0.7)


def pp_timer(c, t0, t1, z, title='', seconds=None, x=None, y=None):
    """Hypit's persistent topic plaque + countdown: the topic in small caps and a digital clock counting down from
    `seconds` (default: the window's length) to 0:00 on the last frame. A retention device: the viewer sees how
    much is left, and that it's short."""
    _css(c)
    t0, t1 = fr(t0), fr(t1)
    seconds = seconds or (t1 - t0)
    x = 46 if x is None else x
    y = (150 if VERTICAL else 40) if y is None else y
    pid, did = c.uid('ppt'), c.uid('pptd')
    n = int(round((t1 - t0)))
    digits = []
    for k in range(n + 1):
        left = max(0, int(round(seconds - k * seconds / max(n, 1))))
        sid = c.uid('pptn')
        digits.append(f'<span id="{sid}" style="position:absolute;left:0;top:0;opacity:0">{left // 60}:{left % 60:02d}</span>')
        c.at(f'tl.set("#{sid}",{{opacity:1}},{t0 + k:.4f});' + (f'tl.set("#{sid}",{{opacity:0}},{min(t1, t0 + k + 1):.4f});' if k < n else ''))
    inner = (f'<div id="{pid}" style="position:absolute;left:{x}px;top:{y}px;display:flex;align-items:stretch;border-radius:16px;overflow:hidden;'
             f'box-shadow:0 10px 30px rgba(0,0,0,.45),0 0 22px {T["edge_glow"]};border:2px solid {PP_EDGE}">'
             f'<div style="padding:12px 18px;background:{T["chip"]};font:900 italic 26px/1.05 var(--ev1-sans);color:#fff;text-transform:uppercase;white-space:nowrap;align-self:center">{esc(title)}</div>'
             f'<div id="{did}" style="position:relative;width:128px;background:#0b1020;font:700 44px/60px var(--ev1-mono);color:{PP_YEL};'
             f'text-shadow:0 0 14px rgba(255,225,77,.7);letter-spacing:.02em"><div style="position:absolute;left:14px;top:2px;width:110px;height:68px">{"".join(digits)}</div></div></div>')
    _full(c, t0, t1, inner, z)
    c.at(f'tl.fromTo("#{pid}",{{x:-60,opacity:0}},{{x:0,opacity:1,duration:{6 * F1_:.4f},ease:"power3.out",immediateRender:false}},{t0:.4f});')
