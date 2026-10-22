#!/usr/bin/env python3
"""odds.py — chance a planned post becomes an outlier, from this niche's own tagged posts.

  python3 -I odds.py lifts --scan <workdir>
      Which tag values the outliers over-use: for every attribute (format, angle, video_type, complexity, delivery,
      funnel), how many tagged outliers and ordinary posts use each value and its lift. -> <workdir>/lifts.md

  python3 -I odds.py score --scan <workdir> --plan <plan.json>
      Odds for each planned post. plan.json is a list of {"title", "format", "angle", "video_type", "complexity",
      "delivery", "funnel", "sources": [video ids from tags.json]}. Prints an "Odds" block per post, in the
      week-plan format (reference/week-plan.md), and writes <workdir>/odds.json.

How it works. tags.json holds every 5x outlier plus a random sample of ordinary posts, so each sampled ordinary post
stands for (ordinary posts in the scan / ordinary posts sampled) posts. For a tag value v:
  P(5x | v) = (outliers with v + base) / (outliers with v + weight*ordinary with v + 1)   (one pseudo-post at the base rate)
  lift(v)   = (P(5x | v) / base) ** (a / (a + 6)), a = distinct accounts using v
The exponent shrinks a lift toward 1 when few accounts back it: five outliers from one creator are one creator's
habit, not a niche pattern.
The five content attributes overlap (easy tutorials are mostly screen recordings), so they are averaged, not
multiplied: evidence = geometric mean of their lifts. The funnel stage is its own multiplier. The result scales the
niche's base rates for 1x, 2x, 5x and 10x (base_rates.json). Rating: strong >= 2x the base rate, good >= 1.2x,
average >= 0.8x, weak below. Confidence: high when every value is backed by 5+ tagged outliers, medium at 2+, else low.
"""
import argparse, json, math, os, statistics

ATTRS = ['format', 'angle', 'video_type', 'complexity', 'delivery']
M = 6


def load(scan):
    tags = [t for t in json.load(open(os.path.join(scan, 'tag', 'tags.json'))) if t.get('format') and not t.get('skip')]
    br = json.load(open(os.path.join(scan, 'base_rates.json')))
    n_out_all = round(br['base']['5'] * br['n'])
    n_ord_all = br['n'] - n_out_all
    n_ord_tag = sum(1 for t in tags if not t['outlier'])
    weight = n_ord_all / max(n_ord_tag, 1)
    return tags, br, weight


def lift_table(tags, br, weight, attr):
    base = br['base']['5']
    rows, accts = {}, {}
    for t in tags:
        r = rows.setdefault(t[attr], [0, 0])
        r[0 if t['outlier'] else 1] += 1
        accts.setdefault(t[attr], set()).add(t['account'])
    out = {}
    for v, (o, n) in rows.items():
        p = (o + base) / (o + weight * n + 1)
        a = len(accts[v])
        out[v] = dict(outliers=o, ordinary=n, accounts=a, lift=round((p / base) ** (a / (a + M)), 2))
    return out


def lifts(a):
    tags, br, w = load(a.scan)
    n_out = sum(t['outlier'] for t in tags)
    L = [f"# What the outliers over-use", '',
         f"{len(tags)} tagged posts: {n_out} outliers (5x+) and {len(tags) - n_out} ordinary posts sampled from the scan, "
         f"each standing for {w:.1f} posts. Base rate for 5x: {br['base']['5']:.1%}. Lift 1.0 = no different from the niche.", '']
    for attr in ATTRS + ['funnel', 'niche']:
        if not any(t.get(attr) for t in tags):
            continue
        tab = lift_table(tags, br, w, attr)
        L += [f"## {attr}", '', '| Value | Outliers | Ordinary (sampled) | Accounts | Lift |', '|---|---|---|---|---|']
        for v, r in sorted(tab.items(), key=lambda kv: -kv[1]['lift']):
            L.append(f"| {v} | {r['outliers']} | {r['ordinary']} | {r['accounts']} | {r['lift']}× |")
        L.append('')
    open(os.path.join(a.scan, 'lifts.md'), 'w').write('\n'.join(L))
    print('\n'.join(L))


def rating(m):
    return 'strong' if m >= 2 else 'good' if m >= 1.2 else 'average' if m >= 0.8 else 'weak'


def score(a):
    tags, br, w = load(a.scan)
    by_id = {t['id']: t for t in tags}
    n_out = sum(t['outlier'] for t in tags)
    tabs = {attr: lift_table(tags, br, w, attr) for attr in ATTRS + ['funnel']}
    res = []
    for p in json.load(open(a.plan)):
        ls = [tabs[attr].get(p[attr], dict(lift=1.0, outliers=0))['lift'] for attr in ATTRS]
        evidence = math.exp(sum(math.log(x) for x in ls) / len(ls))
        funnel = tabs['funnel'].get(p['funnel'], dict(lift=1.0))['lift']
        m = evidence * funnel
        backing = [tabs[attr].get(p[attr], dict(outliers=0))['outliers'] for attr in ATTRS]
        conf = 'high' if min(backing) >= 5 else 'medium' if min(backing) >= 2 else 'low'
        src = [by_id[s]['x'] for s in p.get('sources', []) if s in by_id]
        odds = {k: min(0.95, br['base'][k] * m) for k in ('1', '2', '5', '10')}
        r = dict(title=p['title'], multiplier=round(m, 2), evidence=round(evidence, 2), funnel=round(funnel, 2),
                 sources_median=round(statistics.median(src), 1) if src else None, odds={k: round(v, 3) for k, v in odds.items()},
                 rating=rating(m), confidence=conf)
        res.append(r)
        print(f"## {p['title']}\n")
        print(f"- **Odds:** {odds['5']:.1%} chance of a 5× outlier (this niche's base rate is {br['base']['5']:.1%}), rated {r['rating']}, "
              f"{conf} confidence. {odds['1']:.1%} to beat your follower count, {odds['2']:.1%} to reach 2×, {odds['10']:.1%} to reach 10×.")
        tail = f" · its sources median {r['sources_median']}×" if src else ''
        print(f"  - {m:.2f}× the niche base rate: evidence ×{evidence:.2f} · funnel stage ×{funnel:.2f}{tail}")
        for attr in ATTRS:
            o = tabs[attr].get(p[attr], dict(outliers=0))['outliers']
            print(f"  - {attr.replace('_', ' ').capitalize()} “{p[attr].replace('_', ' ')}”: used by {o} of {n_out} outliers")
        print()
    json.dump(res, open(os.path.join(a.scan, 'odds.json'), 'w'), indent=1)


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest='cmd', required=True)
    s1 = sp.add_parser('lifts'); s1.add_argument('--scan', required=True)
    s2 = sp.add_parser('score'); s2.add_argument('--scan', required=True); s2.add_argument('--plan', required=True)
    a = ap.parse_args()
    lifts(a) if a.cmd == 'lifts' else score(a)


if __name__ == '__main__':
    main()
