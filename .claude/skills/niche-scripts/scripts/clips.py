#!/usr/bin/env python3
"""clips.py — download the top posts of a discover.py run and lay out frames to LOOK at.

    python3 -I clips.py --out <workdir> [--by shares|saves|views] [--top 20] [--frames 8]

Captions say little ("😭😭😭"); the format lives in the picture. For the top --top TikTok/Instagram posts
by --by it downloads the video (the signed URL from posts.json: run this the same day as discover.py)
into <workdir>/clips/NN.mp4 and writes one strip of --frames evenly spaced frames per clip, then
sheets of 7 strips (clips/sheet_K.jpg) with the clip number on the left. Read every sheet and tag
each clip in clips/tags.tsv (format, hook, mechanic): that table is what the scripts copy.
Needs ffmpeg + Pillow. Media is for analysis only: never re-post someone's clip.
"""
import argparse, json, os, subprocess, sys, urllib.request

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True); ap.add_argument('--by', default='shares', choices=['shares', 'saves', 'views'])
    ap.add_argument('--top', type=int, default=20); ap.add_argument('--frames', type=int, default=8)
    a = ap.parse_args()
    from PIL import Image, ImageDraw
    posts = [p for p in json.load(open(os.path.join(a.out, 'posts.json'))) if p.get('media')]
    posts.sort(key=lambda p: -p[a.by])
    d = os.path.join(a.out, 'clips'); os.makedirs(d, exist_ok=True)
    rows, strips = [], []
    for i, p in enumerate(posts[:a.top]):
        f = os.path.join(d, f'{i:02d}.mp4')
        try:
            req = urllib.request.Request(p['media'], headers={'User-Agent': UA, 'Referer': 'https://www.tiktok.com/'})
            open(f, 'wb').write(urllib.request.urlopen(req, timeout=90).read())
            dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f],
                                       capture_output=True, text=True).stdout or 0)
            s = os.path.join(d, f's{i:02d}.jpg')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-vf', f'fps={a.frames}/{max(dur, 1):.2f},scale=180:-2,tile={a.frames}x1',
                            '-frames:v', '1', s], check=True)
            strips.append((i, s))
        except Exception as e:
            print(f'  ! clip {i:02d} ({p["url"]}): {e}', file=sys.stderr)
        rows.append(f"{i:02d}\t{p[a.by]}\t{p['views']}\t{p['platform']}\t{p['user']}\t{p['url']}\t{p['text'][:120]}")
    for k in range(0, len(strips), 7):
        ims = [(i, Image.open(s)) for i, s in strips[k:k + 7]]
        W = max(im.width for _, im in ims) + 40; H = sum(im.height for _, im in ims)
        sheet = Image.new('RGB', (W, H), 'black'); y = 0
        for i, im in ims:
            sheet.paste(im, (40, y)); ImageDraw.Draw(sheet).text((5, y + 10), f'{i:02d}', fill='yellow'); y += im.height
        sheet.save(os.path.join(d, f'sheet_{k // 7}.jpg'), quality=80)
    open(os.path.join(d, 'list.tsv'), 'w').write(f'#\t{a.by}\tviews\tplatform\taccount\turl\tcaption\n' + '\n'.join(rows) + '\n')
    if not os.path.exists(os.path.join(d, 'tags.tsv')):
        open(os.path.join(d, 'tags.tsv'), 'w').write('#\tformat (what it is)\thook (first line / text)\tmechanic or device\tnotes\n')
    print(f'clips: {len(strips)} strips in {(len(strips) + 6) // 7} sheets -> {d}/sheet_*.jpg  (tag them in {d}/tags.tsv)')


if __name__ == '__main__':
    main()
