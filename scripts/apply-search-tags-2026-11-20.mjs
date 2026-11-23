/*
 * Food pantry tags found by a search audit, 2026-11-20. Run once.
 *
 * "free vegetables" and "free produce wednesday" missed food rows that are
 * filed under the wrong SNIFF question, or none:
 *  - Community Engagement Markets (the workbook's "3.5 Fresh Produce Markets
 *    (free)") was filed under VIII:10a, Toys or books. It is a free produce
 *    market, so it moves to VIII:5a, Food pantry.
 *  - The seven day-by-day food schedules ("3.3 Weekly Pantry Schedule (by
 *    day)") are food rows, but Monday, Tuesday, Wednesday and Thursday did not
 *    carry Food pantry. Wednesday instead carried GED, ESL, job training,
 *    college and substance use treatment (V:1a, V:2a, V:4a, V:7a, VII:6a),
 *    which nothing in it supports, so those go.
 *  - Family Resource Center at Emma lists a pantry in its own description.
 * Nothing else on these rows changes.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../data/resources.json", import.meta.url);
const file = JSON.parse(readFileSync(path, "utf8"));
const list = file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(`no row ${id}`); return r; };
const SRC = "SNIFF tags corrected 20 Nov 2026 from the row's own text or workbook section (search audit; scripts/apply-search-tags-2026-11-20.mjs)";
const setNeeds = (r, add, drop = []) => {
  for (const k of drop) {
    if (!r.needs.includes(k)) throw new Error(`${r.id} does not carry ${k}`);
  }
  r.needs = r.needs.filter((k) => !drop.includes(k));
  /* a section's ":*" key goes with its last specific key */
  for (const sec of new Set(drop.map((k) => k.split(":")[0]))) {
    if (!r.needs.some((k) => k.startsWith(sec + ":") && !k.endsWith(":*"))) r.needs = r.needs.filter((k) => k !== sec + ":*");
  }
  for (const k of add) {
    if (r.needs.includes(k)) throw new Error(`${r.id} already carries ${k}`);
    r.needs.push(k);
    const wild = k.split(":")[0] + ":*";
    if (!r.needs.includes(wild)) r.needs.push(wild);
  }
  r.needs.sort();
  r.src = `${String(r.src || "").trim()}; ${SRC}`;
};

const cem = get("community-engagement-markets");
if (cem.os !== "3.5 Fresh Produce Markets (free)") throw new Error("Community Engagement Markets section changed");
setNeeds(cem, ["VIII:5a"], ["VIII:10a"]);

for (const id of ["monday", "tuesday", "thursday"]) {
  const r = get(id);
  if (r.os !== "3.3 Weekly Pantry Schedule (by day)") throw new Error(`${id} section changed`);
  setNeeds(r, ["VIII:5a"]);
}
const wed = get("wednesday");
if (wed.os !== "3.3 Weekly Pantry Schedule (by day)") throw new Error("wednesday section changed");
if (/\b(GED|ESL|job training|college|substance use)\b/i.test(wed.d)) throw new Error("wednesday text now supports its old tags");
setNeeds(wed, ["VIII:5a"], ["V:1a", "V:2a", "V:4a", "V:7a", "VII:6a"]);

const emma = get("family-resource-center-at-emma");
if (!/\bPantry\b/.test(emma.d)) throw new Error("Emma no longer lists a pantry");
setNeeds(emma, ["VIII:5a"]);

file.meta.sources.push("SNIFF tags corrected from a search audit, 20 Nov 2026 (see scripts/apply-search-tags-2026-11-20.mjs)");
writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

const clPath = new URL("../data/changelog.json", import.meta.url);
const cl = JSON.parse(readFileSync(clPath, "utf8"));
const entry = {
  date: "Nov 20 2026",
  what: "Search understands more everyday words",
  detail: "The search box and Ask AI now know the directory's words for things families ask about in their own words: "
    + "\"free vegetables\", \"produce\" and \"fruit\" find the produce markets and pantries (they found 3 rows before); "
    + "\"tampons\" and \"toothpaste\" the period pantries and hygiene closets; \"pet food\" and \"dog food\" the pet "
    + "programs, not every food pantry; \"fathers\" and \"dads group\" the fatherhood programs (\"dad\" and \"mom\" "
    + "were ignored as filler); \"roof\" and \"mold\" the home repair programs; \"birth certificate\" the Register of "
    + "Deeds; \"turkey\" and \"Thanksgiving\" the holiday meals; \"food stamps\" the SNAP rows first. A program filed "
    + "under many needs (a diaper bank filed under domestic violence because Helpmate hands out its diapers) now ranks "
    + "after the programs that are about the need. Community Engagement Markets moved from Toys or books to Food "
    + "pantry, the Monday to Thursday food schedules and the Family Resource Center at Emma joined Food pantry, and "
    + "the Wednesday schedule left GED, ESL, job training and substance use.",
  source: "scripts/apply-search-tags-2026-11-20.mjs; src/shortlist.js, scripts/search-check.mjs",
};
if (/[–—]/.test(JSON.stringify(entry))) throw new Error("dash in changelog entry");
cl.groups.find((g) => g.id === "added").entries.unshift(entry);
writeFileSync(clPath, JSON.stringify(cl, null, 1) + "\n");
console.log("tags corrected on 6 rows");
