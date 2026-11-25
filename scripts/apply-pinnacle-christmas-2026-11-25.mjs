/*
 * Pinnacle Apothecary's free Christmas toy giveaway, from a flyer Skylar Belt
 * shared 25 Nov 2026: Sunday 29 Nov 2026, 2-5pm, 1388 Sand Hill Rd, Candler
 * 28715. Free toys and pencils, no purchase needed, everyone welcome; details
 * at tinyurl.com/PinnacleChristmas2026. The link was not opened from here.
 * The same message shared the free resource Signal chat (already listed) with
 * how to invite someone: in Signal, tap the chat name, then scroll down to add
 * members or further down to copy the invite link. That tip goes on the three
 * Signal chat rows. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

const e = {
  id: "pinnacle-apothecary-free-toys-2026-11-29", date: "2026-11-29", time: "2-5pm", kind: "event",
  what: "Free toys for Christmas (Pinnacle Apothecary)",
  where: "Pinnacle Apothecary, 1388 Sand Hill Rd, Candler 28715",
  detail: "Free Christmas toys and pencils. No purchase necessary and everyone is welcome. More details at tinyurl.com/PinnacleChristmas2026.",
  note: "The flyer gives no sign-up step or limit, so families may want to arrive early.",
  tags: ["Free"], src: "Flyer shared by Skylar Belt, 25 Nov 2026",
};
if (DASH.test(JSON.stringify(e))) throw new Error("dash");
const ev = load("events.json");
if (ev.file.events.some((x) => x.id === e.id)) throw new Error("exists");
ev.file.events.push(e);
save(ev);

const TIP = "To invite someone: in Signal, tap the chat name, then scroll down to add members, or further down to copy the invite link.";
const res = load("resources.json");
for (const id of ["free-resource-signal-group", "mutual-aid-signal-group-a", "mutual-aid-signal-group-b"]) {
  const r = res.file.resources.find((x) => x.id === id);
  if (!r) throw new Error(`no row ${id}`);
  if ((r.note || "").includes("To invite someone")) throw new Error(`${id} already has the tip`);
  r.note = `${r.note} ${TIP}`.trim();
  r.src = `${r.src}; invite tip from Skylar Belt, 25 Nov 2026`;
}
save(res);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift({ date: "Nov 25 2026",
  what: "Free Christmas toys, Pinnacle Apothecary, Candler, Nov 29",
  detail: "Pinnacle Apothecary, 1388 Sand Hill Rd, Candler: free toys and pencils, no purchase needed and everyone welcome, Sunday Nov 29, 2-5pm. On the Events tab. The three Signal group chats now say how to invite someone.",
  source: "scripts/apply-pinnacle-christmas-2026-11-25.mjs" });
save(cl);
console.log("added");
