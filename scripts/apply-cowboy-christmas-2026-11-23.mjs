/*
 * Blue Ridge Cowboy Church's Cowboy Christmas Toy Giveaway, from a flyer
 * shared by Skylar Belt, 23 Nov 2026 (a Facebook post; the poster's name is
 * left out). Saturday 5 Dec 2026, 10am-2pm, 49 Saxon Hill, Fairview 28730:
 * toys for struggling families' children, a free chuckwagon lunch and
 * pictures with Santa. The flyer gives no sign-up step, phone or limits.
 * Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const e = {
  id: "cowboy-christmas-toy-giveaway-2026-12-05", date: "2026-12-05", time: "10am-2pm", kind: "event",
  what: "Cowboy Christmas Toy Giveaway (Blue Ridge Cowboy Church)",
  where: "Blue Ridge Cowboy Church, 49 Saxon Hill, Fairview 28730",
  detail: "Free toys so struggling families have something for their children to open at Christmas, plus a free chuckwagon lunch and pictures with Santa.",
  note: "The flyer gives no sign-up step, phone or limit on toys, so families may want to arrive early.",
  tags: ["Free"], src: "Facebook flyer shared by Skylar Belt, 23 Nov 2026",
};
if (DASH.test(JSON.stringify(e))) throw new Error("dash");
const ev = load("events.json");
if (ev.file.events.some((x) => x.id === e.id)) throw new Error("exists");
ev.file.events.push(e);
save(ev);
const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift({ date: "Nov 23 2026",
  what: "Cowboy Christmas Toy Giveaway, Fairview, Dec 5",
  detail: "Blue Ridge Cowboy Church, 49 Saxon Hill, Fairview: free toys for struggling families, a free chuckwagon lunch and pictures with Santa, Saturday Dec 5, 10am-2pm. On the Events tab.",
  source: "scripts/apply-cowboy-christmas-2026-11-23.mjs" });
save(cl);
console.log("added");
