/* One-off, 8 Nov 2026: give the rows that had only a section-level SNIFF tag
   ("VIII:*") the specific SNIFF questions their own description answers,
   so Ask AI's search can find them by need and not only by their words.
   Rows no SNIFF question honestly fits stay as they were: the crisis lines
   (their CRISIS tag is what puts them on every Ask AI shortlist), pet help,
   senior centers, showers, laundry and a Facebook group. */
import { readFileSync, writeFileSync } from "node:fs";
const file = new URL("../data/resources.json", import.meta.url);
const data = JSON.parse(readFileSync(file, "utf8"));
const TAGS = {
  "the-little-gym-parent-survival-nights": ["I:11a", "IV:6a"],
  "hair-stylists-experienced-with-autistic-kids": ["IX:9a"],
  "weighted-blankets-project-linus": ["VIII:11a"],
  "children-first-cis-learning-centers": ["I:10a"],
  "asheville-community-movement": ["I:11a"],
  "fostering-the-family": ["IV:5a"],
  "nc-kinship-relative-care": ["IV:5a", "VIII:1a"],
  "trailblazer-routes-free": ["VIII:17a"],
  "wnc-community-health-services": ["ESPANOL:interprete-disponible-", "III:1a", "III:3a", "VI:1a"],
  "samaritan-s-feet-senior-shoe-distributions": ["VIII:12a"],
  "senior-law-project": ["VIII:16a"],
  "working-wheels-senior-repair-program": ["VIII:17a"],
  "bountiful-cities-free-veggie-mondays": ["VIII:5a"],
  "budgie-s-bakery-free-pantry": ["VIII:5a", "VIII:13a"],
  "field-and-kitchen": ["VIII:5a"],
  "free-food-wnc-shared-calendar": ["VIII:5a"],
  "friday": ["VIII:5a"],
  "north-asheville-little-free-pantry": ["VIII:5a"],
  "root-cause-farm-free-market": ["VIII:5a"],
  "rosetta-s-kitchen-everyone-eats": ["VIII:5a"],
  "snap": ["VIII:3a"],
  "saturday": ["VIII:5a"],
  "south-french-broad-free-fridge": ["VIII:5a"],
  "southside-community-farm-fridges": ["VIII:5a", "X:8"],
  "summer-meals": ["VIII:5a"],
  "sunday": ["VIII:5a"],
  "buncombe-county-register-of-deeds": ["VIII:4a", "VIII:11a"],
  "foster-adventist-church": ["VIII:5a", "VIII:12a"],
  "rsa-asheville": ["VIII:4a", "VIII:11a"],
  "asheville-area-habitat-for-humanity": ["VIII:6a"],
  "emerge-ministries-fairview-strong-baptists-o": ["VIII:6a"],
  "foothills-regional-commission": ["VIII:6a"],
  "mountain-housing-opportunities-emergency-hom": ["VIII:6a"],
  "nc-homeowner-assistance-fund": ["VIII:6a"],
  "reduce-to-rebuild": ["VIII:6a"],
  "wnc-repair-cafe": ["VIII:13a"],
  "nc-medassist": ["VI:1a"],
  "pediatric-hearing": ["III:2a", "IX:10a"],
  "wncap": ["VI:1a"],
  "appalachian-mountain-health-dental": ["III:3a"],
  "smile-starters": ["III:3a"],
  "wnc-minnie-jones-health-center": ["III:1a", "III:3a", "VI:1a"],
  "wncchs-dental-urgent-care": ["VI:1a"],
  "open-path-collective": ["VII:2a"],
  "recovery-meetings-mcdowell-county": ["VII:6a"],
  "nc-medicaid-enrollment-broker-which-plan-is": ["III:5a", "VI:4a"],
  "buncombe-county-dss-respite-foster-homes": ["IV:6a"],
  "buncombe-county-kinship-support-group": ["IV:4a", "IV:6a"],
  "crossnore-communities-for-children": ["IV:6a"],
  "asheville-poverty-initiative": ["VIII:5a"],
  "cmarc-care-management-for-at-risk-children-ages-0-5": ["I:6a"],
};
const sniff = JSON.parse(readFileSync(new URL("../data/sniff.json", import.meta.url), "utf8"));
const known = new Set(sniff.needs.map((n) => n.key));
let n = 0;
for (const r of data.resources) {
  const add = TAGS[r.id];
  if (!add) continue;
  for (const k of add) if (!known.has(k)) throw new Error(`${r.id}: unknown SNIFF key ${k}`);
  const keys = new Set(r.needs || []);
  for (const k of add) { keys.add(k); keys.add(k.split(":")[0] + ":*"); }
  r.needs = [...keys].sort();
  n++;
}
if (n !== Object.keys(TAGS).length) throw new Error(`matched ${n} of ${Object.keys(TAGS).length} ids`);
writeFileSync(file, JSON.stringify(data, null, 1) + "\n");
console.log(`tagged ${n} rows`);
