// Best-guess "what does this account sell" from its bio links. Claude or the
// user can overwrite it; this just gives every synced account a starting label.
const RULES: [RegExp, string][] = [
  [/gumroad\.com|stan\.store|payhip\.com|lemonsqueezy|podia\.com|teachable\.com|kajabi/i, "Digital product"],
  [/shopmy\.us|shopltk\.com|liketoknow\.it|amzn\.to|amazon\.[a-z.]+\/shop|rstyle\.me|go\.magik\.ly/i, "Affiliate links"],
  [/beacons\.ai|linktr\.ee|linkin\.bio|lnk\.bio|campsite\.bio|bio\.site|taplink|koji\.to/i, "Link-in-bio store"],
  [/patreon\.com|ko-fi\.com|buymeacoffee\.com|substack\.com/i, "Membership / newsletter"],
  [/skool\.com|circle\.so|whop\.com/i, "Community / course"],
  [/calendly\.com|cal\.com/i, "Coaching / calls"],
];

const SOCIAL = /(instagram|tiktok|youtube|youtu\.be|twitter|x\.com|threads\.net|facebook|pinterest|snapchat|spotify|apple\.com)\./i;

export function classifySells(urls: (string | null | undefined)[]): { sells: string; url: string } | null {
  const clean = urls.filter((u): u is string => !!u && URL.canParse(u.startsWith("http") ? u : `https://${u}`));
  for (const [pattern, label] of RULES) {
    const hit = clean.find((u) => pattern.test(u));
    if (hit) return { sells: `${label} (${new URL(hit.startsWith("http") ? hit : `https://${hit}`).hostname.replace(/^www\./, "")})`, url: hit };
  }
  const own = clean.find((u) => !SOCIAL.test(u));
  if (own) return { sells: `Own site / brand (${new URL(own.startsWith("http") ? own : `https://${own}`).hostname.replace(/^www\./, "")})`, url: own };
  return null;
}
