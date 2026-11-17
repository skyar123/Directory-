/*
 * Mountain Strong Free Clinic open house flyers (English and Spanish), shared by
 * Skylar Belt, 16 Nov 2026. Everything below is what the flyers say. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => { const s = JSON.stringify(v); if (DASH.test(s)) throw new Error(`dash: ${s.slice(0, 90)}`); return v; };
const FLYER = "Mountain Strong Free Clinic flyers (English and Spanish), shared by Skylar Belt, 16 Nov 2026";

const res = load("resources.json");
if (res.file.resources.some((r) => r.id === "mountain-strong-free-clinic")) throw new Error("exists");
res.file.resources.push(clean({
  id: "mountain-strong-free-clinic", n: "Mountain Strong Free Clinic (Burnsville, Yancey County)", pp: "",
  sp: "🟡 Bilingual staff", spd: "Its open house flyer comes in Spanish and English.",
  ph: "828-380-9219", em: "", w: "mountainstrong828.org",
  d: "A free clinic in Burnsville. Its Get Connected to Care open house (Saturday Nov 21, 11am-2pm, and Thursday Dec 17, "
    + "5-8pm) lets anyone tour the clinic, meet the team, ask a nurse general health questions, learn about upcoming FREE "
    + "medical services and medication assistance, get a free first aid kit (while supplies last) and get connected as a "
    + "future patient. Everyone is welcome and no registration is needed. No medical appointments or treatment are given "
    + "at the open house, so it is for getting connected, not for being seen that day.",
  a: "371 W US Hwy 19E, Burnsville 28714", h: "Open house Sat Nov 21 11am-2pm and Thu Dec 17 5-8pm; call for other times",
  os: "Flyers", t: "Free, No ID, Spanish / bilingual", lv: "", vb: "", sec: "VI", needs: ["VI:*", "VI:4a", "ESPANOL:*"],
  src: FLYER, note: "Clinic hours and which services are free were not on the flyers; call 828-380-9219.", new: true,
}));
res.file.meta.count = res.file.resources.length;
res.file.meta.sources.push("Mountain Strong Free Clinic flyers, 16 Nov 2026 (see scripts/apply-mountain-strong-2026-11-16.mjs)");
save(res);

const ev = load("events.json");
const mk = (date, time, extra) => ({
  id: `mountain-strong-open-house-${date}`, date, time, kind: "event",
  what: "Free clinic open house: Get Connected to Care (Mountain Strong, Burnsville)",
  where: "371 W US Hwy 19E, Burnsville 28714",
  detail: "Tour the clinic, meet the team, ask a nurse general health questions, learn about free medical services and "
    + "medication assistance, and take home a free first aid kit (while supplies last). Everyone welcome; no "
    + "registration. No appointments or treatment at this event. The flyer is also in Spanish.",
  tags: ["Free"], ph: "828-380-9219", w: "mountainstrong828.org", rid: "mountain-strong-free-clinic", src: FLYER, ...extra,
});
for (const e of [mk("2026-11-21", "11am-2pm"), mk("2026-12-17", "5-8pm")]) {
  if (ev.file.events.some((x) => x.id === e.id)) throw new Error(e.id);
  ev.file.events.push(clean(e));
}
ev.file.events.sort((a, b) => a.date.localeCompare(b.date));
save(ev);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 16 2026", what: "Mountain Strong Free Clinic (Burnsville) open houses",
  detail: "New row and two calendar events (Nov 21 and Dec 17) from the English and Spanish flyers: a free clinic open house with a nurse to ask, medication assistance information and a free first aid kit. No appointments or treatment at the event.",
  source: "scripts/apply-mountain-strong-2026-11-16.mjs" }));
save(cl);
console.log("done", res.file.resources.length);
