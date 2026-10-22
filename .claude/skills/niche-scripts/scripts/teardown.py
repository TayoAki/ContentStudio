#!/usr/bin/env python3
"""teardown.py — look at posts before claiming anything about them.

  python3 -I teardown.py sheets --scan <workdir> [--sample 40]
      Tag sheets: every 5x outlier from outliers.json plus a random sample of ordinary posts from scan.json
      (seeded, so it is repeatable), 6 frames + caption per row, 6 rows per sheet -> <workdir>/tag/sheet_NN.jpg and
      <workdir>/tag/tags.json (one entry per post with empty tag fields to fill: format, angle, video_type,
      complexity, delivery, funnel — the vocabulary is in reference/week-plan.md).

  python3 -I teardown.py scenes --scan <workdir> --post <video id> [--asr-python <python with faster_whisper>]
      Scene-by-scene breakdown of one post: cuts detected (a run of changed frames = one transition), the first and
      last frame of each scene, and what is said in it (if --asr-python points at a Python with faster-whisper)
      -> <workdir>/teardown/<id>/scenes.json, sheet.jpg and breakdown.md (a SEALCaM skeleton to fill in by looking).

Media URLs from the scan are signed and short-lived: run this the same day as scan.py. Photo posts have no video;
they are tagged from the caption (format: carousel).
"""
import argparse, json, os, random, subprocess, sys
from PIL import Image, ImageDraw

FFMPEG = ['ffmpeg', '-nostdin', '-v', 'error', '-y']


def load(scan):
    data = json.load(open(os.path.join(scan, 'scan.json')))
    posts = {}
    for d in data:
        for p in d['posts']:
            posts[p['url'].rsplit('/', 1)[-1]] = dict(p, account=d['account'], followers=d['followers'],
                                                      x=round(p['views'] / max(d['followers'], 1), 2))
    return posts


def fetch(p, folder):
    os.makedirs(folder, exist_ok=True)
    out = os.path.join(folder, 'video.mp4')
    if not os.path.exists(out) and p.get('media') and p.get('dur'):
        subprocess.run(['curl', '-sL', '--max-time', '180', '-A', 'Mozilla/5.0', '-o', out, p['media']])
    return out if os.path.exists(out) and os.path.getsize(out) > 50_000 else None


def frame(video, t, w=200):
    r = subprocess.run(FFMPEG + ['-ss', f'{max(t, 0):.2f}', '-i', video, '-frames:v', '1', '-vf', f'scale={w}:-2', '-f', 'image2pipe',
                                 '-vcodec', 'png', '-'], capture_output=True)
    from io import BytesIO
    return Image.open(BytesIO(r.stdout)).convert('RGB') if r.stdout else None


def sheets(a):
    posts = load(a.scan)
    outl = json.load(open(os.path.join(a.scan, 'outliers.json')))
    ids = [p['url'].rsplit('/', 1)[-1] for p in outl]
    rest = [k for k, p in posts.items() if p['x'] < 5]
    random.Random(7).shuffle(rest)
    ids += rest[:a.sample]
    tagdir = os.path.join(a.scan, 'tag'); os.makedirs(tagdir, exist_ok=True)
    tags = []
    rows = []
    for i in ids:
        p = posts[i]
        v = fetch(p, os.path.join(tagdir, 'media', i))
        frames = [frame(v, (k + .5) * p['dur'] / 6) for k in range(6)] if v else []
        rows.append((p, frames))
        tags.append(dict(id=i, url=p['url'], account=p['account'], x=p['x'], views=p['views'], dur=p['dur'], outlier=p['x'] >= 5,
                         caption=p['text'][:200], format='', angle='', video_type='', complexity='', delivery='', funnel=''))
    W, TH, CAP = 6 * 200, 356, 60
    for s in range(0, len(rows), 6):
        img = Image.new('RGB', (W, 6 * (TH + CAP)), 'black'); d = ImageDraw.Draw(img)
        for r, (p, frames) in enumerate(rows[s:s + 6]):
            y = r * (TH + CAP)
            for k, f in enumerate(frames):
                if f is None:
                    continue
                f = f.resize((200, int(200 * f.size[1] / f.size[0])))
                img.paste(f.crop((0, 0, 200, min(TH, f.size[1]))), (k * 200, y + CAP))
            d.text((4, y + 4), f"#{s + r} {p['x']}x  {p['dur']}s  @{p['account']}", fill='yellow')
            d.text((4, y + 22), p['text'][:150], fill='white')
            d.text((4, y + 40), p['text'][150:300], fill='white')
        img.save(os.path.join(tagdir, f'sheet_{s // 6:02d}.jpg'), quality=85)
    json.dump(tags, open(os.path.join(tagdir, 'tags.json'), 'w'), indent=1)
    print(f'teardown: {len(rows)} posts ({len(outl)} outliers) -> {tagdir}/sheet_*.jpg + tags.json')


