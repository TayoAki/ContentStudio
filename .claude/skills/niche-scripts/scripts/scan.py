#!/usr/bin/env python3
"""scan.py — the niche's base rates: how often an ordinary post beats its creator's follower count.

    python3 -I scan.py --out <workdir> --tiktok selectdata --tiktok shreya.knows.data ... [--pages 2] [--days 180]

Pulls each account's recent posts (TikTok, newest first, `--pages` pages of the profile feed: about 1 credit a
page; needs SCRAPECREATORS_API_KEY) and measures every post in the window as views ÷ the account's followers.

Writes <workdir>/scan.json   [{platform, account, followers, posts: [...]}]
       <workdir>/base_rates.md  P(views >= 1x / 2x / 5x / 10x followers) over all scanned posts, per account
                                and overall; then every 5x outlier, best first (the posts to tear down).
Caveat in the report: followers are today's count, so older posts are measured against a later (usually larger)
audience; the rates lean low for fast-growing accounts.
"""
import argparse, json, os, statistics, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from history import tiktok_history  # noqa: E402

K = (1, 2, 5, 10)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--tiktok', action='append', default=[])
    ap.add_argument('--pages', type=int, default=2)
    ap.add_argument('--days', type=int, default=180)
    ap.add_argument('--min-followers', type=int, default=1000, help='skip accounts below this (ratios explode)')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    since = time.time() - a.days * 86400
    path = os.path.join(a.out, 'scan.json')
    data = json.load(open(path)) if os.path.exists(path) else []
    have = {(d['platform'], d['account']) for d in data}
    for h in a.tiktok:
        h = h.lstrip('@')
        if ('tiktok', h) in have:
            continue
        print(f'tiktok: {h}', file=sys.stderr)
        P, fol = tiktok_history(h, a.pages)
        data.append(dict(platform='tiktok', account=h, followers=fol, posts=P))
        json.dump(data, open(path, 'w'))
    rows, allx, outl = [], [], []
    for d in data:
        if d['followers'] < a.min_followers:
            continue
        P = [p for p in d['posts'] if p['t'] >= since and p['views']]
        if len(P) < 5:
            continue
        xs = [p['views'] / d['followers'] for p in P]
        allx += xs
        rows.append((d, len(P), statistics.median(p['views'] for p in P), [sum(x >= k for x in xs) / len(xs) for k in K]))
        outl += [dict(p, account=d['account'], platform=d['platform'], followers=d['followers'], x=round(p['views'] / d['followers'], 1))
                 for p in P if p['views'] >= 5 * d['followers']]
    n = len(allx)
    base = {k: sum(x >= k for x in allx) / max(n, 1) for k in K}
    json.dump(dict(n=n, accounts=len(rows), days=a.days, base={str(k): v for k, v in base.items()}), open(os.path.join(a.out, 'base_rates.json'), 'w'))
    L = [f'# Base rates: {n} posts from {len(rows)} accounts, last {a.days} days', '',
         '| Beats followers by | 1× | 2× | 5× | 10× |', '| --- | --- | --- | --- | --- |',
         '| Share of posts | ' + ' | '.join(f'{100 * base[k]:.1f}%' for k in K) + ' |', '',
         'Followers are today\'s count, so older posts are measured against a later audience.', '',
         '## Per account', '', '| Account | Followers | Posts | Median views | 1× | 2× | 5× | 10× |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for d, m, med, r in sorted(rows, key=lambda r: -r[3][2]):
        L.append(f"| @{d['account']} | {d['followers']:,} | {m} | {int(med):,} | " + ' | '.join(f'{100 * x:.0f}%' for x in r) + ' |')
    L += ['', f'## 5× outliers ({len(outl)})', '', '| × | Views | Saves | Shares | Length | Account | Post |', '| --- | --- | --- | --- | --- | --- | --- |']
    for p in sorted(outl, key=lambda p: -p['x']):
        L.append(f"| {p['x']}× | {p['views']:,} | {p['saves']:,} | {p['shares']:,} | {p['dur']}s | @{p['account']} | [{p['text'][:70].replace('|', '/')}]({p['url']}) |")
    open(os.path.join(a.out, 'base_rates.md'), 'w').write('\n'.join(L) + '\n')
    json.dump(sorted(outl, key=lambda p: -p['x']), open(os.path.join(a.out, 'outliers.json'), 'w'), indent=0)
    print(f'scan: {n} posts, {len(rows)} accounts, 5x rate {100 * base[5]:.1f}%, {len(outl)} outliers -> {a.out}/base_rates.md')


if __name__ == '__main__':
    main()
