/*
 * Search check: everyday searches, each measured against what the
 * directory files under the matching SNIFF need, and searches for things no
 * SNIFF question covers (period products, pet food, home repair), each of
 * which must show named programs near the top. It runs the same code the
 * search box (src/search.js) and Ask AI's search (src/shortlist.js) run.
 *
 *   npm run search-check
 *
 * It fails when the search box finds less than 95% of what is filed under
 * the needs, or Ask AI's shortlist less than 80%. Run it after a data import
 * or a change to the search, and add a search here when someone reports one
 * that came up short.
 */
import { readFileSync } from "node:fs";
import { buildIndex } from "../src/shortlist.js";

const read = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const resources = read("resources.json").resources.map((r) => ({
  id: r.id, name: r.n, tags: r.t || "", detail: r.d || "", address: r.a || "", origSection: r.os || "",
  phone: r.ph || "", web: r.w || "", point: r.pp || "", needs: r.needs || [], spanish: r.sp || "", hours: r.h || "",
}));
const index = buildIndex(resources, read("sniff.json").needs);

/* src/search.js's searchResources, without the browser's data.js import */
const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ");
const literal = (r, terms) => {
  const n = norm(r.name), t = norm(r.tags), d = norm(r.detail);
  const a = norm(`${r.address} ${r.origSection} ${r.phone} ${r.web} ${r.point}`);
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
};
const searchBox = (q) => {
  const terms = norm(q).split(" ").filter(Boolean);
  const smart = index.rank(q);
  return resources
    .map((r) => { const lit = literal(r, terms); return { r, s: (smart.get(r.id) || 0) + (lit ? (4 + lit / 3) * smart.weight(r.id) : 0) }; })
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.r);
};

const SEARCHES = [
  ["free food", ["VIII:5a"]], ["food pantry", ["VIII:5a"]], ["groceries", ["VIII:5a"]], ["hot meal", ["VIII:5a"]],
  ["food for my kids", ["VIII:5a"]], ["comida gratis", ["VIII:5a"]],
  ["diapers", ["VIII:11a", "VIII:4a"]], ["formula", ["VIII:4a"]], ["car seat", ["VIII:11a"]], ["crib", ["VIII:11a"]],
  ["rent help", ["VIII:6a"]], ["eviction", ["VIII:6a"]], ["electric bill", ["VIII:14a"]], ["heat", ["VIII:14a"]],
  ["shelter tonight", ["VIII:7a"]], ["domestic violence", ["VII:7a", "VIII:8a"]],
  ["daycare", ["I:7a", "VIII:9a"]], ["preschool", ["I:7a"]], ["speech delay", ["I:2a", "I:1a"]],
  ["autism evaluation", ["IX:1a", "IX:2a"]], ["counseling", ["VII:2a"]], ["therapist for my son", ["II:7a", "VII:2a"]],
  ["dentist", ["III:3a"]], ["doctor", ["III:1a", "VI:1a"]], ["medicaid", ["III:5a", "VI:4a"]], ["food stamps", ["VIII:3a"]],
  ["wic", ["VIII:4a"]], ["clothes", ["VIII:12a"]], ["winter coats", ["VIII:12a"]], ["christmas toys", ["VIII:10a"]],
  ["ride to appointment", ["VIII:17a"]], ["bus", ["VIII:17a"]], ["lawyer", ["VIII:16a"]], ["immigration", ["VIII:15a"]],
  ["spanish", ["ESPANOL:servicios-en-espanol-p", "ESPANOL:personal-bilingue-bili"]], ["furniture", ["VIII:13a"]],
  ["job training", ["V:4a", "V:8a"]], ["GED", ["V:1a"]], ["respite", ["IV:6a"]], ["parenting class", ["IV:4a"]],
  ["free vegetables", ["VIII:5a"]], ["fresh produce", ["VIII:5a"]], ["turkey", ["VIII:5a"]], ["dads group", ["IV:4a"]],
];

/* searches whose answer is a few named programs: each must be in the top N
   of the search box (added 20 Nov 2026 from a search audit) */
const MUST = [
  ["free vegetables", ["bountiful-cities-share-markets", "bounty-soul", "root-cause-farm-free-market"], 6],
  ["tampons", ["period-pantry-locations", "project-dignity-of-wnc"], 5],
  ["pet food", ["community-partnership-for-pets", "cherokee-animal-care-pet-food-distribution-w"], 6],
  ["dog food", ["community-partnership-for-pets"], 6],
  ["fathers", ["my-daddy-taught-me-that", "free-monthly-dads-group-early-childhood"], 5],
  ["birth certificate", ["buncombe-county-register-of-deeds"], 3],
  ["glasses", ["eblen-charities"], 3],
  ["roof", ["habitat-critical-home-repair"], 5],
  ["mold", ["habitat-critical-home-repair"], 5],
  ["turkey", ["garren-creek-thanksgiving-boxes-swannanoa"], 6],
  ["food stamps", ["snap"], 3],
  ["domestic violence", ["helpmate-domestic-violence-hotline"], 6],
];

let filed = 0, boxFound = 0, aiFound = 0, top20 = 0;
const rows = [];
for (const [q, keys] of SEARCHES) {
  const truth = new Set(resources.filter((r) => r.needs.some((k) => keys.includes(k))).map((r) => r.id));
  const box = searchBox(q);
  const b = box.filter((r) => truth.has(r.id)).length;
  const a = index(q).resources.filter((r) => truth.has(r.id)).length;
  const t = box.slice(0, 20).filter((r) => truth.has(r.id)).length / Math.min(20, Math.max(1, box.length));
  filed += truth.size; boxFound += b; aiFound += a; top20 += t;
  rows.push(`${q.padEnd(22)} ${String(truth.size).padStart(4)} filed | box ${String(b).padStart(4)} | Ask AI ${String(a).padStart(4)} | top 20 ${(100 * t).toFixed(0)}% relevant`);
}
console.log(rows.join("\n"));
const box = boxFound / filed, ai = aiFound / filed;
console.log(`\nsearch box finds ${(100 * box).toFixed(0)}% | Ask AI's shortlist ${(100 * ai).toFixed(0)}% | top 20 relevant on average ${(100 * top20 / SEARCHES.length).toFixed(0)}%`);
const missed = [];
for (const [q, ids, n] of MUST) {
  const top = searchBox(q).slice(0, n).map((r) => r.id);
  for (const id of ids) {
    if (!resources.some((r) => r.id === id)) missed.push(`${q}: no resource ${id} in the data`);
    else if (!top.includes(id)) missed.push(`${q}: ${id} not in the top ${n}`);
  }
}
console.log(`named programs near the top: ${MUST.length - new Set(missed.map((m) => m.split(":")[0])).size} of ${MUST.length} searches`);
if (missed.length) console.error(missed.join("\n"));
if (box < 0.95 || ai < 0.8 || missed.length) {
  console.error("search check FAILED: below 95% (search box) or 80% (Ask AI), or a named program missing");
  process.exit(1);
}
console.log("search check passed");
