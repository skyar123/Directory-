/*
 * Apply the web-check findings of the November 2026 review
 * (scripts/review/findings-2026-11.json) to data/. Each finding:
 *   r: confirmed | partly | changed | notfound
 *   expect / set: field values to replace (the old value must match)
 *   setIfEmpty: fields to fill only where the row has none
 *   note: a sentence added to the row's note
 *   food: matching Food by day entries to update ({day, match, when} or
 *         {match, whenByDay})
 *   src: what the search found, added to the row's source
 * Findings already applied (listed in applied-2026-11.json) are skipped, so
 * this can run after each batch. Rows marked notfound get a standard note.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const rd = (u) => JSON.parse(readFileSync(u, "utf8"));
const F = rd(new URL("./findings-2026-11.json", import.meta.url));
const doneUrl = new URL("./applied-2026-11.json", import.meta.url);
const done = new Set(existsSync(doneUrl) ? rd(doneUrl) : []);
const resUrl = new URL("../../data/resources.json", import.meta.url);
const foodUrl = new URL("../../data/food-by-day.json", import.meta.url);
const res = rd(resUrl), food = rd(foodUrl);
const DATE = process.argv[2] || "23 Nov 2026";
const NOTFOUND = `A web search (${DATE}) found no online listing for this; confirm by phone or with the community food guide before sending anyone.`;
let n = 0;
for (const f of F) {
  if (done.has(f.id)) continue;
  const r = res.resources.find((x) => x.id === f.id);
  if (!r) throw new Error(`no row ${f.id}`);
  for (const [k, v] of Object.entries(f.expect || {})) if ((r[k] || "") !== v) throw new Error(`${f.id}.${k} is "${r[k]}", expected "${v}"`);
  for (const [k, v] of Object.entries(f.set || {})) r[k] = v;
  for (const [k, v] of Object.entries(f.setIfEmpty || {})) if (!(r[k] || "").trim()) r[k] = v;
  const note = f.r === "notfound" ? NOTFOUND : f.note;
  if (note) r.note = `${(r.note || "").trim()} ${note}`.trim();
  r.src = `${String(r.src || "").trim()}; review ${DATE}: ${f.r === "notfound" ? "not found online" : f.src}`;
  if (f.food) {
    const days = f.food.whenByDay ? Object.keys(f.food.whenByDay) : [f.food.day];
    let hit = 0;
    for (const day of days) {
      const d = food.days.find((x) => x.day === day);
      for (const s of d.sites) if (s.place.includes(f.food.match)) { s.when = f.food.whenByDay ? f.food.whenByDay[day] : f.food.when; hit++; }
    }
    if (!hit) console.warn(`  no Food by day entry for ${f.id} (${f.food.match})`);
  }
  if (DASH.test(JSON.stringify(r))) throw new Error(`dash in ${f.id}`);
  done.add(f.id); n++;
}
writeFileSync(resUrl, JSON.stringify(res, null, 1) + "\n");
writeFileSync(foodUrl, JSON.stringify(food, null, 1) + "\n");
writeFileSync(doneUrl, JSON.stringify([...done], null, 1) + "\n");
console.log(`applied ${n} findings (${done.size} in all)`);
