/*
 * Dates that passed overnight, 24 Nov 2026. Run once.
 *  - ABIPA's Free Sunday Shop met on 22 Nov at the Friendship Center; it moves
 *    month to month, and the next 4th Sunday is 27 Dec 2026.
 *  - The 19 Nov Narcan training has passed; Dec 8 and Dec 17 remain.
 * Events in data/events.json are hidden by the app once their date passes, so
 * only listing text needs changing here.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const swap = (obj, k, from, to) => {
  if (!String(obj[k] || "").includes(from)) throw new Error(`${k} no longer has: ${from}`);
  if (DASH.test(to)) throw new Error(`dash in: ${to}`);
  obj[k] = obj[k].replace(from, to);
};
const SRC = "date review 24 Nov 2026 (scripts/apply-dates-2026-11-24.mjs)";

const res = load("resources.json");
const get = (id) => { const r = res.file.resources.find((x) => x.id === id); if (!r) throw new Error(`no row ${id}`); return r; };

const sun = get("sunday");
swap(sun, "d", "(Friendship Center, 142 Shiloh Rd on 22 Nov 2026; 828-785-3470)",
  "(next 27 Dec 2026; the place changes, so check the month's flyer or call 828-785-3470)");
sun.src = `${sun.src}; ${SRC}`;

const nar = get("free-narcan-trainings-nov-dec-2026");
swap(nar, "h", "Thu Nov 19, Tue Dec 8 and Thu Dec 17, 2026 (times on each listing)",
  "Tue Dec 8 and Thu Dec 17, 2026 (times on each listing; the Nov 19 session has passed)");
nar.src = `${nar.src}; ${SRC}`;
save(res);

const food = load("food-by-day.json");
const site = food.file.days.flatMap((d) => d.sites).find((s) => s.place === "ABIPA Free Sunday Shop");
if (!site) throw new Error("ABIPA missing from Food by day");
swap(site, "when", "4th Sunday 3-6pm (Friendship Center, 142 Shiloh Rd on 22 Nov 2026)", "4th Sunday 3-6pm (next 27 Dec 2026)");
save(food);
console.log("updated 3 entries");
