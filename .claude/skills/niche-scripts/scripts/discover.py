#!/usr/bin/env python3
"""discover.py — find what is performing in a niche and who the outliers are.

    python3 -I discover.py --niche "microsoft fabric" --out <workdir> \
        --query "microsoft fabric" --query "fabric data engineer" --query "dp-700" \
        --must "microsoft ?fabric|onelake|dp-?[67]00|direct ?lake" \
        [--exclude "minecraft|textile|sewing"] [--platforms tiktok,instagram,youtube] \
        [--window last-six-months] [--pages 2]

Needs SCRAPECREATORS_API_KEY in the environment for TikTok and Instagram (never pass it on the
command line or write it to a file). YouTube uses yt-dlp if it is installed (search pages and channel
pages only, no video pages, so YouTube's bot check is not hit).

Writes into <workdir>:
  posts.json      every relevant post, normalised: platform, id, url, user, followers, views, likes,
                  comments, shares, saves, created (epoch), duration (s), text, query, media (video URL;
                  TikTok/Instagram only, signed and short-lived: run clips.py the same day)
  accounts.json   one row per account: posts found, best post, best/followers, median views
  report.md       the ranked tables: top posts, top accounts by outlier score, per-query counts

Relevance: a keyword like "fabric" matches textiles; every post must match --must (a regex on the
caption/title) and must not match --exclude. Check report.md's top rows for strays and tighten.
Scrape Creators silently ignores date filters on some searches: --since drops older posts here.
"""
import argparse, json, os, re, statistics, subprocess, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone

SC = 'https://api.scrapecreators.com'


def sc_get(path, params, tries=4):
    key = os.environ.get('SCRAPECREATORS_API_KEY') or os.environ.get('SC_KEY')
    if not key:
        sys.exit('discover: set SCRAPECREATORS_API_KEY (TikTok/Instagram need it)')
    url = SC + path + '?' + urllib.parse.urlencode({k: v for k, v in params.items() if v not in (None, '')})
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={'x-api-key': key})
            return json.loads(urllib.request.urlopen(req, timeout=60).read())
        except Exception as e:          # rate limits and resets: back off and retry
            if k == tries - 1:
                print(f'  ! {path} failed: {e}', file=sys.stderr)
                return {}
            time.sleep(2 ** (k + 1))


def tiktok(query, window, pages):
    out, cursor = [], None
    for _ in range(pages):
        d = sc_get('/v1/tiktok/search/keyword', {'query': query, 'date_posted': window, 'sort_by': 'most-liked',
                                                  'trim': 'true', 'cursor': cursor})
        for it in d.get('search_item_list') or []:
            a = it.get('aweme_info', it); s = a.get('statistics', {}); au = a.get('author', {})
            out.append(dict(platform='tiktok', id=a.get('aweme_id'), user=au.get('unique_id'),
                            url=f"https://www.tiktok.com/@{au.get('unique_id')}/video/{a.get('aweme_id')}",
                            followers=au.get('follower_count') or 0, views=s.get('play_count', 0),
                            likes=s.get('digg_count', 0), comments=s.get('comment_count', 0),
                            shares=s.get('share_count', 0), saves=s.get('collect_count', 0),
                            created=a.get('create_time') or 0,
                            duration=round(((a.get('video') or {}).get('duration') or 0) / 1000),
                            text=(a.get('desc') or '').replace('\n', ' '), query=query,
                            media=(((a.get('video') or {}).get('play_addr') or {}).get('url_list') or [''])[0]))
        cursor = d.get('cursor')
        if not cursor:
            break
    return out


def instagram(query):
    d = sc_get('/v2/instagram/reels/search', {'query': query})
    out = []
    for r in d.get('reels') or d.get('items') or []:
        cap = r.get('caption') or {}
        cap = cap.get('text') if isinstance(cap, dict) else (cap or '')
        u = r.get('owner') or r.get('user') or {}
        t = r.get('taken_at') or r.get('taken_at_timestamp') or 0
        if isinstance(t, str):
            try: t = int(datetime.fromisoformat(t.replace('Z', '+00:00')).timestamp())
            except ValueError: t = 0
        code = r.get('shortcode') or r.get('code')
        out.append(dict(platform='instagram', id=str(r.get('id') or code), user=u.get('username'),
                        url=f'https://www.instagram.com/reel/{code}/' if code else '',
                        followers=(u.get('edge_followed_by') or {}).get('count') or u.get('follower_count') or 0,
                        views=r.get('video_play_count') or r.get('play_count') or r.get('video_view_count') or 0,
                        likes=r.get('like_count') or (r.get('edge_liked_by') or {}).get('count') or 0,
                        comments=r.get('comment_count') or 0, shares=0, saves=0, created=t,
                        duration=round(r.get('video_duration') or 0), text=(cap or '').replace('\n', ' '), query=query,
                        media=r.get('video_url') or ''))
    return out