def scenes(a):
    p = load(a.scan)[a.post]
    folder = os.path.join(a.scan, 'teardown', a.post)
    os.makedirs(folder, exist_ok=True)
    tagged = os.path.join(a.scan, 'tag', 'media', a.post, 'video.mp4')
    if os.path.exists(tagged) and not os.path.exists(os.path.join(folder, 'video.mp4')):
        os.link(tagged, os.path.join(folder, 'video.mp4'))  # reuse the copy the tag sheets downloaded
    v = fetch(p, folder)
    if not v:
        sys.exit('teardown: no video for this post (photo post or expired link: re-run scan.py)')
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]))
    log = subprocess.run(['ffmpeg', '-nostdin', '-i', v, '-vf', "select='gt(scene,0.25)',showinfo", '-f', 'null', '-'], capture_output=True, text=True).stderr
    raw = [float(x.split('pts_time:')[1].split()[0]) for x in log.splitlines() if 'pts_time:' in x]
    cuts = []
    for t in raw:
        if cuts and t - cuts[-1][1] <= 0.25:
            cuts[-1][1] = t
        else:
            cuts.append([t, t])
    bounds = [0.0] + [b for _, b in cuts] + [dur]
    sc = [(bounds[k], bounds[k + 1]) for k in range(len(bounds) - 1) if bounds[k + 1] - bounds[k] >= 0.3]
    words = []
    if a.asr_python:
        wav = os.path.join(folder, 'a.f32')
        subprocess.run(FFMPEG + ['-i', v, '-ac', '1', '-ar', '16000', '-f', 'f32le', wav])
        code = ("import json,sys,numpy as np\nfrom faster_whisper import WhisperModel\nm=WhisperModel('small',compute_type='int8')\n"
                "seg,_=m.transcribe(np.fromfile(sys.argv[1],dtype=np.float32),word_timestamps=True)\n"
                "print(json.dumps([[w.word.strip(),w.start] for s in seg for w in s.words]))")
        r = subprocess.run([a.asr_python, '-c', code, wav], capture_output=True, text=True)
        words = json.loads(r.stdout or '[]')
    out = []
    for k, (t0, t1) in enumerate(sc):
        said = ' '.join(w for w, t in words if t0 - 0.05 <= t < t1)
        out.append(dict(n=k + 1, t0=round(t0, 2), t1=round(t1, 2), said=said))
    json.dump(dict(post=p, scenes=out), open(os.path.join(folder, 'scenes.json'), 'w'), indent=1)
    cols = 6; tw = 180
    th = int(tw * 16 / 9)
    img = Image.new('RGB', (cols * tw, ((len(out) * 2 + cols - 1) // cols) * (th + 20)), 'black'); d = ImageDraw.Draw(img)
    for i, s in enumerate(out):
        for j, t in enumerate((s['t0'] + 0.1, max(s['t0'] + 0.1, s['t1'] - 0.15))):
            f = frame(v, t, tw)
            q = 2 * i + j; x, y = (q % cols) * tw, (q // cols) * (th + 20)
            if f:
                img.paste(f.crop((0, 0, tw, min(th, f.size[1]))), (x, y + 20))
            d.text((x + 3, y + 3), f"S{s['n']} {'a' if j == 0 else 'b'} {t:.1f}s", fill='yellow')
    img.save(os.path.join(folder, 'sheet.jpg'), quality=85)
    L = [f"### Reference breakdown: @{p['account']} ({p['x']}×)", '', f"{p['url']} · scene by scene in SEALCaM.", '']
    for s in out:
        L += [f"#### Scene {s['n']} · {s['t0']}–{s['t1']} s · <BEAT> · <hard cut | same shot continues>", '',
              f"- **Said:** “{s['said']}”" if s['said'] else '- **Said:** —', '- **On screen:** ', '- **S (Subject):** ',
              '- **E (Environment):** ', '- **A (Action):** ', '- **L (Lighting):** ', '- **Ca (Camera):** ', '- **M (Metatokens):** ', '']
    open(os.path.join(folder, 'breakdown.md'), 'w').write('\n'.join(L))
    print(f"teardown: {len(out)} scenes over {dur:.1f}s -> {folder}/sheet.jpg + breakdown.md")


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest='cmd', required=True)
    s1 = sp.add_parser('sheets'); s1.add_argument('--scan', required=True); s1.add_argument('--sample', type=int, default=40)
    s2 = sp.add_parser('scenes'); s2.add_argument('--scan', required=True); s2.add_argument('--post', required=True)
    s2.add_argument('--asr-python', default=None)
    a = ap.parse_args()
    sheets(a) if a.cmd == 'sheets' else scenes(a)


if __name__ == '__main__':
    main()
