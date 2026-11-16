/*
 * Flyers shared by Skylar Belt, 16 Nov 2026: Carolina Complete Health and YMCA
 * food distribution (Nov 19), Restoration House free haircut clinic (Nov 17),
 * and the City of Asheville Community Closet at Murphy-Oakley (Nov 18, Dec 9).
 * Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => { const s = JSON.stringify(v); if (DASH.test(s)) throw new Error(`dash: ${s.slice(0, 90)}`); return v; };
const FLYER = "Flyer shared by Skylar Belt, 16 Nov 2026";

const res = load("resources.json");
if (res.file.resources.some((r) => r.id === "community-closet-murphy-oakley")) throw new Error("exists");
res.file.resources.push(clean({
  id: "community-closet-murphy-oakley", n: "Community Closet at Murphy-Oakley Community Center (free stuff)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.", ph: "828-232-4529", em: "", w: "avlrec.com",
  d: "City of Asheville Parks & Recreation free closet: take what you need, leave what you can. Monthly on a Wednesday, "
    + "1-2pm (2026: Sep 9, Oct 14, Nov 18, Dec 9). Call 828-232-4529 to drop off donations.",
  a: "Murphy-Oakley Community Center, 749 Fairview Rd, Asheville 28803", h: "Monthly, 1-2pm (next: Nov 18 and Dec 9, 2026)",
  os: "Flyers", t: "Free", lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:12a", "VIII:13a"],
  src: `${FLYER} (City of Asheville Parks & Recreation)`, note: "", new: true,
}));
res.file.meta.count = res.file.resources.length;
res.file.meta.sources.push("Flyers shared 16 Nov 2026 (see scripts/apply-flyers-2026-11-16.mjs)");
save(res);

const ev = load("events.json");
const add = [
  { id: "restoration-house-haircuts-2026-11-17", date: "2026-11-17", kind: "event", what: "Free haircut clinic at Restoration House",
    detail: "Local stylists Brooke Shipman and Cat Raybon Burns give free haircuts.", tags: ["Free"],
    note: "The flyer gives no time or address. The WNC free food guide lists Restoration House WNC at 81 Academy St, Bryson City; confirm it is this one.",
    src: `${FLYER} (Restoration House)` },
  { id: "community-closet-murphy-oakley-2026-11-18", date: "2026-11-18", time: "1-2pm", kind: "event",
    what: "Community Closet: free stuff at Murphy-Oakley", where: "Murphy-Oakley Community Center, 749 Fairview Rd, Asheville 28803",
    detail: "Take what you need, leave what you can.", tags: ["Free"], ph: "828-232-4529", w: "avlrec.com",
    rid: "community-closet-murphy-oakley", src: `${FLYER} (City of Asheville Parks & Recreation)` },
  { id: "cch-ymca-food-distribution-2026-11-19", date: "2026-11-19", time: "11am-12pm", kind: "event",
    what: "Free food distribution: Carolina Complete Health and YMCA", where: "150 Tunnel Rd, Asheville 28805 (bus stop #443 on WE1)",
    detail: "Fresh groceries, free, everyone welcome. Reserve a spot on the Eventbrite listing (Carolina Complete Health - Asheville).",
    tags: ["Free"], src: `Eventbrite listing shared by Skylar Belt, 16 Nov 2026` },
  { id: "community-closet-murphy-oakley-2026-12-09", date: "2026-12-09", time: "1-2pm", kind: "event",
    what: "Community Closet: free stuff at Murphy-Oakley", where: "Murphy-Oakley Community Center, 749 Fairview Rd, Asheville 28803",
    detail: "Take what you need, leave what you can.", tags: ["Free"], ph: "828-232-4529", w: "avlrec.com",
    rid: "community-closet-murphy-oakley", src: `${FLYER} (City of Asheville Parks & Recreation)` },
];
for (const e of add) { if (ev.file.events.some((x) => x.id === e.id)) throw new Error(e.id); ev.file.events.push(clean(e)); }
ev.file.events.sort((a, b) => a.date.localeCompare(b.date));
save(ev);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 16 2026", what: "Flyers: Community Closet, food distribution, free haircuts",
  detail: "New row for the City's monthly Community Closet at Murphy-Oakley (Nov 18, Dec 9). Calendar: Restoration House free haircuts (Nov 17), Carolina Complete Health and YMCA food distribution at 150 Tunnel Rd (Nov 19, reserve a spot).",
  source: "scripts/apply-flyers-2026-11-16.mjs",
}));
save(cl);
console.log("done", res.file.resources.length);