YT_SP = {'month': 'CAMSBAgEEAE', 'year': 'CAMSBAgFEAE'}     # sort by views + uploaded this month / year


def youtube(query, window):
    if not shutil_which('yt-dlp'):
        print('  ! yt-dlp not installed: skipping YouTube (pipx install yt-dlp)', file=sys.stderr)
        return []
    sp = YT_SP['month' if window in ('this-month', 'yesterday', 'this-week') else 'year']
    url = f'https://www.youtube.com/results?search_query={urllib.parse.quote_plus(query)}&sp={sp}'
    r = subprocess.run(['yt-dlp', '--flat-playlist', '-I1:40', '--print',
                        '%(id)s\t%(view_count)s\t%(duration)s\t%(channel)s\t%(channel_url)s\t%(title)s', url],
                       capture_output=True, text=True)
    out = []
    for line in r.stdout.splitlines():
        p = line.split('\t')
        if len(p) < 6 or not p[1].isdigit():
            continue
        out.append(dict(platform='youtube', id=p[0], user=p[3], channel_url=p[4], url=f'https://www.youtube.com/watch?v={p[0]}',
                        followers=0, views=int(p[1]), likes=0, comments=0, shares=0, saves=0, created=0,
                        duration=round(float(p[2])) if p[2] not in ('NA', 'None', '') else 0, text=p[5], query=query))
    return out


