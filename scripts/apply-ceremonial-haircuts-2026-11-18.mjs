/*
 * Ceremonial Beauty Collective pay-what-you-can haircuts, 2026-11-18.
 *
 * Source: the salon's Facebook post in the Friends of Swannanoa NC group
 * (facebook.com/groups/FriendsofSwannanoaNC/permalink/10165178074584044),
 * shared by Skylar Belt 18 Nov 2026. A web search, 18 Nov 2026, found no
 * street address: one booking listing says downtown near Pack Square and
 * another West Asheville, so the address is left to the booking. The post
 * gives no end date, so there is no calendar entry. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => { if (DASH.test(JSON.stringify(v))) throw new Error("dash in text"); return v; };
const SRC = "Ceremonial Beauty Collective's Facebook post in the Friends of Swannanoa NC group, shared by Skylar Belt 18 Nov 2026";

const res = load("resources.json");
const list = res.file.resources;
const ID = "ceremonial-beauty-collective-pay-what-you-can";
if (list.some((r) => r.id === ID)) throw new Error("exists");
list.push(clean({
  id: ID, n: "Ceremonial Beauty Collective: pay-what-you-can haircuts (Asheville)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you book.",
  ph: "828-550-7357", em: "", w: "",
  d: "Pay-what-you-can haircuts for the holiday season: pay what you comfortably can, with no judgment and no "
    + "explanation needed, for anyone in a tough season financially or who needs a little self-care. Appointments "
    + "are limited. Book through the salon's Google business listing or at 828-550-7357, and send a message when "
    + "booking to say it is for the Pay What You Can special.",
  a: "Asheville (ask for the address when booking)", h: "By appointment; limited holiday-season spots",
  os: "Everyday life", t: "Pay what you can", lv: "", vb: "", sec: "X",
  needs: ["X:*", "X:12"], src: SRC,
  note: "The post gives no end date or street address; a web listing places the salon downtown near Pack Square and "
    + "another in West Asheville, so ask when booking.",
  new: true,
}));
const hc = list.find((r) => r.id === "haircuts");
if (!hc) throw new Error("no haircuts row");
if (hc.d.includes("Ceremonial")) throw new Error("already linked");
hc.d = `${hc.d} For the holidays, Ceremonial Beauty Collective in Asheville offers pay-what-you-can haircuts (828-550-7357; see its row).`;
hc.src = `${hc.src}; pay-what-you-can mention from ${SRC}`;
clean(hc);
res.file.meta.count = list.length;
res.file.meta.sources.push("Ceremonial Beauty Collective pay-what-you-can haircuts, 18 Nov 2026 (see scripts/apply-ceremonial-haircuts-2026-11-18.mjs)");
save(res);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 18 2026",
  what: "Pay-what-you-can haircuts, and an easier-to-use app on phones",
  detail: "New row: Ceremonial Beauty Collective's pay-what-you-can holiday haircuts in Asheville (book at 828-550-7357 "
    + "and say it is for the special). The app: Find opens on colored need tiles with icons, and the full list waits "
    + "for a search, a section or Show all; phones get a bottom bar for Find, Food, Events and Plan, with the rest "
    + "under More; cards drop the empty language badge, show Not verified yet quietly and shorten long web addresses.",
  source: "scripts/apply-ceremonial-haircuts-2026-11-18.mjs; src/components/NeedStart.jsx, src/App.jsx, src/styles.css",
}));
save(cl);
console.log(`added the haircut row, ${list.length} resources`);
