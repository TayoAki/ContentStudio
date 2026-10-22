"""shot_analyze.py <video> <cuts.txt> <out_prefix>: merge scene-change frames into cuts (a transition = a run of
changed frames), grab each shot's middle frame from the 16:9 band, classify it (aroll / screen / graphic), print the
shot list and write a labelled contact sheet."""
import sys, subprocess, json, io, statistics
import numpy as np
from PIL import Image, ImageDraw
V, C, OUT = sys.argv[1:4]
dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',V]))
raw = [float(x) for x in open(C).read().split()]
cuts, trans = [], []
for t in raw:
    if cuts and t - trans[-1][1] <= 0.25:
        trans[-1][1] = t
    else:
        cuts.append(t); trans.append([t, t])
bounds = [0.0] + [b for a, b in trans] + [dur]
starts = [0.0] + [a for a, b in trans]
shots = []
for k in range(len(bounds) - 1):
    s0, s1 = bounds[k], (trans[k][0] if k < len(trans) else dur)
    if s1 - s0 < 0.2: continue
    mid = (s0 + s1) / 2
    png = subprocess.run(['ffmpeg','-nostdin','-v','error','-ss',f'{mid:.3f}','-i',V,'-frames:v','1','-vf','crop=480:270:0:292','-f','image2pipe','-vcodec','png','-'],capture_output=True).stdout
    im = Image.open(io.BytesIO(png)).convert('RGB'); a = np.asarray(im).astype(float) / 255
    r, g, b = a[..., 0].mean(), a[..., 1].mean(), a[..., 2].mean()
    hsv = np.asarray(im.convert('HSV')).astype(float) / 255
    sat, val = hsv[..., 1].mean(), hsv[..., 2].mean()
    # purple ground: blue > green clearly, red > green; skin/wood a-roll: red > blue; screen: low saturation
    purple = (b - g > .08) and (r - g > .03) and sat > .35
    warm = (r - b > .04) and sat > .18
    kind = 'graphic' if purple else ('aroll' if warm else 'screen')
    shots.append(dict(t0=round(s0, 2), t1=round(s1, 2), d=round(s1 - s0, 2), kind=kind, trans=round((trans[k-1][1]-trans[k-1][0]) if k else 0, 2), im=im))
json.dump([{k: v for k, v in s.items() if k != 'im'} for s in shots], open(OUT + '.json', 'w'), indent=0)
# sheet
cols = 10; tw, th = 192, 108
sheet = Image.new('RGB', (cols * tw, ((len(shots) + cols - 1) // cols) * (th + 18)), 'black'); d = ImageDraw.Draw(sheet)
for i, s in enumerate(shots):
    x, y = (i % cols) * tw, (i // cols) * (th + 18)
    sheet.paste(s['im'].resize((tw, th)), (x, y)); d.text((x + 3, y + th + 2), f"{s['t0']:.1f} {s['d']:.1f}s {s['kind'][:3]}", fill='white')
sheet.save(OUT + '_sheet.jpg')
print(len(shots), 'shots')