def yt_channel_stats(urls):
    """subscribers + median views of the channel's last 60 uploads (the outlier baseline)"""
    stats = {}
    for u in urls:
        r = subprocess.run(['yt-dlp', '--flat-playlist', '-I1:60', '-J', u + '/videos'], capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
            v = [e.get('view_count') for e in d.get('entries', []) if e.get('view_count')]
            stats[u] = (d.get('channel_follower_count') or 0, int(statistics.median(v)) if v else 0)
        except Exception:
            pass
        time.sleep(1)          # gentle: channel pages, a few at a time
    return stats


def shutil_which(cmd):
    from shutil import which
    return which(cmd)


def fmt(n): return f'{n:,}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--niche', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--query', action='append', required=True)
    ap.add_argument('--must', required=True, help='regex every post caption/title must match (case-insensitive)')
    ap.add_argument('--exclude', default=None)
    ap.add_argument('--platforms', default='tiktok,instagram,youtube')
    ap.add_argument('--window', default='last-six-months', help='TikTok date_posted: this-month | last-six-months | this-year')
    ap.add_argument('--since', default=None, help='YYYY-MM-DD: drop posts created before this (default: 12 months back)')
    ap.add_argument('--pages', type=int, default=2)
    ap.add_argument('--yt-channels', type=int, default=20, help='YouTube channels to baseline (subs + median)')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    plats = set(a.platforms.split(','))
    must = re.compile(a.must, re.I); excl = re.compile(a.exclude, re.I) if a.exclude else None
    since = (datetime.fromisoformat(a.since).replace(tzinfo=timezone.utc).timestamp() if a.since
             else time.time() - 365 * 86400)

    raw = []
    for q in a.query:
        print(f'search: {q}', file=sys.stderr)
        if 'tiktok' in plats: raw += tiktok(q, a.window, a.pages)
        if 'instagram' in plats: raw += instagram(q)
        if 'youtube' in plats: raw += youtube(q, a.window)

    posts, seen, per_q = [], set(), {}
    for p in raw:
        key = (p['platform'], p['id'])
        if key in seen or not p['id']:
            continue
        seen.add(key)
        if not must.search(p['text'] or '') or (excl and excl.search(p['text'] or '')):
            continue
        if p['created'] and p['created'] < since:
            continue
        posts.append(p); per_q[p['query']] = per_q.get(p['query'], 0) + 1

    # YouTube: subscribers + each channel's own median, so a video can be scored against its channel
    yt = [p for p in posts if p['platform'] == 'youtube']
    if yt:
        top_ch = []
        for p in sorted(yt, key=lambda p: -p['views']):
            if p['channel_url'] not in top_ch:
                top_ch.append(p['channel_url'])
        st = yt_channel_stats(top_ch[:a.yt_channels])
        for p in yt:
            subs, med = st.get(p['channel_url'], (0, 0))
            p['followers'] = subs; p['channel_median'] = med

    for p in posts:
        p['x_followers'] = round(p['views'] / max(p['followers'], 500), 1) if p['followers'] else None
        p['x_channel'] = round(p['views'] / p['channel_median'], 1) if p.get('channel_median') else None

    acc = {}
    for p in posts:
        k = (p['platform'], p['user'])
        acc.setdefault(k, []).append(p)
    accounts = []
    for (plat, user), ps in acc.items():
        best = max(ps, key=lambda p: p['views'])
        accounts.append(dict(platform=plat, user=user, followers=best['followers'], posts_found=len(ps),
                             best_views=best['views'], best_url=best['url'], best_text=best['text'][:140],
                             x_followers=best['x_followers'], x_channel=best.get('x_channel'),
                             saves_rate=round(100 * sum(p['saves'] for p in ps) / max(1, sum(p['views'] for p in ps)), 2)))
    score = lambda r: (r['x_channel'] or r['x_followers'] or 0)
    accounts.sort(key=lambda r: -score(r))
    json.dump(posts, open(os.path.join(a.out, 'posts.json'), 'w'), indent=1)
    json.dump(accounts, open(os.path.join(a.out, 'accounts.json'), 'w'), indent=1)

    L = [f'# {a.niche}: what is performing', '',
         f'{len(posts)} relevant posts ({", ".join(f"{k} {sum(p["platform"] == k for p in posts)}" for k in sorted(plats))}), '
         f'pulled {datetime.now():%Y-%m-%d}, since {datetime.fromtimestamp(since):%Y-%m-%d}. '
         f'Relevance: must match `{a.must}`' + (f', not `{a.exclude}`' if a.exclude else '') + '.', '',
         '## Top posts by views', '',
         '| Views | Saves % | Shares | x followers | x channel median | Platform | Account | Posted | Length | Caption / title |',
         '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for p in sorted(posts, key=lambda p: -p['views'])[:30]:
        dt = datetime.fromtimestamp(p['created']).strftime('%Y-%m-%d') if p['created'] else ''
        sv = f"{100 * p['saves'] / max(p['views'], 1):.1f}" if p['saves'] else ''
        L.append(f"| {fmt(p['views'])} | {sv} | {fmt(p['shares']) if p['shares'] else ''} | {p['x_followers'] or ''} | "
                 f"{p.get('x_channel') or ''} | {p['platform']} | [{(p['user'] or '').replace('|', '/')}]({p['url']}) | {dt} | {p['duration']}s | "
                 f"{p['text'][:90].replace('|', '/')} |")
    L += ['', '## Outlier accounts', '',
          'Score = best post ÷ channel median (YouTube) or ÷ followers (TikTok / Instagram). One lucky post is not a',
          'formula: pull histories (history.py) for the accounts that hit more than once.', '',
          '| Score | Platform | Account | Followers | Posts found | Best views | Saves % | Best post |',
          '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for r in accounts[:25]:
        L.append(f"| {score(r)}x | {r['platform']} | {(r['user'] or '').replace('|', '/')} | {fmt(r['followers'])} | {r['posts_found']} | "
                 f"{fmt(r['best_views'])} | {r['saves_rate'] or ''} | [{r['best_text'][:70].replace('|', '/')}]({r['best_url']}) |")
    L += ['', '## Posts per query', ''] + [f'- {q}: {n}' for q, n in sorted(per_q.items(), key=lambda x: -x[1])]
    open(os.path.join(a.out, 'report.md'), 'w').write('\n'.join(L) + '\n')
    print(f'discover: {len(posts)} posts, {len(accounts)} accounts -> {a.out}/report.md')


if __name__ == '__main__':
    main()
