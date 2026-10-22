#!/usr/bin/env python3
"""history.py — month-by-month history of outlier accounts: cadence, median, hit rate, top posts.

    python3 -I history.py --out <workdir> --tiktok shreya.knows.data --tiktok lifebygelique \
        [--youtube https://www.youtube.com/channel/UC...] [--max-pages 40]

TikTok needs SCRAPECREATORS_API_KEY in the environment (about 1 credit per page of ~10-30 posts;
--max-pages caps it). YouTube needs yt-dlp; its dates for older videos are approximate ("1 year ago").

Writes <workdir>/history/<account>.json (every post) and appends each account's section to
<workdir>/history.md:
  - followers, posts, first -> last post, posts a week, median views
  - hit rate: posts at >= 10x the account's own median (the stronger outlier test: a formula, not luck)
  - saves as % of views (reference content gets saved; reach content gets shared)
  - a month table (posts, median, best, total) and the top 6 posts with length and caption
"""
import argparse, json, os, statistics, subprocess, sys, time, urllib.parse, urllib.request
from collections import defaultdict
from datetime import datetime

SC = 'https://api.scrapecreators.com'


def sc_get(path, params, tries=4):
    key = os.environ.get('SCRAPECREATORS_API_KEY') or os.environ.get('SC_KEY')
    if not key:
        sys.exit('history: set SCRAPECREATORS_API_KEY')
    url = SC + path + '?' + urllib.parse.urlencode({k: v for k, v in params.items() if v not in (None, '')})
    for k in range(tries):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={'x-api-key': key}), timeout=60).read())
        except Exception as e:
            if k == tries - 1:
                print(f'  ! {path} failed: {e}', file=sys.stderr)
                return {}
            time.sleep(2 ** (k + 1))


def tiktok_history(handle, max_pages):
    posts, fol, cursor = {}, 0, None
    for _ in range(max_pages):
        d = sc_get('/v3/tiktok/profile/videos', {'handle': handle, 'trim': 'true', 'sort_by': 'latest', 'max_cursor': cursor})
        for a in d.get('aweme_list') or []:
            s = a.get('statistics', {}); fol = fol or (a.get('author') or {}).get('follower_count') or 0
            posts[a['aweme_id']] = dict(t=a.get('create_time') or 0, views=s.get('play_count', 0), likes=s.get('digg_count', 0),
                                        shares=s.get('share_count', 0), saves=s.get('collect_count', 0),
                                        comments=s.get('comment_count', 0),
                                        dur=round(((a.get('video') or {}).get('duration') or 0) / 1000),
                                        media=(((a.get('video') or {}).get('play_addr') or {}).get('url_list') or [''])[0],
                                        text=(a.get('desc') or '').replace('\n', ' '),
                                        url=f'https://www.tiktok.com/@{handle}/video/{a["aweme_id"]}')
        if not d.get('has_more') or not d.get('max_cursor'):
            break
        cursor = d['max_cursor']
    else:
        print(f'  ! {handle}: hit --max-pages, oldest posts not pulled', file=sys.stderr)
    return sorted(posts.values(), key=lambda p: p['t']), fol


def youtube_history(url):
    posts, subs, name = [], 0, url
    for tab in ('videos', 'shorts'):
        r = subprocess.run(['yt-dlp', '--flat-playlist', '-J', '--extractor-args', 'youtubetab:approximate_date', f'{url}/{tab}'],
                           capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
        except Exception:
            continue
        subs = subs or d.get('channel_follower_count') or 0; name = d.get('channel') or name
        for e in d.get('entries', []):
            # with approximate_date, flat entries carry `timestamp` (upload_date stays empty)
            t = e.get('timestamp') or (int(datetime.strptime(e['upload_date'], '%Y%m%d').timestamp()) if e.get('upload_date') else 0)
            if not e.get('view_count') or not t:
                continue
            posts.append(dict(t=t, views=e['view_count'], likes=0, shares=0, saves=0, comments=0,
                              dur=round(e.get('duration') or 0), text=e.get('title') or '', url=e.get('url') or '',
                              tab=tab))
    return sorted(posts, key=lambda p: p['t']), subs, name


def section(name, platform, P, fol, note=''):
    if not P:
        return f'## {name} ({platform})\n\nNo posts returned.\n'
    med = statistics.median(p['views'] for p in P)
    hits = [p for p in P if p['views'] >= 10 * max(med, 1)]
    first, last = datetime.fromtimestamp(P[0]['t']), datetime.fromtimestamp(P[-1]['t'])
    weeks = max((last - first).days / 7, 1)
    sv = sum(p['saves'] for p in P); vw = sum(p['views'] for p in P)
    L = [f'## {name} ({platform})', '',
         f'{fol:,} followers · {len(P)} posts, {first:%Y-%m-%d} to {last:%Y-%m-%d} · {len(P) / weeks:.1f} a week · '
         f'median {int(med):,} views · {len(hits)} posts ({100 * len(hits) / len(P):.0f}%) at 10x+ median'
         + (f' · saves {100 * sv / max(vw, 1):.2f}% of views' if sv else '') + (f' · {note}' if note else ''), '',
         '| Month | Posts | Median views | Best | Total views |', '| --- | --- | --- | --- | --- |']
    m = defaultdict(list)
    for p in P:
        m[datetime.fromtimestamp(p['t']).strftime('%Y-%m')].append(p['views'])
    for k in sorted(m):
        v = m[k]
        L.append(f'| {k} | {len(v)} | {int(statistics.median(v)):,} | {max(v):,} | {sum(v):,} |')
    L += ['', '| Posted | Views | Saves | Shares | Length | Caption / title |', '| --- | --- | --- | --- | --- | --- |']
    for p in sorted(P, key=lambda p: -p['views'])[:6]:
        L.append(f"| {datetime.fromtimestamp(p['t']):%Y-%m-%d} | [{p['views']:,}]({p['url']}) | {p['saves'] or ''} | "
                 f"{p['shares'] or ''} | {p['dur']}s | {p['text'][:110].replace('|', '/')} |")
    return '\n'.join(L) + '\n'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--tiktok', action='append', default=[])
    ap.add_argument('--youtube', action='append', default=[], help='channel URL')
    ap.add_argument('--max-pages', type=int, default=40)
    a = ap.parse_args()
    os.makedirs(os.path.join(a.out, 'history'), exist_ok=True)
    md = []
    for h in a.tiktok:
        h = h.lstrip('@'); print(f'tiktok: {h}', file=sys.stderr)
        P, fol = tiktok_history(h, a.max_pages)
        json.dump(P, open(os.path.join(a.out, 'history', f'tiktok_{h}.json'), 'w'))
        md.append(section('@' + h, 'TikTok', P, fol))
    for u in a.youtube:
        print(f'youtube: {u}', file=sys.stderr)
        P, subs, name = youtube_history(u)
        json.dump(P, open(os.path.join(a.out, 'history', f'youtube_{name.replace("/", "_")}.json'), 'w'))
        md.append(section(name, 'YouTube', P, subs, note='dates before the last year are approximate'))
    with open(os.path.join(a.out, 'history.md'), 'a') as f:
        f.write('\n'.join(md))
    print(f'history: {len(md)} accounts -> {a.out}/history.md')


if __name__ == '__main__':
    main()
