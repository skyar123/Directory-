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
