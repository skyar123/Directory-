import { norm } from "./data.js";

/* weighted so a name hit beats a tag hit beats a body hit; every term has to
   land somewhere or the resource drops out entirely */
export function score(r, terms) {
  if (!terms.length) return 1;
  const n = norm(r.name), t = norm(r.tags), d = norm(r.detail);
  const a = norm(r.address + " " + r.origSection + " " + r.phone + " " + r.web + " " + r.point);
  let s = 0;
  for (const term of terms) {
    let hit = 0;
    if (n.includes(term)) hit += 12;
    if (t.includes(term)) hit += 5;
    if (a.includes(term)) hit += 4;
    if (d.includes(term)) hit += 2;
    if (!hit) return 0;
    s += hit;
  }
  return s;
}

/* The search box. Word-for-word matching alone found about a quarter of what
   fits an everyday search ("groceries", "shelter tonight", "food for my
   kids" found almost nothing), so the shared engine in shortlist.js does the
   finding: word stems, everyday words for each SNIFF need, the needs each
   resource is filed under, Spanish, and programs in Buncombe first when no
   place is named. The word-for-word score still adds in, so names, partial
   names ("ebl" for Eblen), phone numbers and websites are found as before.
   rank is the index's search.rank. */
export function searchResources(resources, q, rank) {
  const terms = norm(q).split(" ").filter(Boolean);
  if (!terms.length) return resources.map((r) => ({ r, s: 1 }));
  const smart = rank(q);
  return resources
    .map((r) => {
      const lit = score(r, terms);
      const w = smart.weight ? smart.weight(r.id) : 1;
      return { r, s: (smart.get(r.id) || 0) + (lit ? (4 + lit / 3) * w : 0) };
    })
    .filter((x) => x.s > 0);
}

/* suggestions for an assessment row: SNIFF-question overlap first, then the
   row's fallback keywords */
export function craCandidates(row, resources) {
  const needSet = new Set(row.needs);
  const out = [];
  for (const r of resources) {
    let s = 0, why = "";
    if (r.needs.some((k) => needSet.has(k))) { s += 40; why = "on this SNIFF question"; }
    const blob = norm(r.name + " " + r.tags + " " + r.origSection + " " + r.detail);
    let kwHits = 0;
    for (const k of row.kw) if (blob.includes(k)) kwHits++;
    if (kwHits) {
      s += kwHits * 6 + (norm(r.name).includes(row.kw[0]) ? 10 : 0);
      if (!why) why = "keyword match";
    }
    if (s > 0) out.push({ r, s, why });
  }
  out.sort((a, b) => b.s - a.s || a.r.name.localeCompare(b.r.name));
  return out;
}
