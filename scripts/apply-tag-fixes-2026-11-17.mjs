/*
 * SNIFF tag fixes, 2026-11-17.
 *
 * A resource shows up under a need (By SNIFF question, Ask AI's "All N"
 * button, the need buttons on Find, and the search's matching by need) only
 * if it carries that need's key. An audit of names and descriptions found
 * food providers, dental clinics, rent programs and counseling practices
 * missing the key for what they plainly offer, so a staff member looking at
 * "Food pantry" never saw, for example, Swannanoa Communities Together or
 * the Haywood Street Welcome Table. Each key below is backed by the row's
 * own name or description; nothing else changes. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../data/resources.json", import.meta.url);
const file = JSON.parse(readFileSync(path, "utf8"));
const list = file.resources;

const ADD = {
  "VIII:5a": [
    "haywood-street-congregation-downtown-welcome", // Welcome Table meals
    "beloved-asheville-street-pantries", // 24/7 street pantries
    "swannanoa-communities-together", // pantry and free fridges
    "swannanoa-valley-christian-ministry", // food pantry
    "meals-on-wheels", // home-delivered meals
    "summer-meals-for-kids-sun-bucks-120-child", // free summer meals
    "free-meals-delivered-after-a-hospital-stay-m", // delivered meals
    "text-foodnc-to-877-877", // food finder text line
    "cula-centro-unido-latino-americano", // biweekly drive-thru pantry
    "tranzmission", // food pantry
    "estes-resource-center", // food pantry
    "asheville-christian-refugee-ministry", // pantry (Food by day, Thursdays)
  ],
  "VIII:11a": ["asheville-christian-refugee-ministry"], // diapers
  "VIII:4a": ["asheville-christian-refugee-ministry"], // formula
  "III:3a": ["mahec-dental-health-center", "wncchs-dental-urgent-care"],
  "VIII:6a": ["eblen-charities-helene-rebuilding-and-rental", "salvation-army-rent-assistance"],
  "VII:2a": [
    "anchor-perinatal-wellness-waypoint-counselin", "national-deaf-therapy-deaf-counseling-center",
    "aspire-psychiatry", "out-of-the-woods-therapy",
  ],
};

let n = 0;
for (const [key, ids] of Object.entries(ADD)) {
  const wild = key.split(":")[0] + ":*";
  for (const id of ids) {
    const r = list.find((x) => x.id === id);
    if (!r) throw new Error(`no resource ${id}`);
    if (r.needs.includes(key)) throw new Error(`${id} already has ${key}`);
    r.needs.push(key);
    if (!r.needs.includes(wild)) r.needs.push(wild);
    r.needs.sort();
    r.src = `${r.src.trim()}; ${key} tag added 17 Nov 2026 from the row's own name or description (tag audit)`;
    n++;
  }
}
file.meta.sources.push("SNIFF tag fixes from a name and description audit, 17 Nov 2026 (see scripts/apply-tag-fixes-2026-11-17.mjs)");
writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

/* the What changed tab: these tags ship with the new search box */
const clPath = new URL("../data/changelog.json", import.meta.url);
const cl = JSON.parse(readFileSync(clPath, "utf8"));
const entry = {
  date: "Nov 17 2026",
  what: "Search finds the whole directory, in everyday words and Spanish",
  detail: "The search box used to need every typed word to appear word for word, so it found about a quarter of what fits "
    + "an everyday search (\"groceries\", \"shelter tonight\" and \"food for my kids\" found almost nothing). It now uses the "
    + "same engine as Ask AI: word stems, everyday and Spanish words for each need, the needs each resource is filed under, "
    + "and Buncombe programs first unless a town is named; names and phone numbers still match exactly. Across 40 everyday "
    + `searches it finds 99% of what is filed under the need, up from 25%. ${n} missing need tags were added (for example `
    + "Swannanoa Communities Together and the Haywood Street Welcome Table under Food pantry). The Events search now "
    + "matches plurals, folds accents and ignores filler words.",
  source: "scripts/apply-tag-fixes-2026-11-17.mjs; src/search.js, src/shortlist.js",
};
if (/[\u2013\u2014]/.test(JSON.stringify(entry))) throw new Error("dash in changelog entry");
cl.groups.find((g) => g.id === "added").entries.unshift(entry);
writeFileSync(clPath, JSON.stringify(cl, null, 1) + "\n");
console.log(`added ${n} need keys`);
