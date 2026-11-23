/*
 * Two flyers shared by Skylar Belt, 22 Nov 2026. Run once.
 * 1. ABIPA free Thanksgiving Sunday Shop: Sunday 22 Nov 2026, 3-6pm, at the
 *    Friendship Center, 142 Shiloh Rd, Asheville. Fresh food, household
 *    essentials, health resources, community care; sign kids up at the
 *    sign-in table for ABIPA's annual Christmas event. 828-785-3470,
 *    abipa.org. The Sunday food list and Food by day had the shop at ABIPA's
 *    office (220 Continuum Dr, Fletcher); Food by day also had the entry
 *    split across its place and time fields.
 * 2. EMOTE Clothing Swap, 444 Haywood Rd, 12-4pm, masks required and
 *    provided. The flyer's dates are all Sundays in 2026 (Jan 25 to Dec 27);
 *    the two still ahead, Nov 29 and Dec 27, become events, and a new row.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const clean = (s) => { if (DASH.test(s)) throw new Error(`dash: ${s}`); return s; };
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const FLYER = "Flyer shared by Skylar Belt, 22 Nov 2026";

const res = load("resources.json");
const list = res.file.resources;
const sun = list.find((r) => r.id === "sunday");
const OLD = "ABIPA Free Sunday Shop 4th Sunday 3-6pm (220 Continuum Dr, Fletcher)";
if (!sun.d.includes(OLD)) throw new Error("Sunday ABIPA text changed");
sun.d = sun.d.replace(OLD, "ABIPA Free Sunday Shop 4th Sunday 3-6pm (Friendship Center, 142 Shiloh Rd on 22 Nov 2026; 828-785-3470)");
sun.src += "; ABIPA Sunday Shop place and phone from ABIPA's Thanksgiving flyer, 22 Nov 2026";

if (list.some((r) => r.id === "emote-clothing-swap")) throw new Error("EMOTE row exists");
list.push({
  id: "emote-clothing-swap", n: "EMOTE Clothing Swap (free, monthly, Haywood Rd)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you go.", ph: "", em: "", w: "",
  d: clean("Free clothing swap at 444 Haywood Rd, West Asheville, on a Sunday near the end of each month, 12-4pm. "
    + "Masks are required and provided. 2026 dates: Jan 25, Feb 22, Mar 29, Apr 26, May 31, Jun 28, Jul 26, Aug 30, "
    + "Sep 27, Oct 25, Nov 29 and Dec 27."),
  a: "444 Haywood Rd, Asheville", h: "One Sunday a month, 12-4pm", os: "EMOTE Clothing Swap flyer",
  t: "Free, Evening / weekend", lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:12a"],
  src: "EMOTE Clothing Swap 2026 flyer, shared by Skylar Belt 22 Nov 2026",
  note: "The flyer gives 2026 dates only; ask whether it continues in 2027.", new: true,
});
res.file.meta.count = list.length;
res.file.meta.sources.push("ABIPA Thanksgiving Sunday Shop and EMOTE Clothing Swap flyers, 22 Nov 2026 (see scripts/apply-abipa-emote-2026-11-22.mjs)");
save(res);

const ev = load("events.json");
const add = (e) => { if (ev.file.events.some((x) => x.id === e.id)) throw new Error(`${e.id} exists`); clean(JSON.stringify(e)); ev.file.events.push(e); };
add({ id: "abipa-thanksgiving-sunday-shop-2026-11-22", date: "2026-11-22", time: "3-6pm", kind: "event",
  what: "ABIPA free Thanksgiving Sunday Shop", where: "Friendship Center, 142 Shiloh Rd, Asheville",
  detail: "Fresh food, household essentials, health resources and community care. At the sign-in table, sign kids up for ABIPA's annual Christmas event.",
  ph: "828-785-3470", w: "abipa.org", tags: ["Free"], rid: "sunday", src: FLYER });
for (const d of ["2026-11-29", "2026-12-27"]) add({ id: `emote-clothing-swap-${d}`, date: d, time: "12-4pm", kind: "event",
  what: "EMOTE Clothing Swap (free)", where: "444 Haywood Rd, Asheville", detail: "Masks required and provided.",
  tags: ["Free"], rid: "emote-clothing-swap", src: FLYER });
save(ev);

const food = load("food-by-day.json");
const s = food.file.days.find((d) => d.day === "Sunday").sites.find((x) => x.place === "ABIPA Free");
if (!s) throw new Error("Food by day ABIPA entry not found");
s.place = "ABIPA Free Sunday Shop";
s.when = "4th Sunday 3-6pm (Friendship Center, 142 Shiloh Rd on 22 Nov 2026)";
s.goodToKnow = "Fresh food, household essentials, health resources; 828-785-3470, abipa.org. The place may change, so check the month's flyer";
food.file.meta.src += "; ABIPA Sunday Shop flyer, 22 Nov 2026";
save(food);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift({ date: "Nov 22 2026",
  what: "ABIPA's Thanksgiving Sunday Shop and the EMOTE Clothing Swap",
  detail: clean("ABIPA's free Thanksgiving Sunday Shop is today, Nov 22, 3-6pm at the Friendship Center, 142 Shiloh Rd (fresh food, household essentials, health resources; sign kids up there for ABIPA's Christmas event). Food by day and the Sunday list now give that place and ABIPA's phone. New: the free EMOTE Clothing Swap at 444 Haywood Rd, one Sunday a month 12-4pm; Nov 29 and Dec 27 are on the Events tab."),
  source: "scripts/apply-abipa-emote-2026-11-22.mjs" });
save(cl);
console.log("done");
