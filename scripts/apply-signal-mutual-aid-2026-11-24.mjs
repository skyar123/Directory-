/*
 * The two other Signal group links Skylar shared on 23 Nov 2026. Run once.
 *
 * On 24 Nov 2026 Skylar said they are public mutual aid group chats that
 * anyone can join. The third link from the same message (the free resource
 * chat) already has its own row, free-resource-signal-group. Signal group
 * links only open in the app, so the groups' names could not be checked from
 * here; the rows are told apart as A and B in the order Skylar sent them.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const clean = (s) => { if (DASH.test(s)) throw new Error(`dash in: ${s.slice(0, 80)}`); return s; };
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

const LINKS = [
  "https://signal.group/#CjQKIF2Is5nUWSY4ObZjnTscYPthzJCNIbe9a4s_5HURQr34EhDoUQdGrrNm5WA4kZ9zp4kQ",
  "https://signal.group/#CjQKICn2yWgaYYkI-UEe8pWPeJxlCefx3jCqYndw3jlE-VcwEhCgu2nrpG59PMMslIUUGiXh",
];
const res = load("resources.json");
const list = res.file.resources;
if (!list.some((r) => r.id === "free-resource-signal-group")) throw new Error("free resource Signal row missing");
for (const w of LINKS) if (list.some((r) => r.w === w)) throw new Error(`link already listed: ${w}`);

["a", "b"].forEach((k, i) => {
  const id = `mutual-aid-signal-group-${k}`;
  if (list.some((r) => r.id === id)) throw new Error(`${id} exists`);
  list.push({
    id,
    n: `Mutual aid group chat ${k.toUpperCase()} (public Signal group)`,
    pp: "", sp: "⚪ Not listed - ask", spd: "Not stated in the source.", ph: "", em: "",
    w: LINKS[i],
    d: clean("A public Signal group chat for mutual aid that anyone can join: neighbors posting what they need and what they "
      + "can share. Open the link on a phone with the Signal app installed to join. There are two such chats in this "
      + "directory (A and B) and a separate free resource chat."),
    a: "", h: "", os: "Community group chats", t: "Free", lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:5a"],
    src: "Link shared by Skylar Belt, 23 Nov 2026; described by Skylar on 24 Nov 2026 as a public mutual aid group chat anyone can join",
    note: clean("The group's name and moderators could not be checked from here: Signal group links only open in the app. "
      + "Members can see each other's Signal names, so a family may want a profile name they are comfortable sharing."),
    new: true,
  });
});

res.file.meta.count = list.length;
res.file.meta.sources.push("Two public mutual aid Signal groups, 24 Nov 2026 (see scripts/apply-signal-mutual-aid-2026-11-24.mjs)");
save(res);

const cl = load("changelog.json");
const entry = {
  date: "Nov 24 2026",
  what: "Two public mutual aid group chats added",
  detail: clean("The two other Signal links shared on 23 Nov are public mutual aid group chats that anyone can join. They are "
    + "listed as Mutual aid group chat A and B, next to the free resource group chat, under Food and basic needs. Each "
    + "opens in the Signal app."),
  source: "scripts/apply-signal-mutual-aid-2026-11-24.mjs",
};
cl.file.groups.find((g) => g.id === "added").entries.unshift(entry);
save(cl);
console.log(`added 2 rows (${list.length} in all)`);
