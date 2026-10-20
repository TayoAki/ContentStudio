#!/bin/bash
# Downloads the OFL fonts the reel templates use (TikTok Sans, JetBrains Mono) from Google Fonts.
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)/fonts"
mkdir -p "$dir"
css="$dir/fonts.css"
curl -fsS -o "$css" "https://fonts.googleapis.com/css2?family=TikTok+Sans:wdth,wght@75,600;100,500&family=JetBrains+Mono:wght@400"
python3 -I -c '
import re, subprocess, sys
out = sys.argv[1]
for blk in open(sys.argv[2]).read().split("}"):
    fam = re.search(r"font-family: .([^\x27]+).;", blk)
    if not fam:
        continue
    weight = re.search(r"font-weight: (\d+)", blk).group(1)
    cond = "condensed" in blk
    url = re.search(r"url\((\S+?)\)", blk).group(1)
    name = fam.group(1).replace(" ", "") + ("-Cond" if cond else "") + f"-{weight}.ttf"
    subprocess.run(["curl", "-fsS", "-o", f"{out}/{name}", url], check=True)
    print(name)
' "$dir" "$css"
rm -f "$css"
