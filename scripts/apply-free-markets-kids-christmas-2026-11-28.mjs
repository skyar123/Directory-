/*
 * Three flyers Skylar Belt shared 28 Nov 2026. Run once.
 *  - WAVL Really Really Free Market (wavlrrfm on Instagram): Sat 28 Nov 2026,
 *    1-4pm, 27 Balm Grove Ave, back pavilion, West Asheville. Bring, take
 *    and give stuff.
 *  - ROAR Really Really Free Market (_roar_wnc on Instagram), a monthly mutual
 *    aid meetup: Sun 13 Dec 2026, 2-5pm, Mal's Bar, 121 S Main St, Marshall.
 *    Book, music and art swap; no bartering or selling.
 *    ruralorganizing.wordpress.com.
 *  - Candler Church Mega Harvest Kids Christmas Event: Sun 20 Dec 2026,
 *    10:30am, 1945 Smokey Park Hwy, Candler. Ages 1 to 12; kids shop for and
 *    pick out their own gift. The flyer prints ZIP 28714; Candler's is 28715,
 *    so the ZIP is left off.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const SRC = "Flyer shared by Skylar Belt, 28 Nov 2026";

const add = [
  {
    id: "wavl-really-really-free-market-2026-11-28", date: "2026-11-28", time: "1-4pm", kind: "event",
    what: "WAVL Really Really Free Market (West Asheville)",
    where: "27 Balm Grove Ave, back pavilion, West Asheville",
    detail: "A free market: bring stuff, take stuff, give stuff. Nothing is sold. Posted by the West Asheville Really Really Free Market (wavlrrfm on Instagram).",
    note: "Families do not need to bring anything to take something.",
    tags: ["Free"], src: SRC,
  },
  {
    id: "roar-really-really-free-market-2026-12-13", date: "2026-12-13", time: "2-5pm", kind: "event",
    what: "ROAR Really Really Free Market: book, music and art swap (Marshall)",
    where: "Mal's Bar, 121 S Main St, Marshall",
    detail: "ROAR's monthly mutual aid meetup. Share books, albums and art. No bartering and no selling: it is all free. ruralorganizing.wordpress.com.",
    note: "ROAR also runs the Mutual Aid Hub in Marshall (its own listing). The flyer calls this monthly; ask ROAR for the next dates.",
    tags: ["Free"], src: SRC,
  },
  {
    id: "candler-church-kids-christmas-2026-12-20", date: "2026-12-20", time: "10:30am", kind: "event",
    what: "Mega Harvest Kids Christmas Event (Candler Church)",
    where: "Candler Church, 1945 Smokey Park Hwy, Candler",
    detail: "A Christmas event for children ages 1 to 12 in the community: kids shop for and pick out their own gift.",
    note: "The flyer gives no sign-up step or limit, so families may want to arrive on time. It is held at a church on a Sunday morning.",
    tags: ["Free", "Kids"], src: SRC,
  },
];
if (DASH.test(JSON.stringify(add))) throw new Error("dash");
const ev = load("events.json");
for (const e of add) {
  if (ev.file.events.some((x) => x.id === e.id)) throw new Error(`${e.id} exists`);
  ev.file.events.push(e);
}
save(ev);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift({ date: "Nov 28 2026",
  what: "Two free markets and a kids' Christmas gift event",
  detail: "On the Events tab: WAVL Really Really Free Market, Sat Nov 28, 1-4pm, 27 Balm Grove Ave (back pavilion), West Asheville; ROAR Really Really Free Market book, music and art swap, Sun Dec 13, 2-5pm, Mal's Bar, 121 S Main St, Marshall; Candler Church Mega Harvest Kids Christmas Event, Sun Dec 20, 10:30am, 1945 Smokey Park Hwy, Candler, where children 1 to 12 pick out their own gift.",
  source: "scripts/apply-free-markets-kids-christmas-2026-11-28.mjs" });
save(cl);
console.log("added 3 events");
